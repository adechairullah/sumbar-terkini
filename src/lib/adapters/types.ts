import type {
  PlatformId,
  PlatformMetrics,
  SocialPlatform,
  SyncSource,
  SyncStatus,
} from '@/types';

export interface AdapterFetchOptions {
  timeoutMs?: number;
  forceFresh?: boolean;
}

export interface AdapterResult {
  metrics: PlatformMetrics;
  cached_fallback_used: boolean;
  status: SyncStatus;
  source: SyncSource;
  error?: string;
}

export interface PlatformAdapter {
  platformId: PlatformId;
  platformName: string;
  fetchMetrics(platform: SocialPlatform, options?: AdapterFetchOptions): Promise<AdapterResult>;
  sync(platform: SocialPlatform, options?: AdapterFetchOptions): Promise<AdapterResult>;
}
