import { NextResponse } from 'next/server';
import { repository } from '@/lib/data/repository';
import { getAdapter } from '@/lib/adapters';
import type {
  SyncResponse,
  SyncPlatformResult,
  PlatformId,
  SocialPlatform,
} from '@/types';

// Force dynamic execution in Next.js 15 App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

// ==============================================================================
// 1. Concurrency Control (Keyed Single-Flight Map)
// ==============================================================================
const inFlightSyncs = new Map<string, Promise<SyncResponse>>();

// ==============================================================================
// 2. Authorization Helper
// ==============================================================================
function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET?.trim();

  // If no CRON_SECRET is configured in the environment, allow access (local dev/offline preview)
  if (!configuredSecret) {
    return true;
  }

  // 1. Check Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') {
      if (parts[1] === configuredSecret) {
        return true;
      }
    }
  }

  // 2. Check query parameter: ?secret=<token>
  try {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');
    if (querySecret && querySecret === configuredSecret) {
      return true;
    }
  } catch {
    // Ignore URL parse error
  }

  return false;
}

// ==============================================================================
// 3. Safe Request Body Parser
// ==============================================================================
interface SyncRequestBody {
  platform_id?: PlatformId;
  platforms?: PlatformId[];
  force_refresh?: boolean;
}

async function safeParseBody(request: Request): Promise<SyncRequestBody> {
  try {
    const text = await request.text();
    if (!text || text.trim().length === 0) {
      return {};
    }
    return JSON.parse(text) as SyncRequestBody;
  } catch {
    return {};
  }
}

// ==============================================================================
// 4. Timeout Wrapper (Overall Batch Guard)
// ==============================================================================
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 9000): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: Operation exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

// ==============================================================================
// 5. Single Platform Sync Worker
// ==============================================================================
async function syncSinglePlatformTask(
  platform: SocialPlatform,
  syncTimestamp: string
): Promise<SyncPlatformResult> {
  // MANUAL mode: strictly preserve admin-entered metrics
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
      last_synced_at: platform.last_synced_at,
    };
  }

  // AUTO_API mode: trigger adapter sync
  try {
    const adapter = getAdapter(platform.platform_id);
    const adapterResult = await adapter.sync(platform);

    // Persist refreshed metrics to ResilientRepository
    try {
      await repository.updateSocialPlatform(platform.id, {
        followers_count: adapterResult.metrics.followers_count,
        engagement_rate: adapterResult.metrics.engagement_rate,
        avg_views: adapterResult.metrics.avg_views,
        avg_likes: adapterResult.metrics.avg_likes,
        avg_comments: adapterResult.metrics.avg_comments,
        last_synced_at: syncTimestamp,
      });
    } catch {
      // Repository persistence error should not fail the platform result
    }

    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: adapterResult.cached_fallback_used ? 'cached_fallback' : 'synced',
      sync_mode: 'AUTO_API',
      metrics: adapterResult.metrics,
      cached_fallback_used: adapterResult.cached_fallback_used,
      source: adapterResult.source,
      last_synced_at: syncTimestamp,
      error: adapterResult.error,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      platform_id: platform.platform_id,
      platform_name: platform.platform_name,
      status: 'cached_fallback',
      sync_mode: 'AUTO_API',
      metrics: {
        followers_count: platform.followers_count,
        engagement_rate: platform.engagement_rate,
        avg_views: platform.avg_views,
        avg_likes: platform.avg_likes,
        avg_comments: platform.avg_comments,
      },
      cached_fallback_used: true,
      source: 'last_cache',
      last_synced_at: platform.last_synced_at,
      error: errorMessage,
    };
  }
}

// ==============================================================================
// 6. Concurrent Batch Metric Sync Execution
// ==============================================================================
async function executeMetricSync(filterPlatformId?: PlatformId): Promise<SyncResponse> {
  const syncTimestamp = new Date().toISOString();
  const allPlatforms = await repository.getSocialPlatforms();

  const targetPlatforms = filterPlatformId
    ? allPlatforms.filter((p) => p.platform_id === filterPlatformId && p.is_active !== false)
    : allPlatforms.filter((p) => p.is_active !== false);

  if (targetPlatforms.length === 0) {
    return {
      success: true,
      timestamp: syncTimestamp,
      platforms_processed: 0,
      synced_platforms: [],
    };
  }

  // Concurrent execution wrapped in a single 9-second timeout guard
  let settledResults: PromiseSettledResult<SyncPlatformResult>[];
  try {
    const batchPromise = Promise.allSettled(
      targetPlatforms.map((platform) => syncSinglePlatformTask(platform, syncTimestamp))
    );
    settledResults = await withTimeout(batchPromise, 9000);
  } catch (timeoutErr: unknown) {
    // If the overall 9s batch timeout is exceeded, gracefully fall back for all target platforms
    const timeoutMsg = timeoutErr instanceof Error ? timeoutErr.message : 'Operation exceeded 9000ms';
    return {
      success: true,
      timestamp: syncTimestamp,
      platforms_processed: targetPlatforms.length,
      synced_platforms: targetPlatforms.map((platform) => ({
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
        last_synced_at: platform.last_synced_at,
        error: timeoutMsg,
      })),
    };
  }

  const syncedResults: SyncPlatformResult[] = settledResults.map((settled, index) => {
    if (settled.status === 'fulfilled') {
      return settled.value;
    }
    const platform = targetPlatforms[index]!;
    const errorMsg = settled.reason instanceof Error ? settled.reason.message : String(settled.reason);
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
      last_synced_at: platform.last_synced_at,
      error: errorMsg,
    };
  });

  return {
    success: true,
    timestamp: syncTimestamp,
    platforms_processed: syncedResults.length,
    synced_platforms: syncedResults,
  };
}

// ==============================================================================
// 7. Keyed Single-Flight Coalescing
// ==============================================================================
async function runSingleFlightSync(filterPlatformId?: PlatformId): Promise<SyncResponse> {
  const flightKey = filterPlatformId || '__ALL__';
  const existingPromise = inFlightSyncs.get(flightKey);
  if (existingPromise) {
    return existingPromise;
  }

  const syncPromise = executeMetricSync(filterPlatformId);
  inFlightSyncs.set(flightKey, syncPromise);

  try {
    return await syncPromise;
  } finally {
    inFlightSyncs.delete(flightKey);
  }
}

// ==============================================================================
// 6. Route Handlers (GET & POST)
// ==============================================================================

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing authorization secret',
        timestamp: new Date().toISOString(),
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  try {
    const url = new URL(request.url);
    const platformFilter = (url.searchParams.get('platform') || undefined) as PlatformId | undefined;

    const result = await runSingleFlightSync(platformFilter);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing authorization secret',
        timestamp: new Date().toISOString(),
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  try {
    const body = await safeParseBody(request);
    const platformFilter = body.platform_id;

    const result = await runSingleFlightSync(platformFilter);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

// ==============================================================================
// 7. Unsupported HTTP Methods (405 Method Not Allowed)
// ==============================================================================

const NOT_ALLOWED_RESPONSE = () =>
  NextResponse.json(
    {
      success: false,
      error: 'Method Not Allowed',
      allowed_methods: ['GET', 'POST'],
    },
    {
      status: 405,
      headers: {
        Allow: 'GET, POST',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );

export async function PUT() {
  return NOT_ALLOWED_RESPONSE();
}

export async function DELETE() {
  return NOT_ALLOWED_RESPONSE();
}

export async function PATCH() {
  return NOT_ALLOWED_RESPONSE();
}

export async function HEAD() {
  return NOT_ALLOWED_RESPONSE();
}
