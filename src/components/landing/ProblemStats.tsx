'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { PhoneOff, TrendingDown, AlertCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  rawValue: number
  prefix: string
  suffix: string
  label: string
  icon: React.ElementType
  iconClass: string
}

// ---------------------------------------------------------------------------
// Count-up hook
// ---------------------------------------------------------------------------

function useCountUp(
  target: number,
  isActive: boolean,
  duration = 1800
): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, target, duration])

  return count
}

// ---------------------------------------------------------------------------
// Individual stat card with isolated count-up
// ---------------------------------------------------------------------------

interface StatCardProps {
  stat: StatCard
  index: number
  sectionInView: boolean
}

function AnimatedStatCard({ stat, index, sectionInView }: StatCardProps) {
  const count = useCountUp(stat.rawValue, sectionInView, 1800)
  const Icon = stat.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-4"
    >
      {/* Icon */}
      <div className="flex items-center justify-between">
        <Icon className={`w-7 h-7 ${stat.iconClass}`} strokeWidth={1.75} />
      </div>

      {/* Animated number */}
      <div className="text-5xl font-extrabold text-white tabular-nums leading-none">
        {stat.prefix}
        {count}
        {stat.suffix}
      </div>

      {/* Label */}
      <p className="text-navy-300 text-base leading-relaxed">{stat.label}</p>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Stat definitions
// Note: rawValue is the numeric portion used for animation. prefix/suffix
// reconstruct the display string.
// ---------------------------------------------------------------------------

const STATS: StatCard[] = [
  {
    rawValue: 3,
    prefix: '2–',
    suffix: ' hrs',
    label: 'per nurse shift spent answering family phone calls',
    icon: PhoneOff,
    iconClass: 'text-red-400',
  },
  {
    rawValue: 27,
    prefix: '',
    suffix: '%',
    label: 'of families dissatisfied with communication at their loved one\'s facility',
    icon: TrendingDown,
    iconClass: 'text-amber-400',
  },
  {
    rawValue: 29,
    prefix: 'Only ',
    suffix: '%',
    label: 'of families report being adequately informed of care changes',
    icon: AlertCircle,
    iconClass: 'text-orange-400',
  },
]

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function ProblemStats() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={sectionRef}
      className="bg-navy-800 py-20"
      aria-labelledby="problem-stats-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <h2
            id="problem-stats-heading"
            className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            The cost of poor family communication is measurable
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto leading-relaxed">
            These aren't soft metrics — they're operational costs that show up in
            staffing, occupancy, and reviews.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {STATS.map((stat, i) => (
            <AnimatedStatCard
              key={stat.label}
              stat={stat}
              index={i}
              sectionInView={isInView}
            />
          ))}
        </div>

        {/* Full-width callout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-primary-600/20 border border-primary-400/30 rounded-2xl p-6 text-center"
        >
          <p className="text-white font-medium text-lg leading-relaxed">
            CareBridge Connect resolves all three — without adding a single task
            to your nursing staff's workflow.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
