import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CareBridge Connect — Dashboard',
  description: 'Your CareBridge Connect care dashboard.',
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
