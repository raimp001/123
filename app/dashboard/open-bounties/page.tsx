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
  Clock,
  DollarSign,
  Users,
  FlaskConical,
  Calendar,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Zap
} from "lucide-react"

// Mock open bounties data (from funder perspective - these are bounties labs can bid on)
const openBounties = [
  {
    id: "bounty_010",
    title: "Novel Antibiotic Discovery from Deep Sea Microorganisms",
    description: "Seeking labs to analyze and culture deep sea bacterial samples for novel antibiotic compounds. Must have BSL-2 facilities.",
    funder: "Marine Pharma Foundation",
    totalBudget: 350000,
    currency: "USDC",
    category: "Microbiology",
    requiredTier: "verified",
    deadline: "2026-02-15",
    proposalCount: 12,
    milestoneCount: 6,
    postedAt: "2026-01-15",
    tags: ["Antibiotics", "Marine Biology", "Drug Discovery"],
    isHot: true,
  },
  {
    id: "bounty_011",
    title: "AI-Powered Drug Interaction Analysis",
    description: "Develop ML models to predict adverse drug interactions from molecular structure data. Access to 10M+ compound database provided.",
    funder: "PharmaTech AI",
    totalBudget: 180000,
    currency: "USD",
    category: "Computational Biology",
    requiredTier: "trusted",
    deadline: "2026-03-01",
    proposalCount: 8,
    milestoneCount: 4,
    postedAt: "2026-01-18",
    tags: ["Machine Learning", "Pharmacology", "Data Science"],
    isHot: true,
  },
  {
    id: "bounty_012",
    title: "CAR-T Cell Therapy Optimization Study",
    description: "Research to improve CAR-T cell persistence and reduce cytokine release syndrome. Requires GMP facility access.",
    funder: "CellTherapy Ventures",
    totalBudget: 500000,
    currency: "USDC",
    category: "Immunotherapy",
    requiredTier: "institutional",
    deadline: "2026-04-30",
    proposalCount: 5,
    milestoneCount: 8,
    postedAt: "2026-01-10",
    tags: ["CAR-T", "Cell Therapy", "Oncology"],
    isHot: false,
  },
  {
    id: "bounty_013",
    title: "Microplastic Bioaccumulation in Fish Species",
    description: "Study microplastic accumulation and health effects in commercial fish species from Mediterranean waters.",
    funder: "EU Environmental Research",
    totalBudget: 95000,
    currency: "USD",
    category: "Environmental Science",
    requiredTier: "verified",
    deadline: "2026-02-28",
    proposalCount: 15,
    milestoneCount: 5,
    postedAt: "2026-01-12",
    tags: ["Environmental", "Marine", "Toxicology"],
    isHot: false,
  },
  {
    id: "bounty_014",
    title: "Quantum Computing for Protein Structure Prediction",
    description: "Leverage quantum algorithms to improve protein folding predictions beyond classical computing methods.",
    funder: "QuantumBio Labs",
    totalBudget: 275000,
    currency: "USDC",
    category: "Computational Biology",
    requiredTier: "institutional",
    deadline: "2026-05-15",
    proposalCount: 3,
    milestoneCount: 5,
    postedAt: "2026-01-20",
    tags: ["Quantum Computing", "Protein Folding", "Algorithm"],
    isHot: true,
  },
]

function BountyCard({ bounty }: { bounty: typeof openBounties[0] }) {
  const daysRemaining = Math.ceil((new Date(bounty.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card className="border-0 shadow-clause card-interactive overflow-hidden">
      <CardContent className="p-0">
        {/* Hot Badge */}
        {bounty.isHot && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-navy-900 text-xs font-semibold px-3 py-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            High Interest
          </div>
        )}
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <Badge variant="secondary" className="mb-2 text-xs">
                {bounty.category}
              </Badge>
              <h3 className="font-semibold text-navy-800 dark:text-white leading-tight">
                {bounty.title}
              </h3>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {bounty.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bounty.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xl font-bold font-mono text-navy-800 dark:text-white">
                ${(bounty.totalBudget / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">{bounty.currency}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-navy-800 dark:text-white">{bounty.proposalCount}</p>
              <p className="text-xs text-muted-foreground">Proposals</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${daysRemaining < 14 ? 'text-alert-600' : 'text-navy-800 dark:text-white'}`}>
                {daysRemaining}d
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-medium text-navy-700 dark:text-slate-300">{bounty.funder}</p>
              <p className="text-xs text-muted-foreground">
                {bounty.milestoneCount} milestones • {bounty.requiredTier}+ required
              </p>
            </div>
            <Button className="bg-navy-800 hover:bg-navy-700 text-white">
              Submit Proposal
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OpenBountiesPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const categories = [...new Set(openBounties.map(b => b.category))]
  
  const filteredBounties = openBounties.filter(bounty => {
    if (categoryFilter !== "all" && bounty.category !== categoryFilter) return false
    if (search && !bounty.title.toLowerCase().includes(search.toLowerCase()) &&
        !bounty.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) {
      return false
    }
    return true
  })

  const totalValue = openBounties.reduce((sum, b) => sum + b.totalBudget, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Open Bounties</h1>
          <p className="text-muted-foreground mt-1">
            Browse and bid on research opportunities
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              ${(totalValue / 1000000).toFixed(1)}M+ in open bounties
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="budget_high">Highest Budget</SelectItem>
            <SelectItem value="deadline">Deadline Soon</SelectItem>
            <SelectItem value="proposals">Most Proposals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBounties.map((bounty, index) => (
          <div 
            key={bounty.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <BountyCard bounty={bounty} />
          </div>
        ))}
      </div>

      {filteredBounties.length === 0 && (
        <Card className="border-0 shadow-clause">
          <CardContent className="p-12 text-center">
            <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
              No bounties found
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
