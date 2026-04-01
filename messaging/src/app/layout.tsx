// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { SidebarWrapper } from '@/components/SidebarWrapper'

export const metadata: Metadata = {
  title: 'CareBridge Connect Messaging — SNF Family Communications',
  description: 'HIPAA-compliant automated family notifications for skilled nursing facilities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
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
