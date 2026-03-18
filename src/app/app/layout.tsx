import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CareBridge Connect — Dashboard',
  description: 'Your CareBridge Connect care management dashboard.',
  robots: { index: false, follow: false },
}

/**
 * App layout for all /app routes.
 *
 * Authentication is enforced at the middleware layer (src/middleware.ts).
 * The middleware checks for a valid Supabase session before any /app route
 * is rendered. If no session exists, the user is redirected to /auth/login.
 *
 * A demo-mode escape hatch allows unauthenticated access when
 * NEXT_PUBLIC_DEMO_MODE=true or a `demo=true` cookie is present.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
