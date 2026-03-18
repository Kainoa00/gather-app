import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>{children}</body>
    </html>
  )
}
