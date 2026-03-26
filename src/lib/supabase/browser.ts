import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseBrowserClient() must only be called in the browser.'
    )
  }

  if (client) {
    return client
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const match = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return match ? decodeURIComponent(match.split('=')[1]) : undefined
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          let cookie = `${name}=${encodeURIComponent(value)}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options.domain) cookie += `; domain=${options.domain}`
          if (options.sameSite) cookie += `; samesite=${options.sameSite}`
          if (options.secure) cookie += `; secure`
          document.cookie = cookie
        },
        remove(name: string, options: Record<string, unknown>) {
          let cookie = `${name}=; max-age=0`
          if (options.path) cookie += `; path=${options.path}`
          if (options.domain) cookie += `; domain=${options.domain}`
          document.cookie = cookie
        },
      },
      isSingleton: true,
    }
  )

  return client
}
