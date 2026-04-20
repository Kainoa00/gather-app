'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, X, Users, FileText, Activity, Calendar, Pill } from 'lucide-react'

interface PCCImportModalProps {
  onClose: () => void
  onImportComplete: () => void
}

interface ImportStep {
  id: string
  label: string
  detail: string
  icon: typeof Users
  durationMs: number
}

const IMPORT_STEPS: ImportStep[] = [
  {
    id: 'connect',
    label: 'Connecting to Point Click Care',
    detail: 'Establishing secure connection...',
    icon: Activity,
    durationMs: 1200,
  },
  {
    id: 'auth',
    label: 'Authenticating facility credentials',
    detail: 'Verifying Sunrise Care Facility (PCC-SUNRISE-4821)',
    icon: FileText,
    durationMs: 1000,
  },
  {
    id: 'census',
    label: 'Pulling resident census',
    detail: '4 active residents found',
    icon: Users,
    durationMs: 1600,
  },
  {
    id: 'meds',
    label: 'Importing medication records',
    detail: 'Syncing 18 active prescriptions...',
    icon: Pill,
    durationMs: 1400,
  },
  {
    id: 'careplans',
    label: 'Importing care plans & diagnoses',
    detail: 'Fetching physician orders and care plans...',
    icon: FileText,
    durationMs: 1300,
  },
  {
    id: 'vitals',
    label: 'Syncing recent vitals',
    detail: 'Importing last 30 days of vitals data...',
    icon: Activity,
    durationMs: 1500,
  },
  {
    id: 'calendar',
    label: 'Loading upcoming appointments',
    detail: 'Retrieving scheduled care events...',
    icon: Calendar,
    durationMs: 1000,
  },
]

type StepStatus = 'pending' | 'active' | 'done'

export default function PCCImportModal({ onClose, onImportComplete }: PCCImportModalProps) {
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(
    Object.fromEntries(IMPORT_STEPS.map((s) => [s.id, 'pending']))
  )
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function runSteps() {
      for (let i = 0; i < IMPORT_STEPS.length; i++) {
        if (cancelled) return
        const step = IMPORT_STEPS[i]

        setStepStatuses((prev) => ({ ...prev, [step.id]: 'active' }))
        await new Promise((r) => setTimeout(r, step.durationMs))

        if (cancelled) return
        setStepStatuses((prev) => ({ ...prev, [step.id]: 'done' }))

        // Small gap between steps
        await new Promise((r) => setTimeout(r, 180))
      }

      if (!cancelled) setFinished(true)
    }

    runSteps()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* PCC logo placeholder */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
            >
              PCC
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Point Click Care Sync</p>
              <p className="text-xs text-slate-400">Sunrise Care Facility · PCC-SUNRISE-4821</p>
            </div>
          </div>
          {finished && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          {IMPORT_STEPS.map((step, index) => {
            const status = stepStatuses[step.id]
            const Icon = step.icon

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: status === 'pending' ? 0.35 : 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                {/* Status icon */}
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                  {status === 'done' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  ) : status === 'active' ? (
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: status === 'done' ? '#166534' : status === 'active' ? '#1e40af' : '#94a3b8',
                    }}
                  >
                    {step.label}
                  </p>
                  {status === 'active' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-blue-400 truncate"
                    >
                      {step.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer / Summary */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-6"
            >
              {/* Summary card */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}
              >
                <p className="text-sm font-semibold text-green-800 mb-2">Import complete</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '4', label: 'Residents imported' },
                    { value: '20', label: 'Care log entries' },
                    { value: '3', label: 'Appointments loaded' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-bold text-green-700">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onImportComplete}
                className="btn-primary w-full text-center"
              >
                View Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {!finished && (
          <div className="px-6 pb-4">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: `${(Object.values(stepStatuses).filter((s) => s === 'done').length / IMPORT_STEPS.length) * 100}%`,
                }}
                transition={{ ease: 'easeOut', duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
