'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import {
  Heart,
  Share2,
  Bookmark,
  MessageCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export function PortfolioShowcaseSection() {
  const { portfolio } = MEDIA_KIT_DATA;

  return (
    <section id="portfolio-showcase" className="py-14 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block mb-2">
            Bukti Nyata Efektivitas Kampanye
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
            Portofolio Kolaborasi & Paid Promote
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
            Contoh hasil kolaborasi konten berita dan promosi kreatif yang sukses menjangkau puluhan hingga ratusan ribu audiens Sumatera Barat.
          </p>
        </div>

        {/* 4 Instagram-Style Collaboration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Sumbar Terkini Collab Bar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-[10px] font-black text-white">
                      ST
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>sumbarterkini_id</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.brandTag}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-800/60 px-1.5 py-0.5 rounded">
                    Collab
                  </span>
                </div>

                {/* Media Image Showcase */}
                <div className="relative aspect-square w-full bg-slate-800 overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  {/* Floating Overlay Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-1 rounded bg-slate-950/80 backdrop-blur text-[10px] font-mono font-bold text-white border border-slate-700/80">
                      {item.format}
                    </span>
                  </div>

                  {/* Reach/View Meter Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-950/85 backdrop-blur border border-slate-700/80 flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.viewsOrReach} {item.viewsOrReachLabel}</span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Instagram Interaction Bar Footer */}
              <div className="px-4 py-3 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-red-400">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  <span className="font-bold text-slate-200">{item.likes}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">{item.secondaryStat}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

