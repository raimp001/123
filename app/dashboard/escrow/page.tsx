"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Lock, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Escrow {
  id: string
  bounty_id: string
  amount: number
  currency: string
  status: string
  payment_method: string
  created_at: string
  bounty?: { title: string }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Lock }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30", icon: Clock },
  held: { label: "Held", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", icon: Lock },
  released: { label: "Released", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", icon: CheckCircle },
  refunded: { label: "Refunded", color: "bg-secondary text-muted-foreground", icon: AlertTriangle },
  disputed: { label: "Disputed", color: "bg-red-500/20 text-red-400 border border-red-500/30", icon: AlertTriangle },
}

export default function EscrowPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchEscrows() {
      try {
        const supabase = createClient()
        if (!supabase) {
          setEscrows([])
          return
        }

        const { data, error: queryError } = await supabase
          .from('escrows')
          .select('*, bounty:bounties(title)')
          .order('created_at', { ascending: false })

        if (queryError) throw queryError
        setEscrows(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch escrows'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchEscrows()
  }, [])

  const totalHeld = escrows
    .filter(e => e.status === 'held')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-foreground">Escrow</h1>
        <p className="text-sm text-muted-foreground">Track escrowed funds</p>
      </div>

      {/* Total Held */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Held in Escrow</p>
          <p className="text-3xl font-semibold text-foreground">${totalHeld.toLocaleString()}</p>
        </CardContent>
      </Card>

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
            <p className="text-muted-foreground">Unable to load escrows</p>
          </CardContent>
        </Card>
      ) : escrows.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">No escrows</p>
            <p className="text-sm text-muted-foreground mt-1">Funds will appear here when bounties are funded</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {escrows.map((escrow) => {
            const status = statusConfig[escrow.status] || statusConfig.pending
            const StatusIcon = status.icon
            return (
              <Card key={escrow.id} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {escrow.bounty?.title || "Bounty"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${escrow.amount.toLocaleString()} {escrow.currency}
                        <span className="ml-2 capitalize">via {escrow.payment_method?.replace('_', ' ')}</span>
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
