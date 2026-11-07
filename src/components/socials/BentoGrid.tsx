'use client';

import React, { useMemo } from 'react';
import { SocialPlatform, PlatformId } from '@/types';
import { BentoCard } from './BentoCard';
import { RollingOdometer } from './RollingOdometer';
import { UsersIcon, TrendingUpIcon } from '@/components/ui/Icons';

export interface BentoGridProps {
  platforms: SocialPlatform[];
  className?: string;
  badgeText?: string;
  titleText?: string;
  subtitleText?: string;
}

/**
 * Determines responsive column span classes for each platform card
 */
export function getBentoGridSpan(platformId: PlatformId): string {
  switch (platformId) {
    case 'instagram':
      return 'lg:col-span-7 md:col-span-2 col-span-1';
    case 'tiktok':
      return 'lg:col-span-5 md:col-span-2 col-span-1';
    case 'youtube':
      return 'lg:col-span-4 md:col-span-1 col-span-1';
    case 'facebook':
      return 'lg:col-span-4 md:col-span-1 col-span-1';
    case 'x':
      return 'lg:col-span-4 md:col-span-2 col-span-1';
    default:
      return 'lg:col-span-4 md:col-span-1 col-span-1';
  }
}

/**
 * Dynamically computes optimal Bento column span based on total active cards
 * so that 1, 2, 3, 4, 5+ platforms display cleanly without empty holes.
 */
export function getAdaptiveBentoSpan(
  totalCount: number,
  index: number,
  platformId: PlatformId
): string {
  // If only 1 platform is active: full hero card
  if (totalCount === 1) {
    return 'lg:col-span-12 col-span-1';
  }
  // If 2 platforms are active: 50% - 50% split (6 + 6)
  if (totalCount === 2) {
    return 'lg:col-span-6 md:col-span-1 col-span-1';
  }
  // If 3 platforms are active: perfectly balanced 3-column row (4 + 4 + 4)
  if (totalCount === 3) {
    return 'lg:col-span-4 md:col-span-1 col-span-1';
  }
  // If 4 platforms are active: 2x2 grid (6 + 6, 6 + 6)
  if (totalCount === 4) {
    return 'lg:col-span-6 md:col-span-1 col-span-1';
  }
  // If 5 platforms are active: classic playful bento (7 + 5, 4 + 4 + 4)
  if (totalCount === 5) {
    if (index === 0) return 'lg:col-span-7 md:col-span-2 col-span-1';
    if (index === 1) return 'lg:col-span-5 md:col-span-2 col-span-1';
    return 'lg:col-span-4 md:col-span-1 col-span-1';
  }
  // Multiples of 3 (6, 9, etc.)
  if (totalCount % 3 === 0) {
    return 'lg:col-span-4 md:col-span-1 col-span-1';
  }
  // Multiples of 2 (8, 10, etc.)
  if (totalCount % 2 === 0) {
    return 'lg:col-span-6 md:col-span-1 col-span-1';
  }
  // Fallback
  return getBentoGridSpan(platformId);
}

export function BentoGrid({
  platforms,
  className = '',
  badgeText,
  titleText,
  subtitleText,
}: BentoGridProps) {
  // Filter active platforms (supports hide / unhide platforms) and sort by sort_order
  const sortedPlatforms = useMemo(() => {
    if (!platforms || platforms.length === 0) return [];
    return platforms
      .filter((p) => p.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [platforms]);

  // Aggregated network metrics
  const { totalFollowers, avgNetworkER } = useMemo(() => {
    if (!sortedPlatforms || sortedPlatforms.length === 0) {
      return { totalFollowers: 0, avgNetworkER: 0 };
    }
    const total = sortedPlatforms.reduce((sum, p) => sum + (p.followers_count || 0), 0);
    const validErCount = sortedPlatforms.filter((p) => p.engagement_rate > 0).length;
    const erSum = sortedPlatforms.reduce((sum, p) => sum + (p.engagement_rate || 0), 0);
    const avgEr = validErCount > 0 ? Math.round((erSum / validErCount) * 100) / 100 : 0;
    return { totalFollowers: total, avgNetworkER: avgEr };
  }, [sortedPlatforms]);

  // Empty state handling conforming to test T2.7.1
  if (!platforms || platforms.length === 0) {
    return (
      <div className="neo-card p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-ink shadow-neo my-6">
        <div className="w-16 h-16 rounded-2xl bg-mustard border-2 border-ink shadow-neo flex items-center justify-center mx-auto mb-4 text-2xl">
          📡
        </div>
        <h3 className="text-xl font-black text-ink mb-2">
          Belum ada platform terdaftar
        </h3>
        <p className="text-sm font-medium text-ink/70 max-w-md mx-auto">
          Silakan aktifkan atau tambahkan platform media sosial melalui CMS Admin Dashboard.
        </p>
      </div>
    );
  }

  return (
    <section className={`my-8 sm:my-12 ${className}`} aria-labelledby="socials-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="neo-badge bg-mint text-ink text-xs mb-2">
            {badgeText || 'Live Verified Social Metrics'}
          </div>
          <h2
            id="socials-heading"
            className="text-2xl sm:text-4xl font-black text-ink tracking-tight flex items-center gap-2"
          >
            {titleText || 'Multi-Platform Bento Grid'}
          </h2>
          <p className="text-sm sm:text-base text-ink/80 font-medium mt-1">
            {subtitleText || 'Jangkauan organik lintas platform media sosial terverifikasi Sumbar Terkini.'}
          </p>
        </div>

        {/* Tactile Summary Banner */}
        <div className="neo-card p-3 sm:p-4 bg-paper rounded-xl border-2 border-ink shadow-neo-sm flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <UsersIcon size={18} className="text-ink" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-ink/60">
                Total Jangkauan
              </div>
              <div className="text-lg font-mono font-black text-ink">
                <RollingOdometer value={totalFollowers} format="compact" />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-ink/20" />

          <div className="flex items-center gap-2">
            <TrendingUpIcon size={18} className="text-ink" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-ink/60">
                Rata-rata ER
              </div>
              <div className="text-lg font-mono font-black text-ink">
                <RollingOdometer value={avgNetworkER} decimals={2} suffix="%" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symmetrical / Adaptive 12-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {sortedPlatforms.map((platform, idx) => {
          const spanClass = getAdaptiveBentoSpan(
            sortedPlatforms.length,
            idx,
            platform.platform_id
          );
          const isFlagship =
            sortedPlatforms.length <= 3
              ? true
              : platform.platform_id === 'instagram' || platform.platform_id === 'tiktok';

          return (
            <div key={platform.id || platform.platform_id} className={spanClass}>
              <BentoCard
                platform={platform}
                isFlagship={isFlagship}
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
