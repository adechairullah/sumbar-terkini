'use client';

import React from 'react';
import { SocialPlatform, PlatformId } from '@/types';
import { RollingOdometer } from './RollingOdometer';
import { DemographicsBar } from './DemographicsBar';
import {
  PlatformIcon,
  ExternalLinkIcon,
  EyeIcon,
  HeartIcon,
  MessageSquareIcon,
} from '@/components/ui/Icons';
import { cn } from '@/lib/utils/cn';

export interface BentoCardProps {
  platform: SocialPlatform;
  className?: string;
  isFlagship?: boolean;
}

export const PLATFORM_BRAND_CONFIG: Record<
  PlatformId,
  {
    name: string;
    brandColor: string;
    badgeBg: string;
    accentBg: string;
    metricLabel: string;
  }
> = {
  instagram: {
    name: 'Instagram',
    brandColor: '#E4405F',
    badgeBg: 'bg-[#E4405F]',
    accentBg: 'bg-[#FFF0F3]',
    metricLabel: 'Followers Aktif',
  },
  tiktok: {
    name: 'TikTok',
    brandColor: '#000000',
    badgeBg: 'bg-black',
    accentBg: 'bg-[#F4F4F6]',
    metricLabel: 'Followers / Audiens',
  },
  youtube: {
    name: 'YouTube',
    brandColor: '#FF0000',
    badgeBg: 'bg-[#FF0000]',
    accentBg: 'bg-[#FFF2F2]',
    metricLabel: 'Subscribers Resmi',
  },
  facebook: {
    name: 'Facebook',
    brandColor: '#1877F2',
    badgeBg: 'bg-[#1877F2]',
    accentBg: 'bg-[#F0F6FF]',
    metricLabel: 'Pengikut Komunitas',
  },
  x: {
    name: 'X (Twitter)',
    brandColor: '#000000',
    badgeBg: 'bg-black',
    accentBg: 'bg-[#F5F5F5]',
    metricLabel: 'Pengikut Linimasa',
  },
};

/**
 * ER % Status Badge Determination (F09 contract)
 */
export function getErStatus(er: number): {
  status: 'Viral Maker' | 'Healthy' | 'Steady';
  badgeClass: string;
  emoji: string;
} {
  const safeER = typeof er === 'number' && !isNaN(er) ? er : 0;
  if (safeER >= 4.0) {
    return {
      status: 'Viral Maker',
      badgeClass: 'bg-mint text-ink',
      emoji: '🔥',
    };
  }
  if (safeER >= 2.0) {
    return {
      status: 'Healthy',
      badgeClass: 'bg-mustard text-ink',
      emoji: '⚡',
    };
  }
  return {
    status: 'Steady',
    badgeClass: 'bg-paper text-ink',
    emoji: '📊',
  };
}

export function BentoCard({ platform, className = '', isFlagship = false }: BentoCardProps) {
  const brand = PLATFORM_BRAND_CONFIG[platform.platform_id] || {
    name: platform.platform_name,
    brandColor: '#1E1E1E',
    badgeBg: 'bg-ink',
    accentBg: 'bg-paper',
    metricLabel: 'Followers',
  };

  // Metric sanitization
  const safeFollowers = Math.max(0, platform.followers_count || 0);
  const safeAvgViews = Math.max(0, platform.avg_views || 0);
  const safeAvgLikes = Math.max(0, platform.avg_likes || 0);
  const safeAvgComments = Math.max(0, platform.avg_comments || 0);
  const safeER = Math.max(0, platform.engagement_rate || 0);

  // Sanitized profile URL and normalized handle
  const rawUrl = platform.profile_url || `https://${platform.platform_id}.com`;
  const sanitizedUrl = encodeURI(rawUrl.trim());
  const rawHandle = platform.handle || 'sumbar_terkini';
  const normalizedHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;

  const erBadge = getErStatus(safeER);

  return (
    <div
      className={cn(
        'neo-card bg-white rounded-2xl border-2 border-ink shadow-neo p-5 sm:p-6',
        'flex flex-col justify-between transition-all duration-200',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg',
        className
      )}
    >
      <div>
        {/* Top Bar: Platform Identity + Live Sync Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl border-2 border-ink shadow-neo-sm flex items-center justify-center text-white shrink-0',
                brand.badgeBg
              )}
            >
              <PlatformIcon platform={platform.platform_id} size={22} className="text-white" />
            </div>

            <div className="min-w-0">
              <h3 className="font-black text-lg text-ink leading-tight truncate">
                {platform.platform_name || brand.name}
              </h3>
              <a
                href={sanitizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink/70 hover:text-ink hover:underline flex items-center gap-1 group"
                title={`Kunjungi profil ${normalizedHandle}`}
              >
                <span className="truncate">{normalizedHandle}</span>
                <ExternalLinkIcon
                  size={12}
                  className="opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </a>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex-shrink-0">
            {platform.sync_mode === 'AUTO_API' ? (
              <span className="neo-badge text-[10px] bg-mint text-ink py-1 px-2 border border-ink shadow-neo-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                API Sync
              </span>
            ) : (
              <span className="neo-badge text-[10px] bg-paper text-ink py-1 px-2 border border-ink shadow-neo-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink/60" />
                Manual
              </span>
            )}
          </div>
        </div>

        {/* Primary Metric: Follower/Subscriber Count with Rolling Odometer */}
        <div className="p-4 bg-paper/60 rounded-xl border-2 border-ink mb-4 shadow-neo-sm">
          <div className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-1">
            {brand.metricLabel}
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-3xl sm:text-4xl font-black text-ink">
              <RollingOdometer value={safeFollowers} format="standard" />
            </div>

            {/* Engagement Rate Badge */}
            <div
              className={cn(
                'neo-badge text-xs py-1 px-2.5 border-2 border-ink shadow-neo-sm',
                erBadge.badgeClass
              )}
              title={`Tingkat Interaksi: ${safeER.toFixed(2)}%`}
            >
              <span className="mr-1">{erBadge.emoji}</span>
              <span className="font-mono font-bold mr-1">{safeER.toFixed(2)}% ER</span>
              <span className="hidden sm:inline">({erBadge.status})</span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Grid: Views, Likes, Comments */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <EyeIcon size={11} className="text-ink" />
              Avg Views
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgViews} format="compact" />
            </div>
          </div>

          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <HeartIcon size={11} className="text-ink" />
              Avg Likes
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgLikes} format="compact" />
            </div>
          </div>

          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <MessageSquareIcon size={11} className="text-ink" />
              Comments
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgComments} format="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Visualization */}
      <div className="mt-2 pt-4 border-t-2 border-ink/10">
        <DemographicsBar
          gender={platform.demographics?.gender || { male: 50, female: 50 }}
          topCities={platform.demographics?.top_cities || []}
          showCities={isFlagship}
          compact={!isFlagship}
        />
      </div>
    </div>
  );
}

