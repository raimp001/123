"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react"

// Mock proposals data
const myProposals = [
  {
    id: "prop_001",
    bountyId: "bounty_010",
    bountyTitle: "Novel Antibiotic Discovery from Deep Sea Microorganisms",
    funder: "Marine Pharma Foundation",
    bidAmount: 320000,
    currency: "USDC",
    stakedAmount: 15000,
    status: "pending",
    submittedAt: "2026-01-18",
    methodology: "We propose a systematic screening approach using high-throughput assays...",
    timeline: 180,
    competitorCount: 11,
  },
  {
    id: "prop_002",
    bountyId: "bounty_014",
    bountyTitle: "Quantum Computing for Protein Structure Prediction",
    funder: "QuantumBio Labs",
    bidAmount: 260000,
    currency: "USDC",
    stakedAmount: 12000,
    status: "accepted",
    submittedAt: "2026-01-20",
    acceptedAt: "2026-01-22",
    methodology: "Leveraging our quantum algorithm expertise...",
    timeline: 150,
    competitorCount: 2,
  },
  {
    id: "prop_003",
    bountyId: "bounty_008",
    bountyTitle: "Neural Plasticity in Aging Brains",
    funder: "Longevity Institute",
    bidAmount: 145000,
    currency: "USD",
    stakedAmount: 8000,
    status: "rejected",
    submittedAt: "2026-01-05",
    rejectedAt: "2026-01-12",
    rejectionReason: "Budget constraints - selected lower bid with similar qualifications",
    methodology: "Our approach focuses on synaptic density measurements...",
    timeline: 120,
    competitorCount: 8,
  },
  {
    id: "prop_004",
    bountyId: "bounty_015",
    bountyTitle: "Biodegradable Plastic Alternatives from Algae",
    funder: "GreenTech Ventures",
    bidAmount: 88000,
    currency: "USD",
    stakedAmount: 5000,
    status: "pending",
    submittedAt: "2026-01-21",
    methodology: "Utilizing our proprietary algae cultivation methods...",
    timeline: 90,
    competitorCount: 6,
  },
]

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: {
    label: "Under Review",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "text-sage-600",
    bgColor: "bg-sage-100 dark:bg-sage-900/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Not Selected",
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: XCircle,
  },
}

function ProposalCard({ proposal }: { proposal: typeof myProposals[0] }) {
  const status = statusConfig[proposal.status]
  const StatusIcon = status.icon

  return (
    <Card className="border-0 shadow-clause card-interactive">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy-800 dark:text-white line-clamp-2">
              {proposal.bountyTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {proposal.funder}
            </p>
          </div>
          <Badge className={`${status.bgColor} ${status.color} border-0 flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>

        {/* Bid Details */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-2xl font-bold font-mono text-navy-800 dark:text-white">
              ${(proposal.bidAmount / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground">Your Bid</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-amber-600">
              ${(proposal.stakedAmount / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground">Staked</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">
              {proposal.timeline}d
            </p>
            <p className="text-xs text-muted-foreground">Timeline</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
            {proposal.competitorCount > 0 && (
              <span className="ml-3">
                • {proposal.competitorCount} other proposals
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
            View Details
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Rejection Reason */}
        {proposal.status === "rejected" && proposal.rejectionReason && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 inline mr-2 text-slate-400" />
            {proposal.rejectionReason}
          </div>
        )}

        {/* Accepted Actions */}
        {proposal.status === "accepted" && (
          <div className="mt-3 flex gap-2">
            <Button className="flex-1 bg-sage-600 hover:bg-sage-500">
              Start Research
            </Button>
            <Button variant="outline" className="flex-1">
              View Contract
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProposalsPage() {
  const pendingCount = myProposals.filter(p => p.status === "pending").length
  const acceptedCount = myProposals.filter(p => p.status === "accepted").length
  const totalStaked = myProposals.filter(p => p.status !== "rejected").reduce((sum, p) => sum + p.stakedAmount, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white">My Proposals</h1>
        <p className="text-muted-foreground mt-1">
          Track your bounty proposals and bids
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{myProposals.length}</p>
            <p className="text-sm text-muted-foreground">Total Proposals</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-sage-600">{acceptedCount}</p>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4">
            <p className="text-2xl font-bold font-mono text-navy-800 dark:text-white">${totalStaked.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Active Stake</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Not Selected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myProposals.map((proposal, index) => (
              <div 
                key={proposal.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <ProposalCard proposal={proposal} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myProposals.filter(p => p.status === "pending").map((proposal, index) => (
              <div key={proposal.id} className="animate-fade-up" style={{ animationDelay: `${index * 75}ms` }}>
                <ProposalCard proposal={proposal} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myProposals.filter(p => p.status === "accepted").map((proposal, index) => (
              <div key={proposal.id} className="animate-fade-up" style={{ animationDelay: `${index * 75}ms` }}>
                <ProposalCard proposal={proposal} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myProposals.filter(p => p.status === "rejected").map((proposal, index) => (
              <div key={proposal.id} className="animate-fade-up" style={{ animationDelay: `${index * 75}ms` }}>
                <ProposalCard proposal={proposal} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
