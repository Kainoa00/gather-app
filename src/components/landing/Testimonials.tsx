'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string
  name: string
  role: string
  org: string
}

/* TODO: Replace with real quotes */
const RAW_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The nursing station phone calls dropped noticeably in the first two weeks. Families who used to call three times a day now check the app instead.',
    name: 'Linda Forsythe',
    role: 'Facility Director',
    org: '120-bed SNF · Kansas City',
  },
  {
    quote:
      'I used to lie awake worrying. Now I check the app before bed and actually sleep. It sounds small but it changed everything for our family.',
    name: 'Megan Cho',
    role: 'Adult Daughter',
    org: 'Family Member',
  },
  {
    quote:
      'We were skeptical about adding another platform. But there was truly nothing to set up on our end. It just works.',
    name: 'Patricia Ruiz',
    role: 'Director of Nursing',
    org: 'Assisted Living · Phoenix',
  },
  {
    quote:
      'Our Google reviews improved. Families who feel informed are families who advocate for your facility.',
    name: 'James Whitmore',
    role: 'Facility Administrator',
    org: 'Continuing Care Community',
  },
  {
    quote:
      'My siblings and I live in three different states. CareBridge Connect means we\'re all on the same page about Dad\'s care without playing phone tag.',
    name: 'Derek Santos',
    role: 'Son',
    org: 'Family Member',
  },
  {
    quote:
      'We piloted it at one building and had every other building director asking for it within 60 days.',
    name: 'Olivia Marsh',
    role: 'VP Operations',
    org: 'Regional SNF Group',
  },
]

// Duplicate to create seamless infinite loop
const TESTIMONIALS = [...RAW_TESTIMONIALS, ...RAW_TESTIMONIALS]

// ─── Single card ──────────────────────────────────────────────────────────────

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-80 shrink-0 flex flex-col gap-4">
      {/* Stars */}
      <div className="flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-white text-sm leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Attribution */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
        <p className="text-xs text-navy-400 mt-0.5">{testimonial.role}</p>
        <p className="text-xs text-navy-400">{testimonial.org}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-navy-900 py-24 overflow-hidden">
      {/* Inline keyframe — keeps animation co-located with component */}
      <style>{`
        @keyframes testimonial-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonials-track {
          animation: testimonial-scroll 42s linear infinite;
        }
        .testimonials-viewport:hover .testimonials-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Trusted by care teams and families
          </h2>
          <p className="text-navy-400 text-base">
            Early access facilities report measurable impact in the first 30 days.
          </p>
        </motion.div>
      </div>

      {/* Full-bleed carousel — sits outside the inner container so it bleeds edge to edge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Fade-out masks on left and right edges */}
        <div
          className="relative testimonials-viewport"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          <div className="testimonials-track flex gap-5 w-max">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
