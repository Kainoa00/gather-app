import type { Metadata } from 'next'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProblemStats from '@/components/landing/ProblemStats'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturesBento from '@/components/landing/FeaturesBento'
import AudienceSplit from '@/components/landing/AudienceSplit'
import Testimonials from '@/components/landing/Testimonials'
import PricingSection from '@/components/landing/PricingSection'
import HipaaSection from '@/components/landing/HipaaSection'
import FinalCta from '@/components/landing/FinalCta'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'CareBridge Connect — Family Communication for Skilled Nursing Facilities',
  description:
    'A HIPAA-compliant platform that reduces family call volume by 60%, improves CMS star ratings, and gives care teams their time back. Trusted by skilled nursing facilities.',
  metadataBase: new URL('https://carebridgeconnect.ai'),
  openGraph: {
    title: 'CareBridge Connect — Family Communication for Skilled Nursing Facilities',
    description:
      'Reduce family call volume by 60% and improve CMS star ratings with real-time care updates, secure messaging, and transparent progress tracking.',
    url: 'https://carebridgeconnect.ai',
    siteName: 'CareBridge Connect',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareBridge Connect — Family Communication for SNFs',
    description:
      'A HIPAA-compliant platform that gives nursing staff their time back and families the visibility they deserve.',
  },
  keywords: [
    'skilled nursing facility software',
    'SNF family communication',
    'HIPAA compliant care updates',
    'nursing home family app',
    'CMS star rating improvement',
    'care team communication platform',
    'long-term care software',
    'family engagement healthcare',
  ],
  alternates: {
    canonical: 'https://carebridgeconnect.ai',
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream-50 overflow-x-hidden">
      <Navbar />

      {/* Hero — full viewport, animated mesh + word reveal */}
      <section id="hero">
        <Hero />
      </section>

      {/* Social proof numbers — dark section, count-up on scroll */}
      <section id="stats">
        <ProblemStats />
      </section>

      {/* How it works — 3-step flow */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Bento feature grid with product UI previews */}
      <section id="features">
        <FeaturesBento />
      </section>

      {/* Audience split — Facilities vs Families */}
      <section id="audience">
        <AudienceSplit />
      </section>

      {/* Infinite-scroll testimonials marquee */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* Pricing — 3 tiers, all CTAs → /demo */}
      <section id="pricing">
        <PricingSection />
      </section>

      {/* HIPAA trust section */}
      <section id="security">
        <HipaaSection />
      </section>

      {/* Final CTA */}
      <section id="contact">
        <FinalCta />
      </section>

      <Footer />
    </main>
  )
}
