'use client'

/**
 * React hooks for consuming agent outputs and alerts.
 * Follows the same patterns as useSupabaseData.ts with
 * realtime subscriptions and demo mode fallback.
 */

import { useState, useEffect } from 'react'
import { supabase, isDemoMode, DEMO_PATIENT_ID } from '@/lib/supabase'
import type { AgentOutputRow, AgentAlertRow } from '@/lib/agents/types'

// -------------------------------------------
// Demo fixture loader
// -------------------------------------------

// ⚠️ DEMO-ONLY — bundles all fixture JSON into the client. Synthetic data only.
// Before shipping with real PHI, replace with a server route that verifies the
// caller's session has access to `residentId`.
export function loadDemoFixture(
  residentId: string,
  agentName: 'care_insights' | 'shift_report'
): AgentOutputRow | null {
  const filename = `${agentName.replace('_', '-')}-${residentId}`
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fixture = require(`../agents/demo-fixtures/${filename}.json`) as {
      residentId: string
      residentFirstName: string
      agentName: 'care_insights' | 'shift_report'
      generatedAt: string
      scenarioMode: string
      output: Record<string, unknown> | null
    }
    if (!fixture.output) return null
    const outputType = agentName === 'care_insights' ? 'digest' : 'report'
    return {
      id: `fixture-${agentName}-${residentId}`,
      session_id: null,
      patient_id: residentId,
      output_type: outputType,
      title: agentName === 'care_insights'
        ? `Daily Care Digest — ${fixture.residentFirstName}`
        : `Shift Report — ${fixture.residentFirstName}`,
      content_json: fixture.output,
      content_html: null,
      severity: 'info',
      acknowledged_by: [],
      expires_at: null,
      created_at: fixture.generatedAt,
    }
  } catch {
    return null
  }
}

// -------------------------------------------
// Demo data for agent outputs
// -------------------------------------------

const demoAgentOutputs: AgentOutputRow[] = [
  {
    id: 'demo-output-1',
    session_id: null,
    patient_id: DEMO_PATIENT_ID,
    output_type: 'digest',
    title: 'Daily Care Digest — Kenji',
    content_json: {
      overallAssessment: 'Kenji had a positive day with good engagement in physical therapy and stable vitals throughout. His mood was content during the morning and remained steady through the afternoon.',
      highlights: [
        { title: 'Strong PT Session', detail: 'Completed full 30-minute physical therapy with active participation' },
        { title: 'Good Appetite', detail: 'Ate well at breakfast and lunch, requested seconds at dinner' },
      ],
      concerns: [
        { title: 'Slightly Elevated BP', detail: 'Blood pressure reading of 142/88 at 2pm — slightly above target range', severity: 'info' },
      ],
      trends: {
        trajectory: 'improving',
        vitalsSummary: 'Vitals have been generally stable over the past week with a slight upward trend in blood pressure',
        moodSummary: 'Mood has been consistently content to happy over the past 5 days',
        activitySummary: 'Activity participation has improved — moved from moderate to active in PT sessions',
      },
      familyTalkingPoints: [
        'Ask about the PT exercises he enjoyed most today',
        'His appetite has been great — consider bringing his favorite snack',
        'He seemed to enjoy the social activity yesterday afternoon',
      ],
      nurseNotes: 'Monitor BP trend — third reading above 140 systolic this week. All other vitals within normal limits. Patient in good spirits and cooperating with care plan.',
    },
    content_html: null,
    severity: 'info',
    acknowledged_by: [],
    expires_at: null,
    created_at: new Date().toISOString(),
  },
]

const demoAgentAlerts: AgentAlertRow[] = [
  {
    id: 'demo-alert-1',
    output_id: null,
    patient_id: DEMO_PATIENT_ID,
    alert_type: 'vitals_anomaly',
    severity: 'info',
    message: 'Blood pressure trending slightly above target over the past 3 readings (avg 138/86). No immediate action required but worth monitoring.',
    data_points: {
      readings: [
        { date: '2026-04-07', systolic: 135, diastolic: 84 },
        { date: '2026-04-08', systolic: 138, diastolic: 86 },
        { date: '2026-04-09', systolic: 142, diastolic: 88 },
      ],
    },
    notified_roles: ['primary', 'nurse'],
    resolved_at: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

// -------------------------------------------
// Hook: useAgentOutputs
// -------------------------------------------

export function useAgentOutputs(patientId: string = DEMO_PATIENT_ID) {
  const [outputs, setOutputs] = useState<AgentOutputRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setOutputs(demoAgentOutputs)
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('agent_outputs')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('[useAgentOutputs] Fetch error:', error.message)
      } else {
        setOutputs((data || []) as AgentOutputRow[])
      }
      setLoading(false)
    }

    fetch()

    // Realtime subscription
    const channel = supabase
      .channel(`agent_outputs_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_outputs',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          setOutputs((prev) => [payload.new as AgentOutputRow, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])

  return { outputs, loading }
}

// -------------------------------------------
// Hook: useAgentAlerts
// -------------------------------------------

export function useAgentAlerts(patientId: string = DEMO_PATIENT_ID) {
  const [alerts, setAlerts] = useState<AgentAlertRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setAlerts(demoAgentAlerts)
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('agent_alerts')
        .select('*')
        .eq('patient_id', patientId)
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('[useAgentAlerts] Fetch error:', error.message)
      } else {
        setAlerts((data || []) as AgentAlertRow[])
      }
      setLoading(false)
    }

    fetch()

    // Realtime subscription
    const channel = supabase
      .channel(`agent_alerts_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_alerts',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((prev) => [payload.new as AgentAlertRow, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as AgentAlertRow
            if (updated.resolved_at) {
              // Remove resolved alerts
              setAlerts((prev) => prev.filter((a) => a.id !== updated.id))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])

  return { alerts, loading }
}

// -------------------------------------------
// Hook: useLatestDigest
// -------------------------------------------

export function useLatestDigest(patientId: string = DEMO_PATIENT_ID) {
  const [digest, setDigest] = useState<AgentOutputRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setDigest(demoAgentOutputs[0] || null)
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('agent_outputs')
        .select('*')
        .eq('patient_id', patientId)
        .eq('output_type', 'digest')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[useLatestDigest] Fetch error:', error.message)
      }
      setDigest((data as AgentOutputRow) || null)
      setLoading(false)
    }

    fetch()
  }, [patientId])

  return { digest, loading }
}

// -------------------------------------------
// Hook: useShiftReports
// -------------------------------------------

export function useShiftReports(patientId: string = DEMO_PATIENT_ID) {
  const [reports, setReports] = useState<AgentOutputRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setReports([])
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('agent_outputs')
        .select('*')
        .eq('patient_id', patientId)
        .eq('output_type', 'report')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('[useShiftReports] Fetch error:', error.message)
      } else {
        setReports((data || []) as AgentOutputRow[])
      }
      setLoading(false)
    }

    fetch()

    // Realtime subscription
    const channel = supabase
      .channel(`shift_reports_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_outputs',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newOutput = payload.new as AgentOutputRow
          if (newOutput.output_type === 'report') {
            setReports((prev) => [newOutput, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])

  return { reports, loading }
}
