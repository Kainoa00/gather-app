const DEFAULT_TZ = 'America/Denver'

export function formatDate(date: Date | string, options?: { timezone?: string; includeTime?: boolean }) {
  const d = typeof date === 'string' ? new Date(date) : date
  const tz = options?.timezone ?? DEFAULT_TZ

  if (options?.includeTime) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZone: tz,
    }).format(d)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: tz,
  }).format(d)
}

export function formatTime(date: Date | string, options?: { timezone?: string }) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit',
    timeZone: options?.timezone ?? DEFAULT_TZ,
  }).format(d)
}
