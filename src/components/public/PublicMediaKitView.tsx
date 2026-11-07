'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SiteSettings, SocialPlatform, EndorsePackage, VisitorReaction, PortfolioItem } from '@/types';
import { repository } from '@/lib/data/repository';
import { HeroSection } from '@/components/hero/HeroSection';
import { BentoGrid } from '@/components/socials/BentoGrid';
import { RateCalculator } from '@/components/calculator/RateCalculator';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { ContactHub } from '@/components/contact/ContactHub';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface PublicMediaKitViewProps {
  initialSettings: SiteSettings;
  initialPlatforms: SocialPlatform[];
  initialPackages: EndorsePackage[];
  initialReactions: VisitorReaction[];
  portfolioItems: PortfolioItem[];
}

export function PublicMediaKitView({
  initialSettings,
  initialPlatforms,
  initialPackages,
  initialReactions,
  portfolioItems,
}: PublicMediaKitViewProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(initialPlatforms);
  const [packages, setPackages] = useState<EndorsePackage[]>(initialPackages);
  const [reactions, setReactions] = useState<VisitorReaction[]>(initialReactions);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(portfolioItems);

  // Sync with browser localStorage / DAL on mount
  const refreshFromClientStore = useCallback(async () => {
    try {
      const [s, pl, pk, rx, port] = await Promise.all([
        repository.getSiteSettings(),
        repository.getSocialPlatforms(),
        repository.getEndorsePackages(),
        repository.getReactions(),
        repository.getPortfolioItems(),
      ]);
      if (s) setSettings(s);
      if (pl && pl.length > 0) setPlatforms(pl);
      if (pk && pk.length > 0) setPackages(pk);
      if (rx && rx.length > 0) setReactions(rx);
      if (port && port.length > 0) setPortfolio(port);
    } catch {
      // Offline fallback
    }
  }, []);

  // Synchronize data-theme on root HTML document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.theme_preset || 'neo-warm');
    }
  }, [settings.theme_preset]);

  useEffect(() => {
    // Initial client sync
    void refreshFromClientStore();

    // Subscribe to cross-tab & realtime DAL broadcasts
    const unsubSettings = repository.subscribeToChanges('site_settings', (e) => {
      if (e.payload) {
        setSettings(e.payload as SiteSettings);
      } else {
        void refreshFromClientStore();
      }
    });

    const unsubSocials = repository.subscribeToChanges('social_platforms', (e) => {
      if (e.payload && Array.isArray(e.payload)) {
        setPlatforms(e.payload as SocialPlatform[]);
      } else {
        void refreshFromClientStore();
      }
    });

    const unsubPackages = repository.subscribeToChanges('endorse_packages', (e) => {
      if (e.payload && Array.isArray(e.payload)) {
        setPackages(e.payload as EndorsePackage[]);
      } else {
        void refreshFromClientStore();
      }
    });

    const unsubReactions = repository.subscribeToChanges('visitor_reactions', (e) => {
      if (e.payload && Array.isArray(e.payload)) {
        setReactions(e.payload as VisitorReaction[]);
      } else {
        void refreshFromClientStore();
      }
    });

    const unsubPortfolio = repository.subscribeToChanges('portfolio_items', (e) => {
      if (e.payload && Array.isArray(e.payload)) {
        setPortfolio(e.payload as PortfolioItem[]);
      } else {
        void refreshFromClientStore();
      }
    });

    // Cross-tab storage event listener
    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('sumbar_')) {
        void refreshFromClientStore();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      unsubSettings();
      unsubSocials();
      unsubPackages();
      unsubReactions();
      unsubPortfolio();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, [refreshFromClientStore]);

  const currentTheme = settings.theme_preset || 'neo-warm';

  return (
    <div
      data-theme={currentTheme}
      className={cn(
        'min-h-screen bg-paper text-ink selection:bg-mustard selection:text-ink font-sans transition-colors duration-200',
        `theme-${currentTheme}`
      )}
    >
      {/* Top Announcement Bar */}
      <div className="bg-mustard border-b-2 border-ink py-2 px-4 text-center font-mono text-xs font-bold text-ink flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>
          {settings.announcement_text ||
            `Portal Media Kit Resmi & Endorsement Hub ${settings.creator_name || 'Sumbar Terkini'} 2026`}
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">{settings.location || 'Ranah Minang & Perantauan'}</span>
      </div>

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b-2 border-ink px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-ink text-paper font-mono font-black flex items-center justify-center border-2 border-ink shadow-neo-sm group-hover:bg-mustard group-hover:text-ink transition-colors overflow-hidden shrink-0">
              {settings.logo_url ? (
                <span className="relative w-full h-full p-1 block">
                  <Image
                    src={settings.logo_url}
                    alt={settings.logo_text || 'Logo'}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </span>
              ) : (
                <span>{settings.logo_text || 'ST'}</span>
              )}
            </span>
            <div>
              <span className="font-black text-lg text-ink tracking-tight block leading-tight">
                {settings.creator_name || 'Sumbar Terkini'}
              </span>
              <span className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider block">
                {settings.creator_title || settings.creator_handle || 'Media Kit & Hub'}
              </span>
            </div>
          </Link>

          {/* Public Header Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold text-ink">
            {(settings.header_menu_items && settings.header_menu_items.length > 0
              ? settings.header_menu_items.filter((m) => m.is_active !== false)
              : [
                  { id: '1', label: 'Bento Grid', href: '#socials-heading' },
                  { id: '2', label: 'Rate Card', href: '#rate-calculator' },
                  { id: '3', label: 'Portofolio', href: '#portfolio-showcase' },
                  { id: '4', label: 'Kontak', href: '#contact-hub' },
                ]
            ).map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="hover:text-coral transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={settings.header_cta_href || '#rate-calculator'}
              className="neo-button text-xs font-mono py-2 px-3.5 bg-mint text-ink rounded-xl flex items-center gap-1.5 min-h-[40px]"
            >
              <span>{settings.header_cta_text || 'Booking Slot'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* 1. Hero Section (F04, F05, F06) */}
        <HeroSection settings={settings} reactions={reactions} />

        {/* 2. Socials Bento Grid (F07, F08, F09) */}
        <BentoGrid
          platforms={platforms}
          badgeText={settings.bento_badge_text}
          titleText={settings.bento_title_text}
          subtitleText={settings.bento_subtitle_text}
        />

        {/* 3. Interactive Rate Card Calculator (F10, F11, F12) */}
        <RateCalculator
          packages={packages}
          whatsappNumber={settings.whatsapp_number}
          creatorName={settings.creator_name}
        />

        {/* 4. Portfolio Showcase (F13) */}
        <PortfolioSection items={portfolio} />

        {/* 5. Contact Hub & Copy Feedback (F14) */}
        <ContactHub
          email={settings.business_email}
          whatsappNumber={settings.whatsapp_number}
          mediaKitPdfUrl={settings.media_kit_pdf_url}
        />
      </main>

      {/* Tactile Neo-Brutalist Footer */}
      <footer className="border-t-2 border-ink bg-white mt-16 py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mustard border-2 border-ink shadow-neo-sm flex items-center justify-center font-mono font-black text-ink text-base overflow-hidden shrink-0">
              {settings.logo_url ? (
                <span className="relative w-full h-full p-1 block">
                  <Image
                    src={settings.logo_url}
                    alt={settings.logo_text || 'Logo'}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </span>
              ) : (
                <span>{settings.logo_text || 'ST'}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-ink">
                {settings.creator_name || 'Sumbar Terkini'} Official Media Kit & Endorsement Hub
              </p>
              <p className="font-mono text-xs text-ink/60 mt-0.5">
                {settings.location || 'Padang, Sumatera Barat, Indonesia'}. Hak Cipta 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold text-ink/80 flex-wrap justify-center">
            {(settings.header_menu_items && settings.header_menu_items.length > 0
              ? settings.header_menu_items.filter((m) => m.is_active !== false)
              : [
                  { id: '1', label: 'Bento Grid', href: '#socials-heading' },
                  { id: '2', label: 'Rate Card', href: '#rate-calculator' },
                  { id: '3', label: 'Portofolio', href: '#portfolio-showcase' },
                  { id: '4', label: 'Kontak', href: '#contact-hub' },
                ]
            ).map((item, idx, arr) => (
              <React.Fragment key={item.id}>
                <a href={item.href} className="hover:underline">
                  {item.label}
                </a>
                {idx < arr.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
