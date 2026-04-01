// src/app/messages/page.tsx
import { prisma } from '@/lib/prisma'
import { MessageDirection } from '@prisma/client'

export default async function MessagesPage() {
  const facilityId = (await prisma.facility.findFirst())?.id ?? ''

  const residents = await prisma.resident.findMany({
    where: { facilityId, status: 'ACTIVE' },
    include: {
      messages: {
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
      },
      contacts: { where: { isPrimary: true } },
    },
    orderBy: { lastName: 'asc' },
  })

  const statusColor: Record<string, string> = {
    DELIVERED:  'text-green-600',
    SENT:       'text-blue-600',
    SUPPRESSED: 'text-red-500',
    QUEUED:     'text-amber-600',
    FAILED:     'text-red-600',
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        {residents.map(resident => {
          const msgs = resident.messages
          const primary = resident.contacts[0]
          if (msgs.length === 0) return null

          return (
            <div key={resident.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-[11px] font-medium text-brand-600 shrink-0">
                  {resident.firstName[0]}{resident.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{resident.firstName} {resident.lastName}</p>
                  <p className="text-[11px] text-gray-400">Room {resident.roomNumber} · {primary?.name ?? 'No primary contact'}</p>
                </div>
                <span className="text-[10px] text-gray-300">{msgs.length} msgs</span>
              </div>

              {/* Thread */}
              <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50/50">
                {msgs.slice(0, 6).map(msg => (
                  <div key={msg.id} className={`flex ${msg.direction === MessageDirection.OUTBOUND ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed ${
                      msg.direction === MessageDirection.OUTBOUND
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                      <p>{msg.body}</p>
                      <p className={`text-[9px] mt-1 ${msg.direction === MessageDirection.OUTBOUND ? 'text-brand-100 opacity-70' : 'text-gray-400'} ${statusColor[msg.status] ?? ''}`}>
                        {msg.direction === MessageDirection.OUTBOUND ? msg.status.toLowerCase() : 'received'} ·{' '}
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {residents.every(r => r.messages.length === 0) && (
        <p className="text-sm text-gray-400 text-center py-12">No messages yet. Messages appear here after EHR events trigger notifications.</p>
      )}
    </div>
  )
}
