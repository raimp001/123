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

export interface Lab {
  id: string
  user_id: string
  name: string
  description: string | null
  bio?: string | null
  institution_affiliation: string | null
  institution?: string | null
  website: string | null
  location_country: string | null
  country?: string | null
  verification_tier: VerificationTier
  reputation_score: number
  total_bounties_completed: number
  total_earnings: number
  staking_balance: number
  locked_stake: number
  staked_amount?: number
  specializations: string[]
  specialties?: string[]
  team_size: number | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Bounty {
  id: string
  funder_id: string
  selected_lab_id: string | null
  title: string
  description: string
  methodology: string
  data_requirements: string[]
  quality_standards: string[]
  ethics_approval: string | null
  total_budget: number
  currency: CurrencyType
  payment_method: PaymentMethod | null
  state: string
  current_state?: string
  state_history: Json[]
  deadline: string | null
  tags: string[]
  visibility: 'public' | 'private' | 'invite_only'
  min_lab_tier: VerificationTier
  proposal_deadline: string | null
  max_proposals: number
  created_at: string
  funded_at: string | null
  started_at: string | null
  completed_at: string | null
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Milestone {
  id: string
  bounty_id: string
  sequence: number
  title: string
  description: string
  deliverables: string[]
  payout_percentage: number
  due_date: string | null
  status: 'pending' | 'in_progress' | 'submitted' | 'verified' | 'rejected'
  evidence_hash: string | null
  evidence_links: string[]
  submission_notes: string | null
  review_feedback: string | null
  submitted_at: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Proposal {
  id: string
  bounty_id: string
  lab_id: string
  methodology: string
  timeline_days: number
  timeline?: string
  bid_amount: number
  proposed_budget?: number
  staked_amount: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'submitted'
  attachments: string[]
  team_members: Json | null
  rejection_reason: string | null
  accepted_at?: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Escrow {
  id: string
  bounty_id: string
  payment_method: PaymentMethod
  total_amount: number
  released_amount: number
  currency: CurrencyType
  status: 'pending' | 'locked' | 'partially_released' | 'fully_released' | 'refunded' | 'funded' | 'awaiting_deposit'
  stripe_payment_intent_id: string | null
  stripe_customer_id: string | null
  solana_escrow_pda: string | null
  solana_transaction_signature: string | null
  base_contract_address: string | null
  base_transaction_hash: string | null
  locked_at: string | null
  funded_at?: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Notification {
  id: string
  user_id: string
  type:
    | 'bounty_update'
    | 'proposal_received'
    | 'proposal_accepted'
    | 'milestone_submitted'
    | 'milestone_approved'
    | 'milestone_rejected'
    | 'dispute_opened'
    | 'dispute_resolved'
    | 'payment_received'
    | 'system'
  title: string
  message: string
  data: Json | null
  read: boolean
  read_at: string | null
  created_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface Dispute {
  id: string
  bounty_id: string
  initiated_by: string
  reason: string
  description: string
  evidence_links: string[]
  status: 'open' | 'under_review' | 'arbitration' | 'resolved'
  resolution: 'funder_wins' | 'lab_wins' | 'partial_refund' | null
  slash_amount: number | null
  arbitrator_id: string | null
  arbitrator_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  [key: string]: Json | string | number | boolean | null | undefined
}

export interface EscrowRelease {
  id: string
  escrow_id: string
  milestone_id: string
  amount: number
  transaction_hash: string | null
  recipient_address: string | null
  released_at: string
  created_at: string
}

export interface StakingTransaction {
  id: string
  lab_id: string
  bounty_id: string | null
  type: 'deposit' | 'withdrawal' | 'lock' | 'unlock' | 'slash'
  amount: number
  balance_after: number
  transaction_hash: string | null
  notes: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  bounty_id: string | null
  action: string
  details: Json
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface WalletAuthNonce {
  id: string
  wallet_address: string
  provider: 'evm' | 'solana'
  nonce: string
  message: string
  expires_at: string
  used_at: string | null
  created_at: string
}

type RowByName = {
  users: User
  labs: Lab
  bounties: Bounty
  milestones: Milestone
  proposals: Proposal
  escrows: Escrow
  escrow_releases: EscrowRelease
  disputes: Dispute
  staking_transactions: StakingTransaction
  notifications: Notification
  activity_logs: ActivityLog
  wallet_auth_nonces: WalletAuthNonce
}

type InsertOf<T> = Partial<T>
type UpdateOf<T> = Partial<T>
type TableDef<T> = { Row: T; Insert: InsertOf<T>; Update: UpdateOf<T>; Relationships: [] }

export interface Database {
  public: {
    Tables: {
      users: TableDef<RowByName['users']>
      labs: TableDef<RowByName['labs']>
      bounties: TableDef<RowByName['bounties']>
      milestones: TableDef<RowByName['milestones']>
      proposals: TableDef<RowByName['proposals']>
      escrows: TableDef<RowByName['escrows']>
      escrow_releases: TableDef<RowByName['escrow_releases']>
      disputes: TableDef<RowByName['disputes']>
      staking_transactions: TableDef<RowByName['staking_transactions']>
      notifications: TableDef<RowByName['notifications']>
      activity_logs: TableDef<RowByName['activity_logs']>
      wallet_auth_nonces: TableDef<RowByName['wallet_auth_nonces']>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      verification_tier: VerificationTier
      currency_type: CurrencyType
      payment_method: PaymentMethod
    }
  }
}
