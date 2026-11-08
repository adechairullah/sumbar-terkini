'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_KIT_DATA, PortfolioMockup } from '@/data/mediaKitData';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export function PortfolioShowcaseSection() {
  const portfolioMockups: PortfolioMockup[] = MEDIA_KIT_DATA.portfolio;

  const cardAccents = [
    { border: 'border-mustard', badgeBg: 'bg-mustard text-ink', ribbon: 'bg-[#FFD166]' },
    { border: 'border-mint', badgeBg: 'bg-mint text-ink', ribbon: 'bg-[#06D6A0]' },
    { border: 'border-coral', badgeBg: 'bg-coral text-ink', ribbon: 'bg-[#EF476F]' },
    { border: 'border-[#1877F2]', badgeBg: 'bg-[#E3F2FD] text-ink', ribbon: 'bg-[#1877F2]' },
  ];

  return (
    <section id="portfolio-showcase" className="my-12 sm:my-16" aria-labelledby="portfolio-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mint text-ink text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Portofolio Kolaborasi & Paid Promote Nyata</span>
          </div>
          <h2 id="portfolio-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Bukti Dampak & Jangkauan Viral Organik
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Hasil kampanye brand lokal, nasional, dan instansi publik di Ranah Minang dengan jangkauan viral ratusan ribu tayangan.
          </p>
        </div>

        <a
          href="https://www.instagram.com/sumbarterkini_id/"
          target="_blank"
          rel="noopener noreferrer"
          className="neo-button min-h-[44px] px-4 py-2 bg-white hover:bg-mustard text-ink text-xs font-mono font-bold rounded-xl border-2 border-ink shadow-neo-sm flex items-center gap-2 self-start md:self-auto"
        >
          <span>Buka Akun Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4 Mockup Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioMockups.map((item: PortfolioMockup, idx: number) => {
          const accent = cardAccents[idx % cardAccents.length]!;
          return (
            <div
              key={item.id}
              className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] transition-transform relative"
            >
              {/* Colorful Top Ribbon */}
              <div className={`h-1.5 w-full ${accent.ribbon}`} />

              <div>
                {/* Instagram-Style Header */}
                <div className="p-3.5 flex items-center justify-between border-b-2 border-ink bg-paper">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full border-2 border-ink overflow-hidden bg-white shrink-0">
                      <Image
                        src="/logo-sumbar-terkini.png"
                        alt="Sumbar Terkini"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-ink font-mono">
                          sumbarterkini_id
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-mint fill-mint/30 stroke-ink" />
                      </div>
                      <span className="text-[10px] text-ink/60 font-mono block">
                        {item.brandTag}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-ink ${accent.badgeBg}`}>
                    {item.platformBadge}
                  </span>
                </div>

                {/* Mockup Thumbnail */}
                <div className="relative aspect-[4/3] w-full bg-paper border-b-2 border-ink overflow-hidden group">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="neo-badge bg-white text-ink text-[10px] font-mono shadow-neo-sm">
                      {item.format}
                    </span>
                  </div>
                </div>

                {/* Instagram Action Icons Row */}
                <div className="p-3 flex items-center justify-between border-b border-ink/10">
                  <div className="flex items-center gap-3 text-ink">
                    <Heart className="w-4 h-4 fill-coral text-coral" />
                    <MessageCircle className="w-4 h-4" />
                    <Share2 className="w-4 h-4" />
                  </div>
                  <Bookmark className="w-4 h-4 text-ink" />
                </div>

                {/* Post Content & Exact Verified Metrics */}
                <div className="p-4 space-y-2">
                  <div className="text-xs font-mono font-bold text-ink flex items-center justify-between">
                    <span className="text-ink/70">{item.viewsOrReachLabel}:</span>
                    <span className="text-sm font-black text-ink">{item.viewsOrReach}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-ink/70">
                    <span>Likes: {item.likes}</span>
                    <span>{item.secondaryStatLabel}: {item.secondaryStat}</span>
                  </div>

                  <h3 className="text-xs font-bold text-ink font-sans pt-1 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="p-3 pt-0">
                <span className="text-[10px] font-mono text-ink/60 block text-center">
                  Kolaborasi Terverifikasi Sumbar Terkini
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
