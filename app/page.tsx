import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, FlaskConical, Globe, Users, Shield, CheckCircle } from "lucide-react"

const FUNDERS = [
  { icon: Building2,  label: "Pharmaceutical",  desc: "Outsource validation studies, Phase I/II screening, biomarker discovery without building internal labs." },
  { icon: Globe,      label: "Government",       desc: "NIH, NSF, DARPA, EU Horizon — post open RFPs, receive competitive proposals, pay on milestone delivery." },
  { icon: Building2,  label: "Universities",     desc: "Tech transfer offices fund external validation. Faculty post research questions beyond their own capacity." },
  { icon: Users,      label: "Foundations & NGOs", desc: "Gates, Wellcome, patient advocacy groups — fund disease-specific research with transparent, verifiable outcomes." },
  { icon: FlaskConical, label: "Biotech / VCs",  desc: "Validate preclinical data before committing capital. Commission independent replication studies." },
  { icon: Globe,      label: "DAOs & Web3",      desc: "Pool community funds into research bounties. Quadratic funding models, on-chain governance of grants." },
]

const ROUTES = [
  { label: "Credit / Debit Card", detail: "Stripe — instant funding, any card worldwide" },
  { label: "Wire Transfer / ACH", detail: "Bank transfer, invoicing, purchase orders for procurement" },
  { label: "USDC on Base",        detail: "Stablecoin escrow — instant, borderless, auditable on-chain" },
  { label: "Crypto (ETH / BTC)",  detail: "Converted to USDC at deposit — no volatility in escrow" },
]

const HOW = [
  { n: "01", title: "Post a bounty",     desc: "Define the research question, success criteria, budget, and milestone structure. Takes 10 minutes." },
  { n: "02", title: "Proposals compete", desc: "Verified labs bid with methodology, timeline, and team credentials. You compare and select the best fit." },
  { n: "03", title: "Research happens",  desc: "Lab submits evidence at each milestone — raw data, reports, IPFS-hashed files. You review before releasing funds." },
  { n: "04", title: "Pay on proof",      desc: "Escrow releases milestone by milestone. No proof delivered → no payment. Your budget is protected throughout." },
]

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Open to institutions, pharma, governments & individuals
        </div>

        <h1 className="heading-display text-5xl md:text-7xl text-foreground mb-8">
          Commission research.<br />
          <span className="text-muted-foreground/50">Pay only when it's proven.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          SciFlow is an open marketplace connecting research funders — pharma, governments,
          universities, foundations, and individuals — with verified labs worldwide.
          Milestone-based escrow means you pay for results, not promises.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full px-8 h-12 gap-2">
            <Link href="/dashboard">Post a Bounty <ArrowRight className="w-4 h-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12">
            <Link href="/for-institutions">For Institutions</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="rounded-full px-8 h-12 text-muted-foreground">
            <Link href="/bounties">Browse Bounties</Link>
          </Button>
        </div>
      </section>

      {/* ── Who funds research here ──────────────────────────── */}
      <section className="border-t border-border/30 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Who uses SciFlow</p>
            <h2 className="text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Built for every type of research funder
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're a Fortune 500 pharma company or an independent researcher with
              an important idea, SciFlow gives you the infrastructure to fund science properly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FUNDERS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-6 border border-border/40 rounded-xl hover:border-border transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm text-foreground">{label}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link href="/for-institutions">Institutional onboarding <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Funding routes ───────────────────────────────────── */}
      <section className="border-t border-border/30 py-24 bg-card/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Flexible funding</p>
              <h2 className="text-3xl md:text-4xl text-foreground tracking-tight mb-4">
                Fund in any currency
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Procurement departments can wire funds and receive invoices.
                Web3-native funders can deposit USDC directly on-chain.
                Everyone gets the same protected, milestone-gated escrow.
              </p>
              <Button asChild className="rounded-full gap-2">
                <Link href="/dashboard">Start a bounty <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>

            <div className="space-y-0 divide-y divide-border/30">
              {ROUTES.map((r) => (
                <div key={r.label} className="py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{r.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 pl-6">{r.detail}</p>
                </div>
              ))}
              <div className="pt-4 pl-6">
                <p className="text-xs text-muted-foreground italic">
                  Bounties &lt; $10K can be funded immediately. Larger amounts
                  can be structured with milestone-locked tranches. Wire instructions
                  and invoices available for institutional procurement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-t border-border/30 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-16 text-center">How it works</p>
          <div className="grid md:grid-cols-4 gap-10 md:gap-6">
            {HOW.map((s) => (
              <div key={s.n}>
                <p className="text-xs text-muted-foreground/40 font-mono mb-3">{s.n}</p>
                <h3 className="font-medium text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ─────────────────────────────────────── */}
      <section className="border-t border-border/30 py-24 bg-card/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">Lab Verification</h3>
              <p className="text-xs text-muted-foreground">4-tier credentialing — Basic to Institutional. Only verified labs can accept funded bounties.</p>
            </div>
            <div className="text-center">
              <FlaskConical className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">IPFS Evidence</h3>
              <p className="text-xs text-muted-foreground">All deliverables hashed and stored immutably. Every milestone is an auditable on-chain record.</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">Dispute Resolution</h3>
              <p className="text-xs text-muted-foreground">Neutral arbitrators handle disputes. Labs stake reputation and security deposits on every bounty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── For researchers ───────────────────────────────────── */}
      <section className="border-t border-border/30 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">For research labs</p>
              <h2 className="text-3xl md:text-4xl text-foreground tracking-tight mb-4">
                Your expertise, globally funded
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Browse funded research problems. Submit proposals on your terms.
                Get paid per milestone — in stablecoins or fiat — without waiting
                for slow grant disbursements.
              </p>
              <Button asChild variant="outline" className="rounded-full gap-2">
                <Link href="/signup">Apply as a lab <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { tier: "Basic",         desc: "Open to all registered labs. Access public bounties under $10K." },
                { tier: "Verified",      desc: "Submit credentials and publications. Unlock bounties up to $100K." },
                { tier: "Trusted",       desc: "Track record on platform. Access multi-phase, long-running studies." },
                { tier: "Institutional", desc: "University or hospital affiliation. High-value pharma & government contracts." },
              ].map(({ tier, desc }) => (
                <div key={tier} className="flex gap-3 p-3 border border-border/30 rounded-lg">
                  <span className="text-xs font-mono text-muted-foreground/50 pt-0.5 w-20 shrink-0">{tier}</span>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-border/30 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Early access — 0% platform fees on first 3 bounties
          </div>
          <h2 className="text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
            Ready to fund breakthrough science?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            Post your first bounty in 10 minutes. Individual, institutional,
            or consortium funding — all welcome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 h-12 gap-2">
              <Link href="/dashboard">Post a Bounty <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12">
              <Link href="/for-institutions">Institutional Inquiry</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8">
        <p className="text-xs text-center text-muted-foreground/40">© 2026 SciFlow</p>
      </footer>
    </div>
  )
}
