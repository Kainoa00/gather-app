import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Gather - One Secure Place for Your Family',
  description: 'Coordinate caregiving, share moments, and keep your family connected. One secure place for appointments, memories, and everything in between.',
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
