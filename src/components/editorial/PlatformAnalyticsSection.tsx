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
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterTab = 'all' | 'instagram' | 'tiktok' | 'facebook';

export function PlatformAnalyticsSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { platforms, demographics } = MEDIA_KIT_DATA;

  const filteredPlatforms =
    activeTab === 'all'
      ? platforms
      : platforms.filter((p) => p.id === activeTab);

  const tabs: { id: FilterTab; label: string; countBadge?: string }[] = [
    { id: 'all', label: 'Semua Platform', countBadge: '3 Akun Resmi' },
    { id: 'instagram', label: 'Instagram', countBadge: '31,5K' },
    { id: 'tiktok', label: 'TikTok', countBadge: '86,2K' },
    { id: 'facebook', label: 'Facebook', countBadge: '212,5K' },
  ];

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
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-xl bg-white border-2 border-ink shadow-neo-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 border-2 ${
              activeTab === tab.id
                ? 'bg-mustard text-ink border-ink shadow-neo-sm'
                : 'bg-paper text-ink border-transparent hover:border-ink/30'
            }`}
          >
            <span>{tab.label}</span>
            {tab.countBadge && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  activeTab === tab.id
                    ? 'bg-white text-ink border-ink'
                    : 'bg-white text-ink/70 border-ink/20'
                }`}
              >
                {tab.countBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Platform Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence mode="popLayout">
          {filteredPlatforms.map((plat) => (
            <motion.div
              key={plat.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="neo-badge bg-paper text-ink text-[11px] font-mono mb-1 inline-block">
                      {plat.badge}
                    </span>
                    <h3 className="text-xl font-black text-ink font-sans flex items-center gap-2">
                      {plat.name}
                    </h3>
                    <p className="text-xs font-mono font-bold text-ink/70 mt-0.5">
                      {plat.handle}
                    </p>
                  </div>

                  <a
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-paper hover:bg-mustard border-2 border-ink flex items-center justify-center text-ink transition-colors shadow-neo-sm shrink-0"
                    title={`Kunjungi profil ${plat.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-ink/80 leading-relaxed mb-6 font-normal">
                  {plat.description}
                </p>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Followers */}
                  <div className="p-3 rounded-xl bg-paper border-2 border-ink">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">
                      <Users className="w-3.5 h-3.5 text-ink" />
                      <span>Followers</span>
                    </div>
                    <div className="text-lg font-mono font-black text-ink">
                      {plat.followersFormatted}
                    </div>
                  </div>

                  {/* ER */}
                  <div className="p-3 rounded-xl bg-mint/40 border-2 border-ink">
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

              {/* Action Link Button */}
              <a
                href={plat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-button w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white hover:bg-mustard text-ink text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 border-ink shadow-neo-sm mt-2"
              >
                <span>Kunjungi Akun Resmi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Audience Demographics Summary Widget */}
      <div className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo p-6 sm:p-8">
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
