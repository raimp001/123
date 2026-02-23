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
 * Canonical columns: institution_affiliation, location_country, description, specializations.
 */
export function toCanonicalLabWrite(input: Partial<Lab>): Partial<Lab> {
  const out = { ...input }
  // Merge aliases into canonical fields
  if (!out.institution_affiliation && (out as Record<string, unknown>).institution) {
    out.institution_affiliation = (out as Record<string, unknown>).institution as string
  }
  if (!out.location_country && (out as Record<string, unknown>).country) {
    out.location_country = (out as Record<string, unknown>).country as string
  }
  if (!out.description && (out as Record<string, unknown>).bio) {
    out.description = (out as Record<string, unknown>).bio as string
  }
  if ((!out.specializations || out.specializations.length === 0)) {
    const specialties = (out as Record<string, unknown>).specialties as string[] | undefined
    const expertiseAreas = (out as Record<string, unknown>).expertise_areas as string[] | undefined
    if (specialties?.length) out.specializations = specialties
    else if (expertiseAreas?.length) out.specializations = expertiseAreas
  }
  // Remove alias fields so they are never written
  delete (out as Record<string, unknown>).institution
  delete (out as Record<string, unknown>).country
  delete (out as Record<string, unknown>).bio
  delete (out as Record<string, unknown>).specialties
  delete (out as Record<string, unknown>).expertise_areas
  delete (out as Record<string, unknown>).equipment
  delete (out as Record<string, unknown>).publications
  return out
}
