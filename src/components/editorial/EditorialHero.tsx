'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  MapPin,
  Flame,
} from 'lucide-react';
import { ParticleMoodClicker } from '@/components/hero/ParticleMoodClicker';
import { CreatorTrustRadar } from '@/components/hero/CreatorTrustRadar';
import { VisitorReaction } from '@/types';

interface EditorialHeroProps {
  reactions?: VisitorReaction[];
}

export function EditorialHero({ reactions = [] }: EditorialHeroProps) {
  const { brand } = MEDIA_KIT_DATA;

  return (
    <section className="neo-card p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-ink shadow-neo-lg mb-12 sm:mb-16 relative overflow-hidden">
      {/* Top Decorative Neo-Brutalist Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b-2 border-ink/10">
        <div className="flex items-center gap-2">
          <span className="neo-badge bg-mustard text-ink text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Media Digital Resmi 2026</span>
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-ink/70">
            <MapPin className="w-3.5 h-3.5 text-ink" />
            <span>{brand.location}</span>
          </div>
        </div>

        {/* Live Followers Pill Badge */}
        <div className="neo-badge bg-coral text-ink text-xs font-mono font-bold flex items-center gap-1.5 shadow-neo-sm">
          <span className="flex h-2 w-2 rounded-full bg-ink animate-ping" />
          <span>{brand.followersBadge}</span>
        </div>
      </div>

      {/* Main Grid: Left Column Hero Identity & CTAs, Right Column Reactions & Trust */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Avatar & Title Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Official Logo Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 sm:border-3 border-ink shadow-neo overflow-hidden bg-white shrink-0 p-1">
              <Image
                src="/logo-sumbar-terkini.png"
                alt={brand.name}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight font-sans">
                  {brand.name}
                </h1>
                <CheckCircle2
                  className="w-7 h-7 text-mint fill-mint/30 stroke-ink"
                  aria-label="Verified Digital Media"
                />
              </div>

              <p className="text-sm sm:text-base font-bold text-ink/90 font-sans">
                {brand.tagline}
              </p>
              <p className="font-mono text-xs sm:text-sm font-bold text-ink/70 mt-1">
                @sumbarterkini_id
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-sans max-w-2xl font-normal">
            {brand.description}
          </p>

          {/* Trust Highlights Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-paper border-2 border-ink flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-ink shrink-0" />
              <span className="text-xs font-bold text-ink font-mono">100% Organik & Anti-Bot</span>
            </div>
            <div className="p-3 rounded-xl bg-paper border-2 border-ink flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-ink shrink-0" />
              <span className="text-xs font-bold text-ink font-mono">Bebas Collab Post Gratis</span>
            </div>
            <div className="p-3 rounded-xl bg-paper border-2 border-ink flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-ink shrink-0" />
              <span className="text-xs font-bold text-ink font-mono">Algoritma Viral & FYP</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href="#order-calculator-widget"
              className="neo-button min-h-[48px] px-6 py-3.5 rounded-xl bg-mustard hover:bg-mustard-hover text-ink text-sm sm:text-base font-black flex items-center gap-2 border-2 border-ink shadow-neo"
            >
              <span>Pasang Iklan Sekarang</span>
              <ArrowRight className="w-4 h-4 text-ink" />
            </a>

            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-button min-h-[48px] px-6 py-3.5 rounded-xl bg-mint hover:bg-mint-hover text-ink text-sm sm:text-base font-black flex items-center gap-2 border-2 border-ink shadow-neo"
            >
              <MessageCircle className="w-5 h-5 text-ink" />
              <span>Hubungi WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column (lg:col-span-4): Visitor Reactions & Trust Radar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Reaction Mood Clicker */}
          <div className="neo-card p-5 bg-paper rounded-2xl border-2 border-ink shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70">
                Respon Pembaca & Mitra:
              </span>
              <span className="neo-badge bg-white text-ink text-[10px] font-mono">
                Live Clicker
              </span>
            </div>
            <ParticleMoodClicker initialReactions={reactions} />
          </div>

          {/* Creator Trust Radar Card */}
          <CreatorTrustRadar />
        </div>
      </div>
    </section>
  );
}
