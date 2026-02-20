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
  type: 'harm' | 'ethics' | 'quality' | 'fraud'
  severity: 'low' | 'medium' | 'high'
  message: string
}

export interface OpenClawResult {
  traceId: string
  decision: OpenClawDecision
  score: number
  signals: OpenClawSignal[]
}

const HIGH_RISK_TERMS = [
  'weapon',
  'bioweapon',
  'pathogen release',
  'toxin synthesis',
  'human cloning',
  'self-harm',
  'targeted virus',
]

const ETHICS_REVIEW_TERMS = [
  'human subjects',
  'patient',
  'clinical trial',
  'animal study',
  'genome editing',
  'crispr',
  'personally identifiable',
  'pii',
]

function hasTerm(text: string, terms: string[]) {
  const normalized = text.toLowerCase()
  return terms.some((term) => normalized.includes(term))
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function buildText(input: OpenClawInput) {
  return [
    input.title,
    input.description,
    input.methodology,
    input.dataRequirements.join(' '),
    input.qualityStandards.join(' '),
    input.milestones.map((m) => `${m.title} ${m.description} ${m.deliverables.join(' ')}`).join(' '),
  ].join('\n')
}

export function runOpenClawReview(input: OpenClawInput): OpenClawResult {
  const text = buildText(input)
  const signals: OpenClawSignal[] = []
  let score = 100

  if (hasTerm(text, HIGH_RISK_TERMS)) {
    signals.push({
      type: 'harm',
      severity: 'high',
      message: 'Potentially harmful or dual-use intent detected.',
    })
    score -= 80
  }

  if (hasTerm(text, ETHICS_REVIEW_TERMS)) {
    signals.push({
      type: 'ethics',
      severity: 'medium',
      message: 'Sensitive research domain detected; explicit ethics review required.',
    })
    score -= 20
  }

  if (input.milestones.length < 2) {
    signals.push({
      type: 'quality',
      severity: 'medium',
      message: 'Single-milestone bounties reduce accountability and payout transparency.',
    })
    score -= 15
  }

  const vagueFields = [input.description, input.methodology].filter((field) => field.trim().length < 60).length
  if (vagueFields > 0) {
    signals.push({
      type: 'quality',
      severity: 'low',
      message: 'Research scope or methodology is too vague for reliable milestone verification.',
    })
    score -= 10
  }

  if (input.totalBudget > 0 && input.totalBudget < 500) {
    signals.push({
      type: 'fraud',
      severity: 'low',
      message: 'Budget is unusually low for lab work and may attract low-quality submissions.',
    })
    score -= 8
  }

  score = clamp(score, 0, 100)

  let decision: OpenClawDecision = 'allow'
  if (signals.some((signal) => signal.severity === 'high' && signal.type === 'harm')) {
    decision = 'reject'
  } else if (signals.length > 0) {
    decision = 'manual_review'
  }

  return {
    traceId: `oc_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    decision,
    score,
    signals,
  }
}
