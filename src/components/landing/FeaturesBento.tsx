'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  Clock,
} from 'lucide-react'

// ─── Tag pill component ───────────────────────────────────────────────────────

interface TagPillProps {
  label: string
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'teal'
}

const tagColorMap: Record<TagPillProps['color'], string> = {
  red:    'bg-red-50 text-red-600 border border-red-100',
  blue:   'bg-blue-50 text-blue-600 border border-blue-100',
  green:  'bg-green-50 text-green-700 border border-green-100',
  purple: 'bg-purple-50 text-purple-600 border border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border border-orange-100',
  teal:   'bg-primary-50 text-primary-600 border border-primary-100',
}

function TagPill({ label, color }: TagPillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColorMap[color]}`}
    >
      {label}
    </span>
  )
}

// ─── Card animation variants ──────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

// ─── Timeline event row ───────────────────────────────────────────────────────

function TimelineEvent({
  time,
  label,
  color,
}: {
  time: string
  label: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-mono text-navy-400 w-16 shrink-0">{time}</span>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
      <span className="text-sm text-navy-700">{label}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FeaturesBento() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="bg-cream-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-navy-900 tracking-tight mb-4">
            Everything families need to feel connected
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Real-time visibility into your loved one&apos;s day-to-day care&nbsp;&mdash; without adding work for staff.
          </p>
        </div>

        {/* Bento grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >

          {/* ── Card 1: Event-Based Care Timeline (large) ── */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="group md:col-span-2 card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1 hover:border-primary-200/70"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-1">
                  Event-Based Care Timeline
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed">
                  Time-stamped updates families can actually parse — not vague nurse notes, but discrete documented events. Read-only for families, which matters for liability control.
                </p>
              </div>
            </div>

            {/* Mini timeline preview */}
            <div className="bg-white/60 rounded-xl border border-white/80 px-4 py-3 mb-5 divide-y divide-navy-50">
              <TimelineEvent time="7:02 AM" label="Medication administered" color="bg-blue-400" />
              <TimelineEvent time="9:15 AM" label="PT session completed (30 min)" color="bg-green-400" />
              <TimelineEvent time="10:30 AM" label="Breakfast consumed (75%)" color="bg-orange-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              <TagPill label="Vitals" color="red" />
              <TagPill label="Medications" color="blue" />
              <TagPill label="Activities" color="green" />
              <TagPill label="Mood" color="purple" />
              <TagPill label="Incidents" color="orange" />
            </div>
          </motion.div>

          {/* ── Card 2: Guardrailed AI Chat ── */}
          <motion.div
            variants={cardVariants}
            className="group card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Guardrailed AI Chat
            </h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              &ldquo;When did she last eat?&rdquo; — Families ask plain questions. The AI only queries documented facts. Never interprets. Never advises. Never guesses.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-100 text-mint-600 text-xs font-semibold border border-mint-200">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-500 inline-block" />
              Fact-only · No hallucinations
            </span>
          </motion.div>

          {/* ── Card 3: Progress Summaries ── */}
          <motion.div
            variants={cardVariants}
            className="group card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-mint-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-mint-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Progress Summaries
            </h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              Daily and weekly summaries highlighting trends — mobility improving, pain decreasing, appetite consistency — not just raw events.
            </p>
            {/* Spark bars */}
            <div className="flex items-end gap-1 h-8">
              {[4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-mint-400/70 group-hover:bg-mint-500/80 transition-colors duration-300"
                  style={{ height: `${h * 10}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Card 4: Permissioned Care Circle ── */}
          <motion.div
            variants={cardVariants}
            className="group card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Permissioned Care Circle
            </h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              Patient opts in. Facility controls who sees what. Family members verified. Every access event logged for HIPAA compliance.
            </p>
            {/* Permission tier badges */}
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Primary Contact', level: 'Full access', dot: 'bg-primary-500' },
                { label: 'Adult Child', level: 'Read-only', dot: 'bg-accent-500' },
                { label: 'Extended Family', level: 'Limited', dot: 'bg-navy-300' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-navy-600">
                    <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                    {row.label}
                  </span>
                  <span className="text-navy-400">{row.level}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Card 5: The Vault (large) ── */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="group md:col-span-2 card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1 hover:border-mint-200/70"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl bg-mint-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-mint-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-1">
                  The Vault
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed">
                  Facility info, visiting hours, insurance cards, medications, and care team contacts. Everything families need — with role-based access controls so sensitive data stays protected.
                </p>
              </div>
            </div>

            {/* Document preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Facility Info', icon: '🏥' },
                { label: 'Insurance', icon: '📋' },
                { label: 'Medications', icon: '💊' },
                { label: 'Care Team', icon: '👥' },
                { label: 'Documents', icon: '📄' },
                { label: 'Access Log', icon: '🔒' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2 border border-white/70"
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="text-xs font-medium text-navy-700">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <TagPill label="Facility Info" color="teal" />
              <TagPill label="Insurance" color="blue" />
              <TagPill label="Medications" color="purple" />
              <TagPill label="Care Team" color="green" />
              <TagPill label="Documents" color="orange" />
            </div>
          </motion.div>

          {/* ── Card 6: Visit Tracking ── */}
          <motion.div
            variants={cardVariants}
            className="group card-glass rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Visit Tracking
            </h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              Check in and out with a note. See who has visited and when. Coordinate visit windows so Kenji is never overwhelmed.
            </p>
            {/* Visit log preview */}
            <div className="space-y-2">
              {[
                { name: 'Sarah M.', time: 'Today 2:30 PM', dur: '45 min' },
                { name: 'David M.', time: 'Yesterday 11 AM', dur: '1 hr' },
              ].map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2 border border-white/70"
                >
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{v.name}</p>
                    <p className="text-xs text-navy-400">{v.time}</p>
                  </div>
                  <span className="text-xs text-accent-600 font-medium">{v.dur}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
