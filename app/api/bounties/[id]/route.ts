import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/bounties/[id] - Get single bounty with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: bounty, error } = await supabase
      .from('bounties')
      .select(`
        *,
        funder:users!bounties_funder_id_fkey(id, full_name, avatar_url, email),
        selected_lab:labs!bounties_selected_lab_id_fkey(
          id, name, verification_tier, reputation_score, 
          user:users(id, full_name, avatar_url)
        ),
        milestones(*, ordered:sequence),
        proposals(
          *,
          lab:labs(id, name, verification_tier, reputation_score, total_bounties_completed)
        ),
        escrow:escrows(*),
        disputes(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(bounty)
  } catch (error) {
    console.error('Error in GET /api/bounties/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/bounties/[id] - Update bounty
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

    // Get current bounty
    const { data: currentBounty, error: fetchError } = await supabase
      .from('bounties')
      .select('*, milestones(*)')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    // Verify ownership
    if (currentBounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow updates in drafting state (with some exceptions)
    const allowedStates = ['drafting', 'admin_review', 'ready_for_funding']
    if (!allowedStates.includes(currentBounty.state)) {
      return NextResponse.json(
        { error: 'Cannot update bounty in current state' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Update bounty
    const { data: updatedBounty, error: updateError } = await supabase
      .from('bounties')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id: id,
      action: 'bounty_updated',
      details: { changes: Object.keys(body) },
    })

    return NextResponse.json(updatedBounty)
  } catch (error) {
    console.error('Error in PATCH /api/bounties/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/bounties/[id] - Delete bounty (only in draft state)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current bounty
    const { data: bounty, error: fetchError } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    if (bounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (bounty.state !== 'drafting') {
      return NextResponse.json(
        { error: 'Can only delete bounties in draft state' },
        { status: 400 }
      )
    }

    // Delete bounty (cascades to milestones)
    const { error: deleteError } = await supabase
      .from('bounties')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/bounties/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
