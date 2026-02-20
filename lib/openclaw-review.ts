type OpenClawDecision = 'allow' | 'manual_review' | 'reject'
type OpenClawSignalType = 'harm' | 'ethics' | 'quality' | 'fraud'
type OpenClawSignalSeverity = 'low' | 'medium' | 'high'

export interface OpenClawSignal {
  type: OpenClawSignalType
  severity: OpenClawSignalSeverity
  message: string
}

export interface OpenClawReviewSummary {
  traceId: string | null
  decision: OpenClawDecision
  score: number | null
  signals: OpenClawSignal[]
}

export type OpenClawRiskLevel = 'low' | 'medium' | 'high'

const VALID_DECISIONS = new Set<OpenClawDecision>(['allow', 'manual_review', 'reject'])
const VALID_SIGNAL_TYPES = new Set<OpenClawSignalType>(['harm', 'ethics', 'quality', 'fraud'])
const VALID_SIGNAL_SEVERITIES = new Set<OpenClawSignalSeverity>(['low', 'medium', 'high'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toSignal(value: unknown): OpenClawSignal | null {
  if (!isRecord(value)) return null

  const type = value.type
  const severity = value.severity
  const message = value.message

  if (
    typeof type !== 'string' ||
    typeof severity !== 'string' ||
    typeof message !== 'string' ||
    !VALID_SIGNAL_TYPES.has(type as OpenClawSignalType) ||
    !VALID_SIGNAL_SEVERITIES.has(severity as OpenClawSignalSeverity)
  ) {
    return null
  }

  return {
    type: type as OpenClawSignalType,
    severity: severity as OpenClawSignalSeverity,
    message,
  }
}

function toReview(value: unknown): OpenClawReviewSummary | null {
  if (!isRecord(value)) return null

  const decisionValue = value.decision
  if (typeof decisionValue !== 'string' || !VALID_DECISIONS.has(decisionValue as OpenClawDecision)) {
    return null
  }

  const scoreValue = value.score
  const score = typeof scoreValue === 'number' && Number.isFinite(scoreValue)
    ? Math.max(0, Math.min(100, scoreValue))
    : null

  const traceIdValue = value.traceId
  const traceId = typeof traceIdValue === 'string' ? traceIdValue : null

  const signalsValue = value.signals
  const signals = Array.isArray(signalsValue)
    ? signalsValue.map(toSignal).filter((signal): signal is OpenClawSignal => signal !== null)
    : []

  return {
    decision: decisionValue as OpenClawDecision,
    score,
    traceId,
    signals,
  }
}

export function extractOpenClawReview(stateHistory: unknown): OpenClawReviewSummary | null {
  if (!Array.isArray(stateHistory)) return null

  for (let i = stateHistory.length - 1; i >= 0; i -= 1) {
    const entry = stateHistory[i]
    if (!isRecord(entry)) continue

    const review = toReview(entry.review)
    if (review) return review

    if (isRecord(entry.details)) {
      const nestedReview = toReview(entry.details.review)
      if (nestedReview) return nestedReview
    }
  }

  return null
}

export function openClawDecisionLabel(decision: OpenClawDecision): string {
  if (decision === 'allow') return 'Allow'
  if (decision === 'reject') return 'Reject'
  return 'Manual Review'
}

export function getOpenClawRiskLevel(review: OpenClawReviewSummary | null): OpenClawRiskLevel | null {
  if (!review) return null
  if (review.decision === 'reject') return 'high'
  if (review.signals.some((signal) => signal.severity === 'high')) return 'high'
  if (review.decision === 'manual_review') return 'medium'
  if (typeof review.score === 'number' && review.score < 40) return 'high'
  if (typeof review.score === 'number' && review.score < 75) return 'medium'
  return 'low'
}

export function openClawSignalTypeLabel(type: OpenClawSignalType): string {
  if (type === 'harm') return 'Harm'
  if (type === 'ethics') return 'Ethics'
  if (type === 'fraud') return 'Fraud'
  return 'Quality'
}
