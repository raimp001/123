"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2, Building2, FlaskConical, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const ROLES = [
  {
    id: "funder",
    icon: Building2,
    title: "I want to fund research",
    subtitle: "Post research questions and pay labs only when they deliver results",
    who: "Pharma companies · Governments · Universities · Foundations · VCs · Individuals",
    color: "border-blue-500/30 hover:border-blue-400/60 data-[selected=true]:border-blue-400 data-[selected=true]:bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    id: "lab",
    icon: FlaskConical,
    title: "I am a researcher / lab",
    subtitle: "Find funded research projects and get paid milestone by milestone",
    who: "Research labs · Academic institutions · Independent scientists · CROs",
    color: "border-emerald-500/30 hover:border-emerald-400/60 data-[selected=true]:border-emerald-400 data-[selected=true]:bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [selected, setSelected] = useState<"funder" | "lab" | null>(null)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected, onboarding_completed: true }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errorMsg = data?.error || `Server error (${res.status})`
        console.error('[Onboarding] PATCH failed:', errorMsg)
        toast.error(`Something went wrong — ${errorMsg}`)
        return
      }

      await refreshUser()
      toast.success("Welcome to SciFlow!")
      router.replace('/dashboard')
    } catch (err) {
      console.error('[Onboarding] Unexpected error:', err)
      toast.error("Something went wrong — please try again")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-6">
        S
      </div>

      <h1 className="text-3xl font-bold mb-2">Welcome to SciFlow</h1>
      <p className="text-muted-foreground mb-8 text-center">
        What best describes you? We&apos;ll set up your workspace accordingly.
      </p>

      {/* Role selection */}
      <div className="w-full max-w-lg space-y-4 mb-8">
        {ROLES.map(role => {
          const isSelected = selected === role.id
          const Icon = role.icon
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id as "funder" | "lab")}
              data-selected={isSelected}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 ${role.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Icon className={`w-8 h-8 mt-0.5 shrink-0 ${role.iconColor}`} />
                  <div>
                    <div className="font-semibold text-lg">{role.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{role.subtitle}</div>
                    <div className="text-xs text-muted-foreground/70 mt-2">{role.who}</div>
                  </div>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-green-400 shrink-0 ml-4" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Continue */}
      <Button
        onClick={handleContinue}
        disabled={!selected || saving}
        className="w-full max-w-lg"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up your workspace…
          </>
        ) : (
          'Continue →'
        )}
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        You can change this later in Settings.
      </p>
    </div>
  )
}
