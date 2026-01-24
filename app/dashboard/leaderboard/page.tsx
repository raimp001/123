"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy,
  Medal,
  Star,
  TrendingUp,
  FlaskConical,
  Shield,
  ShieldCheck,
  Building2,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"

// Mock leaderboard data
const leaderboard = [
  {
    rank: 1,
    previousRank: 1,
    id: "lab_005",
    name: "GenomeTech Research",
    organization: "MIT",
    tier: "institutional",
    bountiesCompleted: 52,
    successRate: 100,
    reputationScore: 99.1,
    totalEarned: 3100000,
    specialties: ["Genomics", "CRISPR"],
  },
  {
    rank: 2,
    previousRank: 3,
    id: "lab_001",
    name: "Stanford Neuroscience Lab",
    organization: "Stanford University",
    tier: "institutional",
    bountiesCompleted: 47,
    successRate: 100,
    reputationScore: 98.5,
    totalEarned: 2450000,
    specialties: ["Neuroscience", "Alzheimer's"],
  },
  {
    rank: 3,
    previousRank: 2,
    id: "lab_003",
    name: "Ocean Research Institute",
    organization: "Ocean Research Institute",
    tier: "trusted",
    bountiesCompleted: 31,
    successRate: 100,
    reputationScore: 95.8,
    totalEarned: 1200000,
    specialties: ["Marine Biology", "Environmental"],
  },
  {
    rank: 4,
    previousRank: 4,
    id: "lab_006",
    name: "AgriScience Lab",
    organization: "AgriTech Foundation",
    tier: "trusted",
    bountiesCompleted: 19,
    successRate: 100,
    reputationScore: 91.5,
    totalEarned: 680000,
    specialties: ["Agricultural Science"],
  },
  {
    rank: 5,
    previousRank: 6,
    id: "lab_002",
    name: "BioTech Solutions Inc.",
    organization: "BioTech Solutions",
    tier: "verified",
    bountiesCompleted: 23,
    successRate: 95.6,
    reputationScore: 89.2,
    totalEarned: 890000,
    specialties: ["mRNA Research", "Gene Therapy"],
  },
  {
    rank: 6,
    previousRank: 5,
    id: "lab_007",
    name: "Quantum Bio Labs",
    organization: "Quantum Bio Inc.",
    tier: "verified",
    bountiesCompleted: 18,
    successRate: 94.4,
    reputationScore: 87.3,
    totalEarned: 720000,
    specialties: ["Quantum Computing", "Computational Biology"],
  },
  {
    rank: 7,
    previousRank: 8,
    id: "lab_008",
    name: "Climate Research Center",
    organization: "ETH Zurich",
    tier: "institutional",
    bountiesCompleted: 28,
    successRate: 96.4,
    reputationScore: 85.9,
    totalEarned: 950000,
    specialties: ["Climate Science", "Modeling"],
  },
  {
    rank: 8,
    previousRank: 7,
    id: "lab_004",
    name: "NeuroTech Labs",
    organization: "NeuroTech Inc.",
    tier: "verified",
    bountiesCompleted: 15,
    successRate: 86.7,
    reputationScore: 82.1,
    totalEarned: 540000,
    specialties: ["Neural Interfaces"],
  },
]

const tierConfig: Record<string, { icon: React.ElementType; color: string }> = {
  institutional: { icon: Building2, color: "text-navy-600" },
  trusted: { icon: ShieldCheck, color: "text-sage-600" },
  verified: { icon: Shield, color: "text-amber-600" },
}

function RankChange({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current
  if (diff > 0) {
    return (
      <span className="flex items-center text-sage-600 text-sm">
        <ArrowUp className="w-4 h-4" />
        {diff}
      </span>
    )
  }
  if (diff < 0) {
    return (
      <span className="flex items-center text-alert-600 text-sm">
        <ArrowDown className="w-4 h-4" />
        {Math.abs(diff)}
      </span>
    )
  }
  return <Minus className="w-4 h-4 text-slate-400" />
}

function LeaderboardRow({ lab, index }: { lab: typeof leaderboard[0]; index: number }) {
  const tier = tierConfig[lab.tier]
  const TierIcon = tier.icon

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg animate-fade-up ${
        lab.rank <= 3 
          ? 'bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900' 
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      } border border-slate-100 dark:border-slate-800 transition-colors`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Rank */}
      <div className="w-12 flex flex-col items-center">
        {lab.rank === 1 ? (
          <Crown className="w-8 h-8 text-amber-500" />
        ) : lab.rank === 2 ? (
          <Medal className="w-7 h-7 text-slate-400" />
        ) : lab.rank === 3 ? (
          <Medal className="w-7 h-7 text-amber-700" />
        ) : (
          <span className="text-2xl font-bold text-slate-400">#{lab.rank}</span>
        )}
        <RankChange current={lab.rank} previous={lab.previousRank} />
      </div>

      {/* Lab Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-navy-800 dark:text-white truncate">{lab.name}</h3>
          <TierIcon className={`w-4 h-4 ${tier.color}`} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{lab.organization}</p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <p className="text-lg font-bold text-navy-800 dark:text-white">{lab.bountiesCompleted}</p>
          <p className="text-xs text-muted-foreground">Bounties</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-sage-600">{lab.successRate}%</p>
          <p className="text-xs text-muted-foreground">Success</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-amber-600 flex items-center justify-center gap-1">
            {lab.reputationScore}
            <Star className="w-4 h-4 fill-amber-500" />
          </p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
      </div>

      {/* Total Earned */}
      <div className="text-right">
        <p className="text-lg font-bold font-mono text-navy-800 dark:text-white">
          ${(lab.totalEarned / 1000000).toFixed(2)}M
        </p>
        <p className="text-xs text-muted-foreground">Earned</p>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Lab Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top performing research labs by reputation score
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-0 text-base px-4 py-2">
          <Trophy className="w-4 h-4 mr-2" />
          {leaderboard.length} Labs Ranked
        </Badge>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Second Place */}
        <Card className="border-0 shadow-clause-md md:order-1 md:mt-8">
          <CardContent className="p-6 text-center">
            <Medal className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-2xl font-bold text-navy-800 dark:text-white">#2</p>
            <h3 className="font-semibold text-navy-700 dark:text-slate-300 mt-2">{leaderboard[1]?.name}</h3>
            <p className="text-sm text-muted-foreground">{leaderboard[1]?.organization}</p>
            <p className="text-xl font-bold text-amber-600 mt-3 flex items-center justify-center gap-1">
              {leaderboard[1]?.reputationScore}
              <Star className="w-5 h-5 fill-amber-500" />
            </p>
          </CardContent>
        </Card>

        {/* First Place */}
        <Card className="border-0 shadow-clause-xl md:order-0 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-900 border-2 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 text-center">
            <Crown className="w-16 h-16 mx-auto text-amber-500 mb-3" />
            <p className="text-3xl font-bold text-navy-800 dark:text-white">#1</p>
            <h3 className="text-lg font-bold text-navy-800 dark:text-white mt-2">{leaderboard[0]?.name}</h3>
            <p className="text-sm text-muted-foreground">{leaderboard[0]?.organization}</p>
            <p className="text-2xl font-bold text-amber-600 mt-3 flex items-center justify-center gap-1">
              {leaderboard[0]?.reputationScore}
              <Star className="w-6 h-6 fill-amber-500" />
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {leaderboard[0]?.bountiesCompleted} bounties • 100% success
            </p>
          </CardContent>
        </Card>

        {/* Third Place */}
        <Card className="border-0 shadow-clause-md md:order-2 md:mt-12">
          <CardContent className="p-6 text-center">
            <Medal className="w-12 h-12 mx-auto text-amber-700 mb-3" />
            <p className="text-2xl font-bold text-navy-800 dark:text-white">#3</p>
            <h3 className="font-semibold text-navy-700 dark:text-slate-300 mt-2">{leaderboard[2]?.name}</h3>
            <p className="text-sm text-muted-foreground">{leaderboard[2]?.organization}</p>
            <p className="text-xl font-bold text-amber-600 mt-3 flex items-center justify-center gap-1">
              {leaderboard[2]?.reputationScore}
              <Star className="w-5 h-5 fill-amber-500" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((lab, index) => (
          <LeaderboardRow key={lab.id} lab={lab} index={index} />
        ))}
      </div>
    </div>
  )
}
