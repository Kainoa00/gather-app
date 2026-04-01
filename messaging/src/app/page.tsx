// src/app/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacility } from '@/lib/facility'
import { MessageStatus, ConsentStatus } from '@prisma/client'
import { AlertTriangle, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/format'

export default async function DashboardPage() {
  const facility = await getFacility()
  const facilityId = facility.id
  const facilityName = facility.name

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000)

  const [
    residentCount,
    messagesThisWeek,
    messagesLastWeek,
    deliveredCount,
    consentGaps,
    recentEvents,
  ] = await Promise.all([
    prisma.resident.count({ where: { facilityId, status: 'ACTIVE' } }),
    prisma.message.count({
      where: { resident: { facilityId }, createdAt: { gte: sevenDaysAgo } }
    }),
    prisma.message.count({
      where: { resident: { facilityId }, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
    }),
    prisma.message.count({
      where: { resident: { facilityId }, status: MessageStatus.DELIVERED, createdAt: { gte: sevenDaysAgo } }
    }),
    prisma.familyContact.count({
      where: {
        resident: { facilityId },
        consents: { none: { status: ConsentStatus.ACTIVE } }
      }
    }),
    prisma.careEvent.findMany({
      where: { resident: { facilityId } },
      include: { resident: true, messages: { include: { contact: true } } },
      orderBy: { occurredAt: 'desc' },
      take: 8,
    }),
  ])

  const deliveryRate = messagesThisWeek > 0
    ? Math.round((deliveredCount / messagesThisWeek) * 1000) / 10
    : 0

  const weekDiff = messagesThisWeek - messagesLastWeek
  const weekDiffLabel = messagesLastWeek === 0
    ? 'No data last week'
    : weekDiff >= 0
      ? `+${weekDiff} vs last week`
      : `${weekDiff} vs last week`

  const statusColor: Record<string, string> = {
    DELIVERED: 'bg-green-50 text-green-700',
    SENT:      'bg-blue-50 text-blue-700',
    SUPPRESSED:'bg-red-50 text-red-700',
    QUEUED:    'bg-amber-50 text-amber-700',
    FAILED:    'bg-red-100 text-red-800',
  }

  const eventDot: Record<string, string> = {
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

  return (
    <div className="p-6">
      {/* Alerts */}
      {consentGaps > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">
            {consentGaps} resident{consentGaps > 1 ? 's' : ''} missing family consent — SMS notifications paused.
          </p>
          <Link href="/consent" className="text-xs font-medium text-red-600 hover:underline shrink-0">Fix now →</Link>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Residents tracked', value: residentCount, sub: facilityName, color: '' },
          { label: 'Messages (7d)',     value: messagesThisWeek, sub: weekDiffLabel, color: 'text-brand-600' },
          { label: 'Delivery rate',    value: `${deliveryRate}%`, sub: 'All carriers nominal', color: 'text-brand-600' },
          { label: 'Consent gaps',     value: consentGaps, sub: consentGaps > 0 ? 'Notifications paused' : 'All clear', color: consentGaps > 0 ? 'text-red-500' : 'text-brand-600' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className="text-2xl font-medium">{m.value}</p>
            <p className={`text-[11px] mt-0.5 ${m.color || 'text-gray-400'}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Event feed */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Recent EHR-triggered events</h2>
          <span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5 font-medium">PointClickCare</span>
        </div>
        {recentEvents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No events yet. Events appear here when PointClickCare sends webhooks.</p>
        )}
        {recentEvents.map(ev => {
          const msg = ev.messages[0]
          const status = msg?.status ?? 'QUEUED'
          return (
            <div key={ev.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${eventDot[ev.type] ?? 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{ev.type.replace(/_/g, ' ')}</p>
                <p className="text-[11px] text-gray-400">{ev.resident.firstName} {ev.resident.lastName} · Room {ev.resident.roomNumber}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {status === 'SUPPRESSED' ? 'No consent' : status.toLowerCase()}
              </span>
              <span className="text-[10px] text-gray-300 shrink-0">
                {formatTime(ev.occurredAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
