'use client'

import { motion } from 'framer-motion'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE } from '@/lib/motion'
import { ClipboardList, Users, Calendar, Lock } from 'lucide-react'

// ─── Feature visuals (pure CSS mockups) ───────────────────────────────────────

function CareLogVisual() {
  const entries = [
    { dot: 'bg-blue-400', title: 'Physical Therapy Session', time: '9:15 AM', category: 'Therapy', catColor: 'bg-blue-100 text-blue-700' },
    { dot: 'bg-green-400', title: 'Meal — Breakfast', time: '8:00 AM', category: 'Nutrition', catColor: 'bg-green-100 text-green-700' },
    { dot: 'bg-purple-400', title: 'Physician Visit — Dr. Chen', time: '7:30 AM', category: 'Medical', catColor: 'bg-purple-100 text-purple-700' },
    { dot: 'bg-amber-400', title: 'Personal Care', time: '7:00 AM', category: 'Daily Care', catColor: 'bg-amber-100 text-amber-700' },
  ]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Care Log — Today</span>
        <span className="text-xs text-slate-400">4 entries</span>
      </div>
      <div className="divide-y divide-slate-50">
        {entries.map((e, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <div className={`w-2.5 h-2.5 rounded-full ${e.dot} shrink-0 mt-1.5`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-800 truncate">{e.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${e.catColor}`}>{e.category}</span>
                <span className="text-[11px] text-slate-400">{e.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FamilyFeedVisual() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Mobile header */}
      <div className="bg-navy-800 px-5 py-4 flex items-center justify-between">
        <span className="text-white text-sm font-semibold">Family View</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-green-300">Live updates</span>
        </div>
      </div>
      {/* Patient card */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">MT</div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Margaret Thompson</div>
            <div className="text-xs text-slate-500">Room 412 · Sunrise Care Center</div>
          </div>
        </div>
      </div>
      {/* Updates */}
      <div className="divide-y divide-slate-50">
        {[
          { icon: '🏃', text: 'Completed PT session', sub: '9:15 AM · Logged by Maria R., RN', isNew: true },
          { icon: '🍳', text: 'Good breakfast appetite', sub: '8:00 AM · Logged by Care Team', isNew: false },
          { icon: '💊', text: 'Morning medications given', sub: '7:45 AM · Logged by Sarah K., CNA', isNew: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${item.isNew ? 'bg-primary-50/40' : ''}`}>
            <div className="text-base shrink-0">{item.icon}</div>
            <div>
              <div className="text-sm font-medium text-slate-800">{item.text}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
            </div>
            {item.isNew && <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarVisual() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Care Calendar — March 2026</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-lg bg-slate-100" />
          <div className="w-6 h-6 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="p-4">
        {/* Mini calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400">{d}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <div key={d} className={`aspect-square flex items-center justify-center text-[11px] rounded-full cursor-default select-none
              ${d === 17 ? 'bg-primary-600 text-white font-bold' :
                [5, 10, 14, 21, 25].includes(d) ? 'bg-primary-100 text-primary-700 font-semibold' :
                'text-slate-600'}`}>
              {d}
            </div>
          ))}
        </div>
        {/* Upcoming events */}
        <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
          {[
            { dot: 'bg-blue-400', text: 'Physical Therapy · 9:00 AM', today: true },
            { dot: 'bg-green-400', text: 'Family Visit · 2:30 PM', today: false },
            { dot: 'bg-amber-400', text: 'Podiatry Appointment · 4:00 PM', today: false },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${e.dot}`} />
              <span className="text-[12px] text-slate-600">{e.text}</span>
              {e.today && <span className="ml-auto text-[10px] font-semibold text-primary-600">Today</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VaultVisual() {
  const files = [
    { name: 'Advance Directive', type: 'PDF', size: '240 KB', color: 'bg-red-100 text-red-600' },
    { name: 'Insurance Card', type: 'JPG', size: '1.2 MB', color: 'bg-blue-100 text-blue-600' },
    { name: 'Power of Attorney', type: 'PDF', size: '180 KB', color: 'bg-red-100 text-red-600' },
    { name: 'Medication List', type: 'PDF', size: '95 KB', color: 'bg-red-100 text-red-600' },
  ]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Document Vault</span>
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Encrypted
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center text-[10px] font-bold shrink-0`}>
              {f.type}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">{f.name}</div>
              <div className="text-xs text-slate-400">{f.size}</div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature rows ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ClipboardList,
    tag: 'Care Log',
    title: 'Every shift, documented and shared.',
    description: 'Staff log care entries — meals, therapy, medications, incidents — from any device. Families see updates the moment they\'re written. No phone tag, no missed calls.',
    bullets: ['Categorized entries (therapy, nutrition, medical)', 'Staff attribution and timestamps', 'Role-based visibility controls'],
    visual: <CareLogVisual />,
  },
  {
    icon: Users,
    tag: 'Family Feed',
    title: 'Families stay informed without interrupting care.',
    description: 'Every care log entry appears in a clean, readable feed for the right family members. Secure messaging replaces the phone as the default way families communicate.',
    bullets: ['Real-time notifications via app or email', 'Configurable access per family member', 'HIPAA-compliant messaging channel'],
    visual: <FamilyFeedVisual />,
  },
  {
    icon: Calendar,
    tag: 'Care Calendar',
    title: 'Appointments, visits, and milestones in one view.',
    description: 'A shared calendar for therapy sessions, physician visits, family visit windows, and care milestones. Families can request visits without calling the front desk.',
    bullets: ['Staff and family calendar in sync', 'Visit request workflow', 'Appointment reminders to families'],
    visual: <CalendarVisual />,
  },
  {
    icon: Lock,
    tag: 'Document Vault',
    title: 'Critical documents, always at hand.',
    description: 'Store advance directives, insurance cards, powers of attorney, and medication lists in an encrypted, access-controlled vault. No more digging through filing cabinets mid-incident.',
    bullets: ['AES-256 encryption at rest', 'Per-document access controls', 'Full audit trail on every view'],
    visual: <VaultVisual />,
  },
]

export default function FeaturesBento() {
  const { ref, inView } = useSectionInView('-80px')

  return (
    <section ref={ref} className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-w-2xl mb-20"
        >
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Built for how care teams actually work.
          </h2>
        </motion.div>

        {/* Feature rows */}
        <div className="space-y-24 md:space-y-32">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            const isEven = i % 2 === 0
            return (
              <motion.div
                key={feature.tag}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.08, 0.24) }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  !isEven ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Text */}
                <div className={!isEven ? 'lg:col-start-2' : ''}>
                  <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full">
                    <Icon size={14} className="text-primary-600" />
                    <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">{feature.tag}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2.5">
                    {feature.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  {feature.visual}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
