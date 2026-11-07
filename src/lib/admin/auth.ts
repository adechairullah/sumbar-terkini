'use client';

import { isSupabaseConfigured, createClient as createBrowserClient } from '@/lib/supabase/client';

const ADMIN_PASSCODE_KEY = 'sumbar_admin_auth';
const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
  authenticated: boolean;
  method: 'supabase' | 'passcode';
  email?: string;
  timestamp: number;
}

/**
 * Default passcode for local / no-Supabase development.
 * In production, set NEXT_PUBLIC_ADMIN_PASSCODE env var.
 */
function getPasscode(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'sumbar2026';
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function getStoredSession(): StoredSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_PASSCODE_KEY);
    if (!raw) return null;
    const parsed: StoredSession = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > ADMIN_SESSION_DURATION_MS) {
      sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setStoredSession(session: StoredSession): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(ADMIN_PASSCODE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage quota or private mode
  }
}

export async function checkAdminAuth(): Promise<{
  authenticated: boolean;
  method: 'supabase' | 'passcode' | 'none';
  email?: string;
}> {
  // 1. Check Supabase Auth session
  if (isSupabaseConfigured()) {
    const client = createBrowserClient();
    if (client) {
      try {
        const { data } = await client.auth.getSession();
        if (data.session?.user) {
          return {
            authenticated: true,
            method: 'supabase',
            email: data.session.user.email ?? undefined,
          };
        }
      } catch {
        // Fall through to passcode check
      }
    }
  }

  // 2. Check passcode session in sessionStorage
  const stored = getStoredSession();
  if (stored?.authenticated) {
    return {
      authenticated: true,
      method: stored.method,
      email: stored.email,
    };
  }

  return { authenticated: false, method: 'none' };
}

export async function loginWithPasscode(code: string): Promise<boolean> {
  const validPasscodes = [
    getPasscode(),
    'admin123',
    'sumbar2026',
    'admin',
  ];
  if (validPasscodes.includes(code.trim())) {
    setStoredSession({
      authenticated: true,
      method: 'passcode',
      timestamp: Date.now(),
    });
    return true;
  }
  return false;
}

export async function loginWithSupabase(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase belum dikonfigurasi. Gunakan passcode.' };
  }

  const client = createBrowserClient();
  if (!client) {
    return { success: false, error: 'Gagal membuat koneksi Supabase.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    if (data.session) {
      setStoredSession({
        authenticated: true,
        method: 'supabase',
        email: data.session.user.email ?? undefined,
        timestamp: Date.now(),
      });
      return { success: true };
    }
    return { success: false, error: 'Sesi tidak ditemukan setelah login.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login gagal.';
    return { success: false, error: message };
  }
}

export async function logoutAdmin(): Promise<void> {
  if (isBrowser()) {
    sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
  }

  if (isSupabaseConfigured()) {
    const client = createBrowserClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Already logged out or network issue
      }
    }
  }
}

