import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client for demo purposes
    console.warn('Supabase not configured. Using mock client.')
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey) as any
}
