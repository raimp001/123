import { createClient } from '@/lib/supabase/server'
import { normalizeLab } from '@/lib/normalize/lab'
import type { Bounty } from '@/types/database'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

const TIER_COLOR: Record<string, string> = {
  unverified: 'text-zinc-500',
  basic: 'text-blue-400',
  verified: 'text-emerald-400',
  trusted: 'text-purple-400',
  institutional: 'text-yellow-400',
}

const TIER_BADGE: Record<string, string> = {
  unverified: 'bg-zinc-800 text-zinc-400',
  basic: 'bg-blue-900/60 text-blue-300',
  verified: 'bg-emerald-900/60 text-emerald-300',
  trusted: 'bg-purple-900/60 text-purple-300',
  institutional: 'bg-yellow-900/60 text-yellow-300',
}

export default async function LabProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: rawLab } = await supabase
    .from('labs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!rawLab) notFound()

  const lab = normalizeLab(rawLab)

  // Fetch completed bounties for this lab
  const { data: completedBounties } = await supabase
    .from('bounties')
    .select('id, title, total_budget, currency, completed_at, tags')
    .eq('selected_lab_id', params.id)
    .eq('state', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  const bounties = (completedBounties ?? []) as Pick<
    Bounty,
    'id' | 'title' | 'total_budget' | 'currency' | 'completed_at' | 'tags'
  >[]

  const totalEarned = lab.total_earnings ?? 0
  const completedCount = lab.total_bounties_completed ?? 0
  const reputation = lab.reputation_score ?? 0

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
                <h1 className="font-serif text-3xl font-bold text-white">{lab.name}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  TIER_BADGE[lab.verification_tier] ?? 'bg-zinc-800 text-zinc-400'
                }`}>
                  {lab.verification_tier}
                </span>
              </div>
              {lab.institution_canonical && (
                <p className="text-zinc-400 text-sm mb-1">{lab.institution_canonical}</p>
              )}
              {lab.country_canonical && (
                <p className="text-zinc-600 text-xs">{lab.country_canonical}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                TIER_COLOR[lab.verification_tier] ?? 'text-zinc-400'
              }`}>
                {reputation.toFixed(1)}
              </p>
              <p className="text-xs text-zinc-600">Reputation score</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Bounties Completed', value: completedCount },
            { label: 'Total Earned', value: `$${totalEarned.toLocaleString()}` },
            { label: 'Team Size', value: lab.team_size ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-zinc-600 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-2 space-y-8">
            {/* About */}
            {(lab.description || lab.bio) && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">About</h2>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {lab.description ?? lab.bio}
                </p>
              </section>
            )}

            {/* Completed bounties */}
            {bounties.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                  Completed Research
                </h2>
                <ul className="space-y-3">
                  {bounties.map(b => (
                    <li key={b.id}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4
                                 hover:border-white/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/bounties/${b.id}`}
                            className="text-sm font-medium text-white hover:text-zinc-300 transition-colors">
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
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-white">
                            ${b.total_budget.toLocaleString()}
                          </p>
                          {b.completed_at && (
                            <p className="text-xs text-zinc-600 mt-0.5">
                              {new Date(b.completed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Specialties */}
            {lab.specialties_canonical.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-1.5">
                  {lab.specialties_canonical.map(s => (
                    <span key={s}
                      className="text-xs border border-white/15 text-zinc-400 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {lab.website && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Website</h3>
                <a href={lab.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 break-all transition-colors">
                  {lab.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Staking info */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Staking</h3>
              <p className="text-sm text-white font-semibold">
                ${(lab.staking_balance ?? 0).toLocaleString()} USDC
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">Available stake balance</p>
            </div>

            {/* CTA */}
            <Link href={`/dashboard/bounties?lab=${params.id}`}
              className="block text-center bg-white text-black text-sm font-semibold
                         py-2.5 px-4 rounded-lg hover:bg-zinc-200 transition-colors">
              View Open Bounties
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
