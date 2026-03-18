import Link from 'next/link'
import Image from 'next/image'

const LINKS = {
  Product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Security & HIPAA', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/demo' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'BAA Template', href: '/baa' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/Logo 1 (color).png"
                alt="CareBridge Connect"
                width={160}
                height={40}
                className="h-7 w-auto brightness-0 invert opacity-80"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-[200px]">
              HIPAA-compliant family communication for skilled nursing facilities.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {['Li', 'Tw', 'Yt'].map((s) => (
                <div key={s} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer">
                  <span className="text-[10px] font-bold text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} CareBridge Connect LLC. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Built for the people who care for our parents.
          </p>
        </div>
      </div>
    </footer>
  )
}
