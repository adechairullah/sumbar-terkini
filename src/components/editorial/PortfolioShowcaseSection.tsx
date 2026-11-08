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

  return (
    <section id="portfolio-showcase" className="my-12 sm:my-16" aria-labelledby="portfolio-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mint text-ink text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Portofolio & Kolaborasi Sukses</span>
          </div>
          <h2 id="portfolio-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Portofolio Kolaborasi & Endorsement
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Contoh hasil kolaborasi nyata Sumbar Terkini bersama brand lokal, nasional, dan instansi publik dengan jangkauan viral organik.
          </p>
        </div>

        <a
          href="https://www.instagram.com/sumbarterkini_id/"
          target="_blank"
          rel="noopener noreferrer"
          className="neo-button min-h-[44px] px-4 py-2 bg-white hover:bg-mustard text-ink text-xs font-mono font-bold rounded-xl border-2 border-ink shadow-neo-sm flex items-center gap-2 self-start md:self-auto"
        >
          <span>Lihat Feed Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4 Mockup Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioMockups.map((item: PortfolioMockup) => (
          <div
            key={item.id}
            className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
          >
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

                <span className="text-[10px] font-mono font-bold text-ink bg-white border border-ink px-1.5 py-0.5 rounded">
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
                  <span className="neo-badge bg-mustard text-ink text-[10px] font-mono">
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

              {/* Post Content & Realistic Metrics */}
              <div className="p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-ink flex items-center justify-between">
                  <span>{item.viewsOrReachLabel}:</span>
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
                Terverifikasi Organik Minangkabau
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
