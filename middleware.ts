import { type NextRequest, NextResponse } from 'next/server'

// ── Supabase env guard ─────────────────────────────────────────────────────────
const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── Rate limit config ───────────────────────────────────────────────────────────
// Two separate buckets:
//   general  — 20 req / 10 s  (all /api/* except auth & payments)
//   sensitive — 10 req / 10 s  (/api/auth/* and /api/payments/*)
//
// Lightweight in-process fallback limiter. This avoids hard runtime deps
// and still provides basic protection per instance.
// Stripe webhooks (/api/webhooks/*) are EXCLUDED from rate limiting.

type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number }
type LocalBucket = { count: number; resetAt: number }

const localBuckets = new Map<string, LocalBucket>()

async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const current = localBuckets.get(key)

  if (!current || current.resetAt <= now) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return {
      success: true,
      limit: max,
      remaining: Math.max(0, max - 1),
      reset: now + windowMs,
    }
  }

  const nextCount = current.count + 1
  current.count = nextCount
  localBuckets.set(key, current)

  if (nextCount > max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: current.resetAt,
    }
  }

  return {
    success: true,
    limit: max,
    remaining: Math.max(0, max - nextCount),
    reset: current.resetAt,
  }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  // 1) Stripe / payment webhooks — skip rate limiting and session refresh
  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }

  // 2) Rate-limit API routes
  if (pathname.startsWith('/api/')) {
    const isSensitive =
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/payments/')

    const bucket = isSensitive ? 'sensitive' : 'general'
    const [max, window] = isSensitive ? [10, 10] : [20, 10]
    const key = `${bucket}_${ip}`

    const result = await checkRateLimit(key, max, window)
    const headers = rateLimitHeaders(result)

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', retryAfter: result.reset }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
            ...headers,
          },
        }
      )
    }

    const res = NextResponse.next()
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }

  // 3) Non-API: Supabase session refresh
  if (!hasSupabase) return NextResponse.next()

  const { updateSession } = await import('@/lib/supabase/middleware')
  return updateSession(request)
}

// ── Matcher ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *   - _next/static  (static assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - public/       (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
