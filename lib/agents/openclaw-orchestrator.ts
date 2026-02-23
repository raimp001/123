/**
 * OpenClaw v2 — Automated bounty risk & quality assessment
 * Runs on every new bounty submission. No external dependencies.
 */

export type OpenClawDecision = 'allow' | 'manual_review' | 'reject'

export interface OpenClawInput {
  title: string
  description: string
  methodology: string
  dataRequirements: string[]
  qualityStandards: string[]
  totalBudget: number
  currency: 'USD' | 'USDC'
  milestones: Array<{
    title: string
    description: string
    deliverables: string[]
    payoutPercentage: number
  }>
}

export interface OpenClawSignal {
  type: 'harm' | 'ethics' | 'quality' | 'fraud' | 'compliance' | 'dual_use'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  rule?: string
}

export interface OpenClawResult {
  traceId: string
  decision: OpenClawDecision
  score: number
  signals: OpenClawSignal[]
  summary: string
  requiresEthicsReview: boolean
  requiresIRB: boolean
}

const REJECT_TERMS = [
  'bioweapon', 'biological weapon', 'pathogen release', 'weaponize',
  'nerve agent', 'chemical weapon', 'human cloning', 'reproductive cloning',
  'self-harm', 'suicide', 'harm to children', 'nuclear weapon',
]

const ETHICS_TERMS = [
  'human subjects', 'human participants', 'patient data', 'patient samples',
  'clinical trial', 'clinical study', 'phase i', 'phase ii', 'phase iii',
  'informed consent', 'irb', 'institutional review',
  'animal study', 'animal model', 'in vivo', 'murine model',
  'genome editing', 'crispr', 'gene therapy', 'germline',
  'personally identifiable', 'pii', 'phi', 'protected health',
  'minors', 'children under', 'pediatric', 'stem cell', 'embryo',
]

const DUAL_USE_TERMS = [
  'gain of function', 'enhanced pathogen', 'transmissibility',
  'antibiotic resistance', 'drug resistance mechanism',
  'surveillance', 'tracking individuals', 'autonomous weapon',
]

const VAGUE_TERMS = [
  'figure it out', 'we will decide later', 'tbd', 'to be determined',
  'as needed', 'whatever works',
]

function contains(text: string, terms: string[]): string | null {
  const norm = text.toLowerCase()
  return terms.find(t => norm.includes(t)) ?? null
}

function buildFullText(input: OpenClawInput): string {
  return [
    input.title, input.description, input.methodology,
    input.dataRequirements.join(' '), input.qualityStandards.join(' '),
    input.milestones.flatMap(m => [m.title, m.description, ...m.deliverables]).join(' '),
  ].join('\n').toLowerCase()
}

export function runOpenClawReview(input: OpenClawInput): OpenClawResult {
  const text = buildFullText(input)
  const signals: OpenClawSignal[] = []
  let score = 100
  let requiresEthicsReview = false
  let requiresIRB = false

  const rejectMatch = contains(text, REJECT_TERMS)
  if (rejectMatch) {
    signals.push({ type: 'harm', severity: 'critical', message: `Prohibited content: "${rejectMatch}". Cannot be posted.`, rule: 'HARD_BLOCK' })
    score = 0
  }

  const dualUseMatch = contains(text, DUAL_USE_TERMS)
  if (dualUseMatch) {
    signals.push({ type: 'dual_use', severity: 'high', message: `Dual-use concern: "${dualUseMatch}". Requires enhanced admin review.`, rule: 'DUAL_USE' })
    score -= 40; requiresEthicsReview = true
  }

  const ethicsMatch = contains(text, ETHICS_TERMS)
  if (ethicsMatch) {
    requiresEthicsReview = true
    const needsIRB = ['human subjects', 'human participants', 'patient', 'clinical trial', 'irb', 'minors', 'pediatric'].some(t => text.includes(t))
    if (needsIRB) {
      requiresIRB = true
      signals.push({ type: 'ethics', severity: 'high', message: `IRB approval required. Triggered by: "${ethicsMatch}".`, rule: 'IRB_REQUIRED' })
      score -= 25
    } else {
      signals.push({ type: 'ethics', severity: 'medium', message: `Sensitive domain ("${ethicsMatch}"). Ethics documentation required as milestone deliverable.`, rule: 'ETHICS_REVIEW' })
      score -= 15
    }
  }

  if (input.milestones.length < 2) {
    signals.push({ type: 'quality', severity: 'medium', message: 'Single-milestone bounties reduce accountability. Recommend at least 2 checkpoints.', rule: 'MIN_MILESTONES' })
    score -= 15
  }

  const unbalanced = input.milestones.filter(m => m.payoutPercentage > 60)
  if (unbalanced.length > 0) {
    signals.push({ type: 'quality', severity: 'low', message: `One milestone holds >${unbalanced[0].payoutPercentage}% of budget. Spread payouts for better lab alignment.`, rule: 'PAYOUT_BALANCE' })
    score -= 8
  }

  const vagueCount = [input.description, input.methodology].filter(f => f.trim().length < 80).length
  if (vagueCount > 0) {
    signals.push({ type: 'quality', severity: 'low', message: 'Description or methodology too brief. Labs need detail to bid accurately.', rule: 'VAGUE_SCOPE' })
    score -= 10
  }

  const vagueMatch = contains(text, VAGUE_TERMS)
  if (vagueMatch) {
    signals.push({ type: 'quality', severity: 'low', message: `Vague language ("${vagueMatch}"). Replace with specific, measurable criteria.`, rule: 'VAGUE_LANGUAGE' })
    score -= 8
  }

  if (input.totalBudget > 0 && input.totalBudget < 500) {
    signals.push({ type: 'fraud', severity: 'low', message: 'Budget under $500 is below typical lab costs.', rule: 'LOW_BUDGET' })
    score -= 8
  }

  if (input.totalBudget > 1_000_000) {
    signals.push({ type: 'compliance', severity: 'medium', message: 'Bounties over $1M require enhanced funder verification before publishing.', rule: 'HIGH_VALUE_REVIEW' })
    score -= 10; requiresEthicsReview = true
  }

  const emptyDeliverables = input.milestones.filter(m => m.deliverables.length === 0)
  if (emptyDeliverables.length > 0) {
    signals.push({ type: 'quality', severity: 'medium', message: `${emptyDeliverables.length} milestone(s) have no deliverables. Labs cannot verify what to produce.`, rule: 'EMPTY_DELIVERABLES' })
    score -= 12
  }

  score = Math.max(0, Math.min(100, score))

  let decision: OpenClawDecision = 'allow'
  if (signals.some(s => s.severity === 'critical')) decision = 'reject'
  else if (signals.some(s => s.severity === 'high') || score < 55) decision = 'manual_review'
  else if (signals.length > 0) decision = 'manual_review'

  const summary = decision === 'reject'
    ? 'Blocked — prohibited content detected.'
    : decision === 'manual_review'
    ? `Score ${score}/100. ${signals.length} signal(s) — admin review required.`
    : `Score ${score}/100. Clean submission.`

  return {
    traceId: `oc2_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    decision, score, signals, summary, requiresEthicsReview, requiresIRB,
  }
}
