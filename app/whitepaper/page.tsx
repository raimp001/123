"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  ArrowLeft,
  FileText,
  FlaskConical,
  Shield,
  Lock,
  Users,
  Wallet,
  Scale,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Zap,
  Download
} from "lucide-react"

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-navy-950/95 backdrop-blur border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-navy-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Block */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
            <FileText className="w-3 h-3 mr-1" />
            Technical Whitepaper v1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 dark:text-white mb-4 font-serif">
            SciFlow Protocol
          </h1>
          <p className="text-xl text-muted-foreground">
            A Decentralized Research Bounty Marketplace with<br />
            Milestone-Based Escrow and Proof of Research
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>January 2026</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
        </div>

        {/* Abstract */}
        <Card className="border-0 shadow-clause-md mb-12 bg-slate-50 dark:bg-navy-900">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Abstract</h2>
            <p className="text-muted-foreground leading-relaxed font-serif">
              SciFlow introduces a novel approach to research funding through decentralized bounties, 
              combining milestone-based escrow with on-chain proof of research. By leveraging smart 
              contracts on Solana and Base networks alongside traditional payment rails via Stripe, 
              SciFlow creates a hybrid payment infrastructure that serves both crypto-native and 
              traditional funders. The protocol implements a state machine-driven workflow that 
              ensures accountability, prevents fraud through staking mechanisms, and provides 
              transparent dispute resolution. This paper outlines the technical architecture, 
              economic model, and governance framework of the SciFlow protocol.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <nav className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Contents
          </h2>
          <ol className="space-y-2 text-navy-700 dark:text-slate-300">
            {[
              "Introduction & Problem Statement",
              "The SciFlow Protocol",
              "State Machine Architecture",
              "Hybrid Payment Infrastructure",
              "Proof of Research (PoR)",
              "Staking & Slashing Mechanics",
              "Dispute Resolution",
              "Economic Model",
              "Technical Implementation",
              "Governance & Roadmap",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-amber-500 font-mono">{(i + 1).toString().padStart(2, '0')}</span>
                <span className="hover:text-amber-600 cursor-pointer">{item}</span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {/* Section 1 */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                1. Introduction & Problem Statement
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                Traditional research funding suffers from significant inefficiencies: slow grant 
                processes, lack of accountability, and misaligned incentives between funders and 
                researchers. According to studies, up to 40% of funded research fails to produce 
                reproducible results, yet researchers face little consequence for these failures.
              </p>
              <p>
                The DeSci (Decentralized Science) movement has emerged to address these issues, 
                but existing solutions often fail to bridge the gap between crypto-native tools 
                and the practical needs of research institutions. SciFlow addresses this by 
                providing a hybrid infrastructure that:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage-500 mt-1 flex-shrink-0" />
                  <span>Connects funders directly with verified research labs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage-500 mt-1 flex-shrink-0" />
                  <span>Implements milestone-based payments that align incentives</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage-500 mt-1 flex-shrink-0" />
                  <span>Creates immutable proof of research deliverables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage-500 mt-1 flex-shrink-0" />
                  <span>Supports both fiat and cryptocurrency payments</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-navy-100 dark:bg-navy-800">
                <FlaskConical className="w-5 h-5 text-navy-600 dark:text-navy-300" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                2. The SciFlow Protocol
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                SciFlow operates as a two-sided marketplace connecting <strong>Funders</strong> 
                (research sponsors, DAOs, foundations, corporations) with <strong>Labs</strong> 
                (verified research institutions, independent scientists, university labs).
              </p>
              
              <Card className="border-0 shadow-clause my-8">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-navy-800 dark:text-white mb-4">Core Protocol Components</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: FileText, title: "Bounty Engine", desc: "Protocol definition, milestone specification, bidding system" },
                      { icon: Lock, title: "Escrow Layer", desc: "Multi-method fund custody (Stripe, Solana, Base)" },
                      { icon: Shield, title: "Verification System", desc: "Lab tiers, reputation scoring, KYC/KYB" },
                      { icon: Scale, title: "Dispute Resolution", desc: "3-stage arbitration with stake slashing" },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3 p-3 bg-slate-50 dark:bg-navy-800/50 rounded-lg">
                        <item.icon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-navy-700 dark:text-white text-sm">{item.title}</p>
                          <p className="text-muted-foreground text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3 - State Machine */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900/30">
                <TrendingUp className="w-5 h-5 text-sage-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                3. State Machine Architecture
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                The bounty lifecycle is governed by a rigid state machine implemented using XState. 
                This ensures deterministic transitions and prevents invalid operations.
              </p>
              
              {/* State Diagram */}
              <Card className="border-0 shadow-clause my-8 bg-navy-800 text-white overflow-hidden">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-6">Bounty State Transitions</h4>
                  <div className="flex flex-wrap gap-3 items-center justify-center">
                    {[
                      { state: "Drafting", color: "bg-slate-500" },
                      { state: "Funding", color: "bg-amber-500" },
                      { state: "Bidding", color: "bg-navy-500" },
                      { state: "Research", color: "bg-sage-500" },
                      { state: "Review", color: "bg-amber-500" },
                      { state: "Completed", color: "bg-sage-500" },
                    ].map((item, i) => (
                      <div key={item.state} className="flex items-center gap-2">
                        <div className={`px-4 py-2 rounded-lg ${item.color} text-white font-mono text-sm`}>
                          {item.state}
                        </div>
                        {i < 5 && <span className="text-slate-500">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-navy-900/50 rounded-lg">
                    <p className="text-sm text-navy-200 font-mono">
                      <span className="text-amber-400">dispute_resolution</span> state can be entered 
                      from <span className="text-sage-400">research</span> or <span className="text-amber-400">review</span> states
                    </p>
                  </div>
                </CardContent>
              </Card>

              <p>
                Each state transition is guarded by conditions that validate the current context. 
                For example, transitioning from <code className="text-amber-600">funding_escrow</code> to{" "}
                <code className="text-amber-600">bidding</code> requires confirmation that funds have 
                been secured in the escrow contract.
              </p>
            </div>
          </section>

          {/* Section 4 - Payments */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                4. Hybrid Payment Infrastructure
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                SciFlow supports three payment methods, each with its own escrow implementation:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 my-8">
                <Card className="border-0 shadow-clause">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💳</span>
                    </div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">Stripe</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      PaymentIntent with manual capture. Funds held until milestone approval.
                    </p>
                    <Badge className="mt-3" variant="outline">Fiat USD</Badge>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-clause">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">◎</span>
                    </div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">Solana</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Anchor program with PDA escrow. Sub-second finality.
                    </p>
                    <Badge className="mt-3" variant="outline">USDC SPL</Badge>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-clause">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔵</span>
                    </div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">Base</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      ERC20 escrow contract via CREATE2 deterministic deployment.
                    </p>
                    <Badge className="mt-3" variant="outline">USDC ERC20</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 5 - Proof of Research */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900/30">
                <Shield className="w-5 h-5 text-sage-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                5. Proof of Research (PoR)
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                Every milestone submission includes cryptographic proof anchored on-chain:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Lab uploads evidence files (data, protocols, results) to IPFS/Arweave</li>
                <li>SHA-256 hash of the content is computed client-side</li>
                <li>Hash is submitted to the milestone evidence contract</li>
                <li>Funder reviews evidence via the content link</li>
                <li>Upon approval, hash is permanently recorded with block timestamp</li>
              </ol>
              <p>
                This creates an immutable, timestamped record of research deliverables that can 
                be independently verified by anyone with the content hash.
              </p>
            </div>
          </section>

          {/* Section 6 - Staking */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white m-0">
                6. Staking & Slashing Mechanics
              </h2>
            </div>
            <div className="font-serif text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                Labs must stake tokens proportional to the bounty value when submitting proposals. 
                This stake serves as collateral for good behavior:
              </p>
              
              <Card className="border-0 shadow-clause my-8 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Slashing Conditions</h4>
                      <ul className="space-y-1 text-amber-700 dark:text-amber-400 text-sm">
                        <li>• Data falsification or fabrication</li>
                        <li>• Protocol deviation without approval</li>
                        <li>• Sample tampering or chain-of-custody violations</li>
                        <li>• Repeated missed deadlines without communication</li>
                        <li>• Abandonment of research project</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <p>
                Staking requirements vary by verification tier: Basic (10%), Verified (7%), 
                Trusted (5%), Institutional (3%).
              </p>
            </div>
          </section>

          {/* Continue reading notice */}
          <Card className="border-0 shadow-clause-md bg-gradient-to-r from-navy-800 to-navy-900 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-4">Full Whitepaper</h3>
              <p className="text-navy-200 mb-6">
                The complete whitepaper includes detailed sections on Dispute Resolution, 
                Economic Model, Technical Implementation, and Governance Roadmap.
              </p>
              <Button className="bg-amber-500 hover:bg-amber-400 text-navy-900">
                <Download className="w-4 h-4 mr-2" />
                Download Full PDF (2.4 MB)
              </Button>
            </CardContent>
          </Card>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-navy-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-bold text-navy-800 dark:text-white">SciFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SciFlow Protocol. Licensed under MIT.
          </p>
        </div>
      </footer>
    </div>
  )
}
