"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle,
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Shield,
  ArrowRight,
  ExternalLink
} from "lucide-react"

// Mock disputes data
const disputes = [
  {
    id: "dispute_001",
    bountyId: "bounty_007",
    bountyTitle: "Neural Interface Safety Protocol Development",
    initiatedBy: "funder",
    funderName: "NeuroSafe Foundation",
    labName: "NeuroTech Labs",
    reason: "timeline_breach",
    reasonLabel: "Timeline Breach",
    description: "Lab failed to deliver Milestone 3 by the agreed deadline. Multiple extension requests were made but deliverables remain incomplete after 45 days past due date.",
    status: "investigation",
    potentialSlash: 18000,
    createdAt: "2026-01-15",
    escalatedAt: null,
    evidenceCount: 5,
  },
  {
    id: "dispute_002",
    bountyId: "bounty_006",
    bountyTitle: "Biodegradable Polymer Synthesis",
    initiatedBy: "funder",
    funderName: "GreenChem Corp",
    labName: "Materials Science Lab",
    reason: "quality_failure",
    reasonLabel: "Quality Failure",
    description: "Submitted data does not meet the quality standards specified in the protocol. Reproducibility tests failed in independent verification.",
    status: "arbitration",
    potentialSlash: 25000,
    createdAt: "2026-01-08",
    escalatedAt: "2026-01-18",
    evidenceCount: 12,
  },
]

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  investigation: {
    label: "Under Investigation",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  arbitration: {
    label: "In Arbitration",
    color: "text-alert-600",
    bgColor: "bg-alert-100 dark:bg-alert-900/30",
  },
  resolved_funder: {
    label: "Resolved - Funder Wins",
    color: "text-sage-600",
    bgColor: "bg-sage-100 dark:bg-sage-900/30",
  },
  resolved_lab: {
    label: "Resolved - Lab Wins",
    color: "text-sage-600",
    bgColor: "bg-sage-100 dark:bg-sage-900/30",
  },
  resolved_partial: {
    label: "Partial Settlement",
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
}

const reasonIcons: Record<string, React.ElementType> = {
  data_falsification: AlertTriangle,
  protocol_deviation: FileText,
  sample_tampering: AlertTriangle,
  timeline_breach: Clock,
  quality_failure: XCircle,
  communication_failure: MessageSquare,
}

function DisputeCard({ dispute }: { dispute: typeof disputes[0] }) {
  const status = statusConfig[dispute.status]
  const ReasonIcon = reasonIcons[dispute.reason] || AlertTriangle

  return (
    <Card className="border-0 shadow-clause-md border-l-4 border-l-alert-500">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${status.bgColor} ${status.color} border-0`}>
                {status.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <ReasonIcon className="w-3 h-3 mr-1" />
                {dispute.reasonLabel}
              </Badge>
            </div>
            <h3 className="font-semibold text-navy-800 dark:text-white">
              {dispute.bountyTitle}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Potential Slash</p>
            <p className="text-xl font-bold font-mono text-alert-600">
              ${dispute.potentialSlash.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Parties */}
        <div className="flex items-center gap-4 py-3 border-t border-b border-slate-100 dark:border-slate-800 text-sm">
          <div className="flex-1">
            <p className="text-muted-foreground">Funder</p>
            <p className="font-medium text-navy-700 dark:text-slate-300">{dispute.funderName}</p>
          </div>
          <div className="text-center">
            <Scale className="w-5 h-5 text-muted-foreground mx-auto" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-muted-foreground">Lab</p>
            <p className="font-medium text-navy-700 dark:text-slate-300">{dispute.labName}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-4">
          {dispute.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <FileText className="w-4 h-4 inline mr-1" />
              {dispute.evidenceCount} evidence files
            </span>
            <span>
              <Clock className="w-4 h-4 inline mr-1" />
              Opened {new Date(dispute.createdAt).toLocaleDateString()}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
            View Case
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DisputesPage() {
  const activeCount = disputes.filter(d => d.status === "investigation" || d.status === "arbitration").length
  const totalAtRisk = disputes.reduce((sum, d) => sum + d.potentialSlash, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Disputes</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and resolve research disputes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-alert-100 dark:bg-alert-900/30">
              <AlertTriangle className="w-6 h-6 text-alert-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-alert-600">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active Disputes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Scale className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {disputes.filter(d => d.status === "arbitration").length}
              </p>
              <p className="text-sm text-muted-foreground">In Arbitration</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-navy-100 dark:bg-navy-800">
              <Shield className="w-6 h-6 text-navy-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-navy-800 dark:text-white">
                ${totalAtRisk.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Stake at Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-0 shadow-clause bg-navy-50 dark:bg-navy-900/30 border-navy-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Scale className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-navy-800 dark:text-navy-300">Dispute Resolution Process</p>
            <p className="text-navy-600 dark:text-navy-400 mt-1">
              All disputes go through a 3-stage process: Investigation → Mediation → Arbitration. 
              If fraud is confirmed, the lab's staked tokens will be slashed and transferred to the funder.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute, index) => (
          <div 
            key={dispute.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DisputeCard dispute={dispute} />
          </div>
        ))}
      </div>

      {disputes.length === 0 && (
        <Card className="border-0 shadow-clause">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-sage-500 mb-4" />
            <h3 className="text-xl font-semibold text-navy-800 dark:text-white mb-2">
              No Active Disputes
            </h3>
            <p className="text-muted-foreground">
              All your bounties are running smoothly
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
