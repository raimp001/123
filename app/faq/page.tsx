"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "Do I need to sign up to browse?",
        a: "No. You can browse open bounties, labs, and the whitepaper without an account. Sign-in is only required to post bounties, submit proposals, or manage escrow."
      },
      {
        q: "How do I get started as a funder?",
        a: "Click 'Post a Research Bounty' on the homepage, define your research question, set milestones and budget, fund the escrow, and wait for lab proposals."
      },
      {
        q: "How do I get started as a lab?",
        a: "Apply for lab verification by submitting your credentials (institution, publications, equipment). Once verified, you can browse open bounties and submit proposals."
      }
    ]
  },
  {
    category: "Payments & Fees",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "Fiat via Stripe (credit cards, bank transfers) and crypto (USDC on Solana and Base networks)."
      },
      {
        q: "What are the fees?",
        a: "5% platform fee on completed bounties. Stripe charges ~2.9% + $0.30 per transaction. Crypto has minimal gas fees (~$0.01-0.50)."
      },
      {
        q: "When do I get paid as a lab?",
        a: "Milestone payments are released within 24 hours of funder approval. If no action is taken, auto-release triggers after 7 days."
      },
      {
        q: "Can I get a refund?",
        a: "Yes. If a lab fails to deliver and loses the dispute, funds are returned. Partial refunds are possible for partially completed work."
      }
    ]
  },
  {
    category: "Security & Trust",
    questions: [
      {
        q: "How are funds protected?",
        a: "All funds are held in escrow (Stripe for fiat, audited smart contracts on Solana/Base for crypto). Funds only release upon verified milestone completion or dispute resolution."
      },
      {
        q: "How do I know a lab is legitimate?",
        a: "Labs are verified through institutional affiliation, publication history, and optional staking. Reputation scores reflect successful past completions."
      },
      {
        q: "What if there's a disagreement?",
        a: "Either party can initiate a dispute. A 3-person arbitration panel reviews evidence and issues a binding decision within 72 hours."
      },
      {
        q: "Is there a risk of fraud?",
        a: "Milestone-based payments limit exposure. Staking requirements for high-value bounties create skin in the game. Dispute resolution and reputation scores further deter bad actors."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What blockchains do you support?",
        a: "Solana (fast, low fees) and Base (Ethereum L2, EVM-compatible) for USDC payments. We use audited smart contracts for escrow."
      },
      {
        q: "What is the state machine?",
        a: "All bounty transitions (Draft → Funded → Active → Complete) are enforced by an XState machine, making the workflow auditable and deterministic."
      },
      {
        q: "How is research evidence stored?",
        a: "Evidence files are hashed and stored on IPFS for immutability. Only the hash is stored on-chain, keeping costs low while ensuring tamper-proof records."
      },
      {
        q: "Is SciFlow open source?",
        a: "Core smart contracts will be open source and auditable once launched. The frontend and backend are source-available."
      }
    ]
  },
  {
    category: "Founding Cohort",
    questions: [
      {
        q: "What is the Founding Cohort?",
        a: "Our first 50 funders and 100 labs get exclusive benefits: 0% fees on first 3 bounties, governance tokens, priority access, and direct team support."
      },
      {
        q: "How do I join?",
        a: "Click 'Apply Now' in the Founding Cohort section on the homepage and complete the application. Spots are limited and allocated on a first-come, first-served basis."
      },
      {
        q: "When does the Founding Cohort end?",
        a: "Once we reach 50 funders and 100 labs, or by Q2 2026, whichever comes first."
      }
    ]
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-start justify-between text-left hover:bg-secondary/50 transition-colors -mx-5 px-5 rounded-lg"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-serif text-foreground">FAQ</h1>
          </div>
          <p className="text-muted-foreground">
            Frequently asked questions about SciFlow.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-lg font-medium text-foreground mb-4">
                {section.category}
              </h2>
              <div className="bg-card border border-border rounded-xl divide-y divide-border px-5">
                {section.questions.map((item, i) => (
                  <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 p-8 rounded-xl bg-card border border-border text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Can&apos;t find your answer?</h2>
          <p className="text-muted-foreground mb-4">
            Check our documentation or reach out directly.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary rounded-full">
              <Link href="/docs">Read Docs</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
              <Link href="/help">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
