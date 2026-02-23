/**
 * app/api/proposals/[id]/review/route.ts (PR#3)
 *
 * GET  /api/proposals/:id/review
 *  – Returns all ProposalReview rows for a proposal
 *  – Reviewers see own review; admins/funders see all
 *  – Labs see only aggregate score (double-blind until decision)
 *
 * POST /api/proposals/:id/review
 *  – Creates or updates a reviewer's scorecard
 *  – Requires role='reviewer' (assigned by admin)
 *  – On submission: recomputes overall_score, updates proposal peer_review_status
 *  – If approvals >= bounty.peer_review_threshold → proposal peer_review_status='approved'
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ReviewDecision, UserRole } from '@/types/database'

// Next.js 15: params is now a Promise
type Ctx = { params: Promise<{ id: string }> }

type ProposalMeta = {
  id: string
  bounty_id: string
  lab_id: string
}

// Weights for overall_score computation
const WEIGHTS = {
  score_scientific_merit:    0.30,
  score_feasibility:         0.20,
  score_innovation:          0.20,
  score_team_qualifications: 0.15,
  score_ethics_compliance:   0.15,
} as const

function computeOverallScore(scores: Record<string, number>): number {
  let total = 0
  for (const [field, weight] of Object.entries(WEIGHTS)) {
    total += (scores[field] ?? 0) * weight
  }
  return Math.round(total * 100) / 100
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function readThreshold(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return 2
  return value
}

// ── GET ──────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id: proposalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: roleErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 })

  const role = (profile?.role as UserRole | undefined) ?? 'lab'

  const { data: proposalData, error: proposalErr } = await supabase
    .from('proposals')
    .select('id, bounty_id, lab_id')
    .eq('id', proposalId)
    .single()
  const proposal = proposalData as ProposalMeta | null
  if (proposalErr || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  // Admins see full reviews
  if (role === 'admin') {
    const { data, error } = await supabase
      .from('proposal_reviews')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reviews: data })
  }

  // Funder can only view reviews for their own bounty
  if (role === 'funder') {
    const { data: bountyData, error: bountyErr } = await supabase
      .from('bounties')
      .select('funder_id')
      .eq('id', proposal.bounty_id)
      .single()
    const bounty = bountyData as { funder_id: string } | null
    if (bountyErr) return NextResponse.json({ error: bountyErr.message }, { status: 500 })
    if (!bounty || bounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('proposal_reviews')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reviews: data })
  }

  // Reviewers see only their own review
  if (role === 'reviewer') {
    const { data, error } = await supabase
      .from('proposal_reviews')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('reviewer_id', user.id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ review: data })
  }

  // Labs can only view aggregate for their own proposal (double-blind).
  const { data: labData, error: labErr } = await supabase
    .from('labs')
    .select('user_id')
    .eq('id', proposal.lab_id)
    .single()
  const lab = labData as { user_id: string } | null
  if (labErr) return NextResponse.json({ error: labErr.message }, { status: 500 })
  if (!lab || lab.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: reviews, error: reviewsErr } = await supabase
    .from('proposal_reviews')
    .select('overall_score, decision, submitted_at')
    .eq('proposal_id', proposalId)
    .not('submitted_at', 'is', null)
  if (reviewsErr) return NextResponse.json({ error: reviewsErr.message }, { status: 500 })

  const submitted = (reviews ?? []).filter(
    (r: { submitted_at: string | null }) => Boolean(r.submitted_at)
  )
  const avgScore = submitted.length
    ? submitted.reduce((sum: number, r: { overall_score: number | null }) => sum + (r.overall_score ?? 0), 0) / submitted.length
    : null

  return NextResponse.json({
    aggregate: {
      count: submitted.length,
      average_score: avgScore === null ? null : Math.round(avgScore * 100) / 100,
      approvals: submitted.filter((r: { decision: ReviewDecision | null }) => r.decision === 'approve').length,
      revisions: submitted.filter((r: { decision: ReviewDecision | null }) => r.decision === 'revise').length,
      rejections: submitted.filter((r: { decision: ReviewDecision | null }) => r.decision === 'reject').length,
    },
  })
}

// ── POST ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, { params }: Ctx) {
  const { id: proposalId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Must be a reviewer
  const { data: profile, error: roleErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 })

  if (profile?.role !== 'reviewer') {
    return NextResponse.json(
      { error: 'Only users with role=reviewer may submit reviews' },
      { status: 403 }
    )
  }

  // Validate proposal exists — use FK hint for bounty join
  const { data: proposal, error: propErr } = await supabase
    .from('proposals')
    .select('id, bounty_id, peer_review_status, bounty:bounties!proposals_bounty_id_fkey(peer_review_threshold, peer_review_required)')
    .eq('id', proposalId)
    .single()

  if (propErr || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  const bountyMeta = Array.isArray(proposal.bounty) ? proposal.bounty[0] : proposal.bounty
  const peerReviewRequired = Boolean((bountyMeta as { peer_review_required?: boolean } | null)?.peer_review_required)
  if (!peerReviewRequired) {
    return NextResponse.json({ error: 'Peer review is not required for this bounty' }, { status: 400 })
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate scores (1–5)
  const scoreFields = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]
  for (const field of scoreFields) {
    const v = body[field]
    if (typeof v !== 'number' || v < 1 || v > 5) {
      return NextResponse.json(
        { error: `${field} must be a number between 1 and 5` },
        { status: 400 }
      )
    }
  }

  const validDecisions: ReviewDecision[] = ['approve', 'revise', 'reject']
  if (!validDecisions.includes(body.decision as ReviewDecision)) {
    return NextResponse.json(
      { error: 'decision must be approve | revise | reject' },
      { status: 400 }
    )
  }

  const strengths = asNonEmptyString(body.strengths)
  const weaknesses = asNonEmptyString(body.weaknesses)
  const requestedRevisions = asNonEmptyString(body.requested_revisions)
  const decision = body.decision as ReviewDecision

  if (!strengths || !weaknesses) {
    return NextResponse.json(
      { error: 'strengths and weaknesses are required' },
      { status: 400 }
    )
  }

  if (decision === 'revise' && !requestedRevisions) {
    return NextResponse.json(
      { error: 'requested_revisions is required when decision is revise' },
      { status: 400 }
    )
  }

  const overallScore = computeOverallScore(body as Record<string, number>)

  // Upsert the review (one reviewer = one review per proposal)
  const reviewPayload = {
    proposal_id:               proposalId,
    bounty_id:                 proposal.bounty_id,
    reviewer_id:               user.id,
    is_blind:                  true,
    score_scientific_merit:    body.score_scientific_merit as number,
    score_feasibility:         body.score_feasibility as number,
    score_innovation:          body.score_innovation as number,
    score_team_qualifications: body.score_team_qualifications as number,
    score_ethics_compliance:   body.score_ethics_compliance as number,
    overall_score:             overallScore,
    strengths,
    weaknesses,
    requested_revisions:       requestedRevisions,
    decision,
    conflict_of_interest:      !!(body.conflict_of_interest),
    conflict_details:          asNonEmptyString(body.conflict_details),
    submitted_at:              new Date().toISOString(),
    updated_at:                new Date().toISOString(),
  }

  const { data: savedReview, error: saveErr } = await supabase
    .from('proposal_reviews')
    .upsert(reviewPayload, {
      onConflict: 'proposal_id,reviewer_id',
    })
    .select()
    .single()

  if (saveErr) {
    console.error('[review] upsert error:', saveErr)
    return NextResponse.json({ error: saveErr.message }, { status: 500 })
  }

  // Recompute proposal peer_review_status
  const { data: allReviews, error: allReviewsErr } = await supabase
    .from('proposal_reviews')
    .select('decision')
    .eq('proposal_id', proposalId)
    .not('submitted_at', 'is', null)
  if (allReviewsErr) {
    return NextResponse.json({ error: allReviewsErr.message }, { status: 500 })
  }

  const submitted = allReviews ?? []
  const approvals  = submitted.filter((r: { decision: ReviewDecision | null }) => r.decision === 'approve').length
  const rejections = submitted.filter((r: { decision: ReviewDecision | null }) => r.decision === 'reject').length
  const threshold = readThreshold(
    (bountyMeta as { peer_review_threshold?: number } | null)?.peer_review_threshold
  )

  let peerStatus: string
  if (approvals  >= threshold) peerStatus = 'approved'
  else if (rejections >= threshold) peerStatus = 'rejected'
  else peerStatus = 'in_review'

  const { error: updateErr } = await supabase
    .from('proposals')
    .update({
      peer_review_status:      peerStatus,
      peer_review_approvals:   approvals,
      peer_review_rejections:  rejections,
      updated_at:              new Date().toISOString(),
    })
    .eq('id', proposalId)
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({
    review:      savedReview,
    peer_status: peerStatus,
    approvals,
    rejections,
  })
}
