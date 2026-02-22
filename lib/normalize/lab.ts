import type { Lab } from '@/types/database'

export type NormalizedLab = Lab & {
  institution_canonical: string | null
  country_canonical: string | null
  specialties_canonical: string[]
}

/**
 * Normalize duplicate Lab fields into single canonical values.
 * Always use this when reading lab data for display or business logic.
 */
export function normalizeLab(lab: Lab): NormalizedLab {
  return {
    ...lab,
    institution_canonical: lab.institution_affiliation ?? lab.institution ?? null,
    country_canonical: lab.location_country ?? lab.country ?? null,
    specialties_canonical:
      (lab.specializations?.length ? lab.specializations : lab.specialties) ?? [],
  }
}

/**
 * Strip deprecated alias fields before writing to Supabase.
 * Canonical columns: institution_affiliation, location_country, specializations.
 */
export function toCanonicalLabWrite(input: Partial<Lab>): Partial<Lab> {
  const out = { ...input }
  // Merge aliases into canonical fields
  if (!out.institution_affiliation && out.institution) {
    out.institution_affiliation = out.institution
  }
  if (!out.location_country && out.country) {
    out.location_country = out.country
  }
  if ((!out.specializations || out.specializations.length === 0) && out.specialties?.length) {
    out.specializations = out.specialties
  }
  // Remove alias fields so they are never written
  delete out.institution
  delete out.country
  delete out.specialties
  return out
}
