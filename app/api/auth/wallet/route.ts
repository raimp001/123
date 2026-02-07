import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'
import type { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

// Wallet-based authentication for Solana and EVM wallets

// POST /api/auth/wallet - Authenticate with wallet signature
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { provider, address, signature, message } = body

    if (!provider || !address || !signature) {
      return NextResponse.json({ 
        error: 'Missing required fields: provider, address, signature' 
      }, { status: 400 })
    }

    if (!['solana', 'evm'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider. Use "solana" or "evm"' }, { status: 400 })
    }

    // Verify the signature
    // In production, implement proper signature verification:
    // - For Solana: Use @solana/web3.js to verify ed25519 signature
    // - For EVM: Use ethers.js to verify personal_sign

    // For now, we'll do a basic check (replace with actual verification)
    const expectedMessage = `Sign this message to authenticate with SciFlow.\n\nAddress: ${address}\nTimestamp: `
    
    if (!message?.startsWith(expectedMessage.split('Timestamp:')[0])) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }

    // Generate a deterministic email from wallet address
    const walletHash = createHash('sha256').update(address.toLowerCase()).digest('hex').slice(0, 8)
    const email = `wallet_${walletHash}@sciflow.local`

    // Check if user exists (check both wallet columns based on provider)
    const walletColumn = provider === 'evm' ? 'wallet_address_evm' : 'wallet_address_solana'
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq(walletColumn, address.toLowerCase())
      .single()

    let userId: string
    let tempPassword: string

    if (existingUser) {
      // User exists, generate temp password for session
      userId = (existingUser as { id: string }).id
      tempPassword = randomBytes(32).toString('hex')

      // Update password for this session
      await supabase.auth.admin.updateUserById(userId, {
        password: tempPassword,
      })
    } else {
      // Create new user
      tempPassword = randomBytes(32).toString('hex')
      
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: address.toLowerCase(),
          wallet_provider: provider,
        },
      })

      if (signUpError || !newUser.user) {
        console.error('Error creating user:', signUpError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      userId = newUser.user.id

      // Create user profile
      const userProfile: UserInsert = {
        id: userId,
        email,
        wallet_address_evm: provider === 'evm' ? address.toLowerCase() : null,
        wallet_address_solana: provider === 'solana' ? address.toLowerCase() : null,
        role: 'funder', // Default role, can be changed later
      }
      await supabase.from('users').insert(userProfile)
    }

    // Log the authentication
    const activityLog: ActivityLogInsert = {
      user_id: userId,
      action: 'wallet_auth',
      details: {
        provider,
        wallet_address: address,
      },
    }
    await supabase.from('activity_logs').insert(activityLog)

    return NextResponse.json({
      email,
      tempPassword,
      message: 'Use these credentials to complete sign in',
    })
  } catch (error) {
    console.error('Error in POST /api/auth/wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/wallet/nonce - Get a nonce for wallet signature
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 })
    }

    // Generate a nonce/message for the wallet to sign
    const timestamp = Date.now()
    const message = `Sign this message to authenticate with SciFlow.\n\nAddress: ${address}\nTimestamp: ${timestamp}`

    return NextResponse.json({
      message,
      timestamp,
    })
  } catch (error) {
    console.error('Error in GET /api/auth/wallet/nonce:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
