'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE } from '@/lib/motion'

interface Testimonial {
  quote: string
  name: string
  title: string
  org: string
  initials: string
  accentColor: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Phone calls to the nursing station dropped noticeably in the first two weeks. Families who used to call three times a day now just open the app.',
    name: 'Linda Martinez',
    title: 'Director of Nursing',
    org: 'Sunrise Care Center',
    initials: 'LM',
    accentColor: 'bg-blue-100 text-blue-700',
  },
  {
    quote:
      'I can check on my mom from across the country and see exactly how her day went. It removed so much of the anxiety of not knowing.',
    name: 'James Chen',
    title: 'Family Member',
    org: 'Son of resident, Room 208',
    initials: 'JC',
    accentColor: 'bg-green-100 text-green-700',
  },
  {
    quote:
      'Our CMS star rating improved and I can directly point to CareBridge as the reason. Family communication is now a competitive advantage for us.',
    name: 'Robert Ashford',
    title: 'Facility Administrator',
    org: 'Oakwood Long-Term Care',
    initials: 'RA',
    accentColor: 'bg-purple-100 text-purple-700',
  },
]

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const { ref, inView } = useSectionInView('-60px')
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
      className="flex flex-col bg-white border border-slate-200 rounded-2xl p-8 hover:border-slate-300 hover:shadow-sm transition-all duration-300"
    >
      {/* Large quote mark */}
      <div className="text-5xl font-serif text-slate-200 leading-none mb-6 select-none">&ldquo;</div>

      {/* Quote */}
      <blockquote className="flex-1 text-slate-700 text-base leading-relaxed mb-8">
        {t.quote}
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
        <div
          className={`w-10 h-10 rounded-full ${t.accentColor} flex items-center justify-center text-sm font-bold shrink-0`}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{t.name}</div>
          <div className="text-xs text-slate-500">
            {t.title} · {t.org}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const { ref, inView } = useSectionInView('-80px')

  return (
    <section ref={ref} className="bg-slate-50 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-w-xl mb-16"
        >
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-4">
            What people say
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Heard from the floor.
          </h2>
        </motion.div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
