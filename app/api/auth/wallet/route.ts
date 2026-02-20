import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Coinbase Smart Wallet authentication
 * 
 * Uses timestamp-based challenge (no DB table needed):
 * - GET: generate a signed challenge with timestamp
 * - POST: verify EIP-1271 signature via viem publicClient (supports Smart Wallet)
 */

const CHALLENGE_WINDOW_MS = 5 * 60 * 1000 // 5 min

// viem publicClient for EIP-1271 contract signature verification (Smart Wallet)
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
})

// GET /api/auth/wallet?address=0x...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const timestamp = Date.now()
  const nonce = randomBytes(8).toString('hex')

  // Embed timestamp + nonce in the message so server can verify without DB
  const message = [
    'Sign in to SciFlow.',
    '',
    `Address: ${address.toLowerCase()}`,
    `Nonce: ${nonce}`,
    `Issued: ${timestamp}`,
  ].join('\n')

  return NextResponse.json({ message, timestamp, nonce })
}

// POST /api/auth/wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, message } = body

    if (!address || !signature || !message) {
      return NextResponse.json({ error: 'Missing address, signature, or message' }, { status: 400 })
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // Parse and validate timestamp from the message
    const issuedMatch = message.match(/Issued: (\d+)/)
    if (!issuedMatch) {
      return NextResponse.json({ error: 'Invalid challenge format' }, { status: 400 })
    }
    const issued = parseInt(issuedMatch[1])
    if (Date.now() - issued > CHALLENGE_WINDOW_MS) {
      return NextResponse.json({ error: 'Challenge expired — please try again' }, { status: 401 })
    }

    // Verify address in message matches the one in the body
    const addrMatch = message.match(/Address: (0x[a-fA-F0-9]+)/i)
    if (!addrMatch || addrMatch[1].toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Address mismatch in challenge' }, { status: 401 })
    }

    // Verify signature — publicClient.verifyMessage supports EIP-1271 (Coinbase Smart Wallet)
    let signatureValid = false
    try {
      signatureValid = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
    } catch (e) {
      console.error('[Wallet Auth] Signature verification error:', e)
      signatureValid = false
    }

    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid wallet signature' }, { status: 401 })
    }

    const supabaseAdmin = createAdminClient()
    const normalizedAddress = address.toLowerCase()

    // Deterministic internal email from wallet address
    const walletHash = createHash('sha256').update(`evm:${normalizedAddress}`).digest('hex').slice(0, 16)
    const email = `wallet_${walletHash}@sciflow.local`

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('wallet_address_evm', normalizedAddress)
      .single()

    let userId: string
    const tempPassword = randomBytes(32).toString('hex')

    if (existingUser) {
      userId = existingUser.id
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })
    } else {
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: normalizedAddress,
          wallet_provider: 'coinbase_smart_wallet',
        },
      })

      if (signUpError || !newUser.user) {
        console.error('[Wallet Auth] User creation error:', signUpError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      userId = newUser.user.id

      // Create profile
      await supabaseAdmin.from('users').insert({
        id: userId,
        email,
        wallet_address_evm: normalizedAddress,
        role: 'funder',
      }).catch(console.error)
    }

    // Non-critical activity log
    await supabaseAdmin.from('activity_logs').insert({
      user_id: userId,
      action: 'wallet_auth',
      details: { wallet_address: normalizedAddress, provider: 'coinbase_smart_wallet' },
    }).catch(() => {})

    return NextResponse.json({ email, tempPassword })
  } catch (error) {
    console.error('[Wallet Auth] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
