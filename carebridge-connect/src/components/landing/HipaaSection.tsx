import Link from 'next/link'
import {
  Lock,
  ShieldCheck,
  Users,
  Eye,
  ClipboardList,
  FileText,
} from 'lucide-react'

// ─── Trust badge data ─────────────────────────────────────────────────────────
const trustBadges = [
  {
    icon: ShieldCheck,
    label: 'End-to-end encryption',
  },
  {
    icon: Lock,
    label: 'HIPAA compliant',
  },
  {
    icon: Users,
    label: 'Role-based access control',
  },
  {
    icon: Eye,
    label: 'Opt-in only — patient consent required',
  },
  {
    icon: ClipboardList,
    label: 'Full audit logging of all PHI access',
  },
  {
    icon: FileText,
    label: 'BAA available on request',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function HipaaSection() {
  return (
    <section id="hipaa" className="bg-navy-800 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Lock icon badge */}
        <div className="bg-mint-500/20 border border-mint-500/30 rounded-2xl p-4 w-fit mx-auto mb-8">
          <Lock
            size={32}
            className="text-mint-400"
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <h2 className="text-white text-3xl font-bold text-center mb-6">
          HIPAA-compliant by design, not by checkbox
        </h2>

        {/* Body text */}
        <p className="text-navy-300 text-center text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          We never expose raw clinical notes. Only approved, structured data
          points — translated into family-friendly language. Every access event
          is logged. Role-based permissions ensure each person sees only what
          they&apos;re authorized to view.
        </p>

        {/* Trust badges grid — 3 columns × 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <Icon
                size={20}
                className="text-mint-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-white text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom note + link */}
        <p className="text-navy-400 text-center text-sm mt-10">
          Questions about our security posture? We&apos;ll walk you through our
          controls on a call.{' '}
          <Link
            href="/demo"
            className="text-mint-400 hover:text-mint-300 transition-colors duration-150"
          >
            Book a security review →
          </Link>
        </p>

      </div>
    </section>
  )
}
