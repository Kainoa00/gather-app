'use client'

import Link from 'next/link'
import { motion, useInView, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'

// ─── Animation variants ───────────────────────────────────────────────────────
const sectionVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: 'easeInOut' },
  },
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
}

// Animated border gradient — inline animate prop avoids Variants type conflict
const BORDER_ANIMATE = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: { duration: 6, ease: 'linear' as const, repeat: Infinity },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="gradient-mesh-bg py-28 px-4 sm:px-6"
    >
      {/* Fade + scale-up on scroll into view */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-3xl mx-auto"
      >
        {/* Animated gradient border ring */}
        <motion.div
          animate={BORDER_ANIMATE}
          className="rounded-3xl p-[2px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(27,71,152,0.6), rgba(27,163,198,0.4), rgba(74,222,128,0.3), rgba(27,71,152,0.6))',
            backgroundSize: '300% 300%',
          }}
          aria-hidden="true"
        >
          {/* Inner card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-12 sm:p-16 text-center">

            {/* Heading */}
            <motion.h2
              variants={childVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.15}
              className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-6"
            >
              Ready to give your nurses their afternoons back?
            </motion.h2>

            {/* Subheading */}
            <motion.p
              variants={childVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.3}
              className="text-navy-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            >
              CareBridge Connect exists to ensure that families never have to
              wonder how their loved one is doing — and that nursing staff never
              have to answer the same question twice.
            </motion.p>

            {/* CTA button */}
            <motion.div
              variants={childVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.45}
              className="flex flex-col items-center gap-4"
            >
              <Link
                href="/demo"
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-10 py-4 font-semibold text-lg min-h-[52px] inline-flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                Schedule a Demo
                <ArrowRight size={20} aria-hidden="true" />
              </Link>

              {/* Trust line */}
              <p className="text-navy-400 text-sm">
                30-day pilot · No long-term contracts · White-glove setup
              </p>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
