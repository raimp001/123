import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/types/database'

type ActorPermission = 'funder' | 'lab' | 'admin' | 'arbitrator'
type TransitionEvent =
  | 'SUBMIT_DRAFT'
  | 'ADMIN_APPROVE_PROTOCOL'
  | 'ADMIN_REQUEST_CHANGES'
  | 'ADMIN_REJECT_PROTOCOL'
  | 'INITIATE_FUNDING'
  | 'FUNDING_CONFIRMED'
  | 'FUNDING_FAILED'
  | 'SELECT_LAB'
  | 'CANCEL_BOUNTY'
  | 'EXTEND_BIDDING'
  | 'SUBMIT_MILESTONE'
  | 'APPROVE_MILESTONE'
  | 'REQUEST_REVISION'
  | 'INITIATE_DISPUTE'
  | 'RESOLVE_DISPUTE'
  | 'CONFIRM_PAYOUT'

type BountyRow = Database['public']['Tables']['bounties']['Row']
type MilestoneRow = Database['public']['Tables']['milestones']['Row']
type ProposalRow = Database['public']['Tables']['proposals']['Row']
type EscrowRow = Database['public']['Tables']['escrows']['Row']
type DisputeRow = Database['public']['Tables']['disputes']['Row']

type BountyWithRelations = BountyRow & {
  milestones: MilestoneRow[]
  proposals: ProposalRow[]
  escrow: EscrowRow | null
  selected_lab: { user_id: string } | null
  disputes: DisputeRow[]
}

const transitionSchema = z.object({
  event: z.enum([
    'SUBMIT_DRAFT',
    'ADMIN_APPROVE_PROTOCOL',
    'ADMIN_REQUEST_CHANGES',
    'ADMIN_REJECT_PROTOCOL',
    'INITIATE_FUNDING',
    'FUNDING_CONFIRMED',
    'FUNDING_FAILED',
    'SELECT_LAB',
    'CANCEL_BOUNTY',
    'EXTEND_BIDDING',
    'SUBMIT_MILESTONE',
    'APPROVE_MILESTONE',
    'REQUEST_REVISION',
    'INITIATE_DISPUTE',
    'RESOLVE_DISPUTE',
    'CONFIRM_PAYOUT',
  ]),
  data: z.record(z.unknown()).optional(),
})

const stateTransitions: Record<
  string,
  {
    validEvents: TransitionEvent[]
    targetStates: Partial<Record<TransitionEvent, string>>
    permissions: ActorPermission[]
  }
> = {
  drafting: {
    validEvents: ['SUBMIT_DRAFT', 'CANCEL_BOUNTY'],
    targetStates: {
      SUBMIT_DRAFT: 'admin_review',
      CANCEL_BOUNTY: 'cancelled',
    },
    permissions: ['funder'],
  },
  admin_review: {
    validEvents: ['ADMIN_APPROVE_PROTOCOL', 'ADMIN_REQUEST_CHANGES', 'ADMIN_REJECT_PROTOCOL'],
    targetStates: {
      ADMIN_APPROVE_PROTOCOL: 'ready_for_funding',
      ADMIN_REQUEST_CHANGES: 'drafting',
      ADMIN_REJECT_PROTOCOL: 'cancelled',
    },
    permissions: ['admin'],
  },
  ready_for_funding: {
    validEvents: ['INITIATE_FUNDING', 'CANCEL_BOUNTY'],
    targetStates: {
      INITIATE_FUNDING: 'funding_escrow',
      CANCEL_BOUNTY: 'cancelled',
    },
    permissions: ['funder'],
  },
  funding_escrow: {
    validEvents: ['FUNDING_CONFIRMED', 'FUNDING_FAILED'],
    targetStates: {
      FUNDING_CONFIRMED: 'bidding',
      FUNDING_FAILED: 'ready_for_funding',
    },
    permissions: ['admin'],
  },
  bidding: {
    validEvents: ['SELECT_LAB', 'CANCEL_BOUNTY', 'EXTEND_BIDDING'],
    targetStates: {
      SELECT_LAB: 'active_research',
      CANCEL_BOUNTY: 'refunding',
      EXTEND_BIDDING: 'bidding',
    },
    permissions: ['funder'],
  },
  active_research: {
    validEvents: ['SUBMIT_MILESTONE', 'INITIATE_DISPUTE'],
    targetStates: {
      SUBMIT_MILESTONE: 'milestone_review',
      INITIATE_DISPUTE: 'dispute_resolution',
    },
    permissions: ['lab', 'funder'],
  },
  milestone_review: {
    validEvents: ['APPROVE_MILESTONE', 'REQUEST_REVISION', 'INITIATE_DISPUTE'],
    targetStates: {
      APPROVE_MILESTONE: 'active_research',
      REQUEST_REVISION: 'active_research',
      INITIATE_DISPUTE: 'dispute_resolution',
    },
    permissions: ['funder'],
  },
  dispute_resolution: {
    validEvents: ['RESOLVE_DISPUTE'],
    targetStates: {
      RESOLVE_DISPUTE: 'partial_settlement',
    },
    permissions: ['admin', 'arbitrator'],
  },
  completed_payout: {
    validEvents: ['CONFIRM_PAYOUT'],
    targetStates: {
      CONFIRM_PAYOUT: 'completed',
    },
    permissions: ['admin'],
  },
}

function isEscrowFunded(escrow: EscrowRow | null) {
  return escrow?.status === 'locked' || escrow?.status === 'partially_released' || escrow?.status === 'fully_released'
}

function resolveTargetState(event: TransitionEvent, bounty: BountyWithRelations, eventData?: Record<string, unknown>) {
  const transition = stateTransitions[bounty.state]
  let targetState = transition?.targetStates[event]

  if (event === 'APPROVE_MILESTONE') {
    const verifiedCount = bounty.milestones.filter((milestone) => milestone.status === 'verified').length
    if (verifiedCount + 1 >= bounty.milestones.length) {
      targetState = 'completed_payout'
    }
  }

  if (event === 'RESOLVE_DISPUTE') {
    const resolution = typeof eventData?.resolution === 'string' ? eventData.resolution : undefined
    if (resolution === 'funder_wins') targetState = 'refunding'
    if (resolution === 'lab_wins') targetState = 'completed_payout'
    if (resolution === 'partial_refund') targetState = 'partial_settlement'
  }

  return targetState
}

function validateEventData(event: TransitionEvent, bounty: BountyWithRelations, eventData?: Record<string, unknown>) {
  if (event === 'SELECT_LAB') {
    const proposalId = typeof eventData?.proposalId === 'string' ? eventData.proposalId : undefined
    if (!proposalId) return { ok: false, error: 'proposalId is required' }

    const proposal = bounty.proposals.find((item) => item.id === proposalId)
    if (!proposal) return { ok: false, error: 'Selected proposal does not belong to this bounty' }

    if (!isEscrowFunded(bounty.escrow)) {
      return { ok: false, error: 'Escrow must be funded before selecting a lab' }
    }

    if (!['pending', 'submitted'].includes(proposal.status)) {
      return { ok: false, error: 'Proposal is not selectable in current status' }
    }

    return { ok: true as const, proposal }
  }

  if (event === 'APPROVE_MILESTONE' || event === 'REQUEST_REVISION' || event === 'SUBMIT_MILESTONE') {
    const milestoneId = typeof eventData?.milestoneId === 'string' ? eventData.milestoneId : undefined
    if (!milestoneId) return { ok: false, error: 'milestoneId is required' }
    const milestone = bounty.milestones.find((item) => item.id === milestoneId)
    if (!milestone) return { ok: false, error: 'Milestone does not belong to this bounty' }

    if (event === 'APPROVE_MILESTONE' && milestone.status !== 'submitted') {
      return { ok: false, error: 'Only submitted milestones can be approved' }
    }

    return { ok: true as const, milestone }
  }

  if (event === 'FUNDING_CONFIRMED' && !isEscrowFunded(bounty.escrow)) {
    return { ok: false, error: 'Escrow is not funded/locked yet' }
  }

  if (event === 'INITIATE_DISPUTE') {
    if (typeof eventData?.reason !== 'string' || typeof eventData?.description !== 'string') {
      return { ok: false, error: 'Dispute reason and description are required' }
    }
  }

  if (event === 'RESOLVE_DISPUTE') {
    const openDispute = bounty.disputes.find((item) => item.status === 'open')
    if (!openDispute) return { ok: false, error: 'No open dispute to resolve' }

    const resolution = eventData?.resolution
    if (!['funder_wins', 'lab_wins', 'partial_refund'].includes(String(resolution))) {
      return { ok: false, error: 'Invalid dispute resolution value' }
    }
  }

  return { ok: true as const }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const validationResult = transitionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const event = validationResult.data.event
    const eventData = validationResult.data.data as Record<string, unknown> | undefined

    const { data: bounty, error: fetchError } = await supabase
      .from('bounties')
      .select(`
        *,
        milestones(*),
        proposals(*),
        escrow:escrows(*),
        disputes(*),
        selected_lab:labs(user_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    const typedBounty = {
      ...(bounty as BountyWithRelations),
      escrow: Array.isArray((bounty as { escrow?: unknown }).escrow)
        ? (((bounty as { escrow: EscrowRow[] }).escrow[0] as EscrowRow | undefined) || null)
        : ((bounty as { escrow?: EscrowRow | null }).escrow || null),
      selected_lab: Array.isArray((bounty as { selected_lab?: unknown }).selected_lab)
        ? (((bounty as { selected_lab: Array<{ user_id: string }> }).selected_lab[0] as { user_id: string } | undefined) || null)
        : ((bounty as { selected_lab?: { user_id: string } | null }).selected_lab || null),
    } as BountyWithRelations
    const transition = stateTransitions[typedBounty.state]

    if (!transition) {
      return NextResponse.json({ error: `No transitions defined for state: ${typedBounty.state}` }, { status: 400 })
    }

    if (!transition.validEvents.includes(event)) {
      return NextResponse.json(
        {
          error: `Event '${event}' is not valid for state '${typedBounty.state}'`,
          validEvents: transition.validEvents,
        },
        { status: 400 }
      )
    }

    const userRole = dbUser?.role || 'funder'
    const isOwner = typedBounty.funder_id === user.id
    const isAssignedLab = typedBounty.selected_lab?.user_id === user.id

    const hasPermission =
      (transition.permissions.includes('funder') && isOwner) ||
      (transition.permissions.includes('lab') && isAssignedLab) ||
      (transition.permissions.includes('admin') && userRole === 'admin') ||
      (transition.permissions.includes('arbitrator') && userRole === 'arbitrator')

    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to perform this action' }, { status: 403 })
    }

    const validation = validateEventData(event, typedBounty, eventData)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const targetState = resolveTargetState(event, typedBounty, eventData)
    if (!targetState) {
      return NextResponse.json({ error: 'Unable to resolve transition target state' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      state: targetState,
      updated_at: new Date().toISOString(),
    }

    if (event === 'FUNDING_CONFIRMED') updates.funded_at = new Date().toISOString()
    if (event === 'SELECT_LAB' && validation.ok && 'proposal' in validation && validation.proposal) {
      updates.started_at = new Date().toISOString()
      updates.selected_lab_id = validation.proposal.lab_id
    }
    if (targetState === 'completed' || targetState === 'completed_payout') {
      updates.completed_at = new Date().toISOString()
    }

    const { data: updatedBounty, error: updateError } = await supabase
      .from('bounties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await handleTransitionSideEffects(supabase, typedBounty, event, eventData, user.id)
    await sendTransitionNotifications(supabase, typedBounty, event, user.id)

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id: id,
      action: `state_transition:${event}`,
      details: {
        from_state: typedBounty.state,
        to_state: targetState,
        event_data: eventData || {},
      },
    })

    return NextResponse.json({
      success: true,
      previousState: typedBounty.state,
      newState: targetState,
      bounty: updatedBounty,
    })
  } catch (error) {
    console.error('Error in POST /api/bounties/[id]/transition:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleTransitionSideEffects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bounty: BountyWithRelations,
  event: TransitionEvent,
  eventData: Record<string, unknown> | undefined,
  userId: string
) {
  switch (event) {
    case 'SELECT_LAB': {
      const proposalId = eventData?.proposalId as string | undefined
      if (!proposalId) break

      await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)

      await supabase
        .from('proposals')
        .update({ status: 'rejected', rejection_reason: 'Another proposal was selected' })
        .eq('bounty_id', bounty.id)
        .neq('id', proposalId)

      const selectedProposal = bounty.proposals.find((proposal) => proposal.id === proposalId)
      if (selectedProposal && selectedProposal.staked_amount > 0) {
        await supabase.from('staking_transactions').insert({
          lab_id: selectedProposal.lab_id,
          bounty_id: bounty.id,
          type: 'lock',
          amount: selectedProposal.staked_amount,
          balance_after: 0,
        })
      }

      const firstMilestone = bounty.milestones.find((milestone) => milestone.sequence === 1)
      if (firstMilestone) {
        await supabase
          .from('milestones')
          .update({ status: 'in_progress' })
          .eq('id', firstMilestone.id)
      }
      break
    }

    case 'SUBMIT_MILESTONE': {
      const milestoneId = eventData?.milestoneId as string | undefined
      if (!milestoneId) break

      await supabase
        .from('milestones')
        .update({
          status: 'submitted',
          evidence_hash: (eventData?.evidenceHash as string | undefined) || null,
          evidence_links: (eventData?.evidenceLinks as string[] | undefined) || [],
          submitted_at: new Date().toISOString(),
        })
        .eq('id', milestoneId)
      break
    }

    case 'APPROVE_MILESTONE': {
      const milestoneId = eventData?.milestoneId as string | undefined
      if (!milestoneId) break

      await supabase
        .from('milestones')
        .update({ status: 'verified', verified_at: new Date().toISOString() })
        .eq('id', milestoneId)

      const milestone = bounty.milestones.find((item) => item.id === milestoneId)
      if (!milestone) break

      const payoutAmount = (Number(milestone.payout_percentage) / 100) * Number(bounty.total_budget)
      const escrow = bounty.escrow
      if (escrow) {
        const nextReleased = Number(escrow.released_amount || 0) + payoutAmount
        const nextStatus = nextReleased >= Number(escrow.total_amount) ? 'fully_released' : 'partially_released'

        await supabase.from('escrow_releases').insert({
          escrow_id: escrow.id,
          milestone_id: milestoneId,
          amount: payoutAmount,
        })

        await supabase
          .from('escrows')
          .update({
            released_amount: nextReleased,
            status: nextStatus,
          })
          .eq('id', escrow.id)
      }

      const nextMilestone = bounty.milestones.find((item) => item.sequence === milestone.sequence + 1)
      if (nextMilestone) {
        await supabase
          .from('milestones')
          .update({ status: 'in_progress' })
          .eq('id', nextMilestone.id)
      }
      break
    }

    case 'REQUEST_REVISION': {
      const milestoneId = eventData?.milestoneId as string | undefined
      if (!milestoneId) break

      await supabase
        .from('milestones')
        .update({
          status: 'in_progress',
          review_feedback: (eventData?.feedback as string | undefined) || 'Revision requested',
        })
        .eq('id', milestoneId)
      break
    }

    case 'INITIATE_DISPUTE': {
      await supabase.from('disputes').insert({
        bounty_id: bounty.id,
        initiated_by: userId,
        reason: eventData?.reason as string,
        description: eventData?.description as string,
        evidence_links: (eventData?.evidenceLinks as string[]) || [],
      })
      break
    }

    case 'RESOLVE_DISPUTE': {
      await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution: eventData?.resolution as string,
          slash_amount: (eventData?.slashAmount as number) || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('bounty_id', bounty.id)
        .eq('status', 'open')
      break
    }
  }
}

async function sendTransitionNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bounty: BountyWithRelations,
  event: TransitionEvent,
  actorId: string
) {
  const notifications: Array<{
    user_id: string
    type: 'bounty_update' | 'proposal_received' | 'proposal_accepted' | 'milestone_submitted' | 'milestone_approved' | 'milestone_rejected' | 'dispute_opened' | 'dispute_resolved' | 'payment_received' | 'system'
    title: string
    message: string
    data: Record<string, unknown>
  }> = []

  if (event === 'SUBMIT_MILESTONE') {
    notifications.push({
      user_id: bounty.funder_id,
      type: 'milestone_submitted',
      title: 'Milestone Submitted',
      message: `A milestone for "${bounty.title}" has been submitted for review.`,
      data: { bounty_id: bounty.id },
    })
  }

  if (event === 'REQUEST_REVISION' && bounty.selected_lab?.user_id) {
    notifications.push({
      user_id: bounty.selected_lab.user_id,
      type: 'milestone_rejected',
      title: 'Revision Requested',
      message: `Revisions were requested for your milestone on "${bounty.title}".`,
      data: { bounty_id: bounty.id },
    })
  }

  if (event === 'APPROVE_MILESTONE' && bounty.selected_lab?.user_id) {
    notifications.push({
      user_id: bounty.selected_lab.user_id,
      type: 'milestone_approved',
      title: 'Milestone Approved',
      message: `Your milestone for "${bounty.title}" has been approved.`,
      data: { bounty_id: bounty.id },
    })
  }

  if (event === 'INITIATE_DISPUTE') {
    const disputeTarget = actorId === bounty.funder_id ? bounty.selected_lab?.user_id : bounty.funder_id
    if (disputeTarget) {
      notifications.push({
        user_id: disputeTarget,
        type: 'dispute_opened',
        title: 'Dispute Opened',
        message: `A dispute has been opened for "${bounty.title}".`,
        data: { bounty_id: bounty.id },
      })
    }
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }
}
