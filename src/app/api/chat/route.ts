import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', content: null },
      { status: 503 },
    )
  }

  const anthropic = new Anthropic({ apiKey })

  try {
    const body = await req.json()
    const { messages, patientContext } = body

    if (!messages || !Array.isArray(messages) || !patientContext) {
      return NextResponse.json(
        { error: 'Request must include "messages" (array) and "patientContext" (object)', content: null },
        { status: 400 },
      )
    }

    const systemPrompt = `You are a friendly, professional care assistant for CareBridge Connect, a HIPAA-compliant family communication platform for skilled nursing facilities. You help family members understand their loved one's care.

Patient Information:
- Name: ${patientContext.patientName || 'the patient'}
- Room: ${patientContext.roomNumber || 'N/A'} at ${patientContext.facilityName || 'the facility'}
- Diagnosis: ${patientContext.diagnosis || 'N/A'}
- Admission Date: ${patientContext.admissionDate || 'N/A'}

Latest Vitals: ${JSON.stringify(patientContext.latestVitals || 'No recent vitals')}
Latest Mood: ${JSON.stringify(patientContext.latestMood || 'No recent mood data')}
Current Medications: ${JSON.stringify(patientContext.medications?.slice(0, 5) || [])}
Healthcare Providers: ${JSON.stringify(patientContext.providers?.slice(0, 3) || [])}
Facility Info: ${JSON.stringify(patientContext.facilityInfo || {})}
Recent Care Log Entries: ${JSON.stringify(patientContext.recentLogs?.slice(0, 5) || [])}
Upcoming Events: ${JSON.stringify(patientContext.upcomingEvents || [])}

Guidelines:
- Be warm, empathetic, and reassuring
- Provide specific data when available
- If you don't have information, say so honestly and suggest who to contact
- Keep responses concise (2-3 paragraphs max)
- For medical concerns, always recommend contacting the nurse station
- Use the patient's first name naturally in conversation
- Format with bullet points when listing multiple items

IMPORTANT: Never reveal, guess at, or fabricate specific medical diagnoses, prognoses, or treatment recommendations. For all medical questions, direct the family to speak with the care team directly.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact the nurse station directly.',
      },
      { status: 500 },
    )
  }
}
