import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toCanonicalLabWrite } from '@/lib/normalize/lab'

// GET /api/labs/[id] - Get lab details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: lab, error } = await supabase
      .from('labs')
      .select(`
        *,
        user:users!labs_user_id_fkey(id, full_name, avatar_url, email),
        completed_bounties:bounties!bounties_selected_lab_id_fkey(
          id, title, total_budget, currency, state, created_at
        ),
        staking:staking_pool(staked_amount, staked_at, unlock_date)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error in GET /api/labs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/labs/[id] - Update lab profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: lab } = await supabase
      .from('labs')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!lab || lab.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this lab' }, { status: 403 })
    }

    // Parse body — accept both canonical and legacy alias field names
    const body = await request.json()
    const allowedFields = ['name', 'institution', 'institution_affiliation', 'bio', 'description', 'website', 'country', 'location_country', 'expertise_areas', 'specializations', 'specialties', 'team_size']
    const rawUpdate: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        rawUpdate[field] = body[field]
      }
    }
    const updateData = toCanonicalLabWrite(rawUpdate as Record<string, unknown>) as Record<string, unknown>
    updateData.updated_at = new Date().toISOString()

    const { data: updatedLab, error: updateError } = await supabase
      .from('labs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedLab)
  } catch (error) {
    console.error('Error in PATCH /api/labs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
