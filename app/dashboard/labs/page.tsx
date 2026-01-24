"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter,
  Star,
  Shield,
  ShieldCheck,
  Building2,
  FlaskConical,
  MapPin,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  Award
} from "lucide-react"

// Verification tier configuration
const tierConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  unverified: {
    label: "Unverified",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    icon: Shield,
  },
  basic: {
    label: "Basic",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: Shield,
  },
  verified: {
    label: "Verified",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: ShieldCheck,
  },
  trusted: {
    label: "Trusted",
    color: "text-sage-600",
    bgColor: "bg-sage-100",
    icon: ShieldCheck,
  },
  institutional: {
    label: "Institutional",
    color: "text-navy-600",
    bgColor: "bg-navy-100",
    icon: Building2,
  },
}

// Mock labs data
const mockLabs = [
  {
    id: "lab_001",
    name: "Stanford Neuroscience Lab",
    organization: "Stanford University",
    type: "university",
    country: "United States",
    tier: "institutional",
    specialties: ["Neuroscience", "Alzheimer's Research", "Protein Folding"],
    bountiesCompleted: 47,
    disputesWon: 2,
    disputesLost: 0,
    reputationScore: 98.5,
    totalEarned: 2450000,
    activeStake: 50000,
    avatar: null,
  },
  {
    id: "lab_002",
    name: "BioTech Solutions Inc.",
    organization: "BioTech Solutions",
    type: "company",
    country: "Germany",
    tier: "verified",
    specialties: ["mRNA Research", "Gene Therapy", "Vaccine Development"],
    bountiesCompleted: 23,
    disputesWon: 1,
    disputesLost: 1,
    reputationScore: 89.2,
    totalEarned: 890000,
    activeStake: 25000,
    avatar: null,
  },
  {
    id: "lab_003",
    name: "Ocean Research Institute",
    organization: "Ocean Research Institute",
    type: "nonprofit",
    country: "Australia",
    tier: "trusted",
    specialties: ["Marine Biology", "Environmental Science", "Microplastics"],
    bountiesCompleted: 31,
    disputesWon: 3,
    disputesLost: 0,
    reputationScore: 95.8,
    totalEarned: 1200000,
    activeStake: 35000,
    avatar: null,
  },
  {
    id: "lab_004",
    name: "NeuroTech Labs",
    organization: "NeuroTech Inc.",
    type: "company",
    country: "United Kingdom",
    tier: "verified",
    specialties: ["Neural Interfaces", "Brain-Computer Interface", "Neurostimulation"],
    bountiesCompleted: 15,
    disputesWon: 0,
    disputesLost: 1,
    reputationScore: 82.1,
    totalEarned: 540000,
    activeStake: 20000,
    avatar: null,
  },
  {
    id: "lab_005",
    name: "GenomeTech Research",
    organization: "MIT",
    type: "university",
    country: "United States",
    tier: "institutional",
    specialties: ["Genomics", "CRISPR", "Gene Editing", "Bioinformatics"],
    bountiesCompleted: 52,
    disputesWon: 4,
    disputesLost: 0,
    reputationScore: 99.1,
    totalEarned: 3100000,
    activeStake: 75000,
    avatar: null,
  },
  {
    id: "lab_006",
    name: "AgriScience Lab",
    organization: "AgriTech Foundation",
    type: "nonprofit",
    country: "Netherlands",
    tier: "trusted",
    specialties: ["Agricultural Science", "Climate Resilience", "Crop Genetics"],
    bountiesCompleted: 19,
    disputesWon: 1,
    disputesLost: 0,
    reputationScore: 91.5,
    totalEarned: 680000,
    activeStake: 28000,
    avatar: null,
  },
]

function LabCard({ lab }: { lab: typeof mockLabs[0] }) {
  const tier = tierConfig[lab.tier]
  const TierIcon = tier.icon

  return (
    <Card className="border-0 shadow-clause card-interactive overflow-hidden">
      <CardContent className="p-0">
        {/* Header with tier badge */}
        <div className="relative p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-navy-600 dark:text-navy-300" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-800 dark:text-white">{lab.name}</h3>
                <p className="text-sm text-muted-foreground">{lab.organization}</p>
              </div>
            </div>
            <Badge className={`${tier.bgColor} ${tier.color} border-0 flex items-center gap-1`}>
              <TierIcon className="w-3 h-3" />
              {tier.label}
            </Badge>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {lab.country}
            <span className="mx-2">•</span>
            <span className="capitalize">{lab.type}</span>
          </div>
        </div>
        
        {/* Specialties */}
        <div className="p-5 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {lab.specialties.slice(0, 3).map((specialty) => (
              <Badge 
                key={specialty} 
                variant="secondary" 
                className="text-xs font-normal"
              >
                {specialty}
              </Badge>
            ))}
            {lab.specialties.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{lab.specialties.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-5 pt-0">
          <div>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{lab.bountiesCompleted}</p>
            <p className="text-xs text-muted-foreground">Bounties</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-sage-600 flex items-center gap-1">
              {lab.reputationScore}
              <Star className="w-4 h-4 fill-sage-500" />
            </p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-navy-800 dark:text-white">
              ${(lab.totalEarned / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">Staked:</span>
            <span className="font-mono font-medium text-navy-700 dark:text-slate-300">
              ${lab.activeStake.toLocaleString()}
            </span>
          </div>
          <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
            View Profile
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LabsPage() {
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")

  const filteredLabs = mockLabs.filter(lab => {
    if (tierFilter !== "all" && lab.tier !== tierFilter) return false
    if (search && !lab.name.toLowerCase().includes(search.toLowerCase()) && 
        !lab.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))) {
      return false
    }
    return true
  })

  // Get unique specialties
  const allSpecialties = [...new Set(mockLabs.flatMap(lab => lab.specialties))]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Browse Labs</h1>
          <p className="text-muted-foreground mt-1">
            Find verified research labs for your bounties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-navy-800 dark:text-white">{mockLabs.length}</span> verified labs
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-navy-800 dark:text-white">156</p>
            <p className="text-sm text-muted-foreground">Total Labs</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-sage-600">94.2%</p>
            <p className="text-sm text-muted-foreground">Avg Success Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold font-mono text-navy-800 dark:text-white">$8.9M</p>
            <p className="text-sm text-muted-foreground">Total Staked</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-navy-800 dark:text-white">42</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search labs or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Shield className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="institutional">Institutional</SelectItem>
            <SelectItem value="trusted">Trusted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {allSpecialties.slice(0, 10).map(specialty => (
              <SelectItem key={specialty} value={specialty.toLowerCase()}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLabs.map((lab, index) => (
          <div 
            key={lab.id} 
            className="animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LabCard lab={lab} />
          </div>
        ))}
      </div>

      {filteredLabs.length === 0 && (
        <Card className="border-0 shadow-clause">
          <CardContent className="p-12 text-center">
            <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
              No labs found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
