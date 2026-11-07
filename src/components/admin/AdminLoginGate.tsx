'use client';

import React, { useState, useCallback } from 'react';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { loginWithPasscode, loginWithSupabase } from '@/lib/admin/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock, Mail, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AdminLoginGateProps {
  onAuthenticated: () => void;
}

export function AdminLoginGate({ onAuthenticated }: AdminLoginGateProps) {
  const [mode, setMode] = useState<'passcode' | 'supabase'>(
    isSupabaseConfigured() ? 'supabase' : 'passcode'
  );
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasscodeLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const success = await loginWithPasscode(passcode);
    if (success) {
      if (typeof document !== 'undefined') {
        document.cookie = 'sumbar_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
      }
      onAuthenticated();
    } else {
      setError('Passcode salah. Coba lagi atau hubungi administrator.');
    }
    setLoading(false);
  }, [passcode, loading, onAuthenticated]);

  const handleSupabaseLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const result = await loginWithSupabase(email, password);
    if (result.success) {
      if (typeof document !== 'undefined') {
        document.cookie = 'sumbar_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
      }
      onAuthenticated();
    } else {
      setError(result.error ?? 'Login gagal.');
    }
    setLoading(false);
  }, [email, password, loading, onAuthenticated]);

  const hasSupabase = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-mustard border-2 border-ink shadow-neo mx-auto flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-ink" />
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tight">
            Admin Gate
          </h1>
          <p className="font-mono text-xs text-ink/60 mt-1.5 uppercase tracking-wider">
            Sumbar Terkini CMS Dashboard
          </p>
        </div>

        <NeoCard className="p-6 sm:p-8">
          {/* Mode Toggle (only shown if Supabase is configured) */}
          {hasSupabase && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setMode('supabase'); setError(null); }}
                className={`flex-1 text-xs font-mono font-bold py-2.5 rounded-xl border-2 border-ink transition-all min-h-[44px] ${mode === 'supabase'
                    ? 'bg-ink text-paper shadow-none'
                    : 'bg-white text-ink hover:bg-paper shadow-neo-sm'
                  }`}
              >
                <Mail className="w-3.5 h-3.5 inline-block mr-1.5" />
                Email Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('passcode'); setError(null); }}
                className={`flex-1 text-xs font-mono font-bold py-2.5 rounded-xl border-2 border-ink transition-all min-h-[44px] ${mode === 'passcode'
                    ? 'bg-ink text-paper shadow-none'
                    : 'bg-white text-ink hover:bg-paper shadow-neo-sm'
                  }`}
              >
                <KeyRound className="w-3.5 h-3.5 inline-block mr-1.5" />
                Passcode
              </button>
            </div>
          )}

          {/* Passcode Login Form */}
          {mode === 'passcode' && (
            <form onSubmit={handlePasscodeLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-passcode"
                  className="block text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-2"
                >
                  Masukkan Passcode Admin
                </label>
                <div className="relative">
                  <input
                    id="admin-passcode"
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border-2 border-ink rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mustard bg-white text-ink placeholder:text-ink/30 min-h-[48px] pr-12"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink/50 hover:text-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Sembunyikan passcode' : 'Tampilkan passcode'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs font-mono font-bold text-coral bg-coral/10 border-2 border-coral/30 rounded-xl px-3 py-2.5">
                  {error}
                </div>
              )}

              <NeoButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || passcode.length === 0}
                className="w-full gap-2"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </NeoButton>

              {!hasSupabase && (
                <p className="text-[10px] font-mono text-ink/40 text-center mt-3">
                  Mode lokal aktif. Default passcode: sumbar2026
                </p>
              )}
            </form>
          )}

          {/* Supabase Email Login Form */}
          {mode === 'supabase' && (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-2"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sumbarterkini.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border-2 border-ink rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mustard bg-white text-ink placeholder:text-ink/30 min-h-[48px]"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border-2 border-ink rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mustard bg-white text-ink placeholder:text-ink/30 min-h-[48px] pr-12"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink/50 hover:text-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs font-mono font-bold text-coral bg-coral/10 border-2 border-coral/30 rounded-xl px-3 py-2.5">
                  {error}
                </div>
              )}

              <NeoButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || email.length === 0 || password.length === 0}
                className="w-full gap-2"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </NeoButton>
            </form>
          )}
        </NeoCard>
      </div>
    </div>
  );
}

