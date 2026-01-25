import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  FlaskConical, 
  DollarSign,
  CheckCircle2,
  Clock,
  Lock,
  Building2,
  Users,
  Zap
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Founding Cohort Banner */}
      <div className="bg-[#6B5FED] text-white text-center py-2.5 px-4">
        <p className="text-sm">
          <span className="font-semibold">Founding Cohort Open</span>
          <span className="hidden sm:inline"> — Early access for funders & labs</span>
          {" "}
          <Link href="#founding" className="underline hover:no-underline">Learn more →</Link>
        </p>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#6B5FED]">
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
          <span className="text-xl font-semibold text-[#111827]">SciFlow</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#111827] mb-5 leading-tight tracking-tight">
          Research ideas to<br />
          validated data in 60 days
        </h1>
        
        <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-8">
          Commission breakthrough research from verified labs. 
          Milestone-based escrow protects both sides.
        </p>

        {/* Social Proof - Single location */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <strong className="text-[#111827]">87</strong> labs
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <strong className="text-[#111827]">23</strong> funders
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <strong className="text-[#111827]">$340K</strong> committed
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                Launch App
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/whitepaper">
              <Button size="lg" variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
                Read Whitepaper
              </Button>
            </Link>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Browse bounties and labs without signing in
          </p>
        </div>
      </div>

      {/* Example Bounty - Clearly labeled */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="p-6 rounded-xl bg-white border border-[#E5E7EB]" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#6B5FED]/10 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-[#6B5FED]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B5FED] mb-1">Example Bounty Format</p>
              <h3 className="font-semibold text-[#111827] mb-2">
                CRISPR Delivery Optimization — $75K
              </h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Typical bounty: 4 milestones over 60 days. Labs submit proposals, 
                funder selects, payments release on verified completion.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 60 days typical
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#6B5FED]" /> Escrow protected
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Dispute resolution
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Segmentation */}
      <div className="bg-white border-y border-[#E5E7EB] py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Funders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[#6B5FED]" />
                <h2 className="text-lg font-semibold text-[#111827]">For Funders</h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Post bounties with clear milestones</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Review proposals from verified labs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Funds held in escrow until verified</span>
                </li>
              </ul>
              <Link href="/dashboard/bounties">
                <Button className="w-full bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
                  Post a Bounty
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* For Labs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-[#6B5FED]" />
                <h2 className="text-lg font-semibold text-[#111827]">For Labs</h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Browse bounties matching your expertise</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Build on-chain reputation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B5FED] flex-shrink-0 mt-0.5" />
                  <span>Get paid in USDC or fiat</span>
                </li>
              </ul>
              <Link href="/dashboard/open-bounties">
                <Button variant="outline" className="w-full border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
                  Browse Bounties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Founding Cohort - Single section */}
      <div id="founding" className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-[#6B5FED] text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Early Access
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-3">Founding Cohort</h2>
          <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
            First 50 funders and 100 labs get 0% fees on first 3 bounties, 
            governance tokens, and priority access.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB]">
              <p className="font-semibold text-[#111827] mb-1">Funders</p>
              <p className="text-[#6B5FED] font-medium">23/50 spots</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB]">
              <p className="font-semibold text-[#111827] mb-1">Labs</p>
              <p className="text-[#6B5FED] font-medium">87/100 spots</p>
            </div>
          </div>
          
          <Link href="/signup">
            <Button className="bg-[#6B5FED] hover:bg-[#5B4FDD] text-white rounded-lg">
              Apply Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
            <span>© 2026 SciFlow Labs</span>
            <div className="flex gap-6">
              <Link href="/docs" className="hover:text-[#111827]">Docs</Link>
              <Link href="/faq" className="hover:text-[#111827]">FAQ</Link>
              <Link href="/whitepaper" className="hover:text-[#111827]">Whitepaper</Link>
              <Link href="/help" className="hover:text-[#111827]">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
