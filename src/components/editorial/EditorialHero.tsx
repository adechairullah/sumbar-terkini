'use client';

import React from 'react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Eye,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function EditorialHero() {
  const { brand, platforms } = MEDIA_KIT_DATA;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800">
      {/* Background Decorative Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-red-900/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-amber-500/10 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col gap-5 text-left"
          >
            {/* Followers Pill Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-700/60 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                {brand.followersBadge}
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <span className="text-xs sm:text-sm font-mono font-bold text-red-400 uppercase tracking-widest block mb-1">
                {brand.name} Media Kit & Paid Promote
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] font-sans">
                {brand.tagline}
              </h1>
            </div>

            {/* Editorial Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-sans">
              {brand.description}
            </p>

            {/* Trust Points Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200">100% Organik & Anti-Bot</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200">Bebas Collab Post Gratis</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 col-span-2 sm:col-span-1">
                <TrendingUp className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200">Algoritma Viral & FYP</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <a
                href="#pricing-calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-950/50 hover:shadow-red-900/60 transition-all border border-red-500"
              >
                <span>Pasang Iklan Sekarang</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </a>

              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wide border border-slate-700 hover:border-slate-600 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hubungi WhatsApp</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Platform Fast Snapshot Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    Jaringan Media Resmi
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                  3 Platform Aktif
                </span>
              </div>

              {/* 3 Platforms Quick Cards */}
              <div className="space-y-3 mt-4">
                {platforms.map((plat) => (
                  <a
                    key={plat.id}
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-red-700/80 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: plat.color }}
                        >
                          {plat.id === 'instagram' ? 'IG' : plat.id === 'tiktok' ? 'TT' : 'FB'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {plat.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {plat.handle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black font-mono text-white">
                          {plat.followersFormatted}
                        </div>
                        <div className="text-[10px] font-mono text-amber-400 font-semibold">
                          ER: {plat.er}%
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Monthly Footprint Total Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-red-300 uppercase tracking-wider font-semibold">
                    Estimasi Total Impresi Bulanan
                  </div>
                  <div className="text-lg font-black font-mono text-amber-300">
                    12.5 Juta+ Tayangan
                  </div>
                </div>
                <Users className="w-8 h-8 text-red-500/60" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

