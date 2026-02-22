/**
 * DB persistence layer for the XState bounty machine.
 */

import { createClient } from '@/lib/supabase/server'
import type { BountyContext } from './bounty-machine'

export async function persistBountyTransition(
  bountyId: string,
  newState: string,
  contextDelta: Partial<Record<string, unknown>> = {}
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('bounties')
    .update({
      state:            newState,
      state_updated_at: new Date().toISOString(),
      ...contextDelta,
    })
    .eq('id', bountyId)
    .throwOnError()
}

export async function rehydrateBounty(bountyId: string): Promise<BountyContext | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bounties')
    .select(`
      *,
      milestones (*),
      proposals (*),
      disputes (*)
    `)
    .eq('id', bountyId)
    .single()

  if (error || !data) return null

  return {
    bountyId:             data.id,
    funderId:             data.funder_id,
    title:                data.title,
    description:          data.description ?? '',
    protocol:             data.protocol ?? { methodology: '', dataRequirements: [], qualityStandards: [] },
    totalBudget:          data.total_budget,
    currency:             data.currency ?? 'USD',
    paymentMethod:        data.payment_method,
    escrow:               data.escrow,
    milestones:           (data.milestones ?? []).map((m: any) => ({
      id:               m.id,
      title:            m.title,
      description:      m.description,
      deliverables:     m.deliverables ?? [],
      payoutPercentage: m.payout_percentage,
      dueDate:          new Date(m.due_date),
      evidenceHash:     m.evidence_hash,
      verifiedAt:       m.verified_at ? new Date(m.verified_at) : undefined,
      status:           m.status,
      revisionCount:    m.revision_count ?? 0,
    })),
    currentMilestoneIndex: (data.milestones ?? []).findIndex((m: any) => m.status === 'in_progress') ?? 0,
    proposals:             (data.proposals ?? []).map((p: any) => ({
      id:               p.id,
      labId:            p.lab_id,
      labName:          p.lab_name ?? '',
      verificationTier: p.verification_tier ?? 'unverified',
      methodology:      p.methodology,
      timeline:         p.timeline,
      bidAmount:        p.bid_amount,
      stakedAmount:     p.staked_amount ?? 0,
      submittedAt:      new Date(p.submitted_at),
      attachments:      p.attachments ?? [],
    })),
    selectedLabId:        data.selected_lab_id,
    selectedProposalId:   data.selected_proposal_id,
    dispute:              data.disputes?.[0] ? {
      id:           data.disputes[0].id,
      reason:       data.disputes[0].reason,
      initiatedBy:  data.disputes[0].initiated_by,
      evidenceLinks:data.disputes[0].evidence_links ?? [],
      description:  data.disputes[0].description,
      createdAt:    new Date(data.disputes[0].created_at),
      resolvedAt:   data.disputes[0].resolved_at ? new Date(data.disputes[0].resolved_at) : undefined,
      resolution:   data.disputes[0].resolution,
      slashAmount:  data.disputes[0].slash_amount,
    } : undefined,
    openClawResult:       data.openclaw_result,
    adminReviewNote:      data.admin_review_note,
    adminReviewedBy:      data.admin_reviewed_by,
    createdAt:            new Date(data.created_at),
    openClawReviewedAt:   data.openclaw_reviewed_at ? new Date(data.openclaw_reviewed_at) : undefined,
    adminApprovedAt:      data.admin_approved_at ? new Date(data.admin_approved_at) : undefined,
    fundedAt:             data.funded_at ? new Date(data.funded_at) : undefined,
    startedAt:            data.started_at ? new Date(data.started_at) : undefined,
    completedAt:          data.completed_at ? new Date(data.completed_at) : undefined,
  }
}
