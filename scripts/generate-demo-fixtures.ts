// Run: ANTHROPIC_API_KEY=... ANTHROPIC_AGENT_INSIGHTS_ID=... ANTHROPIC_AGENT_SHIFT_REPORT_ID=... ANTHROPIC_ENVIRONMENT_ID=... npx tsx scripts/generate-demo-fixtures.ts
// Add --dry-run to skip Anthropic API calls and preview contexts only.

import fs from 'fs'
import path from 'path'

import { getMockData } from '../src/lib/pcc/mock/index'
import { PCC_RESIDENTS } from '../src/lib/pcc/mock/residents'
import type { GeneratedResidentData } from '../src/lib/pcc/mock/generator'
import type { PCCResident } from '../src/lib/pcc/types'
import { pccVitalsToLogEntry, pccAssessmentToLogEntries, pccIncidentToLogEntry } from '../src/lib/pcc/mappers'
import { deriveWellnessDays } from '../src/lib/pcc/aggregators'
import { runAgentWithJsonOutput } from '../src/lib/agents/managed-runner'
import { buildCareInsightsMessage } from '../src/lib/agents/prompts/care-insights'
import { buildShiftReportMessage, getCurrentShiftWindow } from '../src/lib/agents/prompts/shift-report'
import type { SanitizedPatientContext, SanitizedLogEntry, SanitizedWellnessDay, CareInsightsOutput, ShiftReportOutput } from '../src/lib/agents/types'
import type { LogEntry, WellnessDay } from '../src/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface DemoFixture<T> {
  residentId: string
  residentFirstName: string
  agentName: 'care_insights' | 'shift_report'
  generatedAt: string
  scenarioMode: 'demo'
  output: T | null
}

interface FixtureIndex {
  generatedAt: string
  scenarioMode: 'demo'
  model: string
  residents: Array<{
    residentId: string
    firstName: string
    lastName: string
    fixtures: string[]
  }>
}

// ──────────────────────────────────────────────
// Paths
// ──────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(REPO_ROOT, 'src', 'lib', 'agents', 'demo-fixtures')

// ──────────────────────────────────────────────
// Context builder
// ──────────────────────────────────────────────

function logEntryToSanitized(entry: LogEntry): SanitizedLogEntry {
  const sanitized: SanitizedLogEntry = {
    category: entry.category,
    title: entry.title,
    notes: entry.notes ?? undefined,
    createdAt: entry.createdAt.toISOString(),
    enteredByRole: entry.enteredByRole,
  }

  if (entry.vitals) {
    sanitized.vitals = {
      bloodPressureSystolic: entry.vitals.bloodPressureSystolic ?? undefined,
      bloodPressureDiastolic: entry.vitals.bloodPressureDiastolic ?? undefined,
      heartRate: entry.vitals.heartRate ?? undefined,
      temperature: entry.vitals.temperature ?? undefined,
      oxygenSaturation: entry.vitals.oxygenSaturation ?? undefined,
      weight: entry.vitals.weight ?? undefined,
      respiratoryRate: entry.vitals.respiratoryRate ?? undefined,
    }
  }

  if (entry.medicationLog) {
    sanitized.medication = {
      medicationName: entry.medicationLog.medicationName,
      dosage: entry.medicationLog.dosage,
      route: entry.medicationLog.route ?? undefined,
    }
  }

  if (entry.activityLog) {
    sanitized.activity = {
      activityType: entry.activityLog.activityType,
      description: entry.activityLog.description,
      duration: entry.activityLog.duration ?? undefined,
      participation: entry.activityLog.participation ?? undefined,
    }
  }

  if (entry.moodLog) {
    sanitized.mood = {
      mood: entry.moodLog.mood,
      alertness: entry.moodLog.alertness,
      appetite: entry.moodLog.appetite,
      painLevel: entry.moodLog.painLevel ?? undefined,
      notes: entry.moodLog.notes ?? undefined,
    }
  }

  if (entry.incidentLog) {
    sanitized.incident = {
      incidentType: entry.incidentLog.incidentType,
      severity: entry.incidentLog.severity,
      description: entry.incidentLog.description,
      actionTaken: entry.incidentLog.actionTaken,
    }
  }

  return sanitized
}

function wellnessDayToSanitized(day: WellnessDay): SanitizedWellnessDay {
  return {
    date: day.date instanceof Date ? day.date.toISOString().slice(0, 10) : String(day.date),
    overallScore: day.overallScore,
    moodAM: day.moodAM ?? undefined,
    moodPM: day.moodPM ?? undefined,
    appetite: day.appetite ?? undefined,
    painLevel: day.painLevel ?? undefined,
    socialEngagement: day.socialEngagement ?? undefined,
    therapySessions: day.therapySessions ?? undefined,
    visitCount: day.visitCount ?? undefined,
  }
}

function buildSanitizedContextFromPCC(
  data: GeneratedResidentData,
  resident: PCCResident
): SanitizedPatientContext {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const recentVitalEntries = data.vitals
    .filter(v => new Date(v.recordedAt) >= yesterday)
    .map(v => pccVitalsToLogEntry(v))

  const recentAssessmentEntries = data.assessments
    .filter(a => new Date(a.assessedAt) >= yesterday)
    .flatMap(a => pccAssessmentToLogEntries(a))

  const recentIncidentEntries = data.incidents
    .filter(i => new Date(i.occurredAt) >= yesterday)
    .map(i => pccIncidentToLogEntry(i))

  const allRecent: LogEntry[] = [
    ...recentVitalEntries,
    ...recentAssessmentEntries,
    ...recentIncidentEntries,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const wellnessRaw = deriveWellnessDays(data.assessments, data.vitals, sevenDaysAgo, now)

  return {
    firstName: resident.firstName,
    roomNumber: resident.roomNumber ?? 'Unknown',
    primaryDiagnosis: resident.primaryDiagnosis ?? undefined,
    recentLogs: allRecent.map(logEntryToSanitized),
    wellnessTrend: wellnessRaw.map(wellnessDayToSanitized),
  }
}

// ──────────────────────────────────────────────
// Agent runners
// ──────────────────────────────────────────────

async function runCareInsightsFixture(
  context: SanitizedPatientContext,
  agentId: string,
  environmentId: string
): Promise<CareInsightsOutput | null> {
  const message = buildCareInsightsMessage(context)
  try {
    const { result } = await runAgentWithJsonOutput<CareInsightsOutput>({
      agentId,
      environmentId,
      title: `Demo fixture — care_insights — ${context.firstName}`,
      message,
    })
    return result
  } catch (err) {
    console.warn(`  ⚠ care_insights failed for ${context.firstName}:`, (err as Error).message)
    return null
  }
}

async function runShiftReportFixture(
  context: SanitizedPatientContext,
  agentId: string,
  environmentId: string
): Promise<ShiftReportOutput | null> {
  const { start, end } = getCurrentShiftWindow()
  const message = buildShiftReportMessage(
    context.firstName,
    context.roomNumber,
    start.toISOString(),
    end.toISOString(),
    context.recentLogs
  )
  try {
    const { result } = await runAgentWithJsonOutput<ShiftReportOutput>({
      agentId,
      environmentId,
      title: `Demo fixture — shift_report — ${context.firstName}`,
      message,
    })
    return result
  } catch (err) {
    console.warn(`  ⚠ shift_report failed for ${context.firstName}:`, (err as Error).message)
    return null
  }
}

// ──────────────────────────────────────────────
// File I/O
// ──────────────────────────────────────────────

function fixtureFilename(agentName: 'care_insights' | 'shift_report', residentId: string): string {
  return `${agentName.replace('_', '-')}-${residentId}.json`
}

function saveFixture<T>(
  agentName: 'care_insights' | 'shift_report',
  resident: PCCResident,
  output: T | null
): void {
  const fixture: DemoFixture<T> = {
    residentId: resident.residentId,
    residentFirstName: resident.firstName,
    agentName,
    generatedAt: new Date().toISOString(),
    scenarioMode: 'demo',
    output,
  }
  const filename = fixtureFilename(agentName, resident.residentId)
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(fixture, null, 2))
}

function saveIndex(startTime: Date): void {
  const index: FixtureIndex = {
    generatedAt: new Date().toISOString(),
    scenarioMode: 'demo',
    model: 'claude-sonnet-4-6',
    residents: PCC_RESIDENTS.map(r => ({
      residentId: r.residentId,
      firstName: r.firstName,
      lastName: r.lastName,
      fixtures: [
        fixtureFilename('care_insights', r.residentId),
        fixtureFilename('shift_report', r.residentId),
      ],
    })),
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2))
  const elapsed = ((Date.now() - startTime.getTime()) / 1000).toFixed(1)
  console.log(`\nindex.json written  (total: ${elapsed}s)`)
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  const required = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AGENT_INSIGHTS_ID', 'ANTHROPIC_AGENT_SHIFT_REPORT_ID', 'ANTHROPIC_ENVIRONMENT_ID']
  const missing = required.filter(k => !process.env[k])
  if (missing.length > 0 && !isDryRun) {
    console.error(`Missing required environment variables:\n  ${missing.join('\n  ')}`)
    console.error('\nSet them before running:')
    console.error('  ANTHROPIC_API_KEY=sk-... ANTHROPIC_AGENT_INSIGHTS_ID=... npx tsx scripts/generate-demo-fixtures.ts')
    process.exit(1)
  }

  const agentInsightsId = process.env.ANTHROPIC_AGENT_INSIGHTS_ID ?? ''
  const agentShiftId = process.env.ANTHROPIC_AGENT_SHIFT_REPORT_ID ?? ''
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID ?? ''

  console.log('=== CareBridge Connect — Demo Fixture Generator ===')
  if (isDryRun) console.log('DRY RUN — no Anthropic API calls will be made\n')
  else console.log(`Environment: ${environmentId}\n`)

  const mockData = getMockData({ scenarioMode: 'demo', includeTodayUpToNow: false })

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`Created directory: src/lib/agents/demo-fixtures/\n`)
  }

  const startTime = new Date()

  for (const resident of PCC_RESIDENTS) {
    const data = mockData.get(resident.residentId)
    if (!data) {
      console.warn(`  ⚠ No mock data for ${resident.residentId} — skipping`)
      continue
    }

    console.log(`\n${resident.firstName} ${resident.lastName} (${resident.residentId})`)
    console.log(`  Primary diagnosis: ${resident.primaryDiagnosis ?? 'none'}`)

    const context = buildSanitizedContextFromPCC(data, resident)
    console.log(`  Context built — ${context.recentLogs.length} log entries, ${context.wellnessTrend.length} wellness days`)

    if (isDryRun) {
      console.log(`  [dry-run] Would run care_insights agent`)
      console.log(`  [dry-run] Would run shift_report agent`)
      continue
    }

    const insightsStart = Date.now()
    const insightsOutput = await runCareInsightsFixture(context, agentInsightsId, environmentId)
    const insightsMs = Date.now() - insightsStart
    saveFixture('care_insights', resident, insightsOutput)
    console.log(`  ✓ care_insights  (${(insightsMs / 1000).toFixed(1)}s)${insightsOutput ? '' : '  — output null (saved as failed)'}`)

    const shiftStart = Date.now()
    const shiftOutput = await runShiftReportFixture(context, agentShiftId, environmentId)
    const shiftMs = Date.now() - shiftStart
    saveFixture('shift_report', resident, shiftOutput)
    console.log(`  ✓ shift_report   (${(shiftMs / 1000).toFixed(1)}s)${shiftOutput ? '' : '  — output null (saved as failed)'}`)
  }

  if (!isDryRun) {
    saveIndex(startTime)
    console.log('\nAll fixtures saved to src/lib/agents/demo-fixtures/')
  } else {
    console.log('\nDry run complete — no files written.')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
