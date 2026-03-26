import { isDemoMode } from '@/lib/supabase'

interface NotificationRecipient {
  email: string
  name: string
}

interface NotifyFamilyParams {
  patientId: string
  patientName: string
  notificationType: string
  message: string
  senderName: string
  facilityName?: string
  recipients: NotificationRecipient[]
}

/**
 * Send email notifications to family members in the care circle.
 * Uses Promise.allSettled so individual failures don't block others.
 * Never throws — failures are logged to console.
 */
export async function notifyFamilyMembers(params: NotifyFamilyParams): Promise<void> {
  const {
    patientName,
    notificationType,
    message,
    senderName,
    facilityName,
    recipients,
  } = params

  if (isDemoMode) {
    console.log('[notifications] Demo mode — skipping email notifications for', recipients.length, 'recipients')
    return
  }

  if (recipients.length === 0) {
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const res = await fetch(`${baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          patientName,
          notificationType,
          message,
          senderName,
          facilityName,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to notify ${recipient.email}: ${res.status} ${text}`)
      }

      return res.json()
    })
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[notifications] Failed to send notification:', result.reason)
    }
  }
}
