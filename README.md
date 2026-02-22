# SciFlowLabs — DeSci Research Bounty Platform

> Bridging the gap between research labs and institutional funding via bounties, milestones, peer review, and crypto-enabled payments.

[![Deployments](https://img.shields.io/github/deployments/raimp001/sciflowlabs/production?label=Vercel)](https://sciflowlabs.vercel.app)

---

## What It Does

SciFlowLabs connects **institutional funders** (universities, pharma, government agencies) with **verified research labs** through a trustless bounty system:

1. Funders post bounties with milestones, budget, and ethics requirements
2. Labs stake USDC to submit proposals (stake slashable on disputes)
3. Admin + peer reviewers evaluate proposals (double-blind scorecard)
4. Milestones are tracked with IPFS-pinned evidence
5. Payments release automatically on milestone approval

---

## Features

| Feature | Status |
|---------|--------|
| Research Bounty marketplace (`/bounties`) | ✓ Live |
| Lab profiles with reputation + staking | ✓ Live |
| Funder institution pages | ✓ Live |
| Lab tiered verification (Basic → Institutional) | ✓ Live |
| Proposal submission with lab staking | ✓ Live |
| XState bounty lifecycle (state machine) | ✓ Live |
| OpenClaw ethics pre-screening | ✓ Live |
| Multi-currency payments (USD/USDC/Solana/Base) | ✓ Live |
| Escrow system (Solana PDA + Base contract) | ✓ Live |
| Dispute resolution + arbitration | ✓ Live |
| **Scientific peer review (double-blind scorecard)** | ✓ PR#3 |
| **IRB / ethics document upload flow** | ✓ PR#3 |
| **IPFS milestone evidence pinning (Pinata)** | ✓ PR#3 |
| **Reviewer role + ProposalReview type** | ✓ PR#3 |
| IP rate limiting (Vercel KV / Upstash) | ✓ PR#1 |
| Lab field normalization layer | ✓ PR#1 |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| Database | **Supabase** (PostgreSQL + RLS + Storage) |
| Auth | Supabase Auth (email + wallet) |
| Styling | Tailwind CSS + shadcn/ui |
| Payments | Stripe, Solana USDC, Base USDC (Coinbase CDP SDK) |
| State machine | XState (bounty lifecycle) |
| IPFS | Pinata (milestone evidence + IRB docs) |
| Rate limiting | Upstash Ratelimit + Vercel KV |
| Deployment | Vercel |

---

## Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
Copy `.env.local.example` (or `.env.local`) and fill in:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Payments
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# IPFS (Pinata) — PR#3
PINATA_JWT=...           # preferred (v2 JWT)
# or legacy:
# PINATA_API_KEY=...
# PINATA_API_SECRET=...

# Rate limiting (Vercel KV) — PR#1
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### 3. Run locally
```bash
pnpm dev
```

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/bounties` | Public bounty marketplace (no login required) |
| `/labs/[id]` | Public lab profile |
| `/funders/[id]` | Funder institution page |
| `/dashboard` | Authenticated user dashboard |
| `/dashboard/proposals/[id]/review` | Peer review scorecard (reviewer role) |
| `/api/proposals/[id]/review` | GET/POST scientific peer review |
| `/api/milestones/[id]/evidence` | POST IPFS evidence upload |
| `/api/bounties/[id]/irb` | GET/POST IRB document flow |

---

## Architecture Decisions

- **Lab field normalization**: `lab.institution_affiliation` is canonical; `normalizeLab()` in `lib/normalize.ts` resolves legacy aliases without a DB migration.
- **Double-blind peer review**: Reviewers score on 5 dimensions (merit 30%, feasibility 20%, innovation 20%, qualifications 15%, ethics 15%). Labs see only aggregate until 2-of-3 reviewers approve.
- **IPFS evidence**: Milestone submissions must include a file pinned to IPFS via Pinata. The resulting CIDv1 is stored as `evidence_hash` — making deliverables immutable and publicly auditable.
- **IRB document flow**: Funders upload PDFs to Supabase Storage; docs are also pinned to IPFS for permanence. Admins verify and set `irb_status='verified'` before escrow unlocks.
- **Rate limiting**: Edge Middleware applies a sliding-window limiter (20 req/10s general, 10 req/10s for auth/payments). Stripe webhooks are excluded. Fails open if KV is unconfigured.

---

## Contributing

PRs welcome. Please follow the existing commit convention:
- `feat(scope/PR#N): description` for new features
- `fix(scope): description` for bug fixes
- `refactor(scope): description` for refactors

---

## License

MIT
