import type { SocialPlatform, PlatformMetrics } from '@/types';
import type { PlatformAdapter, AdapterResult, AdapterFetchOptions } from './types';
import { smartCache, SmartCacheLayer } from './cache';
import { simulateOrganicMetrics } from './simulation';
import { initialSocialPlatforms } from '@/lib/data/mock-data';

const SEED_FACEBOOK_METRICS: PlatformMetrics = {
  followers_count: 620000,
  engagement_rate: 3.4,
  avg_views: 280000,
  avg_likes: 14200,
  avg_comments: 2800,
};

export class FacebookAdapter implements PlatformAdapter {
  readonly platformId = 'facebook' as const;
  readonly platformName = 'Facebook';

  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'facebook') ?? SEED_FACEBOOK_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }

  async fetchMetrics(
    platform: SocialPlatform,
    options?: AdapterFetchOptions
  ): Promise<AdapterResult> {
    const cacheKey = `${this.platformId}_metrics`;
    const fallback = this.getFallbackMetrics(platform);
    const token =
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
      process.env.META_ACCESS_TOKEN ||
      (platform.api_config?.access_token as string | undefined);
    const pageId =
      (platform.api_config?.page_id as string | undefined) ||
      process.env.FACEBOOK_PAGE_ID;

    if (!token) {
      const simulated = simulateOrganicMetrics(this.platformId, fallback);
      smartCache.set(cacheKey, simulated);
      return {
        metrics: simulated,
        cached_fallback_used: false,
        status: 'synced',
        source: 'mock_jitter',
      };
    }

    const timeoutMs = options?.timeoutMs ?? 5000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const endpoint = `https://graph.facebook.com/v19.0/${pageId || 'me'}?fields=followers_count,fan_count&access_token=${encodeURIComponent(token)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (response.status === 429) {
        const cached = smartCache.get(cacheKey);
        const safeMetrics = SmartCacheLayer.sanitizeMetrics(cached, fallback);
        return {
          metrics: safeMetrics,
          cached_fallback_used: true,
          status: 'cached_fallback',
          source: 'last_cache',
          error: 'Facebook Graph API rate limit exceeded (HTTP 429)',
        };
      }

      if (!response.ok) {
        const cached = smartCache.get(cacheKey);
        const safeMetrics = SmartCacheLayer.sanitizeMetrics(cached, fallback);
        return {
          metrics: safeMetrics,
          cached_fallback_used: true,
          status: 'cached_fallback',
          source: 'last_cache',
          error: `Facebook Graph API error: HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as { followers_count?: number; fan_count?: number };
      const followers_count =
        typeof data.followers_count === 'number'
          ? data.followers_count
          : typeof data.fan_count === 'number'
            ? data.fan_count
            : fallback.followers_count;

      const avg_views = fallback.avg_views;
      const avg_likes = fallback.avg_likes;
      const avg_comments = fallback.avg_comments;
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;

      const freshMetrics: PlatformMetrics = {
        followers_count,
        engagement_rate,
        avg_views,
        avg_likes,
        avg_comments,
      };

      smartCache.set(cacheKey, freshMetrics);
      return {
        metrics: freshMetrics,
        cached_fallback_used: false,
        status: 'synced',
        source: 'live_api',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const cached = smartCache.get(cacheKey);
      const safeMetrics = SmartCacheLayer.sanitizeMetrics(cached, fallback);
      return {
        metrics: safeMetrics,
        cached_fallback_used: true,
        status: 'cached_fallback',
        source: 'last_cache',
        error: errorMsg,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async sync(platform: SocialPlatform, options?: AdapterFetchOptions): Promise<AdapterResult> {
    return this.fetchMetrics(platform, options);
  }
}

export const facebookAdapter = new FacebookAdapter();
