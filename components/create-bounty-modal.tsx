"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus,
  FileText,
  DollarSign,
  Milestone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  FlaskConical,
  Loader2,
  Bot,
  ShieldAlert,
  ShieldCheck
} from "lucide-react"
import { useCreateBounty } from "@/hooks/use-bounties"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { runOpenClawReview } from "@/lib/agents/openclaw-orchestrator"

const DRAFT_KEY = "sciflow_bounty_draft"

type Step = "basics" | "protocol" | "milestones" | "review"

interface MilestoneInput {
  id: string
  title: string
  description: string
  percentage: number
  daysToComplete: number
}

interface DraftState {
  step: Step
  title: string
  description: string
  category: string
  budget: string
  currency: "USD" | "USDC"
  methodology: string
  dataRequirements: string
  qualityStandards: string
  ethicsNotes: string
  milestones: MilestoneInput[]
}

export function CreateBountyModal({ trigger, defaultOpen }: { trigger?: React.ReactNode; defaultOpen?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen ?? false)
  const [step, setStep] = useState<Step>("basics")
  const [hasDraft, setHasDraft] = useState(false)
  const { createBounty, isCreating } = useCreateBounty()
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState<"USD" | "USDC">("USDC")
  const [methodology, setMethodology] = useState("")
  const [dataRequirements, setDataRequirements] = useState("")
  const [qualityStandards, setQualityStandards] = useState("")
  const [ethicsNotes, setEthicsNotes] = useState("")
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: "1", title: "", description: "", percentage: 25, daysToComplete: 30 }
  ])

  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: "basics", label: "Basics", icon: FileText },
    { id: "protocol", label: "Protocol", icon: FlaskConical },
    { id: "milestones", label: "Milestones", icon: Milestone },
    { id: "review", label: "Review", icon: CheckCircle2 },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const budgetNumber = parseFloat(budget) || 0

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { 
        id: String(milestones.length + 1), 
        title: "", 
        description: "", 
        percentage: 0, 
        daysToComplete: 30 
      }
    ])
  }

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id))
    }
  }

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: string | number) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0)

  const parseLines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

  const parsedDataRequirements = useMemo(() => parseLines(dataRequirements), [dataRequirements])
  const parsedQualityStandards = useMemo(() => parseLines(qualityStandards), [qualityStandards])

  const openClawPreview = useMemo(
    () =>
      runOpenClawReview({
        title: title.trim() || "Untitled bounty",
        description: description.trim(),
        methodology: methodology.trim(),
        dataRequirements: parsedDataRequirements,
        qualityStandards: parsedQualityStandards,
        totalBudget: budgetNumber,
        currency,
        milestones: milestones.map((milestone) => ({
          title: milestone.title || `Milestone ${milestone.id}`,
          description: milestone.description || "Deliver milestone evidence",
          deliverables: parseLines(milestone.description).slice(0, 5),
          payoutPercentage: milestone.percentage,
        })),
      }),
    [
      title,
      description,
      methodology,
      parsedDataRequirements,
      parsedQualityStandards,
      budgetNumber,
      currency,
      milestones,
    ]
  )

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].id)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].id)
    }
  }

  const saveDraft = () => {
    if (typeof window === "undefined") return
    const draft: DraftState = {
      step, title, description, category, budget, currency,
      methodology, dataRequirements, qualityStandards, ethicsNotes, milestones,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch { /* ignore */ }
  }

  const loadDraft = () => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as DraftState
      setStep(draft.step)
      setTitle(draft.title)
      setDescription(draft.description)
      setCategory(draft.category)
      setBudget(draft.budget)
      setCurrency(draft.currency)
      setMethodology(draft.methodology)
      setDataRequirements(draft.dataRequirements)
      setQualityStandards(draft.qualityStandards)
      setEthicsNotes(draft.ethicsNotes)
      setMilestones(draft.milestones?.length ? draft.milestones : milestones)
      setHasDraft(false)
      localStorage.removeItem(DRAFT_KEY)
    } catch { /* ignore */ }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) saveDraft()
    setOpen(next)
  }

  useEffect(() => {
    if (open) setHasDraft(typeof window !== "undefined" && !!localStorage.getItem(DRAFT_KEY))
  }, [open])

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !methodology.trim() || budgetNumber <= 0) {
      toast.error("Please complete title, description, methodology, and budget")
      return
    }

    if (parsedQualityStandards.length === 0) {
      toast.error("Please add at least one quality standard")
      return
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error("Milestone percentages must add up to 100%")
      return
    }

    if (openClawPreview.decision === "reject") {
      const firstSignal = openClawPreview.signals[0]?.message
      toast.error(firstSignal ?? "OpenClaw flagged this bounty as high risk. Revise the signals above and resubmit.")
      return
    }

    const result = await createBounty({
      title: title.trim(),
      description: description.trim(),
      methodology: methodology.trim(),
      data_requirements: parsedDataRequirements,
      quality_standards: parsedQualityStandards,
      ethics_approval: ethicsNotes.trim() || undefined,
      total_budget: budgetNumber,
      currency,
      tags: category ? [category] : [],
      milestones: milestones.map((milestone) => ({
        title: milestone.title || `Milestone ${milestone.id}`,
        description: milestone.description || "Deliver milestone evidence",
        deliverables: parseLines(milestone.description).slice(0, 5),
        payout_percentage: milestone.percentage,
      })),
    })

    if (!result.success || !result.bounty) {
      const errMsg = result.error ?? "Failed to create bounty"
      const review = 'review' in result ? result.review : undefined
      const signals = review?.signals as Array<{ message: string }> | undefined
      const detail = signals?.[0]?.message
      toast.error(detail ? `${errMsg}: ${detail}` : errMsg)
      return
    }

    toast.success("Bounty submitted for admin review")
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY)
    setOpen(false)
    setStep("basics")
    router.push(`/dashboard/bounties/${result.bounty.id}`)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-navy-800 hover:bg-navy-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Bounty
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Create Research Bounty</SheetTitle>
          <SheetDescription>
            Define your research requirements and funding
          </SheetDescription>
        </SheetHeader>

        {hasDraft && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
            <p className="text-sm text-amber-700 dark:text-amber-400">You have a saved draft.</p>
            <Button variant="outline" size="sm" onClick={loadDraft} className="text-amber-700 border-amber-500/30 hover:bg-amber-500/20">
              Resume draft
            </Button>
          </div>
        )}

        {/* Progress Steps */}
        <p className="text-xs text-muted-foreground mb-2">Step {currentStepIndex + 1} of {steps.length}</p>
        <div className="flex items-center justify-between mt-6 mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isActive = s.id === step
            const isCompleted = idx < currentStepIndex
            
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-amber-500 text-navy-900' : ''}
                    ${isCompleted ? 'bg-sage-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : ''}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${idx < currentStepIndex ? 'bg-sage-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step: Basics */}
        {step === "basics" && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Bounty Title</label>
              <Input 
                placeholder="e.g., Novel Protein Folding Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Description</label>
              <Textarea
                placeholder="Describe the research objectives and expected outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 min-h-[132px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computational_biology">Computational Biology</SelectItem>
                  <SelectItem value="genomics">Genomics</SelectItem>
                  <SelectItem value="neuroscience">Neuroscience</SelectItem>
                  <SelectItem value="drug_discovery">Drug Discovery</SelectItem>
                  <SelectItem value="environmental">Environmental Science</SelectItem>
                  <SelectItem value="materials">Materials Science</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy-800 dark:text-white">Budget</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-9 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-navy-800 dark:text-white">Currency</label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as "USD" | "USDC")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD (Credit Card)</SelectItem>
                    <SelectItem value="USDC">USDC (Crypto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step: Protocol */}
        {step === "protocol" && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Methodology</label>
              <Textarea
                placeholder="Describe the required research methodology..."
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="mt-1 min-h-[132px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Data Requirements</label>
              <Textarea
                placeholder="List required datasets, formats, and expected artifacts (one item per line)..."
                value={dataRequirements}
                onChange={(e) => setDataRequirements(e.target.value)}
                className="mt-1 min-h-[112px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Quality Standards</label>
              <Textarea
                placeholder="Define acceptance criteria and validation checks (one item per line)..."
                value={qualityStandards}
                onChange={(e) => setQualityStandards(e.target.value)}
                className="mt-1 min-h-[112px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Ethics & Safety Notes (Optional)</label>
              <Textarea
                placeholder="Document sensitive considerations, prohibited use, and required safeguards..."
                value={ethicsNotes}
                onChange={(e) => setEthicsNotes(e.target.value)}
                className="mt-1 min-h-[112px]"
              />
            </div>
            <Card className="border-0 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-400">
                <strong>Tip:</strong> Better structure improves OpenClaw screening quality and reduces back-and-forth during admin review.
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Milestones */}
        {step === "milestones" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-navy-800 dark:text-white">Define Milestones</p>
                <p className="text-sm text-muted-foreground">Break the research into verifiable deliverables</p>
              </div>
              <Badge variant={totalPercentage === 100 ? "default" : "destructive"} className={totalPercentage === 100 ? "bg-sage-100 text-sage-700" : ""}>
                {totalPercentage}% allocated
              </Badge>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <Card key={milestone.id} className="border-0 shadow-clause">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Milestone {idx + 1}</Badge>
                      {milestones.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-alert-600"
                          onClick={() => removeMilestone(milestone.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Input 
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Payout %</label>
                          <Input 
                            type="number"
                            placeholder="25"
                            value={milestone.percentage || ""}
                            onChange={(e) => updateMilestone(milestone.id, "percentage", parseInt(e.target.value) || 0)}
                            className="font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Days to complete</label>
                          <Input 
                            type="number"
                            placeholder="30"
                            value={milestone.daysToComplete}
                            onChange={(e) => updateMilestone(milestone.id, "daysToComplete", parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      {budgetNumber > 0 && milestone.percentage > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Payout: <span className="font-mono font-medium">${((budgetNumber * milestone.percentage) / 100).toLocaleString()}</span> {currency}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" onClick={addMilestone} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-clause">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{title || "Untitled Bounty"}</CardTitle>
                <CardDescription>{category?.replace("_", " ") || "No category"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{description || "No description"}</p>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="text-xl font-bold font-mono text-navy-800 dark:text-white">
                      ${budgetNumber.toLocaleString()} {currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Milestones</p>
                    <p className="text-xl font-bold text-navy-800 dark:text-white">
                      {milestones.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Requirements</p>
                    <p className="text-lg font-semibold text-navy-800 dark:text-white">
                      {parsedDataRequirements.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quality Standards</p>
                    <p className="text-lg font-semibold text-navy-800 dark:text-white">
                      {parsedQualityStandards.length}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-medium text-navy-800 dark:text-white">Milestone Breakdown</p>
                  {milestones.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span>{m.title || `Milestone ${idx + 1}`}</span>
                      <span className="font-mono text-muted-foreground">
                        ${((budgetNumber * m.percentage) / 100).toLocaleString()} ({m.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>

                {ethicsNotes.trim() && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium text-navy-800 dark:text-white mb-1">Ethics & Safety Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ethicsNotes.trim()}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card
              className={`border ${
                openClawPreview.decision === "reject"
                  ? "border-red-500/30 bg-red-500/5"
                  : openClawPreview.decision === "manual_review"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  OpenClaw Pre-Screen
                </CardTitle>
                <CardDescription>
                  This preview estimates how your bounty will be triaged during admin review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Decision: {openClawPreview.decision === "manual_review" ? "Manual Review" : openClawPreview.decision === "allow" ? "Allow" : "Reject"}
                  </Badge>
                  <Badge variant="outline">Score: {openClawPreview.score}</Badge>
                  <Badge variant="outline">Signals: {openClawPreview.signals.length}</Badge>
                </div>

                {openClawPreview.signals.length > 0 ? (
                  <div className="space-y-2">
                    {openClawPreview.signals.map((signal, index) => (
                      <div key={`${signal.type}-${index}`} className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
                        <p className="text-sm font-medium capitalize">{signal.type} · {signal.severity}</p>
                        <p className="text-sm text-muted-foreground">{signal.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    No OpenClaw risk signals detected.
                  </div>
                )}

                {openClawPreview.decision === "reject" && (
                  <div className="text-sm text-red-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Submission blocked until high-risk content is revised.
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full bg-amber-500 hover:bg-amber-400 text-navy-900"
              onClick={handleCreate}
              disabled={isCreating || openClawPreview.decision === "reject"}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4 mr-2" />
              )}
              Create Bounty (Admin + OpenClaw Review)
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step !== "review" && (
          <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 bg-navy-800 hover:bg-navy-700">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
