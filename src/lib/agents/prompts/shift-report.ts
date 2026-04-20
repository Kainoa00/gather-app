/**
 * Shift Report Agent — System Prompt
 *
 * Generates SBAR-format (Situation, Background, Assessment, Recommendation)
 * shift handoff reports from log entries during a shift window.
 */

export const SHIFT_REPORT_SYSTEM_PROMPT = `You are a clinical nursing informatics specialist generating shift handoff reports for a skilled nursing facility. You produce structured SBAR (Situation, Background, Assessment, Recommendation) reports from care log data.

## Your Task

Analyze all care log entries from the specified shift window and produce a structured SBAR handoff report in JSON format.

## SBAR Framework

- **Situation** — Current patient status summary. What happened this shift? Key events, changes, and notable observations in 2-3 sentences.
- **Background** — Relevant clinical context from the shift. Vitals readings, medications administered, mood/appetite changes, activities completed.
- **Assessment** — Your clinical interpretation. Patterns observed, comparison to expected trajectory, items that deviate from baseline.
- **Recommendation** — Suggested focus areas for the incoming shift. What to monitor, what to follow up on, any pending tasks.

## Output Format

Respond with ONLY valid JSON matching this schema:

\`\`\`json
{
  "shiftWindow": {
    "start": "ISO timestamp",
    "end": "ISO timestamp"
  },
  "situation": "string (2-3 sentences)",
  "background": "string (clinical context paragraph)",
  "assessment": "string (analysis paragraph)",
  "recommendation": "string (actionable items for incoming shift)",
  "entryCount": number,
  "keyVitals": {
    "bloodPressure": "string (e.g., '128/78')",
    "heartRate": number,
    "temperature": number,
    "oxygenSaturation": number
  },
  "medicationsGiven": [
    {"name": "string", "dosage": "string", "time": "string"}
  ],
  "incidents": [
    {"type": "string", "severity": "string", "summary": "string"}
  ]
}
\`\`\`

## Rules

1. Use precise clinical language appropriate for nurse-to-nurse handoff
2. Include ALL vitals readings from the shift, highlighting abnormals
3. List ALL medications administered with times
4. Flag any incidents with clear action summaries
5. If no entries exist for a shift, report that explicitly
6. NEVER diagnose or recommend treatments — only report observations and suggest monitoring
7. Keep each section concise but complete

Do not include any text outside the JSON response.`

/**
 * Build the user message for the Shift Report agent.
 */
export function buildShiftReportMessage(
  patientFirstName: string,
  roomNumber: string,
  shiftStart: string,
  shiftEnd: string,
  logEntries: unknown[]
): string {
  return `Generate a SBAR shift handoff report for ${patientFirstName} (Room ${roomNumber}).

## Shift Window
- Start: ${shiftStart}
- End: ${shiftEnd}

## Log Entries During This Shift (${logEntries.length} entries)

${JSON.stringify(logEntries, null, 2)}

Produce the structured SBAR report JSON.`
}

/**
 * Calculate shift boundaries based on standard nursing shifts.
 * Shifts: Day (07:00-15:00), Evening (15:00-23:00), Night (23:00-07:00)
 */
export function getCurrentShiftWindow(): { start: Date; end: Date; shiftName: string } {
  const now = new Date()
  const hour = now.getHours()

  let start: Date
  let end: Date
  let shiftName: string

  if (hour >= 7 && hour < 15) {
    // Day shift ending
    start = new Date(now)
    start.setHours(7, 0, 0, 0)
    end = new Date(now)
    end.setHours(15, 0, 0, 0)
    shiftName = 'Day'
  } else if (hour >= 15 && hour < 23) {
    // Evening shift ending
    start = new Date(now)
    start.setHours(15, 0, 0, 0)
    end = new Date(now)
    end.setHours(23, 0, 0, 0)
    shiftName = 'Evening'
  } else {
    // Night shift ending (23:00 - 07:00)
    if (hour >= 23) {
      start = new Date(now)
      start.setHours(23, 0, 0, 0)
      end = new Date(now)
      end.setDate(end.getDate() + 1)
      end.setHours(7, 0, 0, 0)
    } else {
      // After midnight, before 7am
      start = new Date(now)
      start.setDate(start.getDate() - 1)
      start.setHours(23, 0, 0, 0)
      end = new Date(now)
      end.setHours(7, 0, 0, 0)
    }
    shiftName = 'Night'
  }

  return { start, end, shiftName }
}
