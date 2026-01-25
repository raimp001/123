import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Logo - warm accent like Claude */}
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
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
          <span className="text-xl font-medium text-foreground">SciFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/whitepaper" className="text-muted-foreground hover:text-foreground transition-colors">
            Whitepaper
          </Link>
          <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
        <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-8 leading-[1.1] tracking-tight">
          Got an idea?<br />
          <span className="text-muted-foreground">Get it validated.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          You don&apos;t need a lab. Post your research idea as a bounty. 
          Verified labs compete to make it happen. Pay only when they prove results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium">
              Start a Research Bounty
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/open-bounties">
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary rounded-full px-8 py-6 text-lg">
              Browse Bounties
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          No account required to browse
        </p>
      </main>

      {/* For Idea Holders Section */}
      <section className="border-t border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-medium mb-3">FOR IDEA HOLDERS</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              No lab? No problem.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You have a breakthrough idea but no equipment, no lab, no team. 
              Post it as a bounty and let verified researchers compete to make it real.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-serif text-primary">1</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Post Your Idea</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Describe your research question, what success looks like, and set your budget. Funds go into escrow.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-serif text-primary">2</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Labs Compete</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Only <strong className="text-foreground">verified labs</strong> with proven credentials can submit proposals. Compare their track record.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-serif text-primary">3</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Verify Results</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Labs submit <strong className="text-foreground">proof of research</strong>—data, reports, evidence—at each milestone. You review and approve.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-serif text-primary">4</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Pay on Proof</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Funds release only when milestones are verified. No proof, no payment. Your money is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Labs Section */}
      <section className="py-24 bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-medium mb-3">FOR LABS & RESEARCHERS</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Get paid for your expertise
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access a global pool of funded research projects. Your verification status unlocks higher-value bounties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-emerald-400">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Get Verified</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit your credentials, publications, and equipment list. Higher tiers unlock bigger bounties.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground">Basic</span>
                <span className="px-2 py-1 rounded-full bg-blue-500/20 text-xs text-blue-400">Verified</span>
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-xs text-amber-400">Trusted</span>
                <span className="px-2 py-1 rounded-full bg-purple-500/20 text-xs text-purple-400">Institutional</span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-400">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Submit Proposals</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse open bounties. Submit your methodology, timeline, and why you&apos;re the right fit. Compete on merit.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Prove & Get Paid</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit evidence for each milestone—raw data, lab reports, IPFS-hashed files. Once verified, funds release instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
            Built on proof, not promises
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Every payout requires verified evidence. Labs stake reputation and funds. Disputes are resolved by neutral arbitrators.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground mb-2">Lab Verification</h3>
              <p className="text-sm text-muted-foreground">
                Only registered labs with verified credentials can accept bounties. No anonymous actors.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-400">
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground mb-2">IPFS Evidence</h3>
              <p className="text-sm text-muted-foreground">
                Research data is hashed and stored immutably. Tamper-proof records ensure authenticity.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground mb-2">Dispute Resolution</h3>
              <p className="text-sm text-muted-foreground">
                Disagreements are reviewed by neutral arbitrators. Fair outcomes, transparent process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Cohort */}
      <section id="founding" className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            Limited Early Access
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
            Join the Founding Cohort
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            First 50 funders and 100 labs get 0% fees on their first 3 bounties, 
            plus governance tokens and priority support.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-3xl font-serif text-foreground mb-2">0%</p>
              <p className="text-sm text-muted-foreground">Platform fees (first 3 bounties)</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-3xl font-serif text-foreground mb-2">Tokens</p>
              <p className="text-sm text-muted-foreground">Governance allocation</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-3xl font-serif text-foreground mb-2">Priority</p>
              <p className="text-sm text-muted-foreground">Direct team support</p>
            </div>
          </div>

          <Link href="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path 
                  d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
                  stroke="hsl(20 70% 55%)"
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path d="M9 3H15" stroke="hsl(20 70% 55%)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-foreground font-medium">SciFlow</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/whitepaper" className="hover:text-foreground transition-colors">Whitepaper</Link>
              <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 SciFlow
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
