import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/app/*', '/onboarding', '/auth/*', '/api/*'],
    },
    sitemap: 'https://carebridgeconnect.ai/sitemap.xml',
  }
}
