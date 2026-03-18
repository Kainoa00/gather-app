'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'HIPAA', href: '#hipaa' },
]

function handleSmoothScroll(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string
) {
  if (href.startsWith('#')) {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Shimmer keyframe injected once */}
      <style>{`
        @keyframes btn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .btn-demo-shimmer {
          background: linear-gradient(
            90deg,
            #1B4798 0%,
            #1B4798 35%,
            #4f7fcf 50%,
            #1B4798 65%,
            #1B4798 100%
          );
          background-size: 200% auto;
          animation: btn-shimmer 3s linear infinite;
        }
        .btn-demo-shimmer:hover {
          animation-duration: 1.5s;
        }
      `}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-navy-100'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
              <Image
                src="/logos/Logo 1 (color).png"
                alt="CareBridge Connect"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-primary-600 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold text-navy-700 border border-navy-200 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Sign In
              </Link>
              <Link
                href="/demo"
                className="btn-demo-shimmer inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-float transition-all duration-150 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Request Demo
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-navy-700 hover:bg-navy-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu slide-down */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -12, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -12, scaleY: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'top' }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-navy-100 shadow-glass-lg px-4 pb-6 pt-2"
            >
              <ul className="flex flex-col gap-1 mb-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        handleSmoothScroll(e, link.href)
                        setMobileOpen(false)
                      }}
                      className="flex items-center min-h-[44px] px-4 py-2 text-base font-medium text-navy-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3">
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-base font-semibold text-navy-700 border border-navy-200 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all duration-150"
                >
                  Sign In
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setMobileOpen(false)}
                  className="btn-demo-shimmer inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-base font-semibold text-white rounded-xl shadow-float"
                >
                  Request Demo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
