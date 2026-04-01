// src/app/layout.tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { SidebarWrapper } from '@/components/SidebarWrapper'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'CareBridge Connect Messaging — SNF Family Communications',
  description: 'HIPAA-compliant automated family notifications for skilled nursing facilities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} bg-slate-50 text-navy-800 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <SidebarWrapper />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
