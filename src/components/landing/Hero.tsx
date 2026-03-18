'use client'

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

// ─── Headline copy split into individual words for stagger reveal ───────────
const LINE_ONE = 'Your nurses spend 2–3 hours per shift on family calls.'
const LINE_TWO = 'CareBridge Connect gives those hours back.'

const line1Words = LINE_ONE.split(' ')
const line2Words = LINE_TWO.split(' ')

// ─── Animation variants ──────────────────────────────────────────────────────
const wordVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const wordVariantsReduced: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
}

const line2ContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2 + line1Words.length * 0.06 + 0.1,
    },
  },
}

// Custom variant for fade-up with per-element delay via `custom` prop
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
}

const fadeUpVariantsReduced: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }),
}

// ─── Gradient orb config ─────────────────────────────────────────────────────
const orbs = [
  {
    className: 'absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full',
    style: { background: 'radial-gradient(circle, rgba(27,71,152,0.13) 0%, transparent 70%)' },
    animate: { scale: [1, 1.12, 1], x: [0, 30, 0], y: [0, -20, 0] },
    transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    className: 'absolute -top-16 right-0 w-[480px] h-[480px] rounded-full',
    style: { background: 'radial-gradient(circle, rgba(27,163,198,0.10) 0%, transparent 70%)' },
    animate: { scale: [1, 1.08, 1], x: [0, -25, 0], y: [0, 15, 0] },
    transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 },
  },
  {
    className: 'absolute top-1/2 left-1/4 w-[360px] h-[360px] rounded-full',
    style: { background: 'radial-gradient(circle, rgba(27,71,152,0.07) 0%, transparent 70%)' },
    animate: { scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -30, 0] },
    transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' as const, delay: 4 },
  },
  {
    className: 'absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full',
    style: { background: 'radial-gradient(circle, rgba(27,163,198,0.08) 0%, transparent 70%)' },
    animate: { scale: [1, 1.06, 1], x: [0, -15, 0], y: [0, 20, 0] },
    transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 },
  },
]

// ─── Trust chips ─────────────────────────────────────────────────────────────
const trustChips = ['HIPAA Compliant', 'No EHR Changes', 'Setup in 48hrs']

// ─── Component ───────────────────────────────────────────────────────────────
export default function Hero() {
  const shouldReduceMotion = useReducedMotion()

  const activeWordVariants = shouldReduceMotion ? wordVariantsReduced : wordVariants
  const activeFadeUpVariants = shouldReduceMotion ? fadeUpVariantsReduced : fadeUpVariants

  // Timing for elements that appear after the headline finishes
  const headlineWordCount = line1Words.length + line2Words.length
  const subheadDelay = shouldReduceMotion ? 0 : 0.2 + headlineWordCount * 0.06 + 0.25
  const ctaDelay = subheadDelay + 0.35
  const chipsDelay = ctaDelay + 0.2

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Animated gradient orbs */}
      {!shouldReduceMotion &&
        orbs.map((orb, i) => (
          <motion.div
            key={i}
            className={orb.className}
            style={{ ...orb.style, filter: 'blur(64px)', pointerEvents: 'none' }}
            animate={orb.animate}
            transition={orb.transition}
            aria-hidden="true"
          />
        ))}

      {/* Static fallback orbs for reduced-motion preference */}
      {shouldReduceMotion &&
        orbs.map((orb, i) => (
          <div
            key={i}
            className={orb.className}
            style={{ ...orb.style, filter: 'blur(64px)', pointerEvents: 'none' }}
            aria-hidden="true"
          />
        ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">

        {/* Badge pill */}
        <motion.div
          variants={activeFadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-navy-200 shadow-soft text-sm font-medium text-navy-700 mb-8"
        >
          <span
            className="w-2 h-2 rounded-full bg-mint-500 flex-shrink-0"
            aria-hidden="true"
          />
          Built for assisted living · HIPAA-compliant
        </motion.div>

        {/* Headline — word-by-word stagger */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          {/* Line 1 — navy */}
          <motion.span
            className="block text-navy-900 mb-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-label={LINE_ONE}
          >
            {line1Words.map((word, i) => (
              <motion.span
                key={i}
                variants={activeWordVariants}
                className="inline-block mr-[0.3em] last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </motion.span>

          {/* Line 2 — primary-600 */}
          <motion.span
            className="block text-primary-600"
            variants={line2ContainerVariants}
            initial="hidden"
            animate="visible"
            aria-label={LINE_TWO}
          >
            {line2Words.map((word, i) => (
              <motion.span
                key={i}
                variants={activeWordVariants}
                className="inline-block mr-[0.3em] last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
        </h1>

        {/* Subheading */}
        <motion.p
          variants={activeFadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={subheadDelay}
          className="text-navy-600 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A HIPAA-compliant communication bridge between care teams and families — with zero workflow change for staff.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={activeFadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={ctaDelay}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Link
            href="/demo"
            className="inline-flex items-center justify-center bg-primary-600 text-white rounded-xl px-8 py-4 font-semibold text-lg hover:bg-primary-700 min-h-[52px] shadow-float transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Request a Demo
          </Link>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#features')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }}
            className="inline-flex items-center justify-center border-2 border-navy-200 text-navy-700 rounded-xl px-8 py-4 font-semibold text-lg hover:border-primary-300 hover:text-primary-600 min-h-[52px] bg-white/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            See It in Action
          </a>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          variants={activeFadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={chipsDelay}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {trustChips.map((chip) => (
            <div
              key={chip}
              className="flex items-center gap-2 text-sm font-medium text-navy-600"
            >
              <CheckCircle2
                size={16}
                className="text-mint-500 flex-shrink-0"
                aria-hidden="true"
              />
              {chip}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
