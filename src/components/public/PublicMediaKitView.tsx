'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings, SocialPlatform, EndorsePackage, VisitorReaction, PortfolioItem } from '@/types';
import { repository } from '@/lib/data/repository';
import { EditorialNavbar } from '@/components/editorial/EditorialNavbar';
import { EditorialHero } from '@/components/editorial/EditorialHero';
import { PlatformAnalyticsSection } from '@/components/editorial/PlatformAnalyticsSection';
import { RateCardPricingSection } from '@/components/editorial/RateCardPricingSection';
import { OrderCalculatorSection } from '@/components/editorial/OrderCalculatorSection';
import { PortfolioShowcaseSection } from '@/components/editorial/PortfolioShowcaseSection';
import { TermsAccordionSection } from '@/components/editorial/TermsAccordionSection';
import { ContactHub } from '@/components/contact/ContactHub';
import { EditorialFooter } from '@/components/editorial/EditorialFooter';
import { MobileStickyCta } from '@/components/editorial/MobileStickyCta';

export interface PublicMediaKitViewProps {
  initialSettings?: SiteSettings;
  initialPlatforms?: SocialPlatform[];
  initialPackages?: EndorsePackage[];
  initialReactions?: VisitorReaction[];
  portfolioItems?: PortfolioItem[];
}

export function PublicMediaKitView({
  initialSettings,
  initialPlatforms,
  initialPackages,
  initialReactions,
  portfolioItems,
}: PublicMediaKitViewProps) {
  const [settings, setSettings] = useState<SiteSettings | undefined>(initialSettings);
  const [platforms, setPlatforms] = useState<SocialPlatform[] | undefined>(initialPlatforms);
  const [packages, setPackages] = useState<EndorsePackage[] | undefined>(initialPackages);
  const [reactions, setReactions] = useState<VisitorReaction[] | undefined>(initialReactions);
  const [portfolio, setPortfolio] = useState<PortfolioItem[] | undefined>(portfolioItems);

  const [selectedPackageId, setSelectedPackageId] = useState<string>('combo-reels');

  // Client-side synchronization with repository fallback
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
      // Offline mock fallback
    }
  }, []);

  useEffect(() => {
    void refreshFromClientStore();

    // Subscribe to cross-tab & realtime DAL broadcasts
    const unsubSettings = repository.subscribeToChanges('site_settings', (e) => {
      if (e.payload) setSettings(e.payload as SiteSettings);
      else void refreshFromClientStore();
    });

    const unsubSocials = repository.subscribeToChanges('social_platforms', (e) => {
      if (e.payload && Array.isArray(e.payload)) setPlatforms(e.payload as SocialPlatform[]);
      else void refreshFromClientStore();
    });

    const unsubPackages = repository.subscribeToChanges('endorse_packages', (e) => {
      if (e.payload && Array.isArray(e.payload)) setPackages(e.payload as EndorsePackage[]);
      else void refreshFromClientStore();
    });

    const unsubReactions = repository.subscribeToChanges('visitor_reactions', (e) => {
      if (e.payload && Array.isArray(e.payload)) setReactions(e.payload as VisitorReaction[]);
      else void refreshFromClientStore();
    });

    const unsubPortfolio = repository.subscribeToChanges('portfolio_items', (e) => {
      if (e.payload && Array.isArray(e.payload)) setPortfolio(e.payload as PortfolioItem[]);
      else void refreshFromClientStore();
    });

    return () => {
      unsubSettings();
      unsubSocials();
      unsubPackages();
      unsubReactions();
      unsubPortfolio();
    };
  }, [refreshFromClientStore]);

  // Check if platforms are explicitly empty for graceful fallback
  const isPlatformsEmpty = platforms !== undefined && platforms.length === 0;

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-mustard selection:text-ink flex flex-col font-sans overflow-x-hidden">
      {/* 1. Top Navbar with Official Brand Logo */}
      <EditorialNavbar />

      {/* Main Content Container (Mobile-Ergonomic Padding) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-28 sm:pb-16 flex-1 w-full">
        {/* 2. Brand Profile & Hero Section (Enlarged 1:1 Full Logo Avatar & Dynamic Realtime Slot) */}
        <EditorialHero reactions={reactions} />

        {/* Empty platforms fallback state if platforms array is empty */}
        {isPlatformsEmpty ? (
          <div className="neo-card p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-ink shadow-neo my-6">
            <div className="w-16 h-16 rounded-2xl bg-mustard border-2 border-ink shadow-neo flex items-center justify-center mx-auto mb-4 text-2xl">
              📡
            </div>
            <h3 className="text-xl font-black text-ink mb-2">
              Belum ada platform terdaftar
            </h3>
            <p className="text-sm font-medium text-ink/70 max-w-md mx-auto">
              Silakan aktifkan atau tambahkan platform media sosial melalui CMS Admin Dashboard.
            </p>
          </div>
        ) : (
          /* 3. Jangkauan & Analitik Platform (Platform Switcher with Custom Social Media Icons & Colors) */
          <PlatformAnalyticsSection />
        )}

        {/* 4. Rate Card & Pricing Packages (5 Packages with Highlighted Free Instagram Story) */}
        <RateCardPricingSection onSelectPackage={setSelectedPackageId} />

        {/* 5. Essential Interactive Widget 1: Order & Price Calculator + Auto WhatsApp Generator */}
        <OrderCalculatorSection
          selectedPackageId={selectedPackageId}
          onSelectPackage={setSelectedPackageId}
        />

        {/* 6. Active Instagram Collaboration Showcase Grid with Exact Statistics */}
        <PortfolioShowcaseSection />

        {/* 7. Essential Interactive Widget 3: Accordion Syarat & Ketentuan (T&C) Iklan */}
        <TermsAccordionSection />

        {/* 8. Official Contact Hub with Instant PDF Download & Copy Buttons */}
        <ContactHub
          email={settings?.business_email || 'mrrobot4444@gmail.com'}
          whatsappNumber={settings?.whatsapp_number || '6289617662378'}
          mediaKitPdfUrl="/media-kit-sumbar-terkini.pdf"
        />
      </main>

      {/* 9. Tactile Neo-Brutalist Footer with Official Logo */}
      <EditorialFooter />

      {/* 10. Mobile Sticky Floating CTA Bar */}
      <MobileStickyCta />
    </div>
  );
}
