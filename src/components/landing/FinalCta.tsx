'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE } from '@/lib/motion'

export default function FinalCta() {
  const { ref, inView } = useSectionInView('-80px')

  return (
    <section
      ref={ref}
      className="bg-navy-900 py-32 md:py-40"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            Ready to give your nurses<br className="hidden sm:block" /> their afternoons back?
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-12 max-w-xl mx-auto">
            Start a 30-day pilot at your facility. White-glove setup included. No long-term contracts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy-900 px-8 py-4 rounded-xl text-base font-bold hover:bg-slate-100 transition-all duration-200 min-h-[52px] shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Schedule a Demo
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-400 hover:text-white transition-colors min-h-[52px]"
            >
              Explore the product
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-600">
            Trusted by skilled nursing facilities across the US · HIPAA Certified · SOC 2 Type II
          </p>
        </motion.div>
      </div>
    </section>
  )
}
