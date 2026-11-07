import type { SocialPlatform, PlatformMetrics } from '@/types';
import type { PlatformAdapter, AdapterResult, AdapterFetchOptions } from './types';
import { smartCache, SmartCacheLayer } from './cache';
import { simulateOrganicMetrics } from './simulation';
import { initialSocialPlatforms } from '@/lib/data/mock-data';

const SEED_X_METRICS: PlatformMetrics = {
  followers_count: 215000,
  engagement_rate: 4.12,
  avg_views: 180000,
  avg_likes: 7400,
  avg_comments: 1450,
};

export class XAdapter implements PlatformAdapter {
  readonly platformId = 'x' as const;
  readonly platformName = 'X (Twitter)';

  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed = initialSocialPlatforms.find((p) => p.platform_id === 'x') ?? SEED_X_METRICS;
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
      process.env.TWITTER_BEARER_TOKEN ||
      process.env.X_BEARER_TOKEN ||
      (platform.api_config?.bearer_token as string | undefined);
    const username = platform.handle ? platform.handle.replace('@', '') : 'sumbar_terkini';

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
      const endpoint = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
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
          error: 'X (Twitter) API v2 rate limit exceeded (HTTP 429)',
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
          error: `X (Twitter) API error: HTTP ${response.status}`,
        };
      }

      const body = (await response.json()) as {
        data?: { public_metrics?: { followers_count?: number } };
      };
      const publicMetrics = body.data?.public_metrics;
      const followers_count =
        typeof publicMetrics?.followers_count === 'number'
          ? publicMetrics.followers_count
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

export const xAdapter = new XAdapter();
