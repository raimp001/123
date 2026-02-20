"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, ArrowUpRight, Bot } from "lucide-react"
import { useBounties } from "@/hooks/use-bounties"
import { CreateBountyModal } from "@/components/create-bounty-modal"
import { useAuth } from "@/contexts/auth-context"
import {
  extractOpenClawReview,
  getOpenClawRiskLevel,
  openClawDecisionLabel,
  type OpenClawRiskLevel,
} from "@/lib/openclaw-review"
import Link from "next/link"

const stateColors: Record<string, string> = {
  drafting: "bg-secondary text-muted-foreground",
  admin_review: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  ready_for_funding: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  funding_escrow: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  bidding: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  active_research: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  milestone_review: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  dispute_resolution: "bg-red-500/20 text-red-400 border border-red-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-secondary text-muted-foreground",
}

const stateLabels: Record<string, string> = {
  drafting: "Draft",
  admin_review: "Admin Review",
  ready_for_funding: "Ready to Fund",
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

const riskBadgeClasses: Record<OpenClawRiskLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border border-red-500/20",
}

function riskLabel(level: OpenClawRiskLevel) {
  if (level === "high") return "High"
  if (level === "medium") return "Medium"
  return "Low"
}

function riskPriority(level: OpenClawRiskLevel | null) {
  if (level === "high") return 0
  if (level === "medium") return 1
  if (level === "low") return 2
  return 3
}

export default function BountiesPage() {
  const { isAdmin } = useAuth()
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [adminView, setAdminView] = useState<"all" | "queue" | "high_risk">("all")
  
  const { bounties, isLoading, error, pagination } = useBounties({
    state: filter === "all" ? undefined : filter,
    search: search || undefined,
  })

  const decoratedBounties = useMemo(
    () =>
      bounties.map((bounty) => {
        const openClawReview = extractOpenClawReview(bounty.state_history)
        const riskLevel = getOpenClawRiskLevel(openClawReview)
        return {
          ...bounty,
          currentState: bounty.current_state ?? bounty.state,
          openClawReview,
          riskLevel,
        }
      }),
    [bounties]
  )

  const orderedBounties = useMemo(() => {
    const list = [...decoratedBounties]
    list.sort((a, b) => {
      if (isAdmin) {
        const aQueue = a.currentState === "admin_review" ? 0 : 1
        const bQueue = b.currentState === "admin_review" ? 0 : 1
        if (aQueue !== bQueue) return aQueue - bQueue

        const riskDiff = riskPriority(a.riskLevel) - riskPriority(b.riskLevel)
        if (riskDiff !== 0) return riskDiff
      }

      const aCreated = Date.parse(a.created_at || "")
      const bCreated = Date.parse(b.created_at || "")
      return (Number.isFinite(bCreated) ? bCreated : 0) - (Number.isFinite(aCreated) ? aCreated : 0)
    })
    return list
  }, [decoratedBounties, isAdmin])

  const visibleBounties = useMemo(() => {
    if (!isAdmin || adminView === "all") return orderedBounties
    if (adminView === "queue") {
      return orderedBounties.filter((bounty) => bounty.currentState === "admin_review")
    }
    return orderedBounties.filter((bounty) => bounty.riskLevel === "high")
  }, [orderedBounties, isAdmin, adminView])

  const counts = {
    active: decoratedBounties.filter(b => 
      ["active_research", "milestone_review", "bidding", "funding_escrow"].includes(b.currentState)
    ).length,
    drafts: decoratedBounties.filter(b => b.currentState === "drafting").length,
    completed: decoratedBounties.filter(b => b.currentState === "completed").length,
    disputes: decoratedBounties.filter(b => b.currentState === "dispute_resolution").length,
    reviewQueue: decoratedBounties.filter(b => b.currentState === "admin_review").length,
    highRisk: decoratedBounties.filter(b => b.riskLevel === "high").length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Bounties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track funding lifecycle and OpenClaw risk signals from one queue.
          </p>
        </div>
        <CreateBountyModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active", value: counts.active },
          { label: "Drafts", value: counts.drafts },
          { label: "Completed", value: counts.completed, color: "text-emerald-400" },
          { label: "Disputes", value: counts.disputes, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="text-center py-3">
            <p className={`text-2xl font-medium ${stat.color || "text-foreground"}`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="w-4 h-4 text-violet-400" />
              OpenClaw triage queue
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-violet-500/30 text-violet-300">
                {counts.reviewQueue} awaiting admin review
              </Badge>
              <Badge variant="outline" className="border-red-500/30 text-red-300">
                {counts.highRisk} high-risk flagged
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              size="sm"
              variant={adminView === "all" ? "default" : "outline"}
              onClick={() => setAdminView("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={adminView === "queue" ? "default" : "outline"}
              onClick={() => setAdminView("queue")}
            >
              Needs Review
            </Button>
            <Button
              size="sm"
              variant={adminView === "high_risk" ? "default" : "outline"}
              onClick={() => setAdminView("high_risk")}
            >
              High Risk
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="drafting">Draft</SelectItem>
            <SelectItem value="admin_review">Admin Review</SelectItem>
            <SelectItem value="funding_escrow">Funding</SelectItem>
            <SelectItem value="bidding">Bidding</SelectItem>
            <SelectItem value="active_research">Active</SelectItem>
            <SelectItem value="milestone_review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dispute_resolution">Dispute</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border/30">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Unable to load bounties</p>
        </div>
      ) : visibleBounties.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-foreground font-medium mb-1">
            {search ? "No results" : "No bounties yet"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {search ? "Try different keywords" : "Create your first research bounty"}
          </p>
          {!search && (
            <CreateBountyModal 
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Create Bounty
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {visibleBounties.map((bounty) => (
            <Link key={bounty.id} href={`/dashboard/bounties/${bounty.id}`} className="block">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-3 group cursor-pointer hover:bg-secondary/20 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-accent transition-colors">
                      {bounty.title}
                    </h3>
                    {bounty.openClawReview && (
                      <Badge variant="outline" className="text-[11px] border-violet-500/30 text-violet-300">
                        OpenClaw: {openClawDecisionLabel(bounty.openClawReview.decision)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}
                    {bounty.selected_lab && (
                      <span className="ml-2">· {bounty.selected_lab.name}</span>
                    )}
                    <span className="ml-2">
                      · {new Date(bounty.created_at).toLocaleDateString()}
                    </span>
                  </p>
                  {bounty.openClawReview && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Score {bounty.openClawReview.score ?? "--"} · {bounty.openClawReview.signals.length} signal
                      {bounty.openClawReview.signals.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {bounty.riskLevel && (
                    <Badge className={riskBadgeClasses[bounty.riskLevel]}>
                      {riskLabel(bounty.riskLevel)} Risk
                    </Badge>
                  )}
                  <Badge className={stateColors[bounty.currentState] || stateColors.drafting}>
                    {stateLabels[bounty.currentState] || bounty.currentState}
                  </Badge>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination.total > 0 && (
        <p className="text-xs text-center text-muted-foreground/50 pt-2">
          {visibleBounties.length} of {pagination.total}
        </p>
      )}
    </div>
  )
}
