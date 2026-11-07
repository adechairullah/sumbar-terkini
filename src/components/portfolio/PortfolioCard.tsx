import React from 'react';
import Image from 'next/image';
import { PortfolioItem } from '@/types';
import { formatCompactNumber } from '@/lib/utils/formatters';
import { Eye, Heart, ExternalLink, Award } from 'lucide-react';

export interface PortfolioCardProps {
  item: PortfolioItem;
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  const fallbackThumb = '/placeholder-portfolio.jpg';

  return (
    <div className="neo-card rounded-2xl bg-white border-2 border-ink shadow-neo overflow-hidden flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
      {/* Thumbnail Area with Aspect Ratio */}
      <div className="relative aspect-video w-full bg-paper border-b-2 border-ink overflow-hidden group">
        <Image
          src={item.thumbnail_url || fallbackThumb}
          alt={item.campaign_title || 'Kampanye Kolaborasi Sumbar Terkini'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Platform Badge Overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="neo-badge text-[10px] bg-mustard text-ink">
            {item.platform}
          </span>
          {item.tag && (
            <span className="neo-badge text-[10px] bg-white text-ink">
              {item.tag}
            </span>
          )}
        </div>

        {/* Metric Pill Overlay */}
        <div className="absolute bottom-3 right-3 bg-ink text-white font-mono text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-[2px_2px_0px_#FFD166]">
          <Eye className="w-3.5 h-3.5 text-mustard" />
          <span>
            {item.views_count ? formatCompactNumber(item.views_count) : 'Kampanye Baru'} Views
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-coral mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {item.brand_name}
          </div>
          <h3 className="font-bold text-base sm:text-lg text-ink leading-snug line-clamp-2">
            {item.campaign_title}
          </h3>
        </div>

        {/* Stats Row and Link */}
        <div className="pt-4 mt-4 border-t-2 border-ink/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3 text-ink/70">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-ink" />
              <strong className="text-ink">{formatCompactNumber(item.views_count)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-coral fill-coral/20" />
              <strong className="text-ink">{formatCompactNumber(item.likes_count)}</strong>
            </span>
          </div>

          {item.case_study_url && (
            <a
              href={item.case_study_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink font-bold hover:text-coral transition-colors"
              aria-label={`Lihat hasil kampanye ${item.brand_name}`}
            >
              <span>Hasil</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

