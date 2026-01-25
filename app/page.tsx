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
          Research ideas to<br />
          <span className="text-muted-foreground">validated data.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Commission breakthrough research from verified labs. 
          Milestone-based escrow protects both sides.
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

      {/* Features Section */}
      <section className="border-t border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground text-center mb-16">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-foreground">1</span>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Define Your Bounty</h3>
              <p className="text-muted-foreground leading-relaxed">
                Specify your research question, budget, and milestones. Funds are held in escrow.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-foreground">2</span>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Labs Submit Proposals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Verified research labs submit proposals. Review credentials and select the best fit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-foreground">3</span>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Milestone Payouts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Funds release automatically as milestones are verified. Full transparency.
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
