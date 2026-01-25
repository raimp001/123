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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Bounties</h1>
          <p className="text-sm text-muted-foreground">Manage your research bounties</p>
        </div>
        <CreateBountyModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active", value: counts.active },
          { label: "Drafts", value: counts.drafts },
          { label: "Completed", value: counts.completed, color: "text-emerald-400" },
          { label: "Disputes", value: counts.disputes, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-semibold ${stat.color || "text-foreground"}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-foreground">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-card text-foreground border-border">
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
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg bg-secondary" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-2/3 mb-2 bg-secondary" />
                  <Skeleton className="h-4 w-1/4 bg-secondary" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">Unable to load bounties</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Please configure Supabase environment variables</p>
          </CardContent>
        </Card>
      ) : bounties.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">
              {search ? "No bounties match your search" : "No bounties yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {search ? "Try different keywords" : "Create your first research bounty to get started"}
            </p>
            {!search && (
              <CreateBountyModal 
                trigger={
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                    <Plus className="w-4 h-4 mr-1" /> Create Bounty
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bounties.map((bounty) => (
            <Link key={bounty.id} href={`/dashboard/bounties/${bounty.id}`}>
              <Card className="border-border bg-card hover:border-accent/50 transition-colors group cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {bounty.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}
                      {bounty.selected_lab && (
                        <span className="ml-2">• {bounty.selected_lab.name}</span>
                      )}
                    </p>
                  </div>
                  <Badge className={stateColors[bounty.current_state] || stateColors.drafting}>
                    {stateLabels[bounty.current_state] || bounty.current_state}
                  </Badge>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {pagination.total > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Showing {bounties.length} of {pagination.total} bounties
        </p>
      )}
    </div>
  )
}
