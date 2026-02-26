import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/users — get current user profile
export async function GET() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user

  const { data: profile } = await supabase
    .from('users')
    .select('*, labs(id, name, verification_tier, reputation_score, specializations, institution_affiliation, website, team_size)')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ profile })
}

// PATCH /api/users — update (or create) current user profile
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user

  const body = await req.json()
  const { full_name, avatar_url, role, lab, onboarding_completed } = body

  // Build update payload
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) updates.full_name = full_name
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  if (role !== undefined && ['funder', 'lab'].includes(role)) updates.role = role
  if (onboarding_completed !== undefined) updates.onboarding_completed = onboarding_completed

  // Check if the user profile row exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  let updateErr: { message: string } | null = null

  if (existingProfile) {
    // Row exists — do a regular update
    const { error: err } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    updateErr = err
  } else {
    // Row missing — upsert to create it with defaults
    const { error: err } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        role: (role && ['funder', 'lab'].includes(role) ? role : 'funder') as 'funder' | 'lab',
        onboarding_completed: onboarding_completed ?? false,
        wallet_address_evm: user.user_metadata?.wallet_address ?? null,
        ...updates,
      })
    updateErr = err
  }

  if (updateErr) {
    console.error('[PATCH /api/users] DB error:', updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // If user is a lab, update lab profile too
  if (lab) {
    const { data: existingLab } = await supabase.from('labs').select('id').eq('user_id', user.id).single()
    const labUpdates: Record<string, unknown> = {}
    if (lab.name) labUpdates.name = lab.name
    if (lab.description) labUpdates.description = lab.description
    if (lab.website !== undefined) labUpdates.website = lab.website
    if (lab.specializations) labUpdates.specializations = lab.specializations
    if (lab.institution_affiliation !== undefined) labUpdates.institution_affiliation = lab.institution_affiliation
    if (lab.team_size !== undefined) labUpdates.team_size = lab.team_size
    if (existingLab) {
      await supabase.from('labs').update(labUpdates).eq('user_id', user.id)
    } else if (updates.role === 'lab' || lab.name) {
      await supabase.from('labs').insert({ user_id: user.id, name: lab.name || 'My Lab', ...labUpdates })
    }
  }

  return NextResponse.json({ success: true })
}
