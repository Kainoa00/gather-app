import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield,
  Lock,
  Server,
  Users,
  CheckCircle2,
  Mail,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security & Compliance',
  description:
    'Enterprise-grade security built for healthcare. HIPAA-compliant infrastructure, SOC 2 Type II, AES-256 encryption, and more.',
}

interface CertCard {
  icon: typeof Shield
  title: string
  description: string
}

const CERTIFICATIONS: CertCard[] = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description:
      'Full compliance with HIPAA Privacy, Security, and Breach Notification Rules. BAA available for all paid plans.',
  },
  {
    icon: Server,
    title: 'SOC 2 Type II Infrastructure',
    description:
      'Our infrastructure providers maintain SOC 2 Type II certification with continuous monitoring and auditing.',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description:
      'All data at rest is encrypted using AES-256, the same standard used by financial institutions and government agencies.',
  },
  {
    icon: Lock,
    title: 'TLS 1.3 in Transit',
    description:
      'All data transmitted between your devices and our servers is protected with TLS 1.3, the latest transport security protocol.',
  },
]

interface InfraItem {
  name: string
  cert: string
  description: string
}

const INFRASTRUCTURE: InfraItem[] = [
  {
    name: 'Supabase',
    cert: 'SOC 2 Type II, HIPAA-eligible',
    description:
      'Database and authentication infrastructure with row-level security, encrypted backups, and HIPAA-eligible configuration.',
  },
  {
    name: 'Vercel',
    cert: 'SOC 2 Type II',
    description:
      'Application hosting with global CDN, DDoS protection, and automatic SSL certificate management.',
  },
  {
    name: 'Resend',
    cert: 'GDPR Compliant',
    description:
      'Transactional email delivery for care notifications with high deliverability and data processing agreements.',
  },
]

const DATA_PROTECTION = [
  'PHI never leaves US infrastructure',
  'Encryption at rest (AES-256)',
  'Encryption in transit (TLS 1.3)',
  'Row-level security — each facility\'s data is isolated',
  '99.9% uptime SLA',
]

const ACCESS_CONTROLS = [
  'Role-based access: Admin, Nurse, Primary Family, Family',
  'Audit logging on all PHI access events',
  'Session management with automatic timeout',
  'Multi-factor authentication support',
]

const COMPLIANCE_ITEMS = [
  'HIPAA Business Associate Agreement (BAA) available for all paid plans',
  'CMS data retention standards — 7-year audit log retention',
  'Regular security reviews and vulnerability assessments',
  'Incident response plan with 24-hour breach notification',
]

function CertificationCard({ cert }: { cert: CertCard }) {
  const Icon = cert.icon
  return (
    <div className="card-glass p-6 rounded-xl text-center">
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{cert.title}</h3>
      <p className="text-sm text-navy-600 leading-relaxed">
        {cert.description}
      </p>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-mint-500 shrink-0 mt-0.5" />
      <span className="text-navy-700">{text}</span>
    </li>
  )
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/Logo 1 (color).png"
              alt="CareBridge Connect"
              width={180}
              height={45}
              className="h-8 w-auto brightness-0 invert opacity-90"
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Hero — Dark */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-mesh-dark opacity-50" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 mb-8">
            <Shield className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">
              HIPAA Compliant &middot; SOC 2 Type II
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Enterprise-grade security{' '}
            <span className="gradient-text">built for healthcare.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Your residents&rsquo; data deserves the highest level of protection.
            CareBridge Connect is built on HIPAA-compliant, SOC 2 Type II
            certified infrastructure with end-to-end encryption.
          </p>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 tracking-tight mb-4">
              Certifications &amp; Standards
            </h2>
            <p className="text-navy-600 text-lg max-w-2xl mx-auto">
              We meet and exceed the security standards required by healthcare
              organizations and regulatory bodies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert) => (
              <CertificationCard key={cert.title} cert={cert} />
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 tracking-tight mb-4">
              Infrastructure Partners
            </h2>
            <p className="text-navy-600 text-lg max-w-2xl mx-auto">
              We partner with industry-leading infrastructure providers that
              maintain the highest levels of security certification.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INFRASTRUCTURE.map((item) => (
              <div key={item.name} className="card-glass p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Server className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-bold text-navy-900">
                    {item.name}
                  </h3>
                </div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-mint-100 text-mint-500 text-xs font-semibold mb-3">
                  {item.cert}
                </span>
                <p className="text-sm text-navy-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection + Access Controls — two-column */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Data Protection */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">
                  Data Protection
                </h2>
              </div>
              <ul className="space-y-4">
                {DATA_PROTECTION.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </ul>
            </div>

            {/* Access Controls */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">
                  Access Controls
                </h2>
              </div>
              <ul className="space-y-4">
                {ACCESS_CONTROLS.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Compliance
              </h2>
              <p className="text-navy-600 text-lg">
                We maintain rigorous compliance standards to ensure your
                facility meets all regulatory requirements.
              </p>
            </div>
            <div className="card-glass p-8 rounded-xl">
              <ul className="space-y-4">
                {COMPLIANCE_ITEMS.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Security Team CTA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-600/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
            Questions about security?
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Our security team is available to discuss your compliance
            requirements, review our security documentation, or schedule a
            security assessment call.
          </p>
          <a
            href="mailto:security@carebridgeconnect.ai"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            Contact Security Team
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-slate-500 text-sm mt-4">
            security@carebridgeconnect.ai
          </p>
        </div>
      </section>
    </div>
  )
}
