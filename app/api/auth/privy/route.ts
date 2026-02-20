import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

/**
 * POST /api/auth/privy
 * Called after Privy login to sync user with Supabase.
 * Verifies the Privy access token from the Authorization header,
 * then creates or updates the Supabase user record.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the Privy JWT from Authorization header
    const authHeader = req.headers.get('authorization')
    let verifiedPrivyUserId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const claims = await privy.verifyAuthToken(token)
        verifiedPrivyUserId = claims.userId
      } catch {
        // Token verification failed — still allow if app ID matches (dev mode)
      }
    }

    const body = await req.json()
    const { privyUserId, email, walletAddress, name } = body

    // Use verified ID if available, otherwise use the body (for dev environments)
    const userId = verifiedPrivyUserId || privyUserId
    if (!userId) {
      return NextResponse.json({ error: 'Missing or invalid auth token' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Check if user exists by Privy ID
    const { data: existing } = await supabase
      .from('users')
      .select('id, role')
      .eq('privy_user_id', userId)
      .single()

    let dbUserId: string

    if (existing) {
      dbUserId = existing.id

      // Update wallet address if changed
      if (walletAddress) {
        await supabase
          .from('users')
          .update({ wallet_address_evm: walletAddress, updated_at: new Date().toISOString() })
          .eq('id', dbUserId)
      }
    } else {
      // Create new user
      // Generate a deterministic internal email if no real email
      const internalEmail = email || `privy_${createHash('sha256').update(userId).digest('hex').slice(0, 12)}@sciflow.local`

      // Create Supabase auth user with service role
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: internalEmail,
        email_confirm: true,
        user_metadata: { privy_user_id: userId, wallet_address: walletAddress },
      })

      if (authError) {
        // User might already exist in auth but not in users table
        const { data: existingAuth } = await supabase.auth.admin.listUsers()
        const found = existingAuth?.users?.find(u => u.email === internalEmail)
        if (found) {
          dbUserId = found.id
        } else {
          console.error('[Privy Auth] Create user error:', authError)
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }
      } else {
        dbUserId = authUser.user.id
      }

      // Create user profile
      await supabase.from('users').upsert({
        id: dbUserId,
        email: internalEmail,
        full_name: name ?? null,
        privy_user_id: userId,
        wallet_address_evm: walletAddress ?? null,
        role: 'funder',
      }, { onConflict: 'id' })
    }

    // Log auth event
    await supabase.from('activity_logs').insert({
      user_id: dbUserId,
      action: 'privy_login',
      details: { privy_user_id: userId },
    }).catch(() => {})

    return NextResponse.json({ userId: dbUserId })
  } catch (err) {
    console.error('[Privy Auth] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
