'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  PhoneOff,
  Star,
  TrendingUp,
  Shield,
  ClipboardList,
  Calendar,
  MessageSquare,
  Bell,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BenefitRow {
  icon: React.ElementType
  iconClass: string
  text: string
}

// ---------------------------------------------------------------------------
// Benefit row component
// ---------------------------------------------------------------------------

function Benefit({ icon: Icon, iconClass, text }: BenefitRow) {
  return (
    <li className="flex items-start gap-3">
      <Icon
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClass}`}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="text-base leading-relaxed">{text}</span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Facility benefits
// ---------------------------------------------------------------------------

const FACILITY_BENEFITS: BenefitRow[] = [
  {
    icon: PhoneOff,
    iconClass: 'text-red-400',
    text: 'Reduce nursing station call volume by eliminating routine update calls',
  },
  {
    icon: Star,
    iconClass: 'text-amber-400',
    text: 'Drive Google review scores with families who feel genuinely informed',
  },
  {
    icon: TrendingUp,
    iconClass: 'text-mint-400',
    text: 'Improve census through referrals from satisfied families',
  },
  {
    icon: Shield,
    iconClass: 'text-primary-400',
    text: 'Reduce liability exposure with read-only, role-filtered family access',
  },
]

// ---------------------------------------------------------------------------
// Family benefits
// ---------------------------------------------------------------------------

const FAMILY_BENEFITS: BenefitRow[] = [
  {
    icon: ClipboardList,
    iconClass: 'text-primary-600',
    text: 'Care timeline: vitals, medications, activities — updated as they happen',
  },
  {
    icon: Calendar,
    iconClass: 'text-primary-600',
    text: 'Upcoming appointments, therapy sessions, and family visit windows',
  },
  {
    icon: MessageSquare,
    iconClass: 'text-primary-600',
    text: "Ask the AI: 'Did she eat breakfast today?' — answers from documented facts only",
  },
  {
    icon: Bell,
    iconClass: 'text-primary-600',
    text: 'Instant notifications when something important changes',
  },
]

// ---------------------------------------------------------------------------
// Column animation variants
// Cubic-bezier tuple typed as const to satisfy Framer Motion v12 Easing type.
// ---------------------------------------------------------------------------

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const leftVariant = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

const rightVariant = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function AudienceSplit() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={sectionRef}
      aria-label="Value for facilities and families"
      className="grid grid-cols-1 lg:grid-cols-2"
    >
      {/* ------------------------------------------------------------------ */}
      {/* LEFT — Facilities (dark)                                            */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        variants={leftVariant}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="bg-navy-800 py-24 px-8 lg:px-16 flex flex-col justify-center"
      >
        {/* Label */}
        <p className="text-primary-300 uppercase tracking-widest text-xs font-semibold mb-4">
          For Facilities
        </p>

        {/* Heading */}
        <h2 className="text-white text-3xl font-bold mb-3 leading-snug">
          Solve the family call problem once.
        </h2>

        {/* Subheading */}
        <p className="text-navy-300 text-base leading-relaxed mb-8">
          Your clinical outcomes are excellent. Your families just don't know it yet.
        </p>

        {/* Benefits */}
        <ul className="flex flex-col gap-5 mb-10 text-navy-200">
          {FACILITY_BENEFITS.map((b) => (
            <Benefit key={b.text} {...b} />
          ))}
        </ul>

        {/* CTA */}
        <div>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 rounded-xl border border-white text-white font-semibold text-base hover:bg-white hover:text-navy-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
          >
            Request a Demo
          </Link>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT — Families (light)                                            */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        variants={rightVariant}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="bg-cream-100 py-24 px-8 lg:px-16 flex flex-col justify-center"
      >
        {/* Label */}
        <p className="text-accent-600 uppercase tracking-widest text-xs font-semibold mb-4">
          For Families
        </p>

        {/* Heading */}
        <h2 className="text-navy-900 text-3xl font-bold mb-3 leading-snug">
          Never wonder how Mom is doing.
        </h2>

        {/* Subheading */}
        <p className="text-navy-600 text-base leading-relaxed mb-8">
          Stop refreshing the phone waiting for a call back. See what's happening
          in real time.
        </p>

        {/* Benefits */}
        <ul className="flex flex-col gap-5 mb-10 text-navy-700">
          {FAMILY_BENEFITS.map((b) => (
            <Benefit key={b.text} {...b} />
          ))}
        </ul>

        {/* CTA */}
        <div>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-700 shadow-float transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            See a Demo
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
