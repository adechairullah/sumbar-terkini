import type {
  PlatformId,
  PlatformMetrics,
  SocialPlatform,
  SyncPlatformResult,
} from '@/types';
import type { PlatformAdapter, AdapterFetchOptions } from './types';
import { instagramAdapter } from './instagram';
import { tiktokAdapter } from './tiktok';
import { youtubeAdapter } from './youtube';
import { facebookAdapter } from './facebook';
import { xAdapter } from './x';
import { smartCache } from './cache';

// Unified adapter registry mapping
const adapterRegistry: Record<PlatformId, PlatformAdapter> = {
  instagram: instagramAdapter,
  tiktok: tiktokAdapter,
  youtube: youtubeAdapter,
  facebook: facebookAdapter,
  x: xAdapter,
};

export function getAdapter(platformId: PlatformId): PlatformAdapter {
  const adapter = adapterRegistry[platformId];
  if (!adapter) {
    throw new Error(`Unsupported social platform adapter: "${platformId}"`);
  }
  return adapter;
}

export function getAllAdapters(): Record<PlatformId, PlatformAdapter> {
  return { ...adapterRegistry };
}

export function hasAdapter(platformId: string): platformId is PlatformId {
  return platformId in adapterRegistry;
}

/**
 * Synchronizes an individual social platform respecting its sync_mode.
 */
export async function syncSinglePlatform(
  platform: SocialPlatform,
  options?: AdapterFetchOptions
): Promise<SyncPlatformResult> {
  const syncTimestamp = new Date().toISOString();

  // MANUAL mode: strictly preserve admin numbers without overwrite
  if (platform.sync_mode === 'MANUAL') {
    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: 'skipped_manual',
      sync_mode: 'MANUAL',
      metrics: {
        followers_count: platform.followers_count,
        engagement_rate: platform.engagement_rate,
        avg_views: platform.avg_views,
        avg_likes: platform.avg_likes,
        avg_comments: platform.avg_comments,
      },
      cached_fallback_used: false,
      source: 'last_cache',
      last_synced_at: platform.last_synced_at || syncTimestamp,
    };
  }

  // AUTO_API mode: invoke registered adapter
  let adapter: PlatformAdapter;
  try {
    adapter = getAdapter(platform.platform_id);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const cached = smartCache.get(`${platform.platform_id}_metrics`);
    const fallbackMetrics: PlatformMetrics = cached ?? {
      followers_count: platform.followers_count,
      engagement_rate: platform.engagement_rate,
      avg_views: platform.avg_views,
      avg_likes: platform.avg_likes,
      avg_comments: platform.avg_comments,
    };

    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: 'cached_fallback',
      sync_mode: 'AUTO_API',
      metrics: fallbackMetrics,
      cached_fallback_used: true,
      source: 'last_cache',
      error: errorMsg,
      last_synced_at: platform.last_synced_at || syncTimestamp,
    };
  }

  try {
    const result = await adapter.fetchMetrics(platform, options);
    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: result.status,
      sync_mode: 'AUTO_API',
      metrics: result.metrics,
      cached_fallback_used: result.cached_fallback_used,
      source: result.source,
      error: result.error,
      last_synced_at: syncTimestamp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const cached = smartCache.get(`${platform.platform_id}_metrics`);
    const fallbackMetrics: PlatformMetrics = cached ?? {
      followers_count: platform.followers_count,
      engagement_rate: platform.engagement_rate,
      avg_views: platform.avg_views,
      avg_likes: platform.avg_likes,
      avg_comments: platform.avg_comments,
    };

    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: 'cached_fallback',
      sync_mode: 'AUTO_API',
      metrics: fallbackMetrics,
      cached_fallback_used: true,
      source: 'last_cache',
      error: errorMsg,
      last_synced_at: syncTimestamp,
    };
  }
}

/**
 * Dispatches concurrent metric synchronization across all platforms via Promise.allSettled.
 */
export async function syncAllPlatforms(
  platforms: SocialPlatform[],
  options?: AdapterFetchOptions
): Promise<SyncPlatformResult[]> {
  const promises = platforms.map((platform) => syncSinglePlatform(platform, options));
  const settled = await Promise.allSettled(promises);

  return settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const platform = platforms[index];
    const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
    if (!platform) {
      return {
        platform_id: 'instagram' as PlatformId,
        platform_name: 'Unknown',
        status: 'cached_fallback',
        sync_mode: 'AUTO_API',
        metrics: {
          followers_count: 0,
          engagement_rate: 0,
          avg_views: 0,
          avg_likes: 0,
          avg_comments: 0,
        },
        cached_fallback_used: true,
        source: 'last_cache',
        error: errorMsg,
        last_synced_at: new Date().toISOString(),
      };
    }
    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: 'cached_fallback',
      sync_mode: platform.sync_mode,
      metrics: {
        followers_count: platform.followers_count,
        engagement_rate: platform.engagement_rate,
        avg_views: platform.avg_views,
        avg_likes: platform.avg_likes,
        avg_comments: platform.avg_comments,
      },
      cached_fallback_used: true,
      source: 'last_cache',
      error: errorMsg,
      last_synced_at: platform.last_synced_at,
    };
  });
}

// Re-exports
export * from './types';
export * from './cache';
export * from './simulation';
export { instagramAdapter } from './instagram';
export { tiktokAdapter } from './tiktok';
export { youtubeAdapter } from './youtube';
export { facebookAdapter } from './facebook';
export { xAdapter } from './x';
