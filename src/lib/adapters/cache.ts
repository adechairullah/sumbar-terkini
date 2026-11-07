import type { PlatformMetrics } from '@/types';

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: number;
}

export class SmartCacheLayer<T = PlatformMetrics> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlSeconds: number = 3600) {
    this.ttlMs = ttlSeconds * 1000;
  }

  set(key: string, data: T, customTtlSeconds?: number): void {
    const ttl = customTtlSeconds !== undefined ? customTtlSeconds * 1000 : this.ttlMs;
    const now = Date.now();
    this.cache.set(key, {
      data,
      expiresAt: now + ttl,
      cachedAt: now,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  getValid(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) return null;
    return entry.data;
  }

  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getEntry(key: string): CacheEntry<T> | null {
    return this.cache.get(key) ?? null;
  }

  getOrFallback(
    key: string,
    fallbackSeed: T
  ): { data: T; fallbackUsed: boolean; isExpired: boolean; isCached: boolean } {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return {
        data: entry.data,
        fallbackUsed: false,
        isExpired: false,
        isCached: true,
      };
    }
    if (entry) {
      return {
        data: entry.data,
        fallbackUsed: true,
        isExpired: true,
        isCached: true,
      };
    }
    return {
      data: fallbackSeed,
      fallbackUsed: true,
      isExpired: true,
      isCached: false,
    };
  }

  static sanitizeMetrics(entry: unknown, fallbackSeed: PlatformMetrics): PlatformMetrics {
    if (!entry || typeof entry !== 'object') {
      return { ...fallbackSeed };
    }
    const record = entry as Record<string, unknown>;
    const followers =
      typeof record.followers_count === 'number' && Number.isFinite(record.followers_count)
        ? Math.max(0, record.followers_count)
        : fallbackSeed.followers_count;
    const er =
      typeof record.engagement_rate === 'number' && Number.isFinite(record.engagement_rate)
        ? Math.max(0, Math.min(100, record.engagement_rate))
        : fallbackSeed.engagement_rate;
    const views =
      typeof record.avg_views === 'number' && Number.isFinite(record.avg_views)
        ? Math.max(0, record.avg_views)
        : fallbackSeed.avg_views;
    const likes =
      typeof record.avg_likes === 'number' && Number.isFinite(record.avg_likes)
        ? Math.max(0, record.avg_likes)
        : fallbackSeed.avg_likes;
    const comments =
      typeof record.avg_comments === 'number' && Number.isFinite(record.avg_comments)
        ? Math.max(0, record.avg_comments)
        : fallbackSeed.avg_comments;

    return {
      followers_count: followers,
      engagement_rate: er,
      avg_views: views,
      avg_likes: likes,
      avg_comments: comments,
    };
  }
}

export const smartCache = new SmartCacheLayer<PlatformMetrics>(3600);
