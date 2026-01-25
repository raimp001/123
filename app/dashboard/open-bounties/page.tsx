"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  FlaskConical,
  Send,
  Clock,
  Plus,
  Building2,
  Bell,
  ArrowRight
} from "lucide-react"
import { useBounties } from "@/hooks/use-bounties"
import { useState } from "react"
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

  const { bounties, isLoading, error } = useBounties({
    state: "bidding",
    search: search || undefined
  })

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thanks! We'll notify you when bounties open.")
    setNotifyEmail("")
  }

  // Distinguish error vs empty state
  const hasError = error !== null
  const isEmpty = !isLoading && !hasError && bounties.length === 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Open Bounties</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Research opportunities available for proposals
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/bounties">
            <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" /> Post Bounty
            </Button>
          </Link>
          <Link href="/dashboard/labs">
            <Button variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
              <Building2 className="w-4 h-4 mr-2" /> Apply as Lab
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          placeholder="Search bounties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-[#E5E7EB] rounded-lg"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasError ? (
        // Error state - technical problem
        <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <CardContent className="p-12 text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-[#9CA3AF] mb-4" />
            <p className="font-medium text-[#111827] mb-2">Unable to load bounties</p>
            <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
              Please check your connection and try again. If the problem persists, contact support.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : isEmpty ? (
        // Empty state - no bounties yet (expected for new platform)
        <div className="space-y-6">
          <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
            <CardContent className="p-12 text-center">
              <FlaskConical className="w-10 h-10 mx-auto text-[#6B5FED] mb-4" />
              <p className="font-semibold text-[#111827] text-lg mb-2">No open bounties yet</p>
              <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
                Be among the first to post a research bounty or get notified when opportunities open.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/dashboard/bounties">
                  <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                    <Plus className="w-4 h-4 mr-2" /> Post a Bounty
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Get Notified - Simple */}
          <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Bell className="w-5 h-5 text-[#6B5FED] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#111827] mb-1">Get notified</h3>
                  <p className="text-sm text-[#6B7280] mb-4">
                    We&apos;ll email you when bounties matching your interests open.
                  </p>
                  <form onSubmit={handleNotify} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      required
                      className="bg-white border-[#E5E7EB] rounded-lg flex-1"
                    />
                    <Button type="submit" className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                      Notify Me
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learn More - Link to Docs */}
          <p className="text-center text-sm text-[#6B7280]">
            New to SciFlow? <Link href="/docs" className="text-[#6B5FED] hover:underline">Read the documentation</Link> to learn how bounties work.
          </p>
        </div>
      ) : (
        // Has bounties
        <div className="space-y-4">
          {bounties.map((bounty) => (
            <Card 
              key={bounty.id} 
              className="bg-white border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors rounded-xl"
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-medium text-[#111827] mb-1">{bounty.title}</h3>
                    <p className="text-sm text-[#6B7280] line-clamp-2">{bounty.description}</p>
                  </div>
                  <Badge className="bg-[#6B5FED]/10 text-[#6B5FED] border-0">
                    Open
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    <span className="font-medium text-[#111827]">
                      {formatCurrency(bounty.total_budget || 0, bounty.currency || "USD")}
                    </span>
                    {bounty.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {daysUntil(bounty.deadline)} days left
                      </span>
                    )}
                  </div>
                  <Link href={`/dashboard/bounties/${bounty.id}`}>
                    <Button size="sm" className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Proposal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
