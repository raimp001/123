"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  Calendar,
  Milestone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  FlaskConical,
  Loader2
} from "lucide-react"
import { useCreateBounty } from "@/hooks/use-bounties"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Step = "basics" | "protocol" | "milestones" | "review"

interface MilestoneInput {
  id: string
  title: string
  description: string
  percentage: number
  daysToComplete: number
}

export function CreateBountyModal({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("basics")
  const { createBounty, isCreating } = useCreateBounty()
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState<"USD" | "USDC">("USDC")
  const [methodology, setMethodology] = useState("")
  const [dataRequirements, setDataRequirements] = useState("")
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

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !methodology.trim() || budgetNumber <= 0) {
      toast.error("Please complete title, description, methodology, and budget")
      return
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error("Milestone percentages must add up to 100%")
      return
    }

    const result = await createBounty({
      title: title.trim(),
      description: description.trim(),
      methodology: methodology.trim(),
      data_requirements: parseLines(dataRequirements),
      quality_standards: parseLines(dataRequirements),
      total_budget: budgetNumber,
      currency,
      tags: category ? [category] : [],
      milestones: milestones.map((milestone) => ({
        title: milestone.title || `Milestone ${milestone.id}`,
        description: milestone.description || "Deliver milestone evidence",
        deliverables: parseLines(milestone.description || "").slice(0, 5),
        payout_percentage: milestone.percentage,
      })),
    })

    if (!result.success || !result.bounty) {
      toast.error(result.error || "Failed to create bounty")
      return
    }

    toast.success("Bounty submitted for admin review")
    setOpen(false)
    setStep("basics")
    router.push(`/dashboard/bounties/${result.bounty.id}`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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

        {/* Progress Steps */}
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
              <textarea 
                placeholder="Describe the research objectives and expected outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
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
              <textarea 
                placeholder="Describe the required research methodology..."
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="mt-1 w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-800 dark:text-white">Data Requirements</label>
              <textarea 
                placeholder="List the data formats, quality standards, and deliverables expected..."
                value={dataRequirements}
                onChange={(e) => setDataRequirements(e.target.value)}
                className="mt-1 w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
            <Card className="border-0 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-400">
                <strong>Tip:</strong> Be specific about requirements. Clear protocols reduce disputes 
                and help labs provide accurate bids.
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
              </CardContent>
            </Card>

            <Button
              className="w-full bg-amber-500 hover:bg-amber-400 text-navy-900"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4 mr-2" />
              )}
              Create Bounty (Admin Review)
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
