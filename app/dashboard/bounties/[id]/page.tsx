"use client"

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useBounty } from '@/hooks/use-bounties'
import { useAuth } from '@/contexts/auth-context'
import { StateMachineVisualizer } from '@/components/state-machine-visualizer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { stateMetadata } from '@/lib/machines/bounty-machine'
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Users, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  Send,
  Wallet,
  FlaskConical,
  Target,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BountyDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isFunder, isLab } = useAuth()
  const { bounty, isLoading, error, transition } = useBounty(id)

  const handleTransition = async (event: string, data?: Record<string, unknown>) => {
    const result = await transition(event, data)
    if (result.success) {
      toast.success(`State changed to ${result.newState}`)
    } else {
      toast.error(result.error || 'Failed to transition state')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !bounty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Bounty Not Found</h2>
        <p className="text-muted-foreground">
          {error?.message || 'The bounty you are looking for does not exist.'}
        </p>
        <Button onClick={() => router.push('/dashboard/bounties')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bounties
        </Button>
      </div>
    )
  }

  const isOwner = bounty.funder_id === user?.id
  const stateMeta = stateMetadata[bounty.state as keyof typeof stateMetadata]
  const completedMilestones = bounty.milestones?.filter(m => m.status === 'verified').length || 0
  const totalMilestones = bounty.milestones?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">
            {bounty.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge 
              className={`${
                stateMeta?.color === 'sage' ? 'bg-sage-100 text-sage-700 border-sage-200' :
                stateMeta?.color === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                stateMeta?.color === 'destructive' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {stateMeta?.label || bounty.state}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(bounty.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons based on state */}
        <div className="flex gap-2">
          {isOwner && bounty.state === 'drafting' && (
            <Button onClick={() => handleTransition('SUBMIT_DRAFT')}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Funding
            </Button>
          )}
          {isOwner && bounty.state === 'ready_for_funding' && (
            <Button onClick={() => handleTransition('INITIATE_FUNDING', { paymentMethod: 'stripe' })}>
              <Wallet className="w-4 h-4 mr-2" />
              Fund Bounty
            </Button>
          )}
          {isOwner && bounty.state === 'bidding' && (bounty.proposals?.length || 0) > 0 && (
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Review Proposals ({bounty.proposals?.length})
            </Button>
          )}
          {isOwner && bounty.state === 'milestone_review' && (
            <>
              <Button 
                variant="outline"
                onClick={() => handleTransition('REQUEST_REVISION', { 
                  milestoneId: bounty.milestones?.find(m => m.status === 'submitted')?.id 
                })}
              >
                Request Revision
              </Button>
              <Button onClick={() => handleTransition('APPROVE_MILESTONE', { 
                milestoneId: bounty.milestones?.find(m => m.status === 'submitted')?.id 
              })}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Milestone
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-xl font-bold">
                  {bounty.currency === 'USD' ? '$' : ''}
                  {bounty.total_budget.toLocaleString()}
                  {bounty.currency === 'USDC' ? ' USDC' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900/30">
                <Target className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-xl font-bold">
                  {completedMilestones}/{totalMilestones}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-navy-100 dark:bg-navy-800">
                <Users className="w-5 h-5 text-navy-600 dark:text-navy-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proposals</p>
                <p className="text-xl font-bold">
                  {bounty.proposals?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-xl font-bold">
                  {bounty.deadline 
                    ? new Date(bounty.deadline).toLocaleDateString()
                    : 'Open'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State Machine Visualization */}
      <StateMachineVisualizer
        currentState={bounty.state}
        stateHistory={(bounty.state_history as Array<{ state: string; timestamp: string }>) || []}
      />

      {/* Tabs for Details */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({totalMilestones})
          </TabsTrigger>
          <TabsTrigger value="proposals">
            Proposals ({bounty.proposals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {bounty.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Methodology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {bounty.methodology}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bounty.data_requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sage-500 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  )) || <p className="text-muted-foreground">No specific requirements</p>}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bounty.quality_standards?.map((std, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sage-500 mt-0.5" />
                      <span className="text-muted-foreground">{std}</span>
                    </li>
                  )) || <p className="text-muted-foreground">No specific standards</p>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-4">
            {bounty.milestones?.sort((a, b) => a.sequence - b.sequence).map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        milestone.status === 'verified' ? 'bg-sage-500 text-white' :
                        milestone.status === 'submitted' ? 'bg-amber-500 text-white' :
                        milestone.status === 'in_progress' ? 'bg-navy-500 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {milestone.sequence}
                      </div>
                      <div>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline">
                            {milestone.payout_percentage}% Payout
                          </Badge>
                          <Badge variant={
                            milestone.status === 'verified' ? 'default' :
                            milestone.status === 'submitted' ? 'secondary' :
                            'outline'
                          }>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          {milestone.due_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {milestone.evidence_hash && (
                      <div className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 p-2 rounded">
                        Evidence: {milestone.evidence_hash.slice(0, 16)}...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proposals">
          {bounty.proposals?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-muted-foreground">
                  {bounty.state === 'bidding' 
                    ? 'Verified labs can submit proposals for this bounty.'
                    : 'Proposals will be accepted once funding is confirmed.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bounty.proposals?.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {(proposal as { lab?: { name: string } }).lab?.name}
                          </h3>
                          <Badge variant="outline">
                            {(proposal as { lab?: { verification_tier: string } }).lab?.verification_tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {proposal.methodology}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Bid: ${proposal.bid_amount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {proposal.timeline_days} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4" />
                            Staked: ${proposal.staked_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {isOwner && bounty.state === 'bidding' && (
                        <Button 
                          size="sm"
                          onClick={() => handleTransition('SELECT_LAB', { 
                            proposalId: proposal.id,
                            labId: proposal.lab_id 
                          })}
                        >
                          Select Lab
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">State History</CardTitle>
              <CardDescription>
                Complete audit trail of bounty state changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(bounty.state_history as Array<{ from_state?: string; to_state: string; timestamp: string }> || []).reverse().map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                    <div>
                      <p className="font-medium">
                        {entry.from_state 
                          ? `${stateMetadata[entry.from_state as keyof typeof stateMetadata]?.label || entry.from_state} → ${stateMetadata[entry.to_state as keyof typeof stateMetadata]?.label || entry.to_state}`
                          : stateMetadata[entry.to_state as keyof typeof stateMetadata]?.label || entry.to_state
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
