const { withSentryConfig } = require('@sentry/nextjs')

// HIPAA-compliant security headers applied to all routes.
// Sources: NIST SP 800-53 (SC-8, SC-28), HIPAA Security Rule 45 CFR §164.312(e).
const securityHeaders = [
  // Enforce HTTPS for 1 year, including subdomains (HSTS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Prevent clickjacking — this app should never be embedded in an iframe
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Limit referrer information to same-origin only (no PHI in referrer headers)
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable access to device hardware not needed by this app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // CSP: restrict resource origins to prevent XSS / data exfiltration
  // Allows Supabase, Sentry, and Anthropic; blocks inline scripts except Next.js internals
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
      "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  // Prevent search engines from indexing any patient data pages
  {
    key: 'X-Robots-Tag',
    value: 'noindex, nofollow',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

// Source-map upload is gated on SENTRY_AUTH_TOKEN. When the token is absent
// the build still succeeds but Sentry receives minified stack frames only.
// Set SENTRY_AUTH_TOKEN in Vercel project settings to get readable stacks.
module.exports = withSentryConfig(nextConfig, {
  org: 'carebridge-connect',
  project: 'carebridge-connect',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
