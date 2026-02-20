import { NextRequest, NextResponse } from 'next/server'
import { createHash, createPublicKey, randomBytes, verify as verifySignature } from 'crypto'
import { verifyMessage } from 'viem'
import { PublicKey } from '@solana/web3.js'
import { createAdminClient } from '@/lib/supabase/admin'

// Wallet-based authentication for EVM wallets (Base, Ethereum)
const AUTH_MESSAGE_PREFIX = 'Sign this message to authenticate with SciFlow.'
const NONCE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function normalizeAddress(provider: 'solana' | 'evm', address: string) {
  return provider === 'evm' ? address.toLowerCase() : address
}

function validateAddress(provider: 'solana' | 'evm', address: string) {
  if (provider === 'evm') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  try {
    // Throws on invalid base58 / length.
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

function verifySolanaMessageSignature(message: string, walletAddress: string, signatureBase64: string) {
  try {
    const publicKey = new PublicKey(walletAddress).toBytes()
    const signature = Buffer.from(signatureBase64, 'base64')

    if (signature.length !== 64) return false

    // DER-encoded SPKI prefix for Ed25519 public keys.
    const ed25519SpkiPrefix = Buffer.from('302a300506032b6570032100', 'hex')
    const derKey = Buffer.alloc(ed25519SpkiPrefix.length + publicKey.length)
    derKey.set(ed25519SpkiPrefix, 0)
    derKey.set(publicKey, ed25519SpkiPrefix.length)

    const key = createPublicKey({
      key: derKey,
      format: 'der',
      type: 'spki',
    })

    return verifySignature(null, new TextEncoder().encode(message), key, Uint8Array.from(signature))
  } catch {
    return false
  }
}

// POST /api/auth/wallet - Authenticate with wallet signature
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const { provider, address, signature, message, nonce } = body

    if (!provider || !address || !signature || !message || !nonce) {
      return NextResponse.json({ 
        error: 'Missing required fields: provider, address, signature, message, nonce' 
      }, { status: 400 })
    }

    if (!['solana', 'evm'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider. Use "solana" or "evm"' }, { status: 400 })
    }

    const typedProvider = provider as 'solana' | 'evm'
    if (!validateAddress(typedProvider, address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const normalizedAddress = normalizeAddress(typedProvider, address)

    const { data: nonceRecord, error: nonceError } = await supabaseAdmin
      .from('wallet_auth_nonces')
      .select('*')
      .eq('provider', typedProvider)
      .eq('wallet_address', normalizedAddress)
      .eq('nonce', nonce)
      .is('used_at', null)
      .single()

    if (nonceError || !nonceRecord) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 401 })
    }

    if (nonceRecord.message !== message) {
      return NextResponse.json({ error: 'Challenge message mismatch' }, { status: 401 })
    }

    if (new Date(nonceRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Challenge expired. Request a new one.' }, { status: 401 })
    }

    let signatureValid = false
    if (typedProvider === 'evm') {
      signatureValid = await verifyMessage({
        address: normalizedAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      }).catch(() => false)
    } else {
      signatureValid = verifySolanaMessageSignature(message, normalizedAddress, signature)
    }

    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid wallet signature' }, { status: 401 })
    }

    await supabaseAdmin
      .from('wallet_auth_nonces')
      .update({ used_at: new Date().toISOString() })
      .eq('id', nonceRecord.id)

    // Generate a deterministic email from wallet address
    const walletHash = createHash('sha256').update(`${typedProvider}:${normalizedAddress}`).digest('hex').slice(0, 16)
    const email = `wallet_${walletHash}@sciflow.local`

    // Check if user exists by wallet address
    const walletField = typedProvider === 'evm' ? 'wallet_address_evm' : 'wallet_address_solana'
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq(walletField, normalizedAddress)
      .single()

    let userId: string
    let tempPassword: string

    if (existingUser) {
      // User exists, generate temp password for session
      userId = existingUser.id
      tempPassword = randomBytes(32).toString('hex')

      // Update password for this session
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
      })
    } else {
      // Create new user
      tempPassword = randomBytes(32).toString('hex')
      
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: normalizedAddress,
          wallet_provider: typedProvider,
        },
      })

      if (signUpError || !newUser.user) {
        console.error('Error creating user:', signUpError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }

      userId = newUser.user.id

      // Create user profile
      const profileData: Record<string, unknown> = {
        id: userId,
        email,
        role: 'funder', // Default role, can be changed later
      }
      if (typedProvider === 'evm') {
        profileData.wallet_address_evm = normalizedAddress
      } else {
        profileData.wallet_address_solana = normalizedAddress
      }
      const { error: profileError } = await supabaseAdmin.from('users').insert(profileData)

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }

    // Log the authentication
    await supabaseAdmin.from('activity_logs').insert({
      user_id: userId,
      action: 'wallet_auth',
      details: { 
        provider: typedProvider,
        wallet_address: normalizedAddress,
        chain: typedProvider === 'evm' ? 'base' : 'solana',
      },
    }) // Non-critical, don't fail auth

    return NextResponse.json({
      email,
      tempPassword,
      message: 'Wallet authenticated successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/auth/wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/wallet - Get a nonce/message for wallet signature
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const provider = searchParams.get('provider')

    if (!address || !provider || !['solana', 'evm'].includes(provider)) {
      return NextResponse.json({ error: 'Missing or invalid address/provider' }, { status: 400 })
    }

    const typedProvider = provider as 'solana' | 'evm'
    if (!validateAddress(typedProvider, address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const normalizedAddress = normalizeAddress(typedProvider, address)
    const nonce = randomBytes(16).toString('hex')
    const timestamp = new Date().toISOString()
    const expiresAt = new Date(Date.now() + NONCE_TTL_MS).toISOString()
    const message = `${AUTH_MESSAGE_PREFIX}\n\nAddress: ${normalizedAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`

    const { error } = await supabaseAdmin.from('wallet_auth_nonces').insert({
      wallet_address: normalizedAddress,
      provider: typedProvider,
      nonce,
      message,
      expires_at: expiresAt,
    })

    if (error) {
      console.error('Failed to create wallet auth nonce:', error)
      return NextResponse.json({ error: 'Unable to generate auth challenge' }, { status: 500 })
    }

    return NextResponse.json({
      message,
      nonce,
      timestamp,
      expiresAt,
    })
  } catch (error) {
    console.error('Error in GET /api/auth/wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
