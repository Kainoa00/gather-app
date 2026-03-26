import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'CareBridge Connect Terms of Service — the agreement governing use of our HIPAA-compliant platform for skilled nursing facilities.',
}

const TOC_ITEMS = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'description', label: 'Description of Service' },
  { id: 'account-registration', label: 'Account Registration' },
  { id: 'hipaa-phi', label: 'HIPAA and PHI' },
  { id: 'permitted-use', label: 'Permitted Use & Restrictions' },
  { id: 'payment-terms', label: 'Payment Terms' },
  { id: 'data-ownership', label: 'Data Ownership' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Us' },
]

export default function TermsPage() {
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
            Terms of Service
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
            {/* Acceptance of Terms */}
            <section id="acceptance" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Acceptance of Terms
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                By accessing or using the CareBridge Connect platform
                (&ldquo;Service&rdquo;), you agree to be bound by these Terms of
                Service (&ldquo;Terms&rdquo;). If you are entering into these Terms on
                behalf of a skilled nursing facility or other organization, you
                represent that you have the authority to bind that organization to these
                Terms.
              </p>
              <p className="text-navy-700 leading-relaxed">
                If you do not agree with these Terms, you may not access or use the
                Service. These Terms constitute a legally binding agreement between you
                (and your organization, if applicable) and CareBridge Connect LLC.
              </p>
            </section>

            {/* Description of Service */}
            <section id="description" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Description of Service
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                CareBridge Connect is a HIPAA-compliant, cloud-based communication
                platform designed for skilled nursing facilities. The Service enables
                care teams to share real-time care updates, photos, and messages with
                authorized family members of residents.
              </p>
              <p className="text-navy-700 leading-relaxed">
                Key features include care log timelines, family notification feeds,
                secure document vaults, visit tracking, wellness trend reporting, and
                AI-powered family chat with clinical guardrails. The specific features
                available depend on your subscription plan.
              </p>
            </section>

            {/* Account Registration */}
            <section id="account-registration" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Account Registration and Facility Agreements
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                To use the Service, a skilled nursing facility must complete the
                registration process and execute a Facility Agreement, which includes a
                Business Associate Agreement (BAA) as required by HIPAA. Individual
                users (staff and family members) are invited and provisioned by the
                facility administrator.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account. You
                must immediately notify us of any unauthorized use of your account at{' '}
                <a
                  href="mailto:security@carebridgeconnect.ai"
                  className="text-primary-600 hover:underline"
                >
                  security@carebridgeconnect.ai
                </a>
                .
              </p>
              <p className="text-navy-700 leading-relaxed">
                Facility administrators are responsible for ensuring that only
                authorized personnel have access to the platform and that family member
                invitations are sent only to individuals with a legitimate relationship
                to the resident.
              </p>
            </section>

            {/* HIPAA and PHI */}
            <section id="hipaa-phi" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                HIPAA and Protected Health Information
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                Skilled nursing facilities using CareBridge Connect are{' '}
                <strong>Covered Entities</strong> under HIPAA. CareBridge Connect
                operates as a <strong>Business Associate</strong> and will enter into a
                Business Associate Agreement (BAA) with each facility prior to any PHI
                being processed through the platform.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                The BAA governs how CareBridge Connect may access, use, and safeguard
                PHI. We will only use PHI as permitted by the BAA and applicable law.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                <strong>Prohibited uses of the platform include:</strong>
              </p>
              <ul className="space-y-2 text-navy-700 leading-relaxed mb-4">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>Sharing PHI with unauthorized individuals</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>Using the platform to store PHI beyond the scope of the BAA</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Exporting or downloading PHI for purposes not authorized by the
                    Covered Entity
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Any use that would violate HIPAA Privacy or Security Rules
                  </span>
                </li>
              </ul>
            </section>

            {/* Permitted Use / Restrictions */}
            <section id="permitted-use" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Permitted Use and Restrictions
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to
                access and use the Service for your internal business purposes in
                accordance with these Terms and your subscription plan.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                <strong>You may not:</strong>
              </p>
              <ul className="space-y-2 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Reverse engineer, decompile, or disassemble any part of the Service
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Use the Service for competitive analysis, benchmarking, or to build
                    a competing product
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Sublicense, resell, or redistribute access to the Service
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Use the Service in any way that violates applicable laws or
                    regulations, including HIPAA
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    Attempt to gain unauthorized access to any systems, networks, or
                    data associated with the Service
                  </span>
                </li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section id="payment-terms" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Payment Terms
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                CareBridge Connect offers both annual and monthly billing options.
                Pricing is based on facility size and the features included in your
                chosen plan. Custom enterprise pricing is available for multi-facility
                organizations.
              </p>
              <ul className="space-y-3 text-navy-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Billing Cycle:</strong> Subscriptions are billed in advance
                    on a monthly or annual basis, depending on the plan selected.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Auto-Renewal:</strong> Subscriptions automatically renew at
                    the end of each billing period unless cancelled in writing.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Cancellation:</strong> You may cancel your subscription with
                    30 days&rsquo; written notice prior to the next renewal date. Upon
                    cancellation, you will retain access through the end of the current
                    billing period.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-600 font-bold shrink-0">&bull;</span>
                  <span>
                    <strong>Data Export:</strong> Upon cancellation, you may request a
                    full export of your facility&rsquo;s data within 90 days. After this
                    period, data will be permanently deleted.
                  </span>
                </li>
              </ul>
            </section>

            {/* Data Ownership */}
            <section id="data-ownership" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Data Ownership
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                <strong>Your facility owns all resident data.</strong> All data entered
                into the platform by facility staff, including care logs, resident
                profiles, family contact information, and uploaded documents, remains
                the property of the facility.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                You grant CareBridge Connect a limited, non-exclusive license to
                process, store, and transmit your data solely for the purpose of
                providing and improving the Service. This license terminates when your
                subscription ends and data is deleted.
              </p>
              <p className="text-navy-700 leading-relaxed">
                CareBridge Connect owns all intellectual property rights in the
                platform, including software, algorithms, designs, documentation, and
                trademarks. Aggregate, de-identified usage data may be used by
                CareBridge Connect to improve the Service.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Limitation of Liability
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                To the maximum extent permitted by applicable law, CareBridge Connect
                LLC shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including but not limited to loss of
                profits, data, or business opportunities, arising out of or related to
                your use of the Service.
              </p>
              <p className="text-navy-700 leading-relaxed mb-4">
                Our total aggregate liability for any claims arising under these Terms
                shall not exceed the total amount paid by you to CareBridge Connect in
                the twelve (12) months immediately preceding the event giving rise to
                the claim.
              </p>
              <p className="text-navy-700 leading-relaxed">
                The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis. We make no warranties, express or implied,
                regarding the reliability, accuracy, or availability of the Service,
                except as expressly stated in your Facility Agreement.
              </p>
            </section>

            {/* Governing Law */}
            <section id="governing-law" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Governing Law
              </h2>
              <p className="text-navy-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the
                laws of the State of Utah, United States of America, without regard to
                its conflict of law provisions. Any disputes arising under these Terms
                shall be resolved in the state or federal courts located in Utah County,
                Utah.
              </p>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Changes to Terms
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                We may update these Terms from time to time. When we make material
                changes, we will notify facility administrators via email at least 30
                days before the changes take effect. Your continued use of the Service
                after changes become effective constitutes your acceptance of the
                revised Terms.
              </p>
              <p className="text-navy-700 leading-relaxed">
                We encourage you to review these Terms periodically. The &ldquo;Last
                updated&rdquo; date at the top of this page indicates when the Terms
                were most recently revised.
              </p>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-12 scroll-mt-8">
              <h2 className="text-2xl font-bold text-navy-900 border-b border-slate-200 pb-3 mb-6">
                Contact Us
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="card-glass p-6 rounded-xl">
                <p className="text-navy-800 font-semibold mb-2">
                  CareBridge Connect LLC
                </p>
                <p className="text-navy-600 text-sm mb-1">
                  Legal Inquiries:{' '}
                  <a
                    href="mailto:legal@carebridgeconnect.ai"
                    className="text-primary-600 hover:underline"
                  >
                    legal@carebridgeconnect.ai
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
