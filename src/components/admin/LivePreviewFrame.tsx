'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ExternalLink,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  PortfolioItem,
} from '@/types';
import { HeroSection } from '@/components/hero/HeroSection';
import { BentoGrid } from '@/components/socials/BentoGrid';
import { RateCalculator } from '@/components/calculator/RateCalculator';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { ContactHub } from '@/components/contact/ContactHub';
import { cn } from '@/lib/utils/cn';

export interface LivePreviewFrameProps {
  className?: string;
  onClose?: () => void;
  initialDevice?: 'mobile' | 'tablet' | 'desktop';
  defaultViewMode?: 'components' | 'iframe';
  overrideSettings?: SiteSettings | null;
  overridePlatforms?: SocialPlatform[];
  overridePackages?: EndorsePackage[];
  overridePortfolio?: PortfolioItem[];
}

export function LivePreviewFrame({
  className,
  onClose,
  initialDevice = 'mobile',
  defaultViewMode = 'components',
  overrideSettings,
  overridePlatforms,
  overridePackages,
  overridePortfolio,
}: LivePreviewFrameProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(initialDevice);
  const [viewMode, setViewMode] = useState<'components' | 'iframe'>(defaultViewMode);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [packages, setPackages] = useState<EndorsePackage[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reactions, setReactions] = useState<VisitorReaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Memuat...');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load initial repository state
  const loadInitialData = useCallback(async () => {
    try {
      const [s, pl, pk, rx, port] = await Promise.all([
        repository.getSiteSettings(),
        repository.getSocialPlatforms(),
        repository.getEndorsePackages(),
        repository.getReactions(),
        repository.getPortfolioItems(),
      ]);
      setSettings(s);
      setPlatforms(pl);
      setPackages(pk);
      setReactions(rx);
      setPortfolio(port);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch {
      // In-memory or offline fallback
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // Real-time synchronization via DAL & BroadcastChannel
  useEffect(() => {
    const handleSync = () => {
      setIsSyncing(true);
      void loadInitialData().finally(() => {
        setTimeout(() => setIsSyncing(false), 400);
      });
      // Also reload iframe if in iframe mode
      if (viewMode === 'iframe' && iframeRef.current) {
        setIframeKey(Date.now());
      }
    };

    const unsubSettings = repository.subscribeToChanges('site_settings', handleSync);
    const unsubSocials = repository.subscribeToChanges('social_platforms', handleSync);
    const unsubPackages = repository.subscribeToChanges('endorse_packages', handleSync);
    const unsubReactions = repository.subscribeToChanges('visitor_reactions', handleSync);
    const unsubPortfolio = repository.subscribeToChanges('portfolio_items', handleSync);

    // Redundant window storage event for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('sumbar_')) {
        handleSync();
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
  }, [loadInitialData, viewMode]);

  const handleManualReload = () => {
    setIsSyncing(true);
    setIframeKey(Date.now());
    void loadInitialData().finally(() => {
      setTimeout(() => setIsSyncing(false), 400);
    });
  };

  const activeSettings = overrideSettings || settings;
  const activePlatforms =
    overridePlatforms && overridePlatforms.length > 0 ? overridePlatforms : platforms;
  const activePackages =
    overridePackages && overridePackages.length > 0 ? overridePackages : packages;
  const activePortfolio =
    overridePortfolio && overridePortfolio.length > 0 ? overridePortfolio : portfolio;

  const currentTheme = activeSettings?.theme_preset || 'neo-warm';

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-2 border-ink rounded-2xl shadow-neo overflow-hidden font-sans w-full max-w-full',
        className
      )}
    >
      {/* Frame Top Chrome / Control Toolbar */}
      <div className="bg-paper border-b-2 border-ink px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Mock window traffic light dots & live badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-coral" />
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-mustard" />
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-mint" />
          </div>

          <div className="flex items-center gap-1 ml-1 sm:ml-2 font-mono text-[10px] sm:text-[11px] font-bold text-ink/70">
            <span
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                isSyncing ? 'bg-mustard animate-ping' : 'bg-mint'
              )}
            />
            <span className="hidden xs:inline truncate max-w-[120px]">
              {isSyncing ? 'Sync...' : `Sync ${lastSyncTime}`}
            </span>
          </div>
        </div>

        {/* Device Viewport Selector */}
        <div className="flex items-center bg-white border-2 border-ink rounded-xl p-0.5 shadow-neo-sm">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            title="Mobile View (375px)"
            className={cn(
              'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              device === 'mobile' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Mobile Viewport"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
            className={cn(
              'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              device === 'tablet' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Tablet Viewport"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            title="Desktop / Fluid View (100%)"
            className={cn(
              'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              device === 'desktop' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Desktop Viewport"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'components' ? 'iframe' : 'components'))}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-ink text-xs font-mono font-bold bg-white text-ink hover:bg-paper min-h-[44px]"
            title="Ganti Mode: Komponen Langsung vs Iframe Browser"
          >
            <Layers className="w-4 h-4 text-ink" />
            <span>{viewMode === 'components' ? 'Komponen' : 'Iframe'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualReload}
            className="p-2 rounded-xl border-2 border-ink text-ink bg-white hover:bg-paper transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Refresh Live Preview"
            aria-label="Refresh Preview"
          >
            <RotateCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border-2 border-ink text-ink bg-white hover:bg-paper transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Buka Website di Tab Baru"
            aria-label="Open New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border-2 border-ink bg-coral/20 text-ink hover:bg-coral/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ml-0.5"
              title="Tutup Preview"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5 text-coral font-black" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Body / Scaled Viewport Container */}
      <div className="flex-1 bg-paper/60 p-2 sm:p-4 overflow-y-auto flex items-start justify-center w-full">
        <div
          data-theme={currentTheme}
          className={cn(
            'bg-paper border-2 border-ink shadow-neo rounded-xl overflow-hidden transition-all duration-300 w-full',
            `theme-${currentTheme}`,
            device === 'mobile' && 'max-w-full sm:max-w-[375px]',
            device === 'tablet' && 'max-w-[768px]',
            device === 'desktop' && 'max-w-full'
          )}
        >
          {viewMode === 'components' && activeSettings ? (
            <div className="divide-y-2 divide-ink/20">
              {/* Preview Announcement Bar */}
              <div className="bg-mustard border-b-2 border-ink py-2 px-3 text-center font-mono text-xs font-bold text-ink flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1">
                  {activeSettings.announcement_text ||
                    `[PREVIEW] Media Kit ${activeSettings.creator_name || 'Sumbar Terkini'}`}
                </span>
              </div>

              {/* Preview Mini Navigation Bar */}
              <div className="bg-paper/95 border-b-2 border-ink px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-ink text-paper font-mono font-black text-xs flex items-center justify-center border border-ink shadow-neo-sm overflow-hidden shrink-0">
                    {activeSettings.logo_text || 'ST'}
                  </span>
                  <span className="font-black text-xs text-ink tracking-tight truncate max-w-[130px]">
                    {activeSettings.creator_name || 'Sumbar Terkini'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                  {(activeSettings.header_menu_items && activeSettings.header_menu_items.length > 0
                    ? activeSettings.header_menu_items.filter((m) => m.is_active !== false)
                    : [
                        { id: '1', label: 'Bento' },
                        { id: '2', label: 'Rates' },
                      ]
                  ).slice(0, 3).map((item) => (
                    <span key={item.id} className="text-ink/70 hidden sm:inline">
                      {item.label}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-mint text-ink rounded-lg border border-ink shadow-neo-sm">
                    {activeSettings.header_cta_text || 'Booking'}
                  </span>
                </div>
              </div>

              {/* Live Rendered Public Sections */}
              <div className="p-3 sm:p-4 space-y-6">
                <HeroSection settings={activeSettings} reactions={reactions} />
                <BentoGrid
                  platforms={activePlatforms}
                  badgeText={activeSettings.bento_badge_text}
                  titleText={activeSettings.bento_title_text}
                  subtitleText={activeSettings.bento_subtitle_text}
                />
                <RateCalculator
                  packages={activePackages}
                  whatsappNumber={activeSettings.whatsapp_number}
                  creatorName={activeSettings.creator_name}
                />
                <PortfolioSection items={activePortfolio} />
                <ContactHub
                  email={activeSettings.business_email}
                  whatsappNumber={activeSettings.whatsapp_number}
                  mediaKitPdfUrl={activeSettings.media_kit_pdf_url}
                />
              </div>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/"
              title="Live Preview Website"
              className="w-full min-h-[750px] border-none bg-paper"
            />
          )}
        </div>
      </div>
    </div>
  );
}
