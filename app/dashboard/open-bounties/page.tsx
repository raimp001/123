"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Send, Clock, Plus, Bell, Sparkles } from "lucide-react"
import { useBounties } from "@/hooks/use-bounties"
import { useAuth } from "@/contexts/auth-context"
import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"

function formatCurrency(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString()}` : `${amount.toLocaleString()} ${currency}`
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function OpenBountiesPage() {
  const [search, setSearch] = useState("")
  const [notifyEmail, setNotifyEmail] = useState("")
  const debouncedSearch = useDebounce(search)
  const { lab } = useAuth()

  const { bounties, isLoading, error } = useBounties({
    state: "bidding",
    search: debouncedSearch || undefined
  })

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thanks! We'll notify you when bounties open.")
    setNotifyEmail("")
  }

  const hasError = error !== null
  const isEmpty = !isLoading && !hasError && bounties.length === 0

  const labSpecializations = (lab?.specializations ?? lab?.specialties ?? []) as string[]
  const specSet = useMemo(() => new Set(labSpecializations.map(s => s.toLowerCase())), [labSpecializations])
  const { recommended, other } = useMemo(() => {
    if (!bounties.length) return { recommended: [] as typeof bounties, other: [] as typeof bounties }
    const rec: typeof bounties = []
    const rest: typeof bounties = []
    for (const b of bounties) {
      const tags = (b.tags ?? []) as string[]
      const match = tags.some(t => specSet.has(String(t).toLowerCase()))
      if (match && labSpecializations.length > 0) rec.push(b)
      else rest.push(b)
    }
    return { recommended: rec, other: rest }
  }, [bounties, specSet, labSpecializations.length])

  const displayBounties = recommended.length > 0 ? [...recommended, ...other] : bounties

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-foreground">Open Bounties</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/bounties">
            <Button size="sm" className="rounded-full">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Post Bounty
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search open bounties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y divide-border/30 border border-border/40 rounded-xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="py-10 text-center border border-border/40 rounded-xl">
          <p className="text-sm text-muted-foreground mb-3">Unable to load bounties</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-full">
            Retry
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="space-y-4">
          <div className="py-12 text-center border border-border/40 rounded-xl border-dashed">
            <p className="text-sm font-medium text-foreground mb-1">No open bounties yet</p>
            <p className="text-xs text-muted-foreground mb-5">Post a bounty to get proposals from verified labs</p>
            <Link href="/dashboard/bounties">
              <Button size="sm" className="rounded-full">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Post a Bounty
              </Button>
            </Link>
          </div>

          <div className="border border-border/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Get notified</p>
            </div>
            <form onSubmit={handleNotify} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" size="sm" className="rounded-full">Notify me</Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/30 border border-border/40 rounded-xl overflow-hidden">
          {displayBounties.map((bounty) => {
            const isRecommended = recommended.some(r => r.id === bounty.id)
            return (
            <div key={bounty.id} className="p-5 hover:bg-secondary/10 transition-colors">
              {isRecommended && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Matches your specialties
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-foreground mb-1 truncate">{bounty.title}</h3>
                  {bounty.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{bounty.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}
                  </span>
                  {bounty.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysUntil(bounty.deadline)}d left
                    </span>
                  )}
                </div>
                <Link href={`/dashboard/bounties/${bounty.id}`}>
                  <Button size="sm" className="rounded-full h-8 text-xs">
                    <Send className="w-3 h-3 mr-1.5" />
                    Propose
                  </Button>
                </Link>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
