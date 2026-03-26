import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Demo mode flag - true when Supabase env vars are not configured
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Only create a real client when env vars are set; use a placeholder otherwise
// The placeholder is never called because isDemoMode guards all DB access
export const supabase: SupabaseClient = isDemoMode
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey)

// Demo patient ID (used for seeded data)
export const DEMO_PATIENT_ID = '00000000-0000-0000-0000-000000000001'
