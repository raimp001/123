import { createClient } from '@/lib/supabase/server'
import type { Bounty, User } from '@/types/database'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

function formatBudget(amount: number, currency: string) {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(amount)
  return currency === 'USDC' ? fmt.replace('$', '') + ' USDC' : fmt
}

export default async function FunderProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get funder user record
  const { data: funder } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, email, created_at')
    .eq('id', params.id)
    .eq('role', 'funder')
    .single()

  if (!funder) notFound()

  // Get their public bounties
  const { data: rawBounties } = await supabase
    .from('bounties')
    .select('id, title, total_budget, currency, state, tags, created_at, completed_at, deadline')
    .eq('funder_id', params.id)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  const bounties = (rawBounties ?? []) as Pick<
    Bounty,
    'id' | 'title' | 'total_budget' | 'currency' | 'state' | 'tags' | 'created_at' | 'completed_at' | 'deadline'
  >[]

  const totalFunded = bounties.reduce((sum, b) => sum + b.total_budget, 0)
  const completedCount = bounties.filter(b => b.state === 'completed').length
  const openCount = bounties.filter(b =>
    ['open', 'accepting_proposals', 'funded'].includes(b.state)
  ).length

  const STATE_BADGE: Record<string, string> = {
    open: 'bg-blue-900/60 text-blue-300',
    accepting_proposals: 'bg-blue-900/60 text-blue-300',
    funded: 'bg-emerald-900/60 text-emerald-300',
    completed: 'bg-zinc-800 text-zinc-400',
    cancelled: 'bg-red-900/60 text-red-400',
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <section className="border-b border-white/10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/bounties"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 block">
            ← Browse Bounties
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                  {(funder.full_name ?? 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-bold text-white">
                    {funder.full_name ?? 'Anonymous Funder'}
                  </h1>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Member since {new Date(funder.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <span className="bg-yellow-900/60 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
              Verified Funder
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Funded', value: `$${totalFunded.toLocaleString()}` },
            { label: 'Bounties Posted', value: bounties.length },
            { label: 'Completed', value: completedCount },
          ].map(({ label, value }) => (
            <div key={label}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-zinc-600 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Open bounties CTA */}
        {openCount > 0 && (
          <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                {openCount} open bounty{openCount !== 1 ? 'ies' : ''} accepting proposals
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Apply with your lab to claim these opportunities</p>
            </div>
            <Link href={`/bounties?funder=${params.id}`}
              className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg
                         hover:bg-zinc-200 transition-colors shrink-0">
              Apply Now
            </Link>
          </div>
        )}

        {/* All bounties */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Research Portfolio
          </h2>
          {bounties.length === 0 ? (
            <p className="text-zinc-600 text-sm">No public bounties yet.</p>
          ) : (
            <ul className="space-y-3">
              {bounties.map(b => (
                <li key={b.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-4
                             hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/bounties/${b.id}`}
                        className="text-sm font-medium text-white hover:text-zinc-300 transition-colors line-clamp-1">
                        {b.title}
                      </Link>
                      {b.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.tags.slice(0, 4).map(tag => (
                            <span key={tag}
                              className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 space-y-1.5">
                      <p className="text-sm font-semibold text-white">
                        {formatBudget(b.total_budget, b.currency)}
                      </p>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        STATE_BADGE[b.state] ?? 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {b.state.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
