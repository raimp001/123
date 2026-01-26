"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Search, FlaskConical, ArrowUpRight } from "lucide-react"
import { useBounties } from "@/hooks/use-bounties"
import { CreateBountyModal } from "@/components/create-bounty-modal"
import Link from "next/link"

const stateColors: Record<string, string> = {
  drafting: "bg-secondary text-muted-foreground",
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

export default function BountiesPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  
  const { bounties, isLoading, error, pagination } = useBounties({
    state: filter === "all" ? undefined : filter,
    search: search || undefined,
  })

  const counts = {
    active: bounties.filter(b => 
      ["active_research", "milestone_review", "bidding", "funding_escrow"].includes(b.current_state)
    ).length,
    drafts: bounties.filter(b => b.current_state === "drafting").length,
    completed: bounties.filter(b => b.current_state === "completed").length,
    disputes: bounties.filter(b => b.current_state === "dispute_resolution").length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground tracking-tight">Bounties</h1>
          <p className="text-muted-foreground mt-1">Manage your research bounties</p>
        </div>
        <CreateBountyModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active", value: counts.active, icon: "●" },
          { label: "Drafts", value: counts.drafts, icon: "○" },
          { label: "Completed", value: counts.completed, color: "text-emerald-400", icon: "✓" },
          { label: "Disputes", value: counts.disputes, color: "text-red-400", icon: "!" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:border-accent/30 transition-all duration-300">
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-semibold tracking-tight ${stat.color || "text-foreground"}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search bounties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="drafting">Draft</SelectItem>
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
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-5">
                <Skeleton className="w-12 h-12 rounded-xl bg-secondary/50" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-3 bg-secondary/50" />
                  <Skeleton className="h-4 w-1/3 bg-secondary/50" />
                </div>
                <Skeleton className="h-7 w-20 rounded-lg bg-secondary/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-5">
              <FlaskConical className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">Unable to load bounties</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Please check your connection or configure Supabase environment variables
            </p>
          </CardContent>
        </Card>
      ) : bounties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xl font-medium text-foreground">
              {search ? "No bounties match your search" : "No bounties yet"}
            </p>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
              {search ? "Try different keywords or clear your search" : "Create your first research bounty to start funding breakthrough science"}
            </p>
            {!search && (
              <CreateBountyModal 
                trigger={
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" /> Create Your First Bounty
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bounties.map((bounty) => (
            <Link key={bounty.id} href={`/dashboard/bounties/${bounty.id}`}>
              <Card className="hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 group cursor-pointer">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300">
                    <FlaskConical className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-base truncate group-hover:text-accent transition-colors duration-200">
                      {bounty.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground/80">{formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}</span>
                      {bounty.selected_lab && (
                        <span className="ml-2 text-muted-foreground">• {bounty.selected_lab.name}</span>
                      )}
                    </p>
                  </div>
                  <Badge className={stateColors[bounty.current_state] || stateColors.drafting}>
                    {stateLabels[bounty.current_state] || bounty.current_state}
                  </Badge>
                  <div className="w-8 h-8 rounded-lg bg-transparent group-hover:bg-secondary/50 flex items-center justify-center transition-colors duration-200">
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {pagination.total > 0 && (
        <p className="text-sm text-center text-muted-foreground pt-4">
          Showing {bounties.length} of {pagination.total} bounties
        </p>
      )}
    </div>
  )
}
