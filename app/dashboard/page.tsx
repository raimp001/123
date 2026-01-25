"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  ArrowRight,
  FlaskConical,
  Wallet,
  Users,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { CreateBountyModal } from "@/components/create-bounty-modal"
import { useBounties } from "@/hooks/use-bounties"
import Link from "next/link"

const stateColors: Record<string, string> = {
  drafting: "bg-[#F3F4F6] text-[#6B7280]",
  funding_escrow: "bg-[#FEF3C7] text-[#92400E]",
  bidding: "bg-[#DBEAFE] text-[#1E40AF]",
  active_research: "bg-[#D1FAE5] text-[#065F46]",
  milestone_review: "bg-[#FFEDD5] text-[#9A3412]",
  dispute_resolution: "bg-[#FEE2E2] text-[#991B1B]",
  completed: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#F3F4F6] text-[#6B7280]",
}

const stateLabels: Record<string, string> = {
  drafting: "Draft",
  funding_escrow: "Funding",
  bidding: "Bidding",
  active_research: "Active",
  milestone_review: "Review",
  dispute_resolution: "Dispute",
  completed: "Completed",
  cancelled: "Cancelled",
}

function formatCurrency(amount: number, currency: string) {
  return currency === "USD" 
    ? `$${amount.toLocaleString()}` 
    : `${amount.toLocaleString()} ${currency}`
}

export default function DashboardPage() {
  const { bounties, isLoading, error, refresh } = useBounties({ limit: 6 })

  const stats = {
    active: bounties.filter(b => 
      ["active_research", "milestone_review", "bidding", "funding_escrow"].includes(b.current_state)
    ).length,
    total: bounties.reduce((sum, b) => sum + (b.total_budget || 0), 0),
    labs: new Set(bounties.filter(b => b.selected_lab_id).map(b => b.selected_lab_id)).size,
    disputes: bounties.filter(b => b.current_state === "dispute_resolution").length,
  }

  // Distinguish error vs empty state
  const hasError = error !== null
  const isEmpty = !isLoading && !hasError && bounties.length === 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage your research bounties</p>
        </div>
        <CreateBountyModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active", value: stats.active, icon: FlaskConical, color: "text-[#059669]" },
          { label: "Total Value", value: formatCurrency(stats.total, "USD"), icon: Wallet, color: "text-[#6B5FED]" },
          { label: "Labs", value: stats.labs, icon: Users, color: "text-[#2563EB]" },
          { label: "Disputes", value: stats.disputes, icon: AlertTriangle, color: "text-[#DC2626]" },
        ].map((stat) => (
          <Card 
            key={stat.label} 
            className="bg-white border-[#E5E7EB] rounded-xl"
            style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">{stat.label}</p>
                <p className="text-xl font-semibold text-[#111827]">{stat.value}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bounties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#111827]">Recent Bounties</h2>
          <Link href="/dashboard/bounties">
            <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#111827]">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasError ? (
          // Error state - technical issue
          <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
            <CardContent className="p-10 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto text-[#9CA3AF] mb-4" />
              <p className="font-medium text-[#111827] mb-2">Unable to load bounties</p>
              <p className="text-sm text-[#6B7280] mb-4 max-w-sm mx-auto">
                Please check your connection or try again later. 
                If the problem persists, contact support.
              </p>
              <Button 
                variant="outline" 
                onClick={() => refresh()}
                className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </CardContent>
          </Card>
        ) : isEmpty ? (
          // Empty state - no bounties yet (expected)
          <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
            <CardContent className="p-10 text-center">
              <FlaskConical className="w-10 h-10 mx-auto text-[#6B5FED] mb-4" />
              <p className="font-semibold text-[#111827] mb-2">No bounties yet</p>
              <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
                Create your first research bounty to get started.
              </p>
              <CreateBountyModal 
                trigger={
                  <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                    <Plus className="w-4 h-4 mr-2" /> Create Bounty
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {bounties.map((bounty) => (
              <Link key={bounty.id} href={`/dashboard/bounties/${bounty.id}`}>
                <Card 
                  className="bg-white border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors cursor-pointer rounded-xl"
                  style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#111827] truncate">
                        {bounty.title}
                      </h3>
                      <p className="text-sm text-[#6B7280]">
                        {formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}
                      </p>
                    </div>
                    <Badge className={`${stateColors[bounty.current_state] || stateColors.drafting} border-0`}>
                      {stateLabels[bounty.current_state] || bounty.current_state}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <Card 
        className="bg-[#6B5FED] border-0 rounded-xl overflow-hidden"
      >
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">Ready to fund research?</p>
            <p className="text-sm text-white/80">Create a bounty and connect with verified labs</p>
          </div>
          <CreateBountyModal 
            trigger={
              <Button className="bg-white hover:bg-[#F3F4F6] text-[#6B5FED] font-medium rounded-lg">
                Create Bounty
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
