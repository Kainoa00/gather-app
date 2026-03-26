'use client'

import { motion } from 'framer-motion'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE } from '@/lib/motion'

const STATS = [
  {
    number: '60%',
    label: 'Reduction in family call volume',
    detail: 'Average across first 90 days',
  },
  {
    number: '2–3 hrs',
    label: 'Nursing time reclaimed per shift',
    detail: 'Redirected to direct patient care',
  },
  {
    number: '4.2★',
    label: 'Average CMS star rating improvement',
    detail: 'Among facilities in pilot program',
  },
]

export default function ProblemStats() {
  const { ref, inView } = useSectionInView('-80px')

  return (
    <section
      ref={ref}
      className="bg-slate-900 py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16"
        >
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            The numbers
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-slate-700">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              className="py-10 md:py-0 md:px-12 first:md:pl-0 last:md:pr-0 border-b border-slate-800 md:border-b-0 last:border-b-0"
            >
              <div className="text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none mb-4">
                {stat.number}
              </div>
              <div className="text-lg font-medium text-slate-200 mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-slate-500">
                {stat.detail}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
          className="mt-16 pt-12 border-t border-slate-800"
        >
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Every family call that doesn&apos;t happen is a nurse who stayed with a patient instead.{' '}
            <span className="text-slate-200">
              CareBridge Connect makes that possible at scale.
            </span>
          </p>
        </motion.div>

      </div>
    </section>
  )
}
