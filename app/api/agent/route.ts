import { createOpenAI } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { PrivyClient } from '@privy-io/server-auth'
import { getAgentTools, getAgentWalletAddress } from '@/lib/agent/agentkit'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function getAuthenticatedUser(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const claims = await privy.verifyAuthToken(token)
    return claims.userId
  } catch {
    return null
  }
}

const SYSTEM = `You are the SciFlow Research Agent — an AI assistant with its own Base wallet, powered by Coinbase AgentKit.

You help with:
1. **Draft research bounties** — structure a clear research question, success criteria, milestones, and budget
2. **Review lab proposals** — assess methodology, timeline, scientific rigor. Give a score (1-10) per dimension
3. **Suggest evidence criteria** — what proof should labs submit for each milestone?
4. **On-chain actions** — check your USDC balance, send USDC to labs, fund escrow

Your wallet is on Base mainnet. You can perform real blockchain actions when asked.

Platform rules:
- Payments in USDC (Base) or USD (Stripe)
- Labs must be verified (Basic/Verified/Trusted/Institutional) before receiving funds
- All fund releases require milestone evidence (IPFS-hashed)
- Disputes go to neutral arbitrators

Be concise and scientific. When drafting bounties, output structured JSON.`

export async function POST(req: Request) {
  // Optional auth — agent works for authenticated users
  const privyUserId = await getAuthenticatedUser(req)

  const { messages } = await req.json()

  // Get AgentKit on-chain tools (CDP wallet actions)
  const agentTools = await getAgentTools()
  const agentAddress = getAgentWalletAddress()

  const supabase = createAdminClient()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM + (agentAddress ? `\n\nYour wallet address: ${agentAddress}` : '\n\n(Wallet not configured — contact admin to enable on-chain actions)'),
    messages,
    tools: {
      // ── AgentKit on-chain tools (balance, send USDC, etc.) ──
      ...agentTools,

      // ── Platform-specific tools ──
      createBounty: tool({
        description: 'Create a new research bounty on SciFlow',
        parameters: z.object({
          title: z.string().describe('Bounty title'),
          description: z.string().describe('Research question and goals'),
          methodology: z.string(),
          totalBudget: z.number().describe('Budget in USD'),
          currency: z.enum(['USD', 'USDC']).default('USDC'),
          minTier: z.enum(['basic', 'verified', 'trusted', 'institutional']).default('verified'),
          tags: z.array(z.string()),
          milestones: z.array(z.object({
            title: z.string(),
            description: z.string(),
            payoutPercent: z.number(),
          })),
        }),
        execute: async (draft) => {
          if (!privyUserId) return { error: 'Must be signed in to create bounties' }

          // Get DB user
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('privy_user_id', privyUserId)
            .single()

          if (!user) return { error: 'User not found — please sign in first' }

          const { data: bounty, error } = await supabase.from('bounties').insert({
            funder_id: user.id,
            title: draft.title,
            description: draft.description,
            methodology: draft.methodology,
            total_budget: draft.totalBudget,
            currency: draft.currency,
            state: 'drafting',
            visibility: 'public',
            min_lab_tier: draft.minTier,
            tags: draft.tags,
          }).select().single()

          if (error) return { error: error.message }

          // Create milestones
          for (let i = 0; i < draft.milestones.length; i++) {
            const m = draft.milestones[i]
            await supabase.from('milestones').insert({
              bounty_id: bounty.id,
              sequence: i + 1,
              title: m.title,
              description: m.description,
              payout_percentage: m.payoutPercent,
              deliverables: [],
              status: 'pending',
            })
          }

          return { success: true, bountyId: bounty.id, url: `/dashboard/bounties/${bounty.id}` }
        },
      }),

      listBounties: tool({
        description: 'List current open research bounties on SciFlow',
        parameters: z.object({
          state: z.string().optional().default('bidding'),
          limit: z.number().optional().default(5),
        }),
        execute: async ({ state, limit }) => {
          const { data } = await supabase
            .from('bounties')
            .select('id, title, total_budget, currency, state, tags')
            .eq('state', state)
            .order('created_at', { ascending: false })
            .limit(limit)

          return data ?? []
        },
      }),

      reviewProposal: tool({
        description: 'Score a research lab proposal',
        parameters: z.object({
          methodology: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          timeline: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          team: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          budget: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          overall: z.number().min(1).max(10),
          recommendation: z.enum(['accept', 'request_revision', 'decline']),
          summary: z.string(),
        }),
        execute: async (score) => score,
      }),
    },
    maxSteps: 5,
  })

  return result.toDataStreamResponse()
}
