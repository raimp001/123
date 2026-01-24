"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FlaskConical,
  Clock,
  CheckCircle2,
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  ArrowRight,
  Play,
  Pause
} from "lucide-react"

// Mock active research data
const activeResearch = [
  {
    id: "research_001",
    bountyId: "bounty_014",
    bountyTitle: "Quantum Computing for Protein Structure Prediction",
    funder: "QuantumBio Labs",
    totalBudget: 275000,
    earnedToDate: 55000,
    currency: "USDC",
    startedAt: "2026-01-22",
    currentMilestone: 1,
    totalMilestones: 5,
    status: "in_progress",
    nextDeadline: "2026-02-15",
    milestones: [
      { id: "m1", title: "Algorithm Design", status: "in_progress", amount: 55000, deadline: "2026-02-15" },
      { id: "m2", title: "Quantum Circuit Implementation", status: "pending", amount: 55000, deadline: "2026-03-15" },
      { id: "m3", title: "Classical Benchmark", status: "pending", amount: 55000, deadline: "2026-04-15" },
      { id: "m4", title: "Comparative Analysis", status: "pending", amount: 55000, deadline: "2026-05-15" },
      { id: "m5", title: "Final Report & Publication", status: "pending", amount: 55000, deadline: "2026-06-15" },
    ],
  },
]

function ResearchCard({ research }: { research: typeof activeResearch[0] }) {
  const progress = (research.currentMilestone / research.totalMilestones) * 100
  const daysToDeadline = Math.ceil((new Date(research.nextDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const currentMilestone = research.milestones.find(m => m.status === "in_progress")

  return (
    <Card className="border-0 shadow-clause-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="mb-2 bg-sage-100 text-sage-700 border-0">
              <FlaskConical className="w-3 h-3 mr-1" />
              Active Research
            </Badge>
            <CardTitle className="text-xl">{research.bountyTitle}</CardTitle>
            <CardDescription className="mt-1">{research.funder}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono text-navy-800 dark:text-white">
              ${research.earnedToDate.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of ${research.totalBudget.toLocaleString()} {research.currency}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Milestone Progress</span>
            <span className="font-medium text-navy-700 dark:text-slate-300">
              {research.currentMilestone} of {research.totalMilestones}
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sage-500 to-sage-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Milestone */}
        {currentMilestone && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Current: {currentMilestone.title}
              </h4>
              <Badge variant="outline" className={`${daysToDeadline < 7 ? 'bg-alert-50 text-alert-700 border-alert-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                <Clock className="w-3 h-3 mr-1" />
                {daysToDeadline} days left
              </Badge>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Payout: <span className="font-mono font-semibold">${currentMilestone.amount.toLocaleString()}</span> {research.currency}
            </p>
          </div>
        )}

        {/* Milestones Timeline */}
        <div className="space-y-3">
          <h4 className="font-medium text-navy-800 dark:text-white">Milestone Timeline</h4>
          {research.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                milestone.status === "completed" ? "bg-sage-500 text-white" :
                milestone.status === "in_progress" ? "bg-amber-500 text-white" :
                "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                {milestone.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : milestone.status === "in_progress" ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className={milestone.status === "pending" ? "text-muted-foreground" : "text-navy-700 dark:text-slate-300"}>
                  {milestone.title}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-muted-foreground">
                    ${milestone.amount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(milestone.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button className="flex-1 bg-amber-500 hover:bg-amber-400 text-navy-900">
            <Upload className="w-4 h-4 mr-2" />
            Submit Milestone Evidence
          </Button>
          <Button variant="outline" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            View Contract
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResearchPage() {
  if (activeResearch.length === 0) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Active Research</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ongoing research projects
          </p>
        </div>
        
        <Card className="border-0 shadow-clause">
          <CardContent className="p-12 text-center">
            <FlaskConical className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-navy-800 dark:text-white mb-2">
              No Active Research
            </h3>
            <p className="text-muted-foreground mb-6">
              Start by submitting proposals to open bounties
            </p>
            <Button className="bg-navy-800 hover:bg-navy-700 text-white">
              Browse Open Bounties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Active Research</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ongoing research projects
          </p>
        </div>
        <Badge className="bg-sage-100 text-sage-700 border-0 text-base px-4 py-2">
          <FlaskConical className="w-4 h-4 mr-2" />
          {activeResearch.length} Active Project{activeResearch.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Research Cards */}
      <div className="space-y-6">
        {activeResearch.map((research, index) => (
          <div 
            key={research.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ResearchCard research={research} />
          </div>
        ))}
      </div>
    </div>
  )
}
