'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ClipboardList, Sparkles, Heart, ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Step {
  number: number
  icon: React.ElementType
  colorClass: string
  iconBgClass: string
  title: string
  description: string
}

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

const STEPS: Step[] = [
  {
    number: 1,
    icon: ClipboardList,
    colorClass: 'text-primary-600',
    iconBgClass: 'bg-primary-100',
    title: 'Staff Documents Care',
    description:
      'Your team continues using PointClickCare, MatrixCare, or your existing EHR. No new logins. No new forms. No workflow changes whatsoever.',
  },
  {
    number: 2,
    icon: Sparkles,
    colorClass: 'text-accent-600',
    iconBgClass: 'bg-accent-100',
    title: 'We Translate It',
    description:
      'Approved, structured data points are automatically translated into plain-English updates, care timelines, and progress summaries — filtered by family member permissions.',
  },
  {
    number: 3,
    icon: Heart,
    colorClass: 'text-mint-600',
    iconBgClass: 'bg-mint-100',
    title: 'Families Feel Informed',
    description:
      'Families stop calling the nursing station. They trust your facility more. They leave positive reviews. Your staff gets their afternoons back.',
  },
]

// ---------------------------------------------------------------------------
// Animated arrow connector (desktop only)
// ---------------------------------------------------------------------------

function ArrowConnector({ delay }: { delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <div ref={ref} className="hidden lg:flex items-center justify-center flex-shrink-0 px-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <ArrowRight className="w-7 h-7 text-navy-300" strokeWidth={1.5} />
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual step card
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: Step
  index: number
  sectionInView: boolean
}

function StepCard({ step, index, sectionInView }: StepCardProps) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card-glass rounded-2xl p-8 relative overflow-hidden flex-1 min-w-0"
    >
      {/* Faded step numeral — top-right decorative */}
      <span
        aria-hidden="true"
        className="absolute top-4 right-5 text-8xl font-extrabold text-navy-900/5 select-none leading-none pointer-events-none"
      >
        {step.number}
      </span>

      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${step.iconBgClass}`}
      >
        <Icon className={`w-6 h-6 ${step.colorClass}`} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <h3 className="text-navy-900 text-xl font-bold mb-3">{step.title}</h3>
      <p className="text-navy-600 text-base leading-relaxed">{step.description}</p>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="bg-cream-100 py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-5"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold uppercase tracking-widest border border-primary-200">
            Zero workflow change for staff
          </span>
        </motion.div>

        {/* Heading block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2
            id="how-it-works-heading"
            className="text-4xl font-bold text-navy-900 mb-4 tracking-tight"
          >
            How It Works
          </h2>
          <p className="text-navy-600 text-lg max-w-xl mx-auto leading-relaxed">
            Healthcare already documents everything. CareBridge Connect translates it.
          </p>
        </motion.div>

        {/* Steps + connectors */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.title} className="contents">
              <StepCard step={step} index={i} sectionInView={isInView} />
              {/* Arrow between steps, not after the last */}
              {i < STEPS.length - 1 && (
                <ArrowConnector delay={i * 0.18 + 0.55} />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
