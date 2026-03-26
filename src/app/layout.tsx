import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: {
    default: 'CareBridge Connect — Family Communication for Skilled Nursing Facilities',
    template: '%s | CareBridge Connect',
  },
  description:
    'A HIPAA-compliant platform that reduces family call volume by 60% and gives care teams their time back. Trusted by skilled nursing facilities.',
  metadataBase: new URL('https://carebridgeconnect.ai'),
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: '',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B4798',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CareBridge Connect',
  url: 'https://carebridgeconnect.ai',
  logo: 'https://carebridgeconnect.ai/logos/Logo 1 (color).png',
  description: 'HIPAA-compliant family communication platform for skilled nursing facilities',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@carebridgeconnect.ai',
    contactType: 'sales',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${outfit.className} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
