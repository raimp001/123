import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Wallet, Shield, Clock, Scale, Globe } from "lucide-react"

const sections = [
  {
    id: "how-it-works",
    title: "How It Works",
    icon: BookOpen,
    content: [
      {
        q: "What is SciFlow?",
        a: "SciFlow is a marketplace connecting research funders with verified labs. Every bounty goes through admin safety/ethics review before funding, then labs can submit proposals and milestone-based escrow releases are unlocked only after verification."
      },
      {
        q: "Who can use SciFlow?",
        a: "Anyone can browse. Funders create bounties and fund escrow. Labs apply for verification, submit proposals, and complete research. Both need to sign in to participate."
      },
      {
        q: "What makes a good bounty?",
        a: "Clear deliverables, specific success criteria, reasonable timelines, and well-defined milestones. See example bounties on the Open Bounties page for guidance."
      }
    ]
  },
  {
    id: "fees",
    title: "Fees",
    icon: Wallet,
    content: [
      {
        q: "What are the platform fees?",
        a: "5% of successfully completed bounties. No fees on cancelled or refunded bounties. Founding cohort members get 0% on their first 3 bounties."
      },
      {
        q: "Are there payment processing fees?",
        a: "Stripe: ~2.9% + $0.30 per transaction. Crypto (USDC): network gas fees only (~$0.01-0.50 depending on congestion)."
      },
      {
        q: "When are fees charged?",
        a: "Fees are deducted from milestone payments as they're released, not upfront."
      }
    ]
  },
  {
    id: "security",
    title: "Security & Escrow",
    icon: Shield,
    content: [
      {
        q: "How is my money protected?",
        a: "Funds are held in escrow (Stripe for fiat, smart contracts on Solana/Base for crypto) and only released when milestones are verified or after dispute resolution."
      },
      {
        q: "What blockchains do you support?",
        a: "USDC on Solana (fast, low fees) and Base (Ethereum L2, EVM-compatible). Fiat via Stripe Connect."
      },
      {
        q: "Can I get a refund?",
        a: "Yes, if a lab fails to deliver and loses a dispute, funds are returned. Partial refunds are possible for partially completed work."
      }
    ]
  },
  {
    id: "disputes",
    title: "Disputes",
    icon: Scale,
    content: [
      {
        q: "What if there's a disagreement?",
        a: "Either party can initiate a dispute. Cases are reviewed by a 3-person arbitration panel who examine all evidence within 72 hours."
      },
      {
        q: "Is there a filing fee?",
        a: "$500 filing fee, refunded if you win the dispute. This prevents frivolous claims."
      },
      {
        q: "What evidence is considered?",
        a: "Milestone evidence (IPFS-hashed), communication history, original bounty terms, and any additional documentation submitted by either party."
      }
    ]
  },
  {
    id: "verification",
    title: "Lab Verification",
    icon: Clock,
    content: [
      {
        q: "How do labs get verified?",
        a: "Labs submit institutional affiliation, publications, equipment access, and optionally stake tokens. Verification levels: Basic → Verified → Trusted → Institutional."
      },
      {
        q: "What does reputation score mean?",
        a: "Calculated from successful milestone completions, on-time delivery, and dispute history. Higher scores unlock priority access to bounties."
      },
      {
        q: "Can funders verify labs independently?",
        a: "Yes. Lab profiles show verification documents, past bounty history, and reputation scores. You can also request additional credentials directly."
      }
    ]
  },
  {
    id: "supported",
    title: "Supported Currencies & Regions",
    icon: Globe,
    content: [
      {
        q: "What currencies can I use?",
        a: "Fiat: USD via Stripe. Crypto: USDC on Solana and Base."
      },
      {
        q: "Are there geographic restrictions?",
        a: "Stripe availability depends on your country. Crypto is available globally. Check Stripe's supported countries list for fiat payments."
      },
      {
        q: "What about KYC/AML?",
        a: "Fiat payments require Stripe's standard KYC. Crypto payments above $10K may require additional verification per regulatory requirements."
      }
    ]
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-serif text-foreground mb-2">Documentation</h1>
          <p className="text-muted-foreground">
            Everything you need to know about using SciFlow.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="p-3 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors text-center"
            >
              <section.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{section.title}</span>
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-medium text-foreground">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.content.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-5 bg-card border border-border rounded-xl"
                  >
                    <h3 className="font-medium text-foreground mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 p-8 rounded-xl bg-card border border-border text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Check our FAQ or reach out to the team.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/faq">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary rounded-full">
                View FAQ
              </Button>
            </Link>
            <Link href="/help">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
