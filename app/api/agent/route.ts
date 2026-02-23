import { createOpenAI } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { PrivyClient } from '@privy-io/server-auth'
import { getAgentTools, getAgentWalletAddress } from '@/lib/agent/agentkit'
import { createAdminClient } from '@/lib/supabase/admin'
import { runOpenClawReview } from '@/lib/agents/openclaw-orchestrator'

export const runtime = 'nodejs'
export const maxDuration = 60

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

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

async function getDbUserAndContext(privyUserId: string | null, supabase: ReturnType<typeof createAdminClient>) {
  if (!privyUserId) return null
  const { data: dbUser } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('privy_user_id', privyUserId)
    .single()
  if (!dbUser) return null

  // Fetch recent bounties for funders
  let myBounties: unknown[] = []
  if (dbUser.role === 'funder') {
    const { data } = await supabase
      .from('bounties')
      .select('id, title, state, total_budget, currency')
      .eq('funder_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5)
    myBounties = data ?? []
  }

  // Fetch proposals for labs
  let myProposals: unknown[] = []
  if (dbUser.role === 'lab') {
    const { data: lab } = await supabase.from('labs').select('id').eq('user_id', dbUser.id).single()
    if (lab) {
      const { data } = await supabase
        .from('proposals')
        .select('id, bounty_id, status, bid_amount, methodology')
        .eq('lab_id', lab.id)
        .order('created_at', { ascending: false })
        .limit(5)
      myProposals = data ?? []
    }
  }

  return {
    id: dbUser.id,
    role: dbUser.role,
    fullName: dbUser.full_name,
    myBounties,
    myProposals,
  }
}

const SYSTEM_BASE = `You are the SciFlow Research Agent — an AI assistant with its own Base wallet, powered by Coinbase AgentKit.

### What you do
- **Draft research bounties** — structure a clear research question, success criteria, milestones, and budget
- **Review lab proposals** — assess methodology, timeline, scientific rigor (score 1–10 per dimension)
- **Suggest evidence criteria** — what proof should labs submit for each milestone?
- **On-chain actions** — check USDC balance, send USDC to labs, fund escrow
- **Fetch context** — get bounty details, proposals, labs when the user asks about specific items

Your wallet is on Base mainnet. You can perform real blockchain actions when asked.

### Platform rules
- Payments: USDC (Base) or USD (Stripe)
- Labs must be verified (Basic/Verified/Trusted/Institutional) before receiving funds
- Fund releases require milestone evidence (IPFS-hashed)
- Disputes go to neutral arbitrators

### Communication
- Be concise and scientific. Optimize for clarity and skimmability.
- Use **bold** for key terms, bullet points for lists, \`backticks\` for code/IDs.
- Never mention tool names to the user; describe actions naturally.
- When giving structured advice, use ### headings and bullet points. Avoid walls of text.
- If a tool fails, explain what went wrong in plain language and suggest what the user can do next.
- **Always include direct links** when referencing bounties, proposals, or milestones. Format: [Bounty Title](BASE_URL/dashboard/bounties/ID)

### Output format
- For bounty drafts: use structured sections (### Research question, ### Milestones, ### Budget) with bullet points.
- For proposal reviews: give scores per dimension, then a brief summary and recommendation.
- For errors: state the problem, then one concrete next step.
- When you create or fetch items, include the link so the user can click through.`

export async function POST(req: Request) {
  const privyUserId = await getAuthenticatedUser(req)
  const { messages } = await req.json()

  const agentTools = await getAgentTools()
  const agentAddress = getAgentWalletAddress()
  const supabase = createAdminClient()

  const userContext = await getDbUserAndContext(privyUserId, supabase)

  let systemPrompt = SYSTEM_BASE.replace(/BASE_URL/g, BASE_URL)
  if (agentAddress) {
    systemPrompt += `\n\nYour wallet address: ${agentAddress}`
  } else {
    systemPrompt += '\n\n(Wallet not configured — contact admin to enable on-chain actions)'
  }
  if (userContext) {
    const bountyList = (userContext.myBounties as { id: string; title: string; state: string }[])?.map(b => `[${b.title}](${BASE_URL}/dashboard/bounties/${b.id}) (${b.state})`)?.join(', ') || 'None'
    const proposalList = (userContext.myProposals as { id: string; bounty_id: string }[])?.map(p => `proposal ${p.id} for bounty ${p.bounty_id}`)?.join(', ') || 'None'
    systemPrompt += `\n\n### Current user context
- Role: ${userContext.role}
- Name: ${userContext.fullName || '—'}
${userContext.myBounties.length > 0 ? `- Their recent bounties: ${bountyList}` : ''}
${userContext.myProposals.length > 0 ? `- Their recent proposals: ${proposalList}` : ''}
When the user asks about "my bounty" or "my project", fetch details using these IDs. Always include clickable links when referring to bounties or proposals.`
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
    tools: {
      ...agentTools,

      getBounty: tool({
        description: 'Fetch full details of a bounty by ID. Use when user asks about a specific bounty.',
        parameters: z.object({
          bountyId: z.string().describe('UUID of the bounty'),
        }),
        execute: async ({ bountyId }) => {
          const { data: bounty, error } = await supabase
            .from('bounties')
            .select('*, milestones(*), proposals(id, lab_id, methodology, bid_amount, status)')
            .eq('id', bountyId)
            .single()
          if (error || !bounty) return { error: 'Bounty not found' }
          return {
            ...bounty,
            link: `${BASE_URL}/dashboard/bounties/${bountyId}`,
          }
        },
      }),

      getProposal: tool({
        description: 'Fetch full details of a proposal by ID.',
        parameters: z.object({
          proposalId: z.string().describe('UUID of the proposal'),
        }),
        execute: async ({ proposalId }) => {
          const { data: proposal, error } = await supabase
            .from('proposals')
            .select('*, lab:labs(id, name, verification_tier)')
            .eq('id', proposalId)
            .single()
          if (error || !proposal) return { error: 'Proposal not found' }
          const bountyId = (proposal as { bounty_id: string }).bounty_id
          return {
            ...proposal,
            link: `${BASE_URL}/dashboard/bounties/${bountyId}?proposal=${proposalId}`,
          }
        },
      }),

      listLabs: tool({
        description: 'List labs with filters. Use to find labs matching criteria or for a bounty.',
        parameters: z.object({
          search: z.string().optional(),
          tier: z.enum(['basic', 'verified', 'trusted', 'institutional']).optional(),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ search, tier, limit }) => {
          let query = supabase
            .from('labs')
            .select('id, name, verification_tier, reputation_score, institution_affiliation, specializations, staking_balance')
            .order('reputation_score', { ascending: false })
            .limit(limit)
          if (search) {
            query = query.or(`name.ilike.%${search}%,institution_affiliation.ilike.%${search}%,description.ilike.%${search}%`)
          }
          if (tier) query = query.eq('verification_tier', tier)
          const { data, error } = await query
          if (error) return { error: error.message }
          return (data ?? []).map((lab) => ({
            ...lab,
            link: `${BASE_URL}/labs/${lab.id}`,
          }))
        },
      }),

      listProposals: tool({
        description: 'List proposals for a bounty. Use when user asks about proposals on a bounty.',
        parameters: z.object({
          bountyId: z.string().describe('UUID of the bounty'),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ bountyId, limit }) => {
          const { data, error } = await supabase
            .from('proposals')
            .select('id, lab_id, methodology, bid_amount, timeline_days, status, labs(name, verification_tier)')
            .eq('bounty_id', bountyId)
            .order('created_at', { ascending: false })
            .limit(limit)
          if (error) return { error: error.message }
          return (data ?? []).map((p) => ({
            ...p,
            link: `${BASE_URL}/dashboard/bounties/${bountyId}?proposal=${p.id}`,
          }))
        },
      }),

      createBounty: tool({
        description: 'Create a new research bounty on SciFlow. Runs OpenClaw safety screening. Returns link on success.',
        parameters: z.object({
          title: z.string().describe('Bounty title'),
          description: z.string().describe('Research question and goals'),
          methodology: z.string(),
          totalBudget: z.number().describe('Budget in USD'),
          currency: z.enum(['USD', 'USDC']).default('USDC'),
          minTier: z.enum(['basic', 'verified', 'trusted', 'institutional']).default('verified'),
          tags: z.array(z.string()).default([]),
          dataRequirements: z.array(z.string()).optional().default([]),
          qualityStandards: z.array(z.string()).optional().default([]),
          milestones: z.array(z.object({
            title: z.string(),
            description: z.string(),
            deliverables: z.array(z.string()).optional().default([]),
            payoutPercent: z.number(),
          })),
        }),
        execute: async (draft) => {
          if (!privyUserId) return { error: 'Must be signed in to create bounties' }

          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('privy_user_id', privyUserId)
            .single()
          if (!user) return { error: 'User not found — please sign in first' }

          const totalPct = draft.milestones.reduce((s: number, m) => s + m.payoutPercent, 0)
          if (Math.abs(totalPct - 100) > 0.01) {
            return { error: 'Milestone percentages must sum to 100%' }
          }

          const openClawResult = runOpenClawReview({
            title: draft.title,
            description: draft.description,
            methodology: draft.methodology,
            dataRequirements: draft.dataRequirements ?? [],
            qualityStandards: draft.qualityStandards ?? [],
            totalBudget: draft.totalBudget,
            currency: draft.currency,
            milestones: draft.milestones.map((m) => ({
              title: m.title,
              description: m.description,
              deliverables: m.deliverables ?? [m.description].filter(Boolean),
              payoutPercentage: m.payoutPercent,
            })),
          })

          if (openClawResult.decision === 'reject') {
            const firstSignal = openClawResult.signals[0]?.message
            return { error: firstSignal ?? 'Bounty rejected by safety screening. Revise and resubmit.', review: openClawResult }
          }

          const { data: bounty, error } = await supabase
            .from('bounties')
            .insert({
              funder_id: user.id,
              title: draft.title,
              description: draft.description,
              methodology: draft.methodology,
              data_requirements: draft.dataRequirements ?? [],
              quality_standards: draft.qualityStandards ?? [],
              total_budget: draft.totalBudget,
              currency: draft.currency,
              state: openClawResult.decision === 'manual_review' ? 'admin_review' : 'ready_for_funding',
              visibility: 'public',
              min_lab_tier: draft.minTier,
              tags: draft.tags,
              state_history: [
                { state: 'drafting', timestamp: new Date().toISOString(), by: user.id },
                { state: openClawResult.decision === 'manual_review' ? 'admin_review' : 'ready_for_funding', timestamp: new Date().toISOString(), by: user.id, review: openClawResult },
              ],
            })
            .select()
            .single()

          if (error) return { error: error.message }

          for (let i = 0; i < draft.milestones.length; i++) {
            const m = draft.milestones[i]
            await supabase.from('milestones').insert({
              bounty_id: bounty.id,
              sequence: i + 1,
              title: m.title,
              description: m.description,
              deliverables: m.deliverables ?? [],
              payout_percentage: m.payoutPercent,
              status: 'pending',
            })
          }

          return {
            success: true,
            bountyId: bounty.id,
            url: `${BASE_URL}/dashboard/bounties/${bounty.id}`,
            message: `Bounty created. OpenClaw: ${openClawResult.decision}. View it here: ${BASE_URL}/dashboard/bounties/${bounty.id}`,
          }
        },
      }),

      listBounties: tool({
        description: 'List open research bounties on SciFlow. Use state=bidding for open bounties.',
        parameters: z.object({
          state: z.string().optional().default('bidding'),
          limit: z.number().optional().default(5),
        }),
        execute: async ({ state, limit }) => {
          const { data } = await supabase
            .from('bounties')
            .select('id, title, total_budget, currency, state, tags')
            .eq('state', state)
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .limit(limit)
          return (data ?? []).map((b) => ({ ...b, link: `${BASE_URL}/dashboard/bounties/${b.id}` }))
        },
      }),

      listMyBounties: tool({
        description: 'List the current user\'s bounties (requires sign-in as funder). Use when user asks "my bounties" or "my projects".',
        parameters: z.object({
          state: z.string().optional().describe('Filter by state: milestone_review, bidding, active_research, completed, etc. Omit for all.'),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ state, limit }) => {
          if (!privyUserId) return { error: 'Must be signed in' }
          const { data: user } = await supabase.from('users').select('id, role').eq('privy_user_id', privyUserId).single()
          if (!user) return { error: 'User not found' }
          if (user.role !== 'funder' && user.role !== 'admin') return { error: 'Only funders can list their bounties' }

          let query = supabase
            .from('bounties')
            .select('id, title, state, total_budget, currency, created_at')
            .eq('funder_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)
          if (state) query = query.eq('state', state)
          const { data, error } = await query
          if (error) return { error: error.message }
          return (data ?? []).map((b) => ({
            ...b,
            link: `${BASE_URL}/dashboard/bounties/${b.id}`,
            needsAttention: b.state === 'milestone_review',
          }))
        },
      }),

      bountyTransition: tool({
        description: 'Trigger a state transition on a bounty (e.g. APPROVE_MILESTONE, SELECT_LAB). User must have permission (funder for their bounty, admin for admin actions).',
        parameters: z.object({
          bountyId: z.string(),
          event: z.enum([
            'APPROVE_MILESTONE',
            'SELECT_LAB',
            'CANCEL_BOUNTY',
            'REQUEST_REVISION',
            'EXTEND_BIDDING',
          ]),
          data: z.record(z.unknown()).optional().describe('e.g. { milestoneId: "uuid" } for APPROVE_MILESTONE, { proposalId: "uuid" } for SELECT_LAB, { feedback: "string" } for REQUEST_REVISION, { days: 7 } for EXTEND_BIDDING'),
        }),
        execute: async ({ bountyId, event, data }) => {
          if (!privyUserId) return { error: 'Must be signed in' }
          const { data: user } = await supabase.from('users').select('id, role').eq('privy_user_id', privyUserId).single()
          if (!user) return { error: 'User not found' }

          const { data: bounty, error: fetchErr } = await supabase
            .from('bounties')
            .select('*, milestones(*), proposals(*), escrow:escrows(*)')
            .eq('id', bountyId)
            .single()
          if (fetchErr || !bounty) return { error: 'Bounty not found' }

          const isFunder = bounty.funder_id === user.id
          const isAdmin = user.role === 'admin'
          const escrow = Array.isArray((bounty as { escrow?: unknown }).escrow) ? (bounty as { escrow: unknown[] }).escrow[0] : (bounty as { escrow?: unknown }).escrow
          const selectedLab = (bounty as { selected_lab?: { user_id: string } | { user_id: string }[] }).selected_lab
          const labUserId = Array.isArray(selectedLab) ? selectedLab[0]?.user_id : (selectedLab as { user_id?: string })?.user_id
          const isAssignedLab = labUserId === user.id

          const validEvents: Record<string, string[]> = {
            bidding: ['SELECT_LAB', 'CANCEL_BOUNTY', 'EXTEND_BIDDING'],
            milestone_review: ['APPROVE_MILESTONE', 'REQUEST_REVISION'],
          }
          const allowed = validEvents[bounty.state]
          if (!allowed?.includes(event)) {
            return { error: `Event ${event} not valid for state ${bounty.state}. Allowed: ${allowed?.join(', ') ?? 'none'}` }
          }

          if (event === 'APPROVE_MILESTONE') {
            if (!isFunder && !isAdmin) return { error: 'Only the funder or admin can approve milestones' }
            const milestoneId = data?.milestoneId as string | undefined
            if (!milestoneId) return { error: 'milestoneId required in data' }
            const milestone = (bounty as { milestones?: { id: string; status: string }[] }).milestones?.find((m) => m.id === milestoneId)
            if (!milestone) return { error: 'Milestone not found' }
            if (milestone.status !== 'submitted') return { error: 'Milestone must be submitted to approve' }

            await supabase.from('milestones').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', milestoneId)
            const verifiedCount = (bounty as { milestones?: { status: string }[] }).milestones?.filter((m) => m.status === 'verified').length ?? 0
            const newState = verifiedCount + 1 >= ((bounty as { milestones?: unknown[] }).milestones?.length ?? 0) ? 'completed_payout' : 'active_research'
            await supabase.from('bounties').update({ state: newState, updated_at: new Date().toISOString() }).eq('id', bountyId)
            return { success: true, newState, message: `Milestone approved. View bounty: ${BASE_URL}/dashboard/bounties/${bountyId}` }
          }

          if (event === 'SELECT_LAB') {
            if (!isFunder) return { error: 'Only the funder can select a lab' }
            const proposalId = data?.proposalId as string | undefined
            if (!proposalId) return { error: 'proposalId required in data' }
            const proposal = (bounty as { proposals?: { id: string }[] }).proposals?.find((p) => p.id === proposalId)
            if (!proposal) return { error: 'Proposal not found' }

            await supabase.from('proposals').update({ status: 'accepted' }).eq('id', proposalId)
            await supabase.from('proposals').update({ status: 'rejected', rejection_reason: 'Another proposal was selected' }).eq('bounty_id', bountyId).neq('id', proposalId)
            await supabase.from('bounties').update({ state: 'active_research', started_at: new Date().toISOString(), selected_lab_id: (proposal as { lab_id?: string }).lab_id, updated_at: new Date().toISOString() }).eq('id', bountyId)
            const firstMilestone = (bounty as { milestones?: { id: string; sequence: number }[] }).milestones?.find((m) => m.sequence === 1)
            if (firstMilestone) {
              await supabase.from('milestones').update({ status: 'in_progress' }).eq('id', firstMilestone.id)
            }
            return { success: true, newState: 'active_research', message: `Lab selected. View bounty: ${BASE_URL}/dashboard/bounties/${bountyId}` }
          }

          if (event === 'CANCEL_BOUNTY') {
            if (!isFunder && !isAdmin) return { error: 'Only funder or admin can cancel' }
            const newState = bounty.state === 'bidding' ? 'refunding' : 'cancelled'
            await supabase.from('bounties').update({ state: newState, updated_at: new Date().toISOString() }).eq('id', bountyId)
            return { success: true, newState, message: newState === 'refunding' ? 'Bounty cancelled — refund in progress.' : 'Bounty cancelled.' }
          }

          if (event === 'REQUEST_REVISION') {
            if (!isFunder) return { error: 'Only funder can request revision' }
            const milestoneId = data?.milestoneId as string | undefined
            if (!milestoneId) return { error: 'milestoneId required' }
            const feedback = (data?.feedback as string) || 'Revision requested'
            await supabase.from('milestones').update({ status: 'in_progress', review_feedback: feedback }).eq('id', milestoneId)
            await supabase.from('bounties').update({ state: 'active_research', updated_at: new Date().toISOString() }).eq('id', bountyId)
            return { success: true, newState: 'active_research', message: `Revision requested. Lab will resubmit. View: ${BASE_URL}/dashboard/bounties/${bountyId}` }
          }

          if (event === 'EXTEND_BIDDING') {
            if (!isFunder) return { error: 'Only funder can extend bidding' }
            const extendDays = (data?.days as number) || 7
            const now = new Date()
            const newDeadline = new Date(now.getTime() + extendDays * 24 * 60 * 60 * 1000).toISOString()
            await supabase.from('bounties').update({ proposal_deadline: newDeadline, updated_at: now.toISOString() }).eq('id', bountyId)
            return { success: true, message: `Bidding extended by ${extendDays} days. View: ${BASE_URL}/dashboard/bounties/${bountyId}` }
          }

          return { error: 'Unsupported event' }
        },
      }),

      reviewProposal: tool({
        description: 'Generate advisory scores and recommendation for a lab proposal. Does not persist — provides structured advice for the user to act on.',
        parameters: z.object({
          methodology: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          timeline: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          team: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          budget: z.object({ score: z.number().min(1).max(10), notes: z.string() }),
          overall: z.number().min(1).max(10),
          recommendation: z.enum(['accept', 'request_revision', 'decline']),
          summary: z.string(),
        }),
        execute: async (score) => ({
          ...score,
          note: 'This is advisory. To submit an official review, the user must have role=reviewer and use the review page. Include the link to the proposal when sharing this advice.',
        }),
      }),
    },
    maxSteps: 8,
  })

  return result.toDataStreamResponse()
}
