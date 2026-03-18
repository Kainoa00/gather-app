'use client'

import { motion } from 'framer-motion'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE } from '@/lib/motion'

// ─── Step visuals (defined before STEPS to avoid hoisting issues) ──────────────

function StepOneVisual() {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Quick Entry
        </div>
        {/* Log entry form mockup */}
        <div className="space-y-3">
          <div>
            <div className="h-2.5 w-20 bg-slate-300 rounded mb-1.5" />
            <div className="h-10 bg-white rounded-lg border border-slate-200 flex items-center px-3 gap-2">
              <div className="w-3 h-3 rounded bg-blue-200" />
              <div className="h-2.5 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div>
            <div className="h-2.5 w-28 bg-slate-300 rounded mb-1.5" />
            <div className="h-20 bg-white rounded-lg border border-slate-200 p-3 space-y-2">
              <div className="h-2 w-full bg-slate-100 rounded" />
              <div className="h-2 w-3/4 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-9 flex-1 rounded-lg bg-primary-600 flex items-center justify-center">
              <div className="h-2.5 w-20 bg-primary-300 rounded" />
            </div>
            <div className="h-9 w-24 rounded-lg bg-slate-100 border border-slate-200" />
          </div>
        </div>
        {/* "Families notified" badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
          3 family members notified instantly
        </div>
      </div>
    </div>
  )
}

function StepTwoVisual() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      {/* Mobile-style notification */}
      <div className="bg-slate-900 px-5 py-4">
        <div className="text-[10px] font-medium text-slate-400 mb-3 uppercase tracking-wide">
          Family View · Mobile
        </div>
        <div className="space-y-2">
          {[
            { color: 'bg-blue-400', text: 'Physical therapy completed · 9:15 AM' },
            { color: 'bg-green-400', text: 'Ate well at breakfast · 8:00 AM' },
            { color: 'bg-purple-400', text: 'Dr. Chen notes reviewed · Yesterday' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-slate-800 rounded-xl p-3">
              <div className={`w-2 h-2 rounded-full ${item.color} shrink-0 mt-1`} />
              <div className="flex-1">
                <div className="h-2.5 w-full max-w-[160px] bg-slate-300 rounded mb-1" />
                <div className="h-2 w-12 bg-slate-600 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-3 flex items-center gap-2 border-t border-slate-100 bg-slate-50">
        <div className="w-5 h-5 rounded-full bg-slate-300" />
        <div className="text-xs text-slate-500">
          Logged in as <span className="font-semibold text-slate-700">Sarah Wilson</span> (Daughter)
        </div>
      </div>
    </div>
  )
}

function StepThreeVisual() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Director Dashboard
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Call volume', value: '−58%', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Family satisfaction', value: '94%', color: 'text-primary-700', bg: 'bg-primary-50' },
            { label: 'Active families', value: '47 / 52', color: 'text-slate-800', bg: 'bg-slate-50' },
            { label: 'CMS target', value: '4.5★', color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-3 ${item.bg}`}>
              <div className={`text-base font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
        {/* Mini bar chart */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 mb-2">Call volume — last 8 weeks</div>
          <div className="flex items-end gap-1.5 h-10">
            {[10, 9, 8, 7, 6, 5, 4, 3].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h * 10}%` }}
                className={`flex-1 rounded-sm ${i < 4 ? 'bg-slate-200' : 'bg-primary-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step data (defined after visuals) ────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Deploy in a day, zero EHR disruption',
    description:
      "CareBridge Connect runs alongside your existing workflows. No EHR integration required. Staff log care updates from any device — the same way they'd add a note to the chart.",
    visual: <StepOneVisual />,
  },
  {
    number: '02',
    title: 'Families see updates the moment they happen',
    description:
      'Every care log entry, appointment, and milestone is immediately visible to the right family members — based on the access level you set. Families stop calling because they already know.',
    visual: <StepTwoVisual />,
  },
  {
    number: '03',
    title: 'Directors see exactly what changed',
    description:
      'Real-time dashboards surface call volume trends, engagement scores, and family satisfaction — giving directors the data they need to improve CMS ratings and staff retention.',
    visual: <StepThreeVisual />,
  },
]

// ─── Main component ────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const { ref, inView } = useSectionInView('-80px')

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="bg-white py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-w-2xl mb-20"
        >
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Live in 24 hours. Results in 30 days.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24 md:space-y-32">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.12 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                i % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Text */}
              <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="text-7xl font-black text-slate-100 leading-none mb-6 select-none">
                  {step.number}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {/* Visual */}
              <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
