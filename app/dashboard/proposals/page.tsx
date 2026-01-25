"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Proposal } from "@/types/database"

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30", icon: Clock },
  accepted: { label: "Accepted", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Not Selected", color: "bg-secondary text-muted-foreground", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "bg-secondary text-muted-foreground", icon: XCircle },
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProposals() {
      try {
        const supabase = createClient()
        if (!supabase) {
          setProposals([])
          return
        }

        const { data, error: queryError } = await supabase
          .from('proposals')
          .select('*, bounty:bounties(title, total_budget, currency)')
          .order('created_at', { ascending: false })

        if (queryError) throw queryError
        setProposals(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch proposals'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchProposals()
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-foreground">My Proposals</h1>
        <p className="text-sm text-muted-foreground">Track your submitted proposals</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-2 bg-secondary" />
                <Skeleton className="h-4 w-1/2 bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">Unable to load proposals</p>
          </CardContent>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">No proposals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Submit proposals on open bounties</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const status = statusConfig[proposal.status] || statusConfig.pending
            const StatusIcon = status.icon
            return (
              <Card key={proposal.id} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {(proposal as { bounty?: { title: string } }).bounty?.title || "Bounty"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Proposed: ${proposal.proposed_budget?.toLocaleString() || "—"}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
