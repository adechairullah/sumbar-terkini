'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { checkAdminAuth, logoutAdmin } from '@/lib/admin/auth';
import { repository } from '@/lib/data/repository';
import { SiteSettings, SocialPlatform, EndorsePackage, PortfolioItem } from '@/types';
import { AdminLoginGate } from '@/components/admin/AdminLoginGate';
import { AdminHeader, AdminTab } from '@/components/admin/AdminHeader';
import { ProfileHeroEditor } from '@/components/admin/ProfileHeroEditor';
import { SocialMediaManager } from '@/components/admin/SocialMediaManager';
import { PackageBuilder } from '@/components/admin/PackageBuilder';
import { PortfolioManager } from '@/components/admin/PortfolioManager';
import { ContactSettingsEditor } from '@/components/admin/ContactSettingsEditor';
import { ToastProvider } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading'
  );
  const [authMethod, setAuthMethod] = useState<'supabase' | 'passcode' | 'none'>('passcode');
  const [authEmail, setAuthEmail] = useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<AdminTab>('profile');

  // Core CMS Data States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [packages, setPackages] = useState<EndorsePackage[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Authenticate user session
  const verifyAuth = useCallback(async () => {
    try {
      const auth = await checkAdminAuth();
      if (auth.authenticated) {
        setAuthStatus('authenticated');
        setAuthMethod(auth.method);
        setAuthEmail(auth.email);
        return;
      }

      // Check cookie fallback
      if (typeof document !== 'undefined') {
        const hasCookie = document.cookie
          .split(';')
          .some((item) => item.trim().startsWith('sumbar_admin_auth=true'));

        if (hasCookie) {
          if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
            window.sessionStorage.setItem(
              'sumbar_admin_auth',
              JSON.stringify({
                authenticated: true,
                method: 'passcode',
                timestamp: Date.now(),
              })
            );
          }
          setAuthStatus('authenticated');
          setAuthMethod('passcode');
          return;
        }
      }

      setAuthStatus('unauthenticated');
    } catch {
      setAuthStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void verifyAuth();
  }, [verifyAuth]);

  // Load Repository Data once authenticated
  const loadCmsData = useCallback(async () => {
    try {
      const [s, pl, pk, port] = await Promise.all([
        repository.getSiteSettings(),
        repository.getSocialPlatforms(),
        repository.getEndorsePackages(),
        repository.getPortfolioItems(),
      ]);
      setSettings(s);
      setPlatforms(pl);
      setPackages(pk);
      setPortfolioItems(port);
      setDataLoaded(true);
    } catch {
      // In-memory or fallback
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      void loadCmsData();
    }
  }, [authStatus, loadCmsData]);

  // Handle Logout
  const handleLogout = async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'sumbar_admin_auth=; path=/; max-age=0; SameSite=Lax';
    }
    await logoutAdmin();
    setAuthStatus('unauthenticated');
  };

  // 1. Loading Splash
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-mustard border-2 border-ink shadow-neo flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-ink animate-spin" />
        </div>
        <p className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
          Memverifikasi Sesi Admin...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Login Gate
  if (authStatus === 'unauthenticated') {
    return (
      <AdminLoginGate
        onAuthenticated={() => {
          setAuthStatus('authenticated');
          setAuthMethod('passcode');
        }}
      />
    );
  }

  // 3. Loading CMS State
  if (!dataLoaded || !settings) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-mint border-2 border-ink shadow-neo flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-ink animate-spin" />
        </div>
        <p className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
          Memuat Data CMS Sumbar Terkini...
        </p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-mustard selection:text-ink">
        {/* Sticky Shell Header */}
        <AdminHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          authMethod={authMethod}
          authEmail={authEmail}
        />

        {/* Main Content Area: Direct Full Editor Mode */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="w-full">
            {activeTab === 'profile' && (
              <ProfileHeroEditor
                initialSettings={settings}
                onSaveSuccess={(upd) => setSettings(upd)}
              />
            )}

            {activeTab === 'socials' && (
              <SocialMediaManager
                initialPlatforms={platforms}
                siteSettings={settings}
                onSettingsSaveSuccess={(upd) => setSettings(upd)}
                onSaveSuccess={(upd) => {
                  setPlatforms((prev) =>
                    prev.map((p) => (p.id === upd.id ? { ...p, ...upd } : p))
                  );
                }}
              />
            )}

            {activeTab === 'packages' && (
              <PackageBuilder
                initialPackages={packages}
                onPackagesChange={setPackages}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioManager
                initialItems={portfolioItems}
                onItemsChange={setPortfolioItems}
              />
            )}

            {activeTab === 'contact' && (
              <ContactSettingsEditor
                initialSettings={settings}
                onSaveSuccess={(upd) => setSettings(upd)}
              />
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
