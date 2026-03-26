import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  // Don't capture demo/test errors
  beforeSend(event) {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return null
    return event
  },
})
