/**
 * Escape user-supplied strings before interpolating into HTML (emails, etc.).
 * Prevents XSS / HTML injection.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Derive a display name from an email address.
 * e.g. "jane.doe@example.com" → "jane.doe"
 */
export function nameFromEmail(email: string): string {
  return email.split('@')[0]
}

/**
 * Extract the client IP from a request's x-forwarded-for header.
 */
export function getClientIp(request: Request): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
}
