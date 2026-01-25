import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  FlaskConical, 
  Shield, 
  Wallet, 
  Building2,
  DollarSign,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Zap,
  Code,
  GitBranch,
  Lock,
  TrendingUp,
  Star
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Founding Cohort Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-emerald-600 text-white text-center py-2 px-4">
        <p className="text-sm font-medium">
          🚀 <span className="font-bold">Founding Cohort Open</span> — Early funders & labs get priority access, reduced fees, and governance tokens.{" "}
          <Link href="#founding" className="underline hover:no-underline">Learn more →</Link>
        </p>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path 
                d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
                stroke="url(#g)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path d="M9 3H15" stroke="url(#g)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="15" r="1" fill="#34D399" />
              <circle cx="14" cy="16" r="0.8" fill="#6EE7B7" />
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-semibold text-white">
              Sci<span className="text-amber-400">Flow</span>
            </span>
          </div>
          
          {/* Outcome-led headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            From Research Idea to<br />
            <span className="text-amber-400">Validated Data in 60 Days</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            The first marketplace where funders commission breakthrough research from verified labs — 
            with milestone-based escrow that protects both sides.
          </p>

          {/* Social Proof - Prominent */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300"><span className="font-bold text-white">87</span> Labs Pre-registered</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300"><span className="font-bold text-white">23</span> Funders Onboarded</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300"><span className="font-bold text-white">$340K</span> Committed</span>
            </div>
          </div>

          {/* CTAs with Expectation Setting */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium">
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/whitepaper">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Read Whitepaper
                </Button>
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Browse open bounties, labs & escrow positions — no sign-up needed. Sign in to post or apply.
            </p>
          </div>
        </div>

        {/* Success Story / Case Study */}
        <div className="max-w-3xl mx-auto mt-12 mb-16 p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <Badge className="bg-emerald-500/20 text-emerald-400 mb-2">Pilot Success</Badge>
              <h3 className="text-lg font-semibold text-white mb-2">
                CRISPR Delivery Optimization — $75K Bounty Completed
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                A biotech funder posted a bounty for optimizing CRISPR-Cas9 delivery mechanisms. 
                Within 72 hours, 4 qualified labs submitted proposals. The selected lab delivered 
                validated results in 58 days across 4 milestones, with each payment released 
                automatically upon verification.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 58 days total
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 4/4 milestones verified
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> $0 disputes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audience Segmentation */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* For Funders */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-slate-800/40 border border-amber-700/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">For Funders</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Commission specific research outcomes from pre-vetted labs. Pay only for verified results.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Post bounties with clear deliverables and milestones</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Review proposals from reputation-scored labs</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Funds held in escrow — release only on verified completion</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Dispute resolution with independent arbitration (72h SLA)</span>
              </li>
            </ul>
            <Link href="/dashboard/bounties">
              <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white">
                Post a Research Bounty
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* For Labs */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-slate-800/40 border border-emerald-700/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">For Labs & Researchers</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Get paid for your expertise. Find funded projects that match your capabilities.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Browse bounties filtered by your specialization</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Build on-chain reputation with successful deliveries</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Get paid in USDC or fiat — your choice per milestone</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Stake for priority access to high-value bounties</span>
              </li>
            </ul>
            <Link href="/dashboard/open-bounties">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Browse Open Bounties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Platform Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link 
            href="/dashboard/labs" 
            className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          >
            <FlaskConical className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">Verified Labs</h3>
            <p className="text-sm text-slate-400">
              Reputation-scored labs with staking requirements ensure quality research delivery.
            </p>
            <span className="inline-flex items-center text-xs text-emerald-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              Browse Labs <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>

          <Link 
            href="/dashboard/escrow" 
            className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          >
            <Wallet className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">Hybrid Payments</h3>
            <p className="text-sm text-slate-400">
              Pay via Stripe or crypto (Solana/Base USDC). All funds held in secure escrow.
            </p>
            <span className="inline-flex items-center text-xs text-amber-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              View Escrow <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>

          <Link 
            href="/whitepaper#por" 
            className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          >
            <Shield className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">Milestone Escrow</h3>
            <p className="text-sm text-slate-400">
              Funds release only on verified milestone completion with dispute resolution.
            </p>
            <span className="inline-flex items-center text-xs text-blue-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>
        </div>

        {/* Founding Cohort Section */}
        <div id="founding" className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-800 to-emerald-900/30 border border-amber-600/30">
          <div className="text-center mb-8">
            <Badge className="bg-amber-500/20 text-amber-400 mb-3">
              <Star className="w-3 h-3 mr-1" />
              Limited Availability
            </Badge>
            <h2 className="text-2xl font-bold text-white mb-2">Join the Founding Cohort</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We&apos;re onboarding our first 50 funders and 100 labs with exclusive benefits for early believers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 rounded-xl p-5">
              <h3 className="font-semibold text-amber-400 mb-3">For Founding Funders</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  0% platform fee for first 3 bounties
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Priority lab matching & faster responses
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Governance tokens for protocol decisions
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Direct Slack access to founding team
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-400 mb-3">For Founding Labs</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Reduced staking requirements (50% off)
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Featured placement in lab directory
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Reputation multiplier for early completions
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Beta access to new bounty categories
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 mb-3">
              {/* Progress */}
              <span className="text-amber-400 font-medium">23/50 funder spots</span> and{" "}
              <span className="text-emerald-400 font-medium">87/100 lab spots</span> filled
            </p>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-900 font-medium">
                Apply for Founding Cohort
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Technical / Developer Section with Value Framing */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Built for Transparency</h2>
            <p className="text-slate-400">Open-source, auditable, and extensible by design.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
              <Code className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Modular Escrow Engine</h3>
              <p className="text-sm text-slate-400 mb-3">
                Pluggable escrow contracts on Solana & Base. Add custom release conditions, 
                multi-sig requirements, or time-locks without forking.
              </p>
              <Link href="/whitepaper#payments" className="text-xs text-blue-400 hover:underline">
                Read the spec →
              </Link>
            </div>
            
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
              <TrendingUp className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">On-Chain Reputation</h3>
              <p className="text-sm text-slate-400 mb-3">
                Lab reputation scores are computed from verified milestone completions, 
                stored on-chain, and portable across DeSci platforms.
              </p>
              <Link href="/whitepaper#por" className="text-xs text-emerald-400 hover:underline">
                See the algorithm →
              </Link>
            </div>
            
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
              <GitBranch className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">State Machine Architecture</h3>
              <p className="text-sm text-slate-400 mb-3">
                All bounty transitions (Draft → Funded → Active → Complete) are enforced 
                by XState, making workflows auditable and deterministic.
              </p>
              <Link href="/whitepaper#state-machine" className="text-xs text-amber-400 hover:underline">
                View the diagram →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>© 2026 SciFlow Labs</span>
              <Link href="/whitepaper" className="hover:text-slate-300">Whitepaper</Link>
              <Link href="/help" className="hover:text-slate-300">Help</Link>
              <a href="https://github.com/sciflowlabs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">GitHub</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="w-3 h-3" />
              <span>Escrow secured by Solana & Base smart contracts</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
