'use client';

import React from 'react';
import { MEDIA_KIT_DATA, PricingPackage } from '@/data/mediaKitData';
import {
  Tag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Star,
  Gift,
} from 'lucide-react';

interface RateCardPricingSectionProps {
  onSelectPackage?: (packageId: string) => void;
}

export function RateCardPricingSection({ onSelectPackage }: RateCardPricingSectionProps) {
  const { packages } = MEDIA_KIT_DATA;

  const handleChoose = (id: string) => {
    onSelectPackage?.(id);
    const element = document.getElementById('order-calculator-widget');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getPackageTheme = (id: string, isPopular?: boolean, isBestValue?: boolean) => {
    if (isBestValue) {
      return {
        cardBg: 'bg-[#F2FCF8]', // Soft mint tint
        borderTop: 'bg-[#06D6A0]',
        badgeBg: 'bg-mint text-ink',
        buttonBg: 'bg-mint hover:bg-mint-hover text-ink',
        hasFreeStory: true,
      };
    }
    if (isPopular) {
      return {
        cardBg: 'bg-[#FFFDF3]', // Soft mustard tint
        borderTop: 'bg-[#FFD166]',
        badgeBg: 'bg-coral text-ink',
        buttonBg: 'bg-mustard hover:bg-mustard-hover text-ink',
        hasFreeStory: true,
      };
    }
    if (id === 'foto-desain') {
      return {
        cardBg: 'bg-[#FAF8F5]', // Warm paper tint
        borderTop: 'bg-[#1E1E1E]',
        badgeBg: 'bg-white text-ink border-ink/40',
        buttonBg: 'bg-paper hover:bg-mustard text-ink',
        hasFreeStory: true,
      };
    }
    if (id === 'video-reels') {
      return {
        cardBg: 'bg-[#FFF8FA]', // Soft rose tint
        borderTop: 'bg-[#EF476F]',
        badgeBg: 'bg-[#FFEBEF] text-ink border-ink/40',
        buttonBg: 'bg-paper hover:bg-coral text-ink',
        hasFreeStory: true,
      };
    }
    return {
      cardBg: 'bg-white',
      borderTop: 'bg-ink',
      badgeBg: 'bg-paper text-ink border-ink/40',
      buttonBg: 'bg-paper hover:bg-mustard text-ink',
      hasFreeStory: false,
    };
  };

  return (
    <section id="rate-calculator" className="my-12 sm:my-16" aria-labelledby="pricing-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mustard text-ink text-xs mb-2">
            <Tag className="w-3.5 h-3.5 text-ink" />
            <span>Rate Card & Paket Iklan Resmi 2026</span>
          </div>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Tarif & Pilihan Paket Paid Promote
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Investasi promosi transparan, terjangkau, dan berdampak tinggi. Setiap paket promo otomatis sudah include Free 1x Instagram Story 24 Jam!
          </p>
        </div>

        <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70">
          Pilihan Paket Layanan ({packages.length} Tersedia)
        </div>
      </div>

      {/* 5 Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const theme = getPackageTheme(pkg.id, pkg.isPopular, pkg.isBestValue);
          const isFeatured = pkg.isPopular || pkg.isBestValue;

          return (
            <div
              key={pkg.id}
              className={`neo-card rounded-2xl border-2 border-ink shadow-neo p-6 flex flex-col justify-between transition-transform hover:translate-y-[-2px] relative overflow-hidden ${
                theme.cardBg
              } ${isFeatured ? 'ring-2 ring-ink ring-offset-2' : ''}`}
            >
              {/* Colorful Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-2 ${theme.borderTop}`} />

              {/* Card Content */}
              <div className="pt-1">
                {/* Responsive Badges Header: NO OVERLAPPING */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pkg.isBestValue ? (
                      <span className="neo-badge bg-mint text-ink text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-ink text-ink" />
                        <span>BEST VALUE</span>
                      </span>
                    ) : pkg.isPopular ? (
                      <span className="neo-badge bg-coral text-ink text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-ink text-ink" />
                        <span>PALING LARIS</span>
                      </span>
                    ) : (
                      <span className={`neo-badge text-[11px] font-mono shrink-0 ${theme.badgeBg}`}>
                        {pkg.name}
                      </span>
                    )}

                    {pkg.isBestValue && (
                      <span className="neo-badge bg-mustard text-ink text-[10px] font-mono font-bold shrink-0">
                        Hemat Rp600.000
                      </span>
                    )}
                  </div>

                  <span className="neo-badge bg-white text-ink text-[10px] font-mono font-bold shrink-0 border border-ink">
                    {pkg.platformsSupported === 'all'
                      ? '3 Platform Serentak'
                      : '1 Platform Pilihan'}
                  </span>
                </div>

                {/* Package Name & Price */}
                <h3 className="text-xl font-black text-ink font-sans mb-1">
                  {pkg.name}
                </h3>

                <div className="text-2xl sm:text-3xl font-mono font-black text-ink mb-3">
                  {pkg.priceFormatted}
                </div>

                {/* Free Story Inclusion Highlight */}
                {theme.hasFreeStory && (
                  <div className="mb-4 p-2 rounded-lg bg-mint/30 border border-ink/30 flex items-center gap-1.5 text-xs font-mono font-bold text-ink">
                    <Gift className="w-3.5 h-3.5 text-ink shrink-0" />
                    <span>Include Free Instagram Story 24 Jam</span>
                  </div>
                )}

                {/* Deliverables List */}
                <ul className="space-y-2.5 mb-6 text-xs text-ink/90 font-sans">
                  {pkg.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                      <span className={item.includes('BONUS') ? 'font-bold text-ink' : ''}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleChoose(pkg.id)}
                className={`neo-button w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 border-ink shadow-neo-sm ${theme.buttonBg}`}
              >
                <span>Pilih & Hitung Paket</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
