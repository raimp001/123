export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'funder' | 'lab' | 'admin' | 'arbitrator'
export type VerificationTier = 'unverified' | 'basic' | 'verified' | 'trusted' | 'institutional'
export type CurrencyType = 'USD' | 'USDC'
export type PaymentMethod = 'stripe' | 'solana_usdc' | 'base_usdc'
export type BountyStatus = 'draft' | 'open' | 'in_progress' | 'under_review' | 'completed' | 'disputed' | 'cancelled'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

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

/**
 * Canonical Lab interface — DB columns only.
 * Use normalizeLab() from lib/normalize.ts to handle legacy aliases.
 */
export interface Lab {
  id: string
  user_id: string
  name: string
  // Single canonical field for each concept:
  description: string | null         // canonical (was also bio)
  institution_affiliation: string | null  // canonical (was also institution)
  website: string | null
  location_country: string | null    // canonical (was also country)
  verification_tier: VerificationTier
  reputation_score: number
  total_bounties_completed: number
  total_earnings: number
  staking_balance: number            // canonical (was also staked_amount)
  locked_stake: number
  specializations: string[]          // canonical (was also specialties)
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
  // Convenience aliases (read-only, computed by normalizeLab)
  readonly bio: string | null
  readonly institution: string | null
  readonly country: string | null
  readonly staked_amount: number
  readonly specialties: string[]
}

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
  ethics_approval: string | null
  amount: number
  currency: CurrencyType
  payment_method: PaymentMethod
  status: BountyStatus
  deadline: string | null
  review_period_days: number
  is_public: boolean
  tags: string[]
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

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
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

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
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

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
