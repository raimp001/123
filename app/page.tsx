import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  FlaskConical, 
  DollarSign,
  CheckCircle2,
  Sparkles,
  Clock,
  Lock,
  Building2,
  Users,
  Zap
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Founding Cohort Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2.5 px-4">
        <p className="text-sm">
          <span className="font-semibold">Founding Cohort Open</span>
          <span className="hidden sm:inline"> — Early funders & labs get 0% fees and governance tokens.</span>
          {" "}
          <Link href="#founding" className="underline hover:no-underline">Learn more →</Link>
        </p>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary">
            <path 
              d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
              stroke="currentColor"
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M9 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="15" r="1" fill="currentColor" />
            <circle cx="14" cy="16" r="0.8" fill="currentColor" />
          </svg>
          <span className="text-xl font-semibold text-foreground">
            SciFlow
          </span>
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight tracking-tight">
          Research ideas to<br />
          validated data in 60 days
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Commission breakthrough research from verified labs. 
          Milestone-based escrow protects both sides.
        </p>

        {/* Social Proof */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <strong className="text-foreground">87</strong> labs
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <strong className="text-foreground">23</strong> funders
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <strong className="text-foreground">$340K</strong> committed
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Launch App
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/whitepaper">
              <Button size="lg" variant="outline">
                Read Whitepaper
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Browse bounties and labs without signing in
          </p>
        </div>
      </div>

      {/* Success Story */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary mb-1">Pilot Success</p>
              <h3 className="font-semibold text-foreground mb-2">
                CRISPR Delivery Optimization — $75K Completed
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                4 qualified labs submitted proposals within 72 hours. Selected lab delivered 
                validated results in 58 days across 4 milestones.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 58 days
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> 4/4 verified
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> $0 disputes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Segmentation */}
      <div className="bg-card border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Funders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">For Funders</h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Post bounties with clear milestones</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Review proposals from verified labs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Funds held in escrow until verified</span>
                </li>
              </ul>
              <Link href="/dashboard/bounties">
                <Button className="w-full">
                  Post a Bounty
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* For Labs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">For Labs</h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Browse bounties matching your expertise</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Build on-chain reputation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Get paid in USDC or fiat</span>
                </li>
              </ul>
              <Link href="/dashboard/open-bounties">
                <Button variant="outline" className="w-full">
                  Browse Bounties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Founding Cohort */}
      <div id="founding" className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Limited Availability
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Join the Founding Cohort</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            First 50 funders and 100 labs get 0% fees, governance tokens, and priority access.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="font-semibold text-foreground mb-1">Founding Funders</p>
              <p className="text-muted-foreground text-xs mb-2">0% fee on first 3 bounties</p>
              <p className="text-primary font-medium">23/50 spots filled</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="font-semibold text-foreground mb-1">Founding Labs</p>
              <p className="text-muted-foreground text-xs mb-2">50% reduced staking</p>
              <p className="text-primary font-medium">87/100 spots filled</p>
            </div>
          </div>
          
          <Link href="/signup">
            <Button>
              Apply for Founding Cohort
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© 2026 SciFlow Labs</span>
            <div className="flex gap-6">
              <Link href="/docs" className="hover:text-foreground">Docs</Link>
              <Link href="/faq" className="hover:text-foreground">FAQ</Link>
              <Link href="/whitepaper" className="hover:text-foreground">Whitepaper</Link>
              <Link href="/help" className="hover:text-foreground">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
