import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_NETWORK_TIMEOUT_MS = 3000;

/**
 * Custom fetch implementation enforcing a strict timeout (default 3000ms)
 * and abort semantics on transport errors. This prevents @supabase/postgrest-js
 * from executing 3 exponential backoff retries (7s delay per request) when a host is unreachable.
 */
export function createFastTimeoutFetch(timeoutMs: number = DEFAULT_NETWORK_TIMEOUT_MS): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    let isTimedOut = false;

    const timer = setTimeout(() => {
      isTimedOut = true;
      controller.abort(new DOMException(`Network request timed out after ${timeoutMs}ms`, 'AbortError'));
    }, timeoutMs);

    if (init?.signal) {
      if (init.signal.aborted) {
        clearTimeout(timer);
        controller.abort(init.signal.reason);
      } else {
        init.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            controller.abort(init.signal?.reason);
          },
          { once: true }
        );
      }
    }

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (err: unknown) {
      controller.abort(err);
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      if (isTimedOut) {
        throw new DOMException(`Network request timed out after ${timeoutMs}ms`, 'AbortError');
      }
      // Re-throw transport/DNS errors as AbortError to prevent PostgREST's 3x exponential retry backoff
      const errMessage = err instanceof Error ? err.message : String(err);
      throw new DOMException(`Supabase network connection failed: ${errMessage}`, 'AbortError');
    } finally {
      clearTimeout(timer);
    }
  };
}

let cachedBrowserClient: SupabaseClient | null = null;
let cachedClientUrl: string | null = null;
let cachedClientKey: string | null = null;

/**
 * Returns true only if valid Supabase environment variables are present.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;

  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (
    trimmedUrl === '' ||
    trimmedKey === '' ||
    trimmedUrl.includes('your-project') ||
    trimmedUrl.includes('placeholder') ||
    trimmedKey.includes('placeholder') ||
    trimmedKey.includes('your-anon-key') ||
    !trimmedUrl.startsWith('https://')
  ) {
    return false;
  }

  return true;
}

/**
 * Creates or returns the cached browser Supabase client with fast network timeout guard.
 * Returns null safely if Supabase is unconfigured (never throws).
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const currentKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!cachedBrowserClient || cachedClientUrl !== currentUrl || cachedClientKey !== currentKey) {
    cachedClientUrl = currentUrl;
    cachedClientKey = currentKey;
    cachedBrowserClient = createBrowserClient(currentUrl, currentKey, {
      global: {
        fetch: createFastTimeoutFetch(DEFAULT_NETWORK_TIMEOUT_MS),
      },
    });
  }

  return cachedBrowserClient;
}
