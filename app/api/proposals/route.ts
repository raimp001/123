import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const createProposalSchema = z.object({
  bounty_id: z.string().uuid(),
  methodology: z.string().min(50).max(10000),
  timeline: z.string().min(20).max(5000),
  budget_breakdown: z.array(z.object({
    item: z.string(),
    amount: z.number().positive(),
    justification: z.string().optional(),
  })).optional(),
  team_members: z.array(z.object({
    name: z.string(),
    role: z.string(),
    expertise: z.string().optional(),
  })).optional(),
  relevant_experience: z.string().max(5000).optional(),
  milestones: z.array(z.object({
    sequence: z.number().positive(),
    estimated_days: z.number().positive(),
    approach: z.string(),
  })).optional(),
})

// GET /api/proposals - List proposals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const bountyId = searchParams.get('bounty_id')
    const labId = searchParams.get('lab_id')
    const status = searchParams.get('status')
    const myProposals = searchParams.get('my') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Build query
    let query = supabase
      .from('proposals')
      .select(`
        *,
        bounty:bounties!proposals_bounty_id_fkey(
          id, title, total_budget, currency, state, funder_id
        ),
        lab:labs!proposals_lab_id_fkey(
          id, name, verification_tier, reputation_score
        )
      `, { count: 'exact' })

    // Filter by user's proposals
    if (myProposals && user) {
      // Get user's lab
      const { data: lab } = await supabase
        .from('labs')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (lab) {
        query = query.eq('lab_id', lab.id)
      } else {
        // User has no lab, return empty
        return NextResponse.json({
          proposals: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        })
      }
    }

    if (bountyId) {
      query = query.eq('bounty_id', bountyId)
    }

    if (labId) {
      query = query.eq('lab_id', labId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Sorting and pagination
    query = query.order('created_at', { ascending: false })
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching proposals:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      proposals: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/proposals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/proposals - Submit a proposal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's lab
    const { data: lab, error: labError } = await supabase
      .from('labs')
      .select('id, verification_tier')
      .eq('user_id', user.id)
      .single()

    if (labError || !lab) {
      return NextResponse.json({ error: 'You must be a verified lab to submit proposals' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createProposalSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { bounty_id, ...proposalData } = validationResult.data

    // Check bounty exists and is in bidding state
    const { data: bounty, error: bountyError } = await supabase
      .from('bounties')
      .select('id, state, min_lab_tier, funder_id')
      .eq('id', bounty_id)
      .single()

    if (bountyError || !bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    if (bounty.state !== 'bidding') {
      return NextResponse.json({ error: 'Bounty is not accepting proposals' }, { status: 400 })
    }

    // Check lab meets minimum tier requirement
    const tierOrder = ['unverified', 'basic', 'verified', 'trusted', 'institutional']
    const labTierIndex = tierOrder.indexOf(lab.verification_tier)
    const minTierIndex = tierOrder.indexOf(bounty.min_lab_tier || 'basic')

    if (labTierIndex < minTierIndex) {
      return NextResponse.json({ 
        error: `Your lab must be at least ${bounty.min_lab_tier} tier to submit a proposal` 
      }, { status: 403 })
    }

    // Check for existing proposal
    const { data: existingProposal } = await supabase
      .from('proposals')
      .select('id')
      .eq('bounty_id', bounty_id)
      .eq('lab_id', lab.id)
      .single()

    if (existingProposal) {
      return NextResponse.json({ error: 'You already submitted a proposal for this bounty' }, { status: 400 })
    }

    // Create proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        ...proposalData,
        bounty_id,
        lab_id: lab.id,
        status: 'submitted',
      })
      .select()
      .single()

    if (proposalError) {
      console.error('Error creating proposal:', proposalError)
      return NextResponse.json({ error: proposalError.message }, { status: 500 })
    }

    // Create notification for funder
    await supabase.from('notifications').insert({
      user_id: bounty.funder_id,
      type: 'new_proposal',
      title: 'New Proposal Received',
      message: `A lab has submitted a proposal for your bounty`,
      data: { bounty_id, proposal_id: proposal.id },
    })

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id,
      action: 'proposal_submitted',
      details: { proposal_id: proposal.id, lab_id: lab.id },
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/proposals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
