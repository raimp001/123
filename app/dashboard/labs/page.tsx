"use client"

import { useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
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
import { Search, Shield, ShieldCheck, Building2, Star, ExternalLink, Plus, RefreshCw, HelpCircle } from "lucide-react"
import { useLabs } from "@/hooks/use-labs"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TIER_HELP =
  "Basic: email verified. Verified: full KYC. Trusted: successful track record. Institutional: university/company verified."

const tierConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  unverified: { label: "Unverified", color: "bg-secondary text-muted-foreground", icon: Shield },
  basic: { label: "Basic", color: "bg-secondary text-muted-foreground", icon: Shield },
  verified: { label: "Verified", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30", icon: ShieldCheck },
  trusted: { label: "Trusted", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", icon: ShieldCheck },
  institutional: { label: "Institutional", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", icon: Building2 },
}

export default function LabsPage() {
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const debouncedSearch = useDebounce(search)
  
  const { labs, isLoading, error, refresh } = useLabs({
    tier: tierFilter === "all" ? undefined : tierFilter,
    search: debouncedSearch || undefined,
  })

  const hasError = error !== null
  const isEmpty = !isLoading && !hasError && labs.length === 0

  return (
    <TooltipProvider>
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-foreground">Browse Labs</h1>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/signup?role=lab">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Apply as Lab
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search labs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-1">
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="institutional">Institutional</SelectItem>
            <SelectItem value="trusted">Trusted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-4 h-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {TIER_HELP}
          </TooltipContent>
        </Tooltip>
        </div>
      </div>

      {/* Labs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3 mb-1.5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="py-10 text-center border border-border/40 rounded-xl">
          <p className="text-sm text-muted-foreground mb-3">Unable to load labs</p>
          <Button variant="outline" size="sm" onClick={() => refresh()} className="rounded-full">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="py-12 text-center border border-border/40 rounded-xl border-dashed">
          <p className="text-sm font-medium text-foreground mb-1">
            {search ? "No labs found" : "No labs registered yet"}
          </p>
          <p className="text-xs text-muted-foreground mb-5">
            {search ? "Try different keywords" : "Be among the first labs to join SciFlow"}
          </p>
          {!search && (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/signup?role=lab">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Apply as Lab
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => {
            const tier = tierConfig[lab.verification_tier] || tierConfig.unverified
            const TierIcon = tier.icon
            return (
              <div
                key={lab.id}
                className="border border-border/40 rounded-xl p-5 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-medium text-sm text-foreground">{lab.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[lab.institution, lab.country].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={`${tier.color} text-xs flex-shrink-0 cursor-help`}>
                        <TierIcon className="w-3 h-3 mr-1" />
                        {tier.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{TIER_HELP}</TooltipContent>
                  </Tooltip>
                </div>

                {lab.specialties && lab.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lab.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                        {s}
                      </span>
                    ))}
                    {lab.specialties.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                        +{lab.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-xs cursor-help">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-foreground font-medium">
                          {lab.reputation_score?.toFixed(1) || "—"}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Reputation score from completed bounties</TooltipContent>
                  </Tooltip>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                    <Link href={`/labs/${lab.id}`}>
                      View <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
