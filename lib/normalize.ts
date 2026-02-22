import type { Lab, NormalizedLab } from '@/types/database'

/**
 * Normalizes a raw Lab row (from DB or API) into a NormalizedLab.
 * Resolves all legacy duplicate field aliases to their canonical names
 * so UI components always work with a single, consistent shape.
 *
 * Canonical  <-  Legacy aliases
 * description           <- bio
 * institution_affiliation <- institution
 * location_country      <- country
 * staking_balance       <- staked_amount
 * specializations       <- specialties
 */
export function normalizeLab(raw: Lab & Record<string, unknown>): NormalizedLab {
  const description =
    (raw.description as string | null) ??
    (raw.bio as string | null) ??
    null

  const institution_affiliation =
    (raw.institution_affiliation as string | null) ??
    (raw.institution as string | null) ??
    null

  const location_country =
    (raw.location_country as string | null) ??
    (raw.country as string | null) ??
    null

  const staking_balance =
    (raw.staking_balance as number | undefined) ??
    (raw.staked_amount as number | undefined) ??
    0

  const specializations: string[] =
    (Array.isArray(raw.specializations) ? raw.specializations : null) ??
    (Array.isArray(raw.specialties) ? raw.specialties : null) ??
    []

  const normalized: NormalizedLab = {
    ...raw,
    description,
    institution_affiliation,
    location_country,
    staking_balance,
    locked_stake: (raw.locked_stake as number | undefined) ?? 0,
    specializations,
    is_public: (raw.is_public as boolean | undefined) ?? false,
    // Readonly convenience aliases
    get bio() { return this.description },
    get institution() { return this.institution_affiliation },
    get country() { return this.location_country },
    get staked_amount() { return this.staking_balance },
    get specialties() { return this.specializations },
  }

  return normalized
}

/**
 * Normalizes an array of raw Lab rows.
 */
export function normalizeLabs(raws: (Lab & Record<string, unknown>)[]): NormalizedLab[] {
  return raws.map(normalizeLab)
}

/**
 * Strips legacy alias fields before sending to the DB / API.
 * Use when constructing INSERT / UPDATE payloads.
 */
export function toDbLab(lab: Partial<NormalizedLab>): Partial<Lab> {
  const { bio: _bio, institution: _inst, country: _country, staked_amount: _sa, specialties: _sp, ...rest } = lab as Record<string, unknown>
  return rest as Partial<Lab>
}
