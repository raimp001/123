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
import { Search, FlaskConical, Shield, ShieldCheck, Building2, Star, MapPin, ExternalLink, Plus, RefreshCw, AlertTriangle } from "lucide-react"
import { useLabs } from "@/hooks/use-labs"
import Link from "next/link"

const tierConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  unverified: { label: "Unverified", color: "bg-[#F3F4F6] text-[#6B7280]", icon: Shield },
  basic: { label: "Basic", color: "bg-[#F3F4F6] text-[#6B7280]", icon: Shield },
  verified: { label: "Verified", color: "bg-[#FEF3C7] text-[#92400E]", icon: ShieldCheck },
  trusted: { label: "Trusted", color: "bg-[#D1FAE5] text-[#065F46]", icon: ShieldCheck },
  institutional: { label: "Institutional", color: "bg-[#DBEAFE] text-[#1E40AF]", icon: Building2 },
}

export default function LabsPage() {
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  
  const { labs, isLoading, error, refresh } = useLabs({
    tier: tierFilter === "all" ? undefined : tierFilter,
    search: search || undefined,
  })

  const hasError = error !== null
  const isEmpty = !isLoading && !hasError && labs.length === 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Labs</h1>
          <p className="text-sm text-[#6B7280]">Find verified research labs</p>
        </div>
        <Link href="/signup?role=lab">
          <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Apply as Lab
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search labs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#E5E7EB] rounded-lg"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] rounded-lg">
            <Shield className="w-4 h-4 mr-2 text-[#9CA3AF]" />
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="institutional">Institutional</SelectItem>
            <SelectItem value="trusted">Trusted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Labs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasError ? (
        <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <CardContent className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-[#9CA3AF] mb-4" />
            <p className="font-medium text-[#111827] mb-2">Unable to load labs</p>
            <p className="text-sm text-[#6B7280] mb-4">Please check your connection and try again.</p>
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
        <Card className="bg-white border-[#E5E7EB] rounded-xl" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <CardContent className="p-10 text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-[#6B5FED] mb-4" />
            <p className="font-semibold text-[#111827] mb-2">
              {search ? "No labs match your search" : "No labs registered yet"}
            </p>
            <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
              {search ? "Try different keywords" : "Be among the first labs to join SciFlow"}
            </p>
            {!search && (
              <Link href="/signup?role=lab">
                <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                  <Plus className="w-4 h-4 mr-2" /> Apply as Lab
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => {
            const tier = tierConfig[lab.verification_tier] || tierConfig.unverified
            const TierIcon = tier.icon
            
            return (
              <Card 
                key={lab.id} 
                className="bg-white border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors rounded-xl"
                style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                        <FlaskConical className="w-5 h-5 text-[#6B7280]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#111827]">{lab.name}</h3>
                        {lab.institution && (
                          <p className="text-xs text-[#6B7280]">{lab.institution}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${tier.color} border-0 text-xs`}>
                      <TierIcon className="w-3 h-3 mr-1" />
                      {tier.label}
                    </Badge>
                  </div>

                  {/* Location */}
                  {lab.country && (
                    <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-3">
                      <MapPin className="w-3 h-3" />
                      {lab.country}
                    </div>
                  )}

                  {/* Specialties */}
                  {lab.specialties && lab.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {lab.specialties.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs font-normal bg-[#F3F4F6] text-[#6B7280]">
                          {s}
                        </Badge>
                      ))}
                      {lab.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs font-normal bg-[#F3F4F6] text-[#6B7280]">
                          +{lab.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="font-medium text-[#111827]">
                        {lab.reputation_score?.toFixed(1) || "—"}
                      </span>
                    </div>
                    {lab.staked_amount && (
                      <span className="text-xs text-[#6B7280]">
                        ${lab.staked_amount.toLocaleString()} staked
                      </span>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs text-[#6B7280] hover:text-[#111827]">
                      View <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
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
