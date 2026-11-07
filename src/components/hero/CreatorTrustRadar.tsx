'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Gift,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CreatorTrustRadarProps {
  title?: string;
  guarantee1?: string;
  guarantee2?: string;
  guarantee3?: string;
  bonusText?: string;
  whatsappNumber?: string;
  creatorName?: string;
  className?: string;
}

type RadarTab = 'guarantee' | 'niche' | 'bonus';

const NICHE_DATA = {
  kuliner: {
    label: '🍲 Kuliner',
    reach: '250K - 600K+',
    engagement: 'Tinggi (Viral Makan Padang)',
    format: '1x Reels Review + Story Link',
  },
  fashion: {
    label: '👗 Fashion',
    reach: '180K - 420K+',
    engagement: '70% Wanita Muda Minang',
    format: '1x Reels OOTD + Carousel Detail',
  },
  tech: {
    label: '📱 Gadget',
    reach: '150K - 350K+',
    engagement: 'Klik Link Voucher Tinggi',
    format: '1x Video Unboxing + Story Swipe',
  },
  wisata: {
    label: '🏨 Wisata',
    reach: '300K - 750K+',
    engagement: 'Viral Potensi FYP Nasional',
    format: 'Cinematic B-Roll Reels + Tag Lokasi',
  },
} as const;

type NicheKey = keyof typeof NICHE_DATA;

export function CreatorTrustRadar({
  title = 'Garansi Resmi & Radar Kolaborasi',
  guarantee1 = '100% Organik & Anti-Bot Minang',
  guarantee2 = 'Garansi 2x Revisi Draft Konten',
  guarantee3 = 'Laporan Transparan Analytics H+3',
  bonusText = 'Bonus Free Repost Story 24 Jam',
  whatsappNumber = '6281234567890',
  creatorName = 'Sumbar Terkini',
  className,
}: CreatorTrustRadarProps) {
  const [activeTab, setActiveTab] = useState<RadarTab>('guarantee');
  const [selectedNiche, setSelectedNiche] = useState<NicheKey>('kuliner');

  const currentNiche = NICHE_DATA[selectedNiche];

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Halo Tim ${creatorName}! 👋 Saya tertarik dengan jaminan kolaborasi dan ingin booking endorsement untuk niche ${currentNiche.label}. Mohon info slot terdekat ya. Terima kasih!`
  )}`;

  return (
    <div
      className={cn(
        'neo-card p-3.5 sm:p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm relative overflow-hidden flex flex-col gap-3',
        className
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-ink/10 gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-ink uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-mint stroke-ink fill-mint/30" />
          <span className="truncate">{title}</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-ink/30 text-ink/80 shadow-neo-xs shrink-0">
          ✓ Verified
        </span>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="grid grid-cols-3 gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('guarantee')}
          className={cn(
            'py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border transition-all text-center min-h-[38px] flex items-center justify-center gap-1',
            activeTab === 'guarantee'
              ? 'bg-mustard text-ink border-ink shadow-neo-xs font-black'
              : 'bg-white text-ink/70 border-ink/20 hover:text-ink'
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Garansi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('niche')}
          className={cn(
            'py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border transition-all text-center min-h-[38px] flex items-center justify-center gap-1',
            activeTab === 'niche'
              ? 'bg-mint text-ink border-ink shadow-neo-xs font-black'
              : 'bg-white text-ink/70 border-ink/20 hover:text-ink'
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Radar Niche</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bonus')}
          className={cn(
            'py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border transition-all text-center min-h-[38px] flex items-center justify-center gap-1',
            activeTab === 'bonus'
              ? 'bg-coral text-ink border-ink shadow-neo-xs font-black'
              : 'bg-white text-ink/70 border-ink/20 hover:text-ink'
          )}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Bonus</span>
        </button>
      </div>

      {/* Tab 1: 3 Poin Garansi Resmi */}
      {activeTab === 'guarantee' && (
        <div className="flex flex-col gap-2 pt-0.5">
          {[
            { text: guarantee1, sub: 'Jaminan audiens nyata warga Sumbar' },
            { text: guarantee2, sub: 'Kepuasan hasil sebelum konten tayang' },
            { text: guarantee3, sub: 'Bukti data tayangan transparan' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-ink/30 flex items-start gap-2 shadow-neo-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-mint stroke-ink shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="font-sans font-black text-xs text-ink leading-tight">
                  {item.text}
                </span>
                <span className="font-mono text-[10px] text-ink/60 mt-0.5">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Radar Niche Brand */}
      {activeTab === 'niche' && (
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="grid grid-cols-4 gap-1">
            {(Object.keys(NICHE_DATA) as NicheKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedNiche(key)}
                className={cn(
                  'py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold border text-center transition-all min-h-[36px]',
                  selectedNiche === key
                    ? 'bg-mustard text-ink border-ink shadow-neo-xs font-black'
                    : 'bg-white text-ink/70 border-ink/20 hover:text-ink'
                )}
              >
                {NICHE_DATA[key].label}
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-ink/30 flex flex-col gap-1 shadow-neo-xs text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink/60 uppercase">Estimasi Reach:</span>
              <span className="font-mono font-black text-ink">{currentNiche.reach}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink/60 uppercase">Audiens Karakter:</span>
              <span className="font-sans font-bold text-[11px] text-ink truncate max-w-[160px]">
                {currentNiche.engagement}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-ink/10">
              <span className="text-[10px] font-mono text-ink/60 uppercase">Format Teruji:</span>
              <span className="font-mono font-bold text-[10px] text-mint bg-ink px-1.5 py-0.5 rounded">
                {currentNiche.format}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bonus Eksklusif */}
      {activeTab === 'bonus' && (
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="p-2.5 rounded-xl bg-mustard/40 border-2 border-ink flex flex-col gap-1.5 shadow-neo-xs">
            <div className="flex items-center gap-1.5 font-sans font-black text-xs text-ink">
              <Sparkles className="w-3.5 h-3.5 text-ink fill-ink" />
              <span>{bonusText}</span>
            </div>
            <p className="text-[11px] font-sans text-ink/80 leading-relaxed">
              Dapatkan eksposur ekstra tanpa biaya tambahan untuk setiap pemesanan paket endorsement bulan ini.
            </p>
          </div>

          <div className="p-2 rounded-xl bg-white border border-ink/30 text-[10px] font-mono font-bold text-ink/70 flex items-center justify-between">
            <span>📌 Pin Postingan 3 Hari:</span>
            <span className="text-mint font-black">GRATIS</span>
          </div>
        </div>
      )}

      {/* Action CTA Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'min-h-[44px] px-3 py-2 rounded-xl font-bold font-sans text-xs',
          'bg-white text-ink border-2 border-ink shadow-neo-xs',
          'hover:bg-mustard hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]',
          'transition-all flex items-center justify-center gap-1.5 text-center mt-1'
        )}
      >
        <MessageCircle className="w-3.5 h-3.5 text-ink" />
        <span>Klaim Garansi & Slot via WA</span>
        <ArrowRight className="w-3 h-3 text-ink/60" />
      </a>
    </div>
  );
}
