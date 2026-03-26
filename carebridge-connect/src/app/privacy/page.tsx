import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'CareBridge Connect Privacy Policy — how we collect, use, and protect your data in compliance with HIPAA.',
}

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-information', label: 'How We Use Information' },
  { id: 'hipaa-compliance', label: 'HIPAA Compliance' },
  { id: 'data-sharing', label: 'Data Sharing' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'security', label: 'Security' },
  { id: 'contact', label: 'Contact Us' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/Logo 1 (color).png"
              alt="CareBridge Connect"
              width={180}
              height={45}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-navy-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-navy-500 text-sm">
            Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8">
              <h2 className="text-xs font-semibold text-navy-400 uppercase tracking-widest mb-4">
                On this page
              </h2>
              <ul className="space-y-2">
                {TOC_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-navy-500 hover:text-primary-600 transition-colors block py-1"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="prose-container max-w-3xl">
            {/* Introduction */}
            <section id="introduction" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Introduction
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                CareBridge Connect LLC (&ldquo;CareBridge,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the
                CareBridge Connect platform available at{' '}
                <a href="https://carebridgeconnect.ai" className="text-primary-600 hover:underline">
                  carebridgeconnect.ai
                </a>
                . This Privacy Policy describes how we collect, use, disclose, and
                protect information when you use our platform and services.
              </p>
              <p className="text-navy-700 leading-relaxed">
                CareBridge Connect is a HIPAA-compliant, B2B SaaS platform designed
                for skilled nursing facilities (SNFs) to improve communication between
                care teams, residents, and their families. We take data privacy
                seriously and are committed to protecting all personal and health
                information entrusted to us.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="information-we-collect" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Information We Collect
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We collect the following categories of information in order to provide
                and improve our services:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Facility Information:</strong> Facility name, address,
                    administrator contact details, NPI numbers, CMS certification
                    information, and billing details.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Resident Information:</strong> Resident names, room
                    assignments, admission dates, care status, and other information
                    necessary to provide care updates to authorized family members.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Family Contact Information:</strong> Names, email
                    addresses, phone numbers, and relationship to residents for
                    authorized family members who are invited by the facility.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Care Log Data:</strong> Care notes, activity updates,
                    wellness observations, meal and hydration tracking, vitals
                    summaries, and other care-related entries created by facility staff.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Usage Analytics:</strong> Page views, feature usage
                    patterns, device information, IP addresses, and browser type. This
                    data is used in aggregate to improve our platform and is not linked
                    to protected health information (PHI).
                  </span>
                </li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section id="how-we-use-information" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                How We Use Information
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Providing the Service:</strong> Delivering care updates,
                    enabling secure messaging between staff and families, managing
                    resident timelines, and powering the family portal.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Sending Care Notifications:</strong> Delivering email and
                    in-app notifications to authorized family members when new care
                    updates, photos, or messages are posted by facility staff.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Improving Our Product:</strong> Analyzing aggregate usage
                    patterns to improve user experience, identify bugs, and develop new
                    features that better serve facilities and families.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Billing and Account Management:</strong> Processing
                    payments, managing subscriptions, and communicating with facility
                    administrators about their accounts.
                  </span>
                </li>
              </ul>
            </section>

            {/* HIPAA Compliance */}
            <section id="hipaa-compliance" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                HIPAA Compliance
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                CareBridge Connect operates as a <strong>Business Associate</strong>{' '}
                under the Health Insurance Portability and Accountability Act (HIPAA).
                Our platform is designed to handle Protected Health Information (PHI)
                in compliance with HIPAA Privacy, Security, and Breach Notification
                Rules.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                We enter into a <strong>Business Associate Agreement (BAA)</strong>{' '}
                with every skilled nursing facility that uses our platform. The BAA
                defines how we may access, use, and safeguard PHI on behalf of the
                facility (the Covered Entity).
              </p>
              <p className="text-navy-700 leading-relaxed">
                All PHI is processed and stored in accordance with the HIPAA minimum
                necessary standard. Access to PHI is restricted to authorized
                personnel and systems that require it to perform the contracted
                services. We maintain comprehensive audit logs of all PHI access
                events.
              </p>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Data Sharing
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                <strong>We never sell your data.</strong> We do not sell, rent, or
                trade personal information or PHI to any third party for marketing or
                advertising purposes.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                We share data only with the following service providers, each of which
                is contractually bound to protect your information:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Supabase:</strong> Our database and authentication
                    infrastructure provider. Supabase provides SOC 2 Type II certified,
                    HIPAA-eligible infrastructure with data encrypted at rest and in
                    transit.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Resend:</strong> Our transactional email provider, used to
                    deliver care update notifications and account communications to
                    authorized family members.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Vercel:</strong> Our application hosting provider. Vercel
                    provides SOC 2 Type II certified infrastructure with a global CDN
                    for reliable, fast access.
                  </span>
                </li>
              </ul>
            </section>

            {/* Data Retention */}
            <section id="data-retention" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Data Retention
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We retain data in accordance with the HIPAA minimum necessary standard
                and applicable CMS (Centers for Medicare &amp; Medicaid Services)
                requirements:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Protected Health Information (PHI):</strong> Retained for
                    the duration of the facility&rsquo;s active subscription and for a
                    reasonable period thereafter to allow data export. PHI is permanently
                    deleted upon verified request from the Covered Entity.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Audit Logs:</strong> Retained for a minimum of 7 years in
                    compliance with CMS data retention requirements and HIPAA audit trail
                    standards.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Account and Billing Data:</strong> Retained for the duration
                    of the business relationship and as required by applicable tax and
                    financial regulations.
                  </span>
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Your Rights
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Access:</strong> Request a copy of the personal information
                    we hold about you.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Correction:</strong> Request that we correct any inaccurate
                    or incomplete personal information.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Deletion:</strong> Request that we delete your personal
                    information, subject to applicable legal and regulatory retention
                    requirements.
                  </span>
                </li>
              </ul>
              <p className="text-navy-700 leading-relaxed mt-4">
                To exercise any of these rights, please contact us at{' '}
                <a
                  href="mailto:privacy@carebridgeconnect.ai"
                  className="text-primary-600 hover:underline"
                >
                  privacy@carebridgeconnect.ai
                </a>
                . We will respond to all verified requests within 30 days.
              </p>
            </section>

            {/* Security */}
            <section id="security" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Security
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We implement comprehensive technical and organizational measures to
                protect your information:
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Encryption at Rest:</strong> All data is encrypted at rest
                    using AES-256 encryption.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Encryption in Transit:</strong> All data transmitted between
                    your device and our servers is protected by TLS 1.3 encryption.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>SOC 2 Type II Infrastructure:</strong> Our infrastructure
                    providers (Supabase, Vercel) maintain SOC 2 Type II certification,
                    ensuring rigorous controls over security, availability, and
                    confidentiality.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Access Controls:</strong> Role-based access controls ensure
                    that only authorized users can access specific data. All access to
                    PHI is logged and auditable.
                  </span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Contact Us
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="card-glass p-6 rounded-xl">
                <p className="text-navy-800 font-semibold mb-2">
                  CareBridge Connect LLC
                </p>
                <p className="text-navy-600 text-sm mb-1">
                  Privacy Inquiries:{' '}
                  <a
                    href="mailto:privacy@carebridgeconnect.ai"
                    className="text-primary-600 hover:underline"
                  >
                    privacy@carebridgeconnect.ai
                  </a>
                </p>
                <p className="text-navy-600 text-sm">
                  Website:{' '}
                  <a
                    href="https://carebridgeconnect.ai"
                    className="text-primary-600 hover:underline"
                  >
                    carebridgeconnect.ai
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
