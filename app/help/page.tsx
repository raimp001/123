import Link from "next/link"

const TERMS = [
  {
    term: "Bounty",
    definition: "A funded research project posted by a funder. Labs can submit proposals to win the work. Funds are released milestone by milestone upon verified deliverables.",
  },
  {
    term: "Escrow",
    definition: "Funds locked in a secure contract or wallet until milestone conditions are met. Protects both funders and labs.",
  },
  {
    term: "Staking",
    definition: "USDC that labs lock when submitting proposals. Stake is slashable if the lab breaches the bounty agreement. Signals commitment and quality.",
  },
  {
    term: "Verification tier",
    definition: "Lab trust level: Basic (email verified), Verified (full KYC), Trusted (successful track record), Institutional (university/company verified). Higher tiers unlock more bounties.",
  },
  {
    term: "Milestone",
    definition: "A checkpoint in the research project. Labs submit evidence (e.g., IPFS-pinned deliverables) for funder review. Payment releases on approval.",
  },
  {
    term: "OpenClaw",
    definition: "Automated pre-screening that flags bounties for ethics, safety, or quality concerns. High-risk submissions require admin review before going live.",
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground mb-6 block">
          ← Back
        </Link>
        <h1 className="text-2xl font-serif font-bold mb-2">Help & Glossary</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Key terms and concepts on SciFlowLabs.
        </p>

        <dl className="space-y-6">
          {TERMS.map(({ term, definition }) => (
            <div key={term} className="border-b border-border/40 pb-6 last:border-0">
              <dt className="font-semibold text-foreground mb-1">{term}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{definition}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 p-4 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-sm text-muted-foreground">
            Need more help?{" "}
            <a href="mailto:support@sciflowlabs.com" className="text-accent hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
