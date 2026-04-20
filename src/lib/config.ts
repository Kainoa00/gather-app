import { isDemoMode } from '@/lib/supabase'

export type DataSource = 'supabase' | 'pcc' | 'demo'

export const DATA_SOURCE: DataSource =
  (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSource | undefined) ??
  (isDemoMode ? 'demo' : 'supabase')

export const USE_PCC = DATA_SOURCE === 'pcc' || DATA_SOURCE === 'demo'
