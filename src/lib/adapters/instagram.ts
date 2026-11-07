import type { SocialPlatform, PlatformMetrics } from '@/types';
import type { PlatformAdapter, AdapterResult, AdapterFetchOptions } from './types';
import { smartCache, SmartCacheLayer } from './cache';
import { simulateOrganicMetrics } from './simulation';
import { initialSocialPlatforms } from '@/lib/data/mock-data';

const SEED_IG_METRICS: PlatformMetrics = {
  followers_count: 854200,
  engagement_rate: 4.85,
  avg_views: 450000,
  avg_likes: 38200,
  avg_comments: 3250,
};

export class InstagramAdapter implements PlatformAdapter {
  readonly platformId = 'instagram' as const;
  readonly platformName = 'Instagram';

  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'instagram') ?? SEED_IG_METRICS;
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
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      process.env.META_ACCESS_TOKEN ||
      (platform.api_config?.access_token as string | undefined);
    const accountId =
      (platform.api_config?.account_id as string | undefined) ||
      process.env.INSTAGRAM_ACCOUNT_ID;

    // Simulation mode when external API credentials are not present
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

    // Authenticated API request with rate-limit and error fallback
    const timeoutMs = options?.timeoutMs ?? 5000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const endpoint = `https://graph.facebook.com/v19.0/${accountId || 'me'}?fields=followers_count,media_count&access_token=${encodeURIComponent(token)}`;
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
          error: 'Instagram Graph API rate limit exceeded (HTTP 429)',
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
          error: `Instagram Graph API error: HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as { followers_count?: number };
      const followers_count =
        typeof data.followers_count === 'number' ? data.followers_count : fallback.followers_count;
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

export const instagramAdapter = new InstagramAdapter();
