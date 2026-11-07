import type { SocialPlatform, PlatformMetrics } from '@/types';
import type { PlatformAdapter, AdapterResult, AdapterFetchOptions } from './types';
import { smartCache, SmartCacheLayer } from './cache';
import { simulateOrganicMetrics } from './simulation';
import { initialSocialPlatforms } from '@/lib/data/mock-data';

const SEED_YOUTUBE_METRICS: PlatformMetrics = {
  followers_count: 425000,
  engagement_rate: 6.1,
  avg_views: 210000,
  avg_likes: 18500,
  avg_comments: 2200,
};

export class YouTubeAdapter implements PlatformAdapter {
  readonly platformId = 'youtube' as const;
  readonly platformName = 'YouTube';

  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'youtube') ?? SEED_YOUTUBE_METRICS;
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
    const apiKey =
      process.env.YOUTUBE_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (platform.api_config?.api_key as string | undefined);
    const channelId =
      (platform.api_config?.channel_id as string | undefined) ||
      process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
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
      const endpoint = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`;
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
          error: 'YouTube Data API rate limit / quota exceeded (HTTP 429)',
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
          error: `YouTube Data API error: HTTP ${response.status}`,
        };
      }

      const body = (await response.json()) as {
        items?: Array<{ statistics?: { subscriberCount?: string; viewCount?: string } }>;
      };
      const stats = body.items?.[0]?.statistics;
      const subCount = stats?.subscriberCount ? parseInt(stats.subscriberCount, 10) : NaN;
      const followers_count = !Number.isNaN(subCount) ? subCount : fallback.followers_count;

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

export const youtubeAdapter = new YouTubeAdapter();
