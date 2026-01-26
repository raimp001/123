import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Logo - warm accent like Claude */}
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
            <path 
              d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
              stroke="hsl(20 70% 55%)"
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M9 3H15" stroke="hsl(20 70% 55%)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="15" r="1.2" fill="hsl(20 70% 55%)" />
            <circle cx="14" cy="16" r="0.9" fill="hsl(20 70% 65%)" />
          </svg>
          <span className="text-xl font-semibold text-foreground tracking-tight">SciFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/whitepaper" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            Whitepaper
          </Link>
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            Docs
          </Link>
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-40 text-center">
        <h1 className="heading-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-10">
          Got an idea?<br />
          <span className="text-muted-foreground/70">Get it validated.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed font-light">
          You don&apos;t need a lab. Post your research idea as a bounty. 
          Verified labs compete to make it happen. Pay only when they prove results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-10 py-7 text-base font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
              Start a Research Bounty
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/open-bounties">
            <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-base">
              Browse Bounties
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground/60 tracking-wide">
          No account required to browse
        </p>
      </main>

      {/* For Idea Holders Section */}
      <section className="border-t border-border/50 py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs text-accent font-semibold tracking-[0.2em] uppercase mb-4">FOR IDEA HOLDERS</p>
            <h2 className="text-4xl md:text-5xl text-foreground mb-6 tracking-tight">
              No lab? No problem.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              You have a breakthrough idea but no equipment, no lab, no team. 
              Post it as a bounty and let verified researchers compete to make it real.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-5">
            <div className="text-center p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 hover:bg-card transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-serif text-accent">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Post Your Idea</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Describe your research question, what success looks like, and set your budget. Funds go into escrow.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 hover:bg-card transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-serif text-accent">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Labs Compete</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Only <strong className="text-foreground font-medium">verified labs</strong> with proven credentials can submit proposals. Compare their track record.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 hover:bg-card transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-serif text-accent">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Verify Results</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Labs submit <strong className="text-foreground font-medium">proof of research</strong>—data, reports, evidence—at each milestone. You review and approve.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 hover:bg-card transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-serif text-accent">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Pay on Proof</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Funds release only when milestones are verified. No proof, no payment. Your money is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Labs Section */}
      <section className="py-32 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs text-accent font-semibold tracking-[0.2em] uppercase mb-4">FOR LABS & RESEARCHERS</p>
            <h2 className="text-4xl md:text-5xl text-foreground mb-6 tracking-tight">
              Get paid for your expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Access a global pool of funded research projects. Your verification status unlocks higher-value bounties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-background border border-border/50 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/15 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-emerald-400">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get Verified</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Submit your credentials, publications, and equipment list. Higher tiers unlock bigger bounties.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground">Basic</span>
                <span className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-xs font-medium text-blue-400">Verified</span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-xs font-medium text-amber-400">Trusted</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-xs font-medium text-purple-400">Institutional</span>
              </div>
            </div>
            
            <div className="p-8 rounded-3xl bg-background border border-border/50 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/15 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-blue-400">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Submit Proposals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse open bounties. Submit your methodology, timeline, and why you&apos;re the right fit. Compete on merit.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/15 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-accent">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Prove & Get Paid</h3>
              <p className="text-muted-foreground leading-relaxed">
                Submit evidence for each milestone—raw data, lab reports, IPFS-hashed files. Once verified, funds release instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="py-32 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl text-foreground mb-8 tracking-tight">
            Built on proof, not promises
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
            Every payout requires verified evidence. Labs stake reputation and funds. Disputes are resolved by neutral arbitrators.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border border-border/50 hover:border-emerald-500/30 bg-card/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-emerald-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-3 text-lg">Lab Verification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Only registered labs with verified credentials can accept bounties. No anonymous actors.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl border border-border/50 hover:border-blue-500/30 bg-card/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-blue-400">
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-3 text-lg">IPFS Evidence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Research data is hashed and stored immutably. Tamper-proof records ensure authenticity.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl border border-border/50 hover:border-accent/30 bg-card/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-accent">
                  <path d="M12 3v18M3 12h18" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-3 text-lg">Dispute Resolution</h3>
              <p className="text-muted-foreground leading-relaxed">
                Disagreements are reviewed by neutral arbitrators. Fair outcomes, transparent process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Cohort */}
      <section id="founding" className="py-32 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Limited Early Access
          </div>
          
          <h2 className="text-4xl md:text-5xl text-foreground mb-8 tracking-tight">
            Join the Founding Cohort
          </h2>
          
          <p className="text-xl text-muted-foreground mb-14 max-w-xl mx-auto leading-relaxed">
            First 50 funders and 100 labs get 0% fees on their first 3 bounties, 
            plus governance tokens and priority support.
          </p>

          <div className="grid sm:grid-cols-3 gap-5 mb-14">
            <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all duration-300">
              <p className="text-5xl font-serif text-foreground mb-3">0%</p>
              <p className="text-muted-foreground">Platform fees<br /><span className="text-sm">(first 3 bounties)</span></p>
            </div>
            <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all duration-300">
              <p className="text-5xl font-serif text-foreground mb-3">Tokens</p>
              <p className="text-muted-foreground">Governance<br /><span className="text-sm">allocation</span></p>
            </div>
            <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all duration-300">
              <p className="text-5xl font-serif text-foreground mb-3">Priority</p>
              <p className="text-muted-foreground">Direct team<br /><span className="text-sm">support</span></p>
            </div>
          </div>

          <Link href="/signup">
            <Button size="lg" className="rounded-full px-12 py-7 text-base font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 bg-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path 
                  d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
                  stroke="hsl(20 70% 55%)"
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path d="M9 3H15" stroke="hsl(20 70% 55%)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-foreground font-semibold tracking-tight">SciFlow</span>
            </div>
            
            <div className="flex items-center gap-10 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors duration-200">Docs</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors duration-200">FAQ</Link>
              <Link href="/whitepaper" className="hover:text-foreground transition-colors duration-200">Whitepaper</Link>
              <Link href="/help" className="hover:text-foreground transition-colors duration-200">Help</Link>
            </div>
            
            <p className="text-sm text-muted-foreground/60">
              © 2026 SciFlow
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
