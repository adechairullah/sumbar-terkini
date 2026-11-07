'use client';

import React, { useState, useMemo } from 'react';
import { PortfolioItem } from '@/types';
import { PortfolioCard } from './PortfolioCard';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PortfolioSectionProps {
  items: PortfolioItem[];
  className?: string;
}

export function PortfolioSection({ items, className }: PortfolioSectionProps) {
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (activePlatformFilter === 'all') return items;
    return items.filter((item) => item.platform === activePlatformFilter);
  }, [items, activePlatformFilter]);

  const categories = [
    { id: 'all', label: 'Semua Kampanye' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'cross-platform', label: 'Cross-Platform' },
  ];

  return (
    <section id="portfolio-showcase" className={cn('my-16', className)} aria-labelledby="portfolio-heading">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge bg-mint text-ink mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Portofolio & Kolaborasi Viral
          </div>
          <h2 id="portfolio-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Bukti Nyata Dampak & Jangkauan
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Hasil kampanye brand ternama dan UMKM Sumatera Barat yang sukses menjangkau jutaan audiens Minang organik.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActivePlatformFilter(cat.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl border-2 border-ink text-xs font-bold font-mono transition-all min-h-[44px]',
                activePlatformFilter === cat.id
                  ? 'bg-mustard text-ink shadow-neo-sm -translate-y-0.5'
                  : 'bg-white text-ink/70 hover:bg-paper'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="neo-card p-12 text-center bg-white rounded-2xl">
          <p className="text-ink/70 font-mono text-sm">
            Belum ada kolaborasi untuk kategori ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

