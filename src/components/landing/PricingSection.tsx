'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSectionInView } from '@/lib/hooks/useSectionInView'
import { EASE, makeContainerVariants, fadeUpVariants } from '@/lib/motion'
import { CheckCircle2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingTier {
  id: string
  badge: string
  badgeHighlighted: boolean
  name: string
  residents: string
  features: string[]
  ctaLabel: string
  ctaVariant: 'outline' | 'primary'
  highlighted: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIERS: PricingTier[] = [
  {
    id: 'starter',
    badge: 'For smaller facilities',
    badgeHighlighted: false,
    name: 'Starter',
    residents: 'Up to 30 residents',
    features: [
      'Care Log & Timeline',
      'Family feed & posts',
      'Secure Vault',
      'Visit tracking',
      'Mobile app access',
      'Email support',
    ],
    ctaLabel: 'Contact Us',
    ctaVariant: 'outline',
    highlighted: false,
  },
  {
    id: 'professional',
    badge: 'Most popular',
    badgeHighlighted: true,
    name: 'Professional',
    residents: 'Up to 100 residents',
    features: [
      'Everything in Starter',
      'AI Family Chat (guardrailed)',
      'Wellness & vitals trends',
      'Notification center',
      'Priority support',
      'Analytics dashboard',
    ],
    ctaLabel: 'Contact Us',
    ctaVariant: 'primary',
    highlighted: true,
  },
  {
    id: 'enterprise',
    badge: 'For multi-facility groups',
    badgeHighlighted: false,
    name: 'Enterprise',
    residents: 'Unlimited residents',
    features: [
      'Everything in Professional',
      'Multi-facility management',
      'Custom EHR integration',
      'Dedicated success manager',
      'Custom onboarding',
      'SLA guarantee',
      'BAA included',
    ],
    ctaLabel: 'Contact Us',
    ctaVariant: 'outline',
    highlighted: false,
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = makeContainerVariants(0.1)

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" />
      <span className="text-sm text-navy-700">{text}</span>
    </li>
  )
}

// ─── Pricing card ─────────────────────────────────────────────────────────────

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <motion.div
      variants={cardVariants}
      className={[
        'relative flex flex-col rounded-2xl p-7 lg:p-8 transition-all duration-300',
        tier.highlighted
          ? 'card-glass ring-2 ring-primary-400 shadow-float lg:scale-105 z-10'
          : 'card-glass hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-1',
      ].join(' ')}
    >
      {/* Badge */}
      <div className="mb-5">
        <span
          className={[
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
            tier.highlighted
              ? 'bg-primary-600 text-white'
              : 'bg-navy-100 text-navy-600',
          ].join(' ')}
        >
          {tier.badge}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-navy-900 mb-1">{tier.name}</h3>

      {/* Residents */}
      <p className="text-sm font-medium text-navy-500 mb-6 pb-6 border-b border-navy-100">
        {tier.residents}
      </p>

      {/* Feature list */}
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {tier.features.map((f) => (
          <FeatureRow key={f} text={f} />
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/demo"
        className={[
          'inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          tier.ctaVariant === 'primary'
            ? 'bg-primary-600 text-white shadow-float hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg'
            : 'border border-navy-200 text-navy-800 bg-white/60 hover:border-primary-300 hover:text-primary-700 hover:bg-white',
        ].join(' ')}
      >
        {tier.ctaLabel}
      </Link>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PricingSection() {
  const { ref: gridRef, inView: isInView } = useSectionInView('-80px')

  return (
    <section id="pricing" className="bg-cream-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-navy-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-navy-600 text-lg leading-relaxed">
            All plans include unlimited family members, HIPAA-compliant
            infrastructure, and white-glove onboarding. Pricing based on facility
            size.
          </p>
        </motion.div>

        {/* Pricing cards grid */}
        <motion.div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
        >
          {TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </motion.div>

        {/* Footnote */}
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center text-sm text-navy-500 mt-10"
        >
          All plans include a 30-day pilot with white-glove setup. No long-term contracts.
        </motion.p>

      </div>
    </section>
  )
}
