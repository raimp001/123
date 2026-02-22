export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Role & Status Enums ──────────────────────────────────────────────────────
export type UserRole = 'funder' | 'lab' | 'admin' | 'arbitrator' | 'reviewer'
export type VerificationTier = 'unverified' | 'basic' | 'verified' | 'trusted' | 'institutional'
export type CurrencyType = 'USD' | 'USDC'
export type PaymentMethod = 'stripe' | 'solana_usdc' | 'base_usdc'
export type BountyStatus = 'draft' | 'open' | 'in_progress' | 'under_review' | 'completed' | 'disputed' | 'cancelled'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type ReviewDecision = 'approve' | 'revise' | 'reject'
export type IrbStatus = 'pending' | 'uploaded' | 'verified' | 'rejected'

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  wallet_address_solana: string | null
  wallet_address_evm: string | null
  email_verified: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── Lab ──────────────────────────────────────────────────────────────────────
/**
 * Canonical Lab interface — DB columns only.
 * Use normalizeLab() from lib/normalize.ts to handle legacy aliases.
 */
export interface Lab {
  id: string
  user_id: string
  name: string
  description: string | null          // canonical (was also bio)
  institution_affiliation: string | null // canonical (was also institution)
  website: string | null
  location_country: string | null     // canonical (was also country)
  verification_tier: VerificationTier
  reputation_score: number
  total_bounties_completed: number
  total_earnings: number
  staking_balance: number             // canonical (was also staked_amount)
  locked_stake: number
  specializations: string[]           // canonical (was also specialties)
  team_size: number | null
  is_public: boolean
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

/**
 * Runtime-normalized Lab — all alias fields resolved to canonical.
 * Returned by normalizeLab(); use this in UI components.
 */
export interface NormalizedLab extends Lab {
  readonly bio: string | null
  readonly institution: string | null
  readonly country: string | null
  readonly staked_amount: number
  readonly specialties: string[]
}

// ── Bounty ───────────────────────────────────────────────────────────────────
export interface Bounty {
  id: string
  funder_id: string
  selected_lab_id: string | null
  title: string
  description: string
  research_area: string
  methodology: string
  data_requirements: string[]
  quality_standards: string[]
  // IRB / ethics gate (PR#3: full document flow)
  ethics_approval: string | null      // free-text note or approval number
  irb_document_url: string | null     // uploaded IRB PDF (Supabase Storage path)
  irb_status: IrbStatus               // lifecycle of the IRB doc
  amount: number
  total_budget: number
  currency: CurrencyType
  payment_method: PaymentMethod
  status: BountyStatus
  state: string                       // XState lifecycle state
  visibility: 'public' | 'private'
  min_lab_tier: VerificationTier
  tags: string[]
  proposal_deadline: string | null
  deadline: string | null
  review_period_days: number
  // Escrow
  solana_escrow_pda: string | null
  base_contract_address: string | null
  // Peer review gate
  peer_review_required: boolean       // if true, proposals need 2-of-3 reviewer approval
  peer_review_threshold: number       // min approvals needed (default 2)
  is_public: boolean
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── Proposal ─────────────────────────────────────────────────────────────────
export interface Proposal {
  id: string
  bounty_id: string
  lab_id: string
  status: ProposalStatus
  cover_letter: string
  methodology: string
  timeline_days: number
  budget_breakdown: Json
  team_credentials: string
  // Peer review gate result
  peer_review_status: 'awaiting_review' | 'in_review' | 'approved' | 'rejected' | 'not_required'
  peer_review_approvals: number
  peer_review_rejections: number
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── ProposalReview (scientific peer review — PR#3) ───────────────────────────
/**
 * Structured scientific peer review of a research proposal.
 * Reviewers are assigned by admins with role='reviewer'.
 * Decision: approve | revise | reject.
 * 2-of-3 approvals unlock escrow commitment.
 */
export interface ProposalReview {
  id: string
  proposal_id: string
  bounty_id: string
  reviewer_id: string            // User with role='reviewer'
  // Double-blind: reviewer cannot see lab name until after decision
  is_blind: boolean
  // Structured scorecard (1–5 each)
  score_scientific_merit: number
  score_feasibility: number
  score_innovation: number
  score_team_qualifications: number
  score_ethics_compliance: number
  // Weighted average (computed server-side)
  overall_score: number
  // Written comments (stored but not shown to lab until decision)
  strengths: string
  weaknesses: string
  requested_revisions: string | null
  // Final decision
  decision: ReviewDecision
  conflict_of_interest: boolean  // reviewer flags own conflict
  conflict_details: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── Milestone ────────────────────────────────────────────────────────────────
export interface Milestone {
  id: string
  bounty_id: string
  proposal_id: string
  title: string
  description: string
  deliverables: string[]
  amount: number
  due_date: string | null
  status: MilestoneStatus
  submission_url: string | null
  submission_notes: string | null
  reviewer_notes: string | null
  // IPFS evidence (PR#3: wired to Pinata)
  evidence_hash: string | null   // IPFS CIDv1 — immutable evidence fingerprint
  evidence_ipfs_url: string | null // gateway URL (https://ipfs.io/ipfs/<cid>)
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── Payment ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: string
  bounty_id: string
  milestone_id: string | null
  from_user_id: string
  to_user_id: string | null
  amount: number
  currency: CurrencyType
  payment_method: PaymentMethod
  stripe_payment_intent_id: string | null
  transaction_hash: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── Review (general funder<>lab rating) ──────────────────────────────────────
export interface Review {
  id: string
  bounty_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── IrbDocument (PR#3: ethics document flow) ─────────────────────────────────
export interface IrbDocument {
  id: string
  bounty_id: string
  uploaded_by: string            // User ID
  file_name: string
  storage_path: string           // Supabase Storage path
  public_url: string | null      // signed URL (expires)
  ipfs_hash: string | null       // pinned to IPFS for immutability
  status: IrbStatus
  admin_notes: string | null     // admin verification notes
  verified_at: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

// ── ArbitratorStake (arbitrator incentive model) ─────────────────────────────
export interface ArbitratorStake {
  id: string
  dispute_id: string
  arbitrator_id: string
  staked_amount: number          // USDC staked to participate
  reward_amount: number | null   // 1% of disputed amount on resolution
  verdict: string | null
  verdict_at: string | null
  created_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}
