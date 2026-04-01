// src/app/events/page.tsx
import { prisma } from '@/lib/prisma'
import { MessageStatus } from '@prisma/client'

export default async function EventsPage() {
  const facilityId = (await prisma.facility.findFirst())?.id ?? ''

  const events = await prisma.careEvent.findMany({
    where: { resident: { facilityId } },
    include: {
      resident: true,
      messages: { include: { contact: true }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { occurredAt: 'desc' },
    take: 50,
  })

  const dotColor: Record<string, string> = {
    ADMISSION:                'bg-blue-400',
    DISCHARGE:                'bg-gray-400',
    LAB_RESULT:               'bg-amber-400',
    MEDICATION_CHANGE:        'bg-red-400',
    PSYCHOTROPIC_MED_CONSENT: 'bg-purple-400',
    IMMUNIZATION:             'bg-teal-400',
    WEIGHT_CHANGE:            'bg-blue-300',
    ROOM_TRANSFER:            'bg-indigo-400',
    MANUAL:                   'bg-gray-300',
  }

  const msgBadge: Record<string, string> = {
    DELIVERED:  'bg-green-50 text-green-700',
    SENT:       'bg-blue-50 text-blue-700',
    SUPPRESSED: 'bg-red-50 text-red-700',
    QUEUED:     'bg-amber-50 text-amber-700',
    FAILED:     'bg-red-100 text-red-800',
  }

  const msgLabel: Record<string, string> = {
    DELIVERED:  'Delivered',
    SENT:       'Sent',
    SUPPRESSED: 'No consent — suppressed',
    QUEUED:     'Queued',
    FAILED:     'Failed',
  }

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">EHR event log</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium bg-blue-50 text-blue-700 rounded px-2 py-0.5">PointClickCare</span>
            <span className="text-[11px] text-gray-400">Last sync: 2 min ago</span>
          </div>
        </div>

        {events.map(ev => {
          const msg = ev.messages[0]
          const status = msg?.status ?? 'QUEUED'
          const details = ev.details as Record<string, string>

          return (
            <div key={ev.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor[ev.type] ?? 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium">{ev.type.replace(/_/g, ' ')}</p>
                  {ev.pccNoteWritten && (
                    <span className="text-[10px] bg-green-50 text-green-700 rounded px-1.5 py-0.5">PCC note written</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {ev.resident.firstName} {ev.resident.lastName} · Room {ev.resident.roomNumber}
                  {msg?.contact ? ` · ${msg.contact.name} notified` : ''}
                </p>
                {Object.keys(details).length > 0 && (
                  <p className="text-[11px] text-gray-300 mt-0.5 font-mono">{JSON.stringify(details)}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${msgBadge[status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {msgLabel[status] ?? status}
                </span>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}

        {events.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">
            No EHR events yet. Events appear here when PointClickCare webhooks are received.
          </p>
        )}

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Progress notes are automatically written back to the PCC patient chart for every delivered notification.
          </p>
        </div>
      </div>
    </div>
  )
}
