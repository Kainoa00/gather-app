'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { EASE } from '@/lib/motion'

// ─── Product mockup ────────────────────────────────────────────────────────────
// Pure CSS/Tailwind dashboard preview — looks like the real product
function ProductMockup() {
  return (
    <div className="relative">
      {/* Browser chrome + app */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden bg-white"
        style={{ boxShadow: '0 32px 80px -16px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.06)' }}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 h-10 bg-slate-50/80 border-b border-slate-200/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 bg-slate-200/70 rounded-md max-w-[200px] flex items-center px-2">
              <span className="text-[10px] text-slate-400 font-mono">carebridgeconnect.ai/app</span>
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: '400px' }}>
          {/* Sidebar */}
          <div className="w-44 bg-slate-50/60 border-r border-slate-100 p-3 flex flex-col gap-0.5 shrink-0">
            {/* Logo in sidebar */}
            <div className="px-2 py-2 mb-2">
              <div className="h-5 w-28 bg-navy-800/80 rounded-md" />
            </div>
            {[
              { label: 'Dashboard', active: false, color: 'bg-slate-300' },
              { label: 'Care Log', active: true, color: 'bg-primary-500' },
              { label: 'Calendar', active: false, color: 'bg-slate-300' },
              { label: 'Care Circle', active: false, color: 'bg-slate-300' },
              { label: 'Vault', active: false, color: 'bg-slate-300' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${
                  item.active ? 'bg-primary-50' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className={`w-4 h-4 rounded ${item.color} shrink-0`} />
                <span className={`text-[11px] font-medium ${item.active ? 'text-primary-700' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </div>
            ))}
            {/* Divider + user */}
            <div className="mt-auto pt-3 border-t border-slate-200 flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-full bg-primary-200 shrink-0" />
              <div>
                <div className="h-2 w-16 bg-slate-400 rounded" />
                <div className="h-1.5 w-10 bg-slate-300 rounded mt-1" />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden bg-white p-4">
            {/* Patient header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-4 w-36 bg-slate-800 rounded" />
                  <div className="px-1.5 py-0.5 bg-green-100 rounded text-[9px] font-semibold text-green-700">Active</div>
                </div>
                <div className="h-2.5 w-44 bg-slate-300 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100" />
                <div className="w-7 h-7 rounded-lg bg-primary-100" />
              </div>
            </div>

            {/* Stat mini-cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Days in care', value: '47', color: 'text-navy-800' },
                { label: 'Family visits', value: '12', color: 'text-primary-700' },
                { label: 'Log entries', value: '89', color: 'text-green-700' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Care log entries */}
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Today&apos;s Log</div>
            {[
              { time: '9:15 AM', text: 'Physical therapy — patient completed full session independently', dot: 'bg-blue-400', wide: 'w-48' },
              { time: '11:30 AM', text: 'Lunch — good appetite, ate 90% of meal', dot: 'bg-green-400', wide: 'w-40' },
              { time: '2:00 PM', text: 'Family visit — daughter Sarah, 45 minutes', dot: 'bg-purple-400', wide: 'w-44' },
            ].map((entry, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2 border-t border-slate-50 first:border-0">
                <div className={`w-2 h-2 rounded-full ${entry.dot} shrink-0 mt-1`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`h-2.5 ${entry.wide} bg-slate-700 rounded`} />
                    <div className="h-2 w-10 bg-slate-300 rounded shrink-0" />
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating notification — family notified */}
      <motion.div
        initial={{ opacity: 0, y: 12, x: -4 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.0 }}
        className="absolute -bottom-5 -left-4 bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xl"
        style={{ boxShadow: '0 8px 32px -8px rgba(15,23,42,0.16)' }}
      >
        <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
          <CheckCircle size={16} className="text-green-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-none mb-0.5">Family notified</p>
          <p className="text-xs text-slate-400">Therapy update sent · just now</p>
        </div>
      </motion.div>

      {/* Floating stat chip — top right */}
      <motion.div
        initial={{ opacity: 0, y: -12, x: 4 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.2 }}
        className="absolute -top-5 -right-4 bg-navy-800 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
      >
        <div className="text-right">
          <p className="text-lg font-bold leading-none">−62%</p>
          <p className="text-xs text-slate-300 mt-0.5">family call volume</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center bg-white overflow-hidden pt-16">
      {/* Subtle dot grid — very faint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
        }}
      />
      {/* Gradient overlay to fade the grid toward center */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-white/80 to-primary-50/30" />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            {/* Tag label */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
              <span className="text-xs font-semibold text-primary-700 tracking-wide uppercase">
                HIPAA-Compliant · Built for SNFs
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[64px] xl:text-7xl font-bold tracking-tight text-slate-900 leading-[1.06] mb-6">
              Your nurses deserve{' '}
              <span className="text-primary-700">better mornings.</span>
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-lg">
              CareBridge Connect eliminates the 2–3 hours per shift nursing staff spend on family calls — replaced with real-time updates families check on their own.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 bg-navy-800 text-white px-7 py-4 rounded-xl text-base font-semibold hover:bg-navy-700 transition-all duration-200 min-h-[52px] shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-800 focus-visible:ring-offset-2"
              >
                Request a Demo
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-h-[52px]"
              >
                See how it works
              </button>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-green-500" />
                HIPAA Certified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                30-day pilot · no commitment
              </span>
            </div>
          </motion.div>

          {/* Right — product mockup */}
          <div className="hidden lg:block">
            <ProductMockup />
          </div>

        </div>
      </div>
    </section>
  )
}
