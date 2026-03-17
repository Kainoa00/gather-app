import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a clinical note parser for CareBridge Connect, a skilled nursing facility care platform.

Your job is to read raw nurse shift notes and extract structured log entries that match the system's data model.

Return a JSON object with this exact shape:
{
  "entries": [
    {
      "category": "vitals" | "medication" | "activity" | "mood" | "incident",
      "title": "short title string",
      "notes": "optional additional notes string or null",
      "inferredTime": "HH:MM in 24h format, or null if not mentioned",
      "confidence": "high" | "medium" | "low",
      "vitals": { ... } | null,
      "medicationLog": { ... } | null,
      "activityLog": { ... } | null,
      "moodLog": { ... } | null,
      "incidentLog": { ... } | null
    }
  ],
  "summary": "1-2 sentence plain English summary of what was extracted"
}

Field schemas:

vitals (when category = "vitals"):
{
  "bloodPressureSystolic": number | null,
  "bloodPressureDiastolic": number | null,
  "heartRate": number | null,
  "temperature": number | null,
  "oxygenSaturation": number | null,
  "respiratoryRate": number | null,
  "weight": number | null
}

medicationLog (when category = "medication"):
{
  "medicationName": "string",
  "dosage": "string",
  "route": "Oral" | "IV" | "Injection" | "Topical" | "Inhaled",
  "administeredBy": "Nurse on duty"
}

activityLog (when category = "activity"):
{
  "activityType": "physical_therapy" | "occupational_therapy" | "meal" | "social" | "walk" | "exercise" | "other",
  "description": "string",
  "duration": number | null,
  "participation": "active" | "moderate" | "minimal" | "refused"
}

moodLog (when category = "mood"):
{
  "mood": "happy" | "content" | "neutral" | "anxious" | "sad" | "agitated",
  "alertness": "alert" | "drowsy" | "lethargic" | "unresponsive",
  "appetite": "good" | "fair" | "poor" | "refused",
  "painLevel": number (0-10) | null,
  "notes": "string or null"
}

incidentLog (when category = "incident"):
{
  "incidentType": "fall" | "behavior_change" | "condition_change" | "complaint" | "other",
  "severity": "low" | "moderate" | "high",
  "description": "string",
  "actionTaken": "string",
  "physicianNotified": boolean,
  "familyNotified": boolean
}

Rules:
- One entry per distinct clinical event (split vitals from medication from activity etc.)
- Infer times from context clues like "8am", "morning", "afternoon", "2pm", etc.
- Map meal percentages to participation: >=80% = active, 50-79% = moderate, <50% = minimal, refused = refused
- For mood, map clinical language: "comfortable", "pleasant" → content; "anxious", "restless" → anxious; "lethargic", "tired" → note in mood
- Confidence: high = explicitly stated, medium = reasonable inference, low = uncertain/ambiguous
- Only include non-null fields for category-specific data (set unused category fields to null)
- If notes mention physician or family being notified in incident context, set those flags to true
- Return ONLY valid JSON, no markdown, no explanation text`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 503 })
  }

  try {
    const { notes, patientName, nurseName } = await req.json()

    if (!notes?.trim()) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const userMessage = `Parse the following nurse notes for patient ${patientName || 'the patient'}. The nurse's name is ${nurseName || 'the nurse on duty'}.

NURSE NOTES:
${notes.trim()}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip any accidental markdown fences
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.error('Failed to parse Claude JSON output:', rawText)
      return NextResponse.json({ error: 'Agent returned malformed response. Please try again.' }, { status: 422 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('parse-notes API error:', error)
    return NextResponse.json({ error: 'Failed to parse notes. Please try again.' }, { status: 500 })
  }
}
