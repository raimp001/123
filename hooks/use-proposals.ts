"use client"

import { useCallback, useEffect, useState } from 'react'

interface Proposal {
  id: string
  bounty_id: string
  lab_id: string
  methodology: string
  timeline: string
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  accepted_at?: string
  rejection_reason?: string
  bounty?: {
    id: string
    title: string
    total_budget: number
    currency: string
    state: string
  }
  lab?: {
    id: string
    name: string
    verification_tier: string
    reputation_score: number
  }
}

interface UseProposalsOptions {
  bounty_id?: string
  lab_id?: string
  status?: string
  myProposals?: boolean
  limit?: number
}

interface UseProposalsReturn {
  proposals: Proposal[]
  isLoading: boolean
  error: Error | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
}

export function useProposals(options: UseProposalsOptions = {}): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)

  const limit = options.limit || 20

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: String(limit),
      })

      if (options.bounty_id) params.set('bounty_id', options.bounty_id)
      if (options.lab_id) params.set('lab_id', options.lab_id)
      if (options.status) params.set('status', options.status)
      if (options.myProposals) params.set('my', 'true')

      const response = await fetch(`/api/proposals?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch proposals')
      }

      setProposals(data.proposals || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch proposals'))
      setProposals([])
    } finally {
      setIsLoading(false)
    }
  }, [limit, options.bounty_id, options.lab_id, options.status, options.myProposals])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return {
    proposals,
    isLoading,
    error,
    pagination: {
      page: 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    refetch: fetchProposals,
  }
}

// Hook for submitting a proposal
export function useSubmitProposal() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitProposal = useCallback(async (data: {
    bounty_id: string
    methodology: string
    timeline: string
    budget_breakdown?: Array<{ item: string; amount: number; justification?: string }>
    team_members?: Array<{ name: string; role: string; expertise?: string }>
    relevant_experience?: string
  }) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit proposal')
      }

      return { success: true, proposal: result }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit proposal')
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submitProposal, isSubmitting, error }
}

// Hook for accepting/rejecting proposals (for funders)
export function useProposalActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const acceptProposal = useCallback(async (proposalId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept proposal')
      }

      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept proposal')
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const rejectProposal = useCallback(async (proposalId: string, reason?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejection_reason: reason }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject proposal')
      }

      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject proposal')
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { acceptProposal, rejectProposal, isLoading, error }
}
