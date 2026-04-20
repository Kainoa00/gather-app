'use client'

import { useState, useEffect } from 'react'
import { isDemoMode } from '@/lib/supabase'
import { USE_PCC } from '@/lib/config'
import type { CareInsightsOutput } from '@/lib/agents/types'

interface CareInsightsResult {
  insight: CareInsightsOutput | null
  generatedAt: string | null
  loading: boolean
  source: 'fixture' | 'live' | null
}

// Demo fixtures shipped with the repo. Keyed by residentId → JSON module.
// Using an explicit require list so Next's bundler picks them up on the client.
function loadFixture(residentId: string): { output: CareInsightsOutput; generatedAt: string } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fixture = require(`@/lib/agents/demo-fixtures/care-insights-${residentId}.json`) as {
      residentId: string
      residentFirstName: string
      agentName: 'care_insights'
      generatedAt: string
      output: CareInsightsOutput | null
    }
    if (!fixture.output) return null
    return { output: fixture.output, generatedAt: fixture.generatedAt }
  } catch {
    return null
  }
}

// Grant-demo path: serve the precomputed fixture for the selected PCC resident
// so investors see a rich Claude-authored card without a live API call. When the
// product eventually runs against a real care_insights agent, this hook can
// swap to fetching from Supabase output_store for the latest `digest` row.
export function useCareInsights(residentId: string | undefined): CareInsightsResult {
  const [result, setResult] = useState<CareInsightsResult>({
    insight: null,
    generatedAt: null,
    loading: true,
    source: null,
  })

  useEffect(() => {
    if (!residentId) {
      setResult({ insight: null, generatedAt: null, loading: false, source: null })
      return
    }

    // In demo or PCC-demo mode, serve the fixture. Live mode would hit the
    // Supabase output_store via /api/agents/care-insights — not wired yet.
    if (isDemoMode || USE_PCC) {
      const fixture = loadFixture(residentId)
      setResult({
        insight: fixture?.output ?? null,
        generatedAt: fixture?.generatedAt ?? null,
        loading: false,
        source: fixture ? 'fixture' : null,
      })
      return
    }

    setResult({ insight: null, generatedAt: null, loading: false, source: null })
  }, [residentId])

  return result
}
