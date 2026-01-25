"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Scale, Clock, CheckCircle } from "lucide-react"
import { useBounties } from "@/hooks/use-bounties"

export default function DisputesPage() {
  const { bounties, isLoading, error } = useBounties({ state: "dispute_resolution" })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-foreground">Disputes</h1>
        <p className="text-sm text-muted-foreground">Manage active disputes and arbitration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xl font-semibold text-foreground">{bounties.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Scale className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xl font-semibold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">In Arbitration</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xl font-semibold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
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
            <p className="text-muted-foreground">Unable to load disputes</p>
          </CardContent>
        </Card>
      ) : bounties.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">No active disputes</p>
            <p className="text-sm text-muted-foreground mt-1">All bounties are running smoothly</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bounties.map((bounty) => (
            <Card key={bounty.id} className="border-border bg-card border-l-4 border-l-red-400">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{bounty.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(bounty.total_budget || 0).toLocaleString()} at stake
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Dispute
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
