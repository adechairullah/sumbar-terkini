import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, createFastTimeoutFetch, DEFAULT_NETWORK_TIMEOUT_MS } from './client';

/**
 * Creates an async server-side Supabase client for Server Components,
 * Server Actions, and Route Handlers in Next.js 15 with network timeout guard.
 * Returns null safely if Supabase is unconfigured.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Next.js 15 throws when setAll is invoked inside a Server Component
            // during read-only rendering. This can be safely ignored.
          }
        },
      },
      global: {
        fetch: createFastTimeoutFetch(DEFAULT_NETWORK_TIMEOUT_MS),
      },
    }
  );
}
