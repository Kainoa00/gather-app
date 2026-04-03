import Anthropic from '@anthropic-ai/sdk'

export interface ContactForPersonalization {
  contactId: string
  contactName: string
  relationship: string
  residentFirstName: string
  residentLastName: string
}

export interface PersonalizedMessage {
  contactId: string
  body: string
}

export async function personalizeMessages(
  baseMessage: string,
  contacts: ContactForPersonalization[]
): Promise<PersonalizedMessage[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  // Demo fallback when no API key
  if (!apiKey) {
    return contacts.map(c => ({
      contactId: c.contactId,
      body: `Hi ${c.contactName.split(' ')[0]}, as ${c.residentFirstName}'s ${c.relationship.toLowerCase()}, we wanted to share this update with you:\n\n${baseMessage}\n\nWarm regards,\nCareBridge Connect`,
    }))
  }

  const client = new Anthropic({ apiKey })

  const contactList = contacts.map(c =>
    `- contactId: "${c.contactId}" | ${c.contactName} (${c.relationship} of ${c.residentFirstName} ${c.residentLastName})`
  ).join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: `You personalize family update messages for a skilled nursing facility. Write warm, professional messages. Always address the contact by first name and reference their relationship to the resident naturally. Keep messages concise (2-3 sentences max). Return ONLY valid JSON.`,
    messages: [{
      role: 'user',
      content: `The staff member wrote this general update:\n\n"${baseMessage}"\n\nPersonalize this for each family contact below. Each message should feel personal and direct.\n\n${contactList}\n\nReturn a JSON array: [{"contactId": "...", "body": "..."}]\nReturn ONLY the JSON array, nothing else.`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as PersonalizedMessage[]
    // Validate structure
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed.filter(m => m.contactId && m.body)
  } catch {
    // Fallback to demo personalization if AI response is malformed
    return contacts.map(c => ({
      contactId: c.contactId,
      body: `Hi ${c.contactName.split(' ')[0]}, as ${c.residentFirstName}'s ${c.relationship.toLowerCase()}, we wanted to share this update with you:\n\n${baseMessage}\n\nWarm regards,\nCareBridge Connect`,
    }))
  }
}
