'use client';

import React, { useState } from 'react';
import { MEDIA_KIT_DATA, PlatformMetric } from '@/data/mediaKitData';
import {
  ExternalLink,
  Users,
  Eye,
  TrendingUp,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterTab = 'all' | 'instagram' | 'tiktok' | 'facebook';

// Official SVG Brand Icons
function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.75a8.16 8.16 0 0 0 4.77 1.52v-3.45a4.85 4.85 0 0 1-.87-.13z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function PlatformAnalyticsSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { platforms, demographics } = MEDIA_KIT_DATA;

  const filteredPlatforms =
    activeTab === 'all'
      ? platforms
      : platforms.filter((p) => p.id === activeTab);

  const tabs: {
    id: FilterTab;
    label: string;
    countBadge?: string;
    icon: React.ReactNode;
    activeColorClass: string;
  }[] = [
    {
      id: 'all',
      label: 'Semua Platform',
      countBadge: '3 Akun',
      icon: <Layers className="w-4 h-4 text-ink" />,
      activeColorClass: 'bg-mustard text-ink',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      countBadge: '31,5K',
      icon: <InstagramIcon className="w-4 h-4 text-[#E1306C]" />,
      activeColorClass: 'bg-[#FCE4EC] text-ink border-[#E1306C]',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      countBadge: '86,2K',
      icon: <TikTokIcon className="w-4 h-4 text-ink" />,
      activeColorClass: 'bg-paper text-ink border-ink',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      countBadge: '212,5K',
      icon: <FacebookIcon className="w-4 h-4 text-[#1877F2]" />,
      activeColorClass: 'bg-[#E3F2FD] text-ink border-[#1877F2]',
    },
  ];

  // Helper to render platform-specific branding
  const getPlatformBrandConfig = (id: string) => {
    switch (id) {
      case 'instagram':
        return {
          icon: <InstagramIcon className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
          cardBg: 'bg-[#FFF5F8]',
          badgeBg: 'bg-[#FCE4EC] text-[#880E4F] border-[#E1306C]',
          cardBorderTop: '#E1306C',
          btnBg: 'bg-[#E1306C] hover:bg-[#C13584] text-white',
          themeAccent: '#E1306C',
        };
      case 'tiktok':
        return {
          icon: <TikTokIcon className="w-6 h-6 text-white" />,
          iconBg: 'bg-[#000000]',
          cardBg: 'bg-[#F8FAFC]',
          badgeBg: 'bg-white text-ink border-ink',
          cardBorderTop: '#00F2FE',
          btnBg: 'bg-ink hover:bg-ink/90 text-paper',
          themeAccent: '#111111',
        };
      case 'facebook':
        return {
          icon: <FacebookIcon className="w-6 h-6 text-white" />,
          iconBg: 'bg-[#1877F2]',
          cardBg: 'bg-[#F0F7FF]',
          badgeBg: 'bg-[#E3F2FD] text-[#0D47A1] border-[#1877F2]',
          cardBorderTop: '#1877F2',
          btnBg: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
          themeAccent: '#1877F2',
        };
      default:
        return {
          icon: <Users className="w-6 h-6 text-ink" />,
          iconBg: 'bg-mustard',
          cardBg: 'bg-white',
          badgeBg: 'bg-paper text-ink border-ink',
          cardBorderTop: '#FFD166',
          btnBg: 'bg-white text-ink hover:bg-mustard',
          themeAccent: '#FFD166',
        };
    }
  };

  return (
    <section id="socials-heading" className="my-12 sm:my-16" aria-labelledby="analytics-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mint text-ink text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Jangkauan & Analitik Terverifikasi</span>
          </div>
          <h2 id="analytics-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Jangkauan & Analitik Platform
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Data industri media digital dengan benchmark engagement realistis berbasis 330.200+ followers aktif di Sumatera Barat dan nasional.
          </p>
        </div>

        {/* Total Reach Summary Badge */}
        <div className="neo-card p-3 sm:p-4 bg-mustard rounded-xl border-2 border-ink shadow-neo-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border-2 border-ink flex items-center justify-center font-mono font-bold text-ink shrink-0">
            <Users className="w-5 h-5 text-ink" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-ink/70">
              Total Jangkauan Aktif
            </div>
            <div className="text-lg font-mono font-black text-ink">
              330.200+ Akun
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: Interactive Platform Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8 p-1.5 rounded-2xl bg-white border-2 border-ink shadow-neo-sm w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border-2 ${
                isActive
                  ? `${tab.activeColorClass} shadow-neo-sm`
                  : 'bg-paper text-ink border-transparent hover:border-ink/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.countBadge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                    isActive
                      ? 'bg-white text-ink border-ink'
                      : 'bg-white text-ink/70 border-ink/20'
                  }`}
                >
                  {tab.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Platform Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence mode="popLayout">
          {filteredPlatforms.map((plat) => {
            const brandCfg = getPlatformBrandConfig(plat.id);
            return (
              <motion.div
                key={plat.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25 }}
                className={`neo-card rounded-2xl border-2 border-ink shadow-neo p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-transform relative overflow-hidden ${brandCfg.cardBg}`}
              >
                {/* Platform Signature Top Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: brandCfg.themeAccent }}
                />

                <div className="pt-1">
                  {/* Platform Header: Icon + Name + External Link */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Platform Icon Badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl border-2 border-ink shadow-neo-sm flex items-center justify-center shrink-0 ${brandCfg.iconBg}`}
                      >
                        {brandCfg.icon}
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-ink font-sans leading-tight">
                          {plat.name}
                        </h3>
                        <p className="text-xs font-mono font-bold text-ink/70">
                          {plat.handle}
                        </p>
                      </div>
                    </div>

                    <a
                      href={plat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-paper hover:bg-mustard border-2 border-ink flex items-center justify-center text-ink transition-colors shadow-neo-sm shrink-0"
                      title={`Buka ${plat.name} Sumbar Terkini`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Platform Category Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${brandCfg.badgeBg}`}
                    >
                      {plat.badge}
                    </span>
                  </div>

                  <p className="text-xs text-ink/80 leading-relaxed mb-6 font-normal">
                    {plat.description}
                  </p>

                  {/* Key Numbers Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Followers */}
                    <div className="p-3.5 rounded-xl bg-paper border-2 border-ink">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">
                        <Users className="w-3.5 h-3.5 text-ink" />
                        <span>Followers</span>
                      </div>
                      <div className="text-lg font-mono font-black text-ink">
                        {plat.followersFormatted}
                      </div>
                    </div>

                    {/* ER */}
                    <div className="p-3.5 rounded-xl bg-mint/40 border-2 border-ink">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-ink" />
                        <span>Avg. ER</span>
                      </div>
                      <div className="text-lg font-mono font-black text-ink">
                        {plat.er}%
                      </div>
                    </div>
                  </div>

                  {/* Performance Metric List */}
                  <div className="space-y-2 mb-4 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-ink/20">
                      <span className="text-ink/70">Jangkauan / Post:</span>
                      <span className="font-bold text-ink">{plat.reachRange}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-ink/20">
                      <span className="text-ink/70">Jangkauan Bulanan:</span>
                      <span className="font-bold text-ink">{plat.monthlyMetric}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-ink/20">
                      <span className="text-ink/70">{plat.secondaryMetricLabel}:</span>
                      <span className="font-bold text-ink">{plat.secondaryMetricValue}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Visit Action Button */}
                <a
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`neo-button w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 border-ink shadow-neo-sm mt-2 ${brandCfg.btnBg}`}
                >
                  <span>Kunjungi Akun Resmi {plat.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Audience Demographics Summary Widget */}
      <div className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-mustard" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-ink/10">
          <div>
            <span className="neo-badge bg-mustard text-ink text-xs mb-1 inline-block">
              Demografi Terdistribusi
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight font-sans">
              Profil & Persebaran Audiens Sumbar Terkini
            </h3>
          </div>
          <div className="text-xs font-mono text-ink/70">
            Berbasis data gabungan 330.200+ followers
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Location Breakdown */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ink" />
              <span>Persebaran Lokasi Utama:</span>
            </h4>
            <div className="space-y-3">
              {demographics.locations.map((loc) => (
                <div key={loc.name}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-ink">{loc.name}</span>
                    <span className="font-black text-ink">{loc.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-paper border-2 border-ink overflow-hidden">
                    <div
                      className="h-full bg-mustard"
                      style={{ width: `${loc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Distribution Breakdown */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ink" />
              <span>Rentang Usia Dominan (18-44 Tahun = 90%):</span>
            </h4>
            <div className="space-y-3">
              {demographics.ageGroups.map((age) => (
                <div key={age.range}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-ink">Usia {age.range} Tahun</span>
                    <span className="font-black text-ink">{age.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-paper border-2 border-ink overflow-hidden">
                    <div
                      className="h-full bg-mint"
                      style={{ width: `${age.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
