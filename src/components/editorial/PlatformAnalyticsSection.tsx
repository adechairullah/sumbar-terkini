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
    { id: 'all', label: 'Semua Platform', countBadge: '3 Akun' },
    { id: 'instagram', label: 'Instagram', countBadge: '31,5K' },
    { id: 'tiktok', label: 'TikTok', countBadge: '86,2K' },
    { id: 'facebook', label: 'Facebook', countBadge: '212,5K' },
  ];

  return (
    <section id="platform-analytics" className="py-14 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block mb-2">
            Metrik & Data Jangkauan Otentik
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
            Jangkauan & Analitik Platform
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
            Data audiens nyata media massa regional terdepan dengan benchmark keterlibatan (engagement) di atas rata-rata industri media digital Indonesia.
          </p>

          {/* Interactive Platform Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 w-fit mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-red-700 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.countBadge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      activeTab === tab.id
                        ? 'bg-red-950 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.countBadge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Metric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlatforms.map((plat) => (
              <motion.div
                key={plat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group"
              >
                {/* Accent Top Border Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: plat.color }}
                />

                <div>
                  {/* Header: Logo, Name, Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                        style={{ backgroundColor: plat.color }}
                      >
                        {plat.id === 'instagram' ? 'IG' : plat.id === 'tiktok' ? 'TT' : 'FB'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                          {plat.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400">{plat.handle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      {plat.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                    {plat.description}
                  </p>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Total Followers
                      </div>
                      <div className="text-xl font-black font-mono text-white mt-0.5">
                        {plat.followers.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                        ✓ 100% Organik
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Engagement Rate
                      </div>
                      <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                        {plat.er}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Tinggi Regional
                      </div>
                    </div>
                  </div>

                  {/* Secondary Metrics List */}
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-red-400" />
                        Jangkauan Rata-rata:
                      </span>
                      <span className="font-bold text-white">{plat.reachRange}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Impresi Bulanan:
                      </span>
                      <span className="font-bold text-emerald-300">{plat.monthlyMetric}</span>
                    </div>

                    <div className="flex flex-col p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] uppercase">
                        {plat.secondaryMetricLabel}
                      </span>
                      <span className="font-bold text-amber-300 text-xs mt-0.5">
                        {plat.secondaryMetricValue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visit Official Account Link */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <a
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
                  >
                    <span>Kunjungi Akun Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Audience Demographics Summary Widget (Section 2.4 in prompt) */}
        <div className="mt-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                Audience Profiling
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ringkasan Demografi Audiens Sumbar Terkini
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-300 border border-slate-700">
                Audience Lintas Usia & Wilayah
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Demographics by Location */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-red-400" />
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Distribusi Wilayah & Geografis
                </h4>
              </div>

              <div className="space-y-3.5">
                {demographics.locations.map((loc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-medium">{loc.name}</span>
                      <span className="text-amber-300 font-bold">{loc.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${loc.percentage}%`,
                          backgroundColor: loc.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-3">
                *Sangat dominan di pusat kota & nagari Sumatera Barat serta komunitas perantau Minang di Jabodetabek & Riau.
              </p>
            </div>

            {/* Demographics by Age */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Rentang Usia Audiens Aktif
                </h4>
              </div>

              <div className="space-y-3.5">
                {demographics.ageGroups.map((age, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-medium">Usia {age.range}</span>
                      <span className="text-emerald-400 font-bold">{age.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${age.percentage}%`,
                          backgroundColor: age.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-3">
                *Sebanyak 65% audiens berada pada usia produktif (25-44 tahun) dengan daya beli mandiri dan keputusan konsumsi tinggi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

