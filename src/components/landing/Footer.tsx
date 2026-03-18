import Link from 'next/link'
import Image from 'next/image'

// ─── Footer link groups ───────────────────────────────────────────────────────
const footerGroups = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#hipaa' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'HIPAA Notice', href: '/hipaa-notice' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="bg-navy-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row — logo + nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Logo column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="CareBridge Connect — Home">
              <Image
                src="/logos/Logo 1 (color).png"
                alt="CareBridge Connect"
                width={160}
                height={45}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-navy-400 text-sm mt-4 leading-relaxed max-w-xs">
              A HIPAA-compliant communication bridge between care teams and
              families.
            </p>
          </div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">
                {group.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-navy-400 text-sm hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-navy-400 text-sm hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-navy-500 text-sm">
              © 2026 CareBridge Connect, Inc. All rights reserved.
            </p>
            <p className="text-navy-500 text-sm">
              Built for the people who care for our parents.
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
