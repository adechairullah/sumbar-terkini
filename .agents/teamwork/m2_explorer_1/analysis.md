# Analysis: Next.js App Router Architecture for `/api/sync-socials`

**Author**: M2 Explorer 1 (API Route Architecture Specialist)  
**Date**: 2026-11-07  
**Scope**: Milestone 2 — Hybrid Social Media Metric Engine API Route Handler  
**Target File**: `src/app/api/sync-socials/route.ts`  

---

## 1. Executive Summary

Requirement R2 and Milestone 2 mandate a production-grade, resilient HTTP API route handler at `/api/sync-socials` within the Next.js 15 App Router architecture. This endpoint serves dual roles:
1. **Automated Background Poller**: Scheduled via Vercel Cron (`0 */6 * * *` configured in `vercel.json`) to periodically refresh creator social statistics across Instagram, TikTok, YouTube, Facebook, and X.
2. **On-Demand Manual Sync & Webhook Receiver**: Callable via `POST` (or `GET`) from the CMS Admin Panel (`/admin`) or external webhooks.

This analysis provides the complete architectural design, authorization contract, concurrency safeguards, dual-mode persistence workflow, and concrete production-grade code for `src/app/api/sync-socials/route.ts`.

---

## 2. Requirements & E2E Test Contract Matrix

The API route must satisfy all specifications defined across `PROJECT.md`, `ORIGINAL_REQUEST.md`, `TEST_READY.md`, and test suites `tier1-features.test.ts`, `tier2-boundaries.test.ts`, `tier3-combinations.test.ts`, and `tier4-workloads.test.ts`.

| ID | Test / Spec | Requirement | Architectural Solution |
|---|---|---|---|
| **T1.15.1** | `F15: Route handles GET and POST` | Route must accept both `GET` and `POST` methods, returning HTTP 200 with JSON payload | Export named `GET` and `POST` handlers in `route.ts` |
| **T1.15.2** | `F15: Response schema` | Response must strictly include `success: true`, `timestamp: string`, and `synced_platforms: Array` | Conform to Contract 2 schema in `PROJECT.md` and `SyncResponse` in `src/types/index.ts` |
| **T1.15.3** | `F15: AUTO_API refresh` | Platforms configured with `AUTO_API` trigger platform metric refresh | Query platform adapter, compute metrics, update database |
| **T1.15.4** | `F15: MANUAL preservation` | Platforms configured with `MANUAL` must NEVER have their admin metrics overwritten | Check `platform.sync_mode === 'MANUAL'`, preserve metrics, return `status: 'skipped_manual'` |
| **T1.15.5** | `F15: Bearer CRON_SECRET` | Accepts optional `Bearer <CRON_SECRET>` authorization header | Validate header against `process.env.CRON_SECRET`; allow if secret is unset or valid |
| **P14** | `Tier 3 Combinations: Cron Header Auth` | When `CRON_SECRET` is set: valid Bearer -> 200; missing header -> 401; wrong secret -> 401. When unset: allow 200 (dev mode) | Enforce environment-aware secret gate (`isAuthorized` helper) |
| **T2.15.1** | `Tier 2 Boundaries: Method Not Allowed` | Unsupported HTTP methods (`PUT`, `DELETE`, `PATCH`, `HEAD`) must return HTTP 405 Method Not Allowed | Export explicit handlers for `PUT`, `DELETE`, `PATCH`, `HEAD` returning 405 with `Allow: GET, POST` header |
| **T2.15.2** | `Tier 2 Boundaries: Invalid Secret Auth` | Wrong secret when `CRON_SECRET` enforced returns 401 | Validate bearer token and query parameter string equality |
| **T2.15.3** | `Tier 2 Boundaries: Malformed Body Handling` | Empty or malformed JSON in `POST` body handled gracefully without 500 crash | Safe `request.text()` reading with `try/catch` and fallback to empty object |
| **T2.15.4** | `Tier 2 Boundaries: Upstream Timeout (>10s)` | Upstream API network delays intercepted by timeout handler before Vercel limits | Wrap adapter execution in 9-second `Promise.race` timeout guard |
| **T2.15.5** | `Tier 2 Boundaries: Concurrent Call Debouncing` | Simultaneous concurrent sync calls serialize or debounce safely | In-flight execution lock / coalesced promise to prevent duplicate upstream sync |
| **S3** | `Tier 4 Workloads: Scheduled Cron Sync` | When adapter encounters HTTP 429 or network error, serve smart cache with `cached_fallback_used: true` | Seamless integration with `SmartCacheLayer` via platform adapters |

---

## 3. Core Architectural Components

### 3.1 Next.js 15 Route Segment Configuration
To ensure Vercel and Next.js never statically cache or pre-render this endpoint, the following route segment exports are required at the top of `src/app/api/sync-socials/route.ts`:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
```

### 3.2 Authorization Logic Specification
The endpoint supports both production cron invocation and local development preview:
1. Read `const configuredSecret = process.env.CRON_SECRET?.trim()`.
2. **If `configuredSecret` is undefined or empty string**:
   - Authentication is waived. Requests proceed with HTTP 200 (essential for local testing, offline demo, and initial git clone without credentials).
3. **If `configuredSecret` is set**:
   - Extract `Authorization` header: `Bearer <token>`.
   - Extract URL query parameter: `?secret=<token>`.
   - If either matches `configuredSecret`: request is authorized.
   - If both are missing or do not match: reject with `HTTP 401 Unauthorized`:
     ```json
     {
       "success": false,
       "error": "Unauthorized: Invalid or missing CRON_SECRET token",
       "timestamp": "2026-11-07T05:30:00.000Z"
     }
     ```

### 3.3 Concurrency & Single-Flight Execution Lock (T2.15.5)
To prevent thundering herd problems, duplicate external API quota consumption, and race conditions during database writes:
- Maintain module-scoped state:
  ```typescript
  let activeSyncPromise: Promise<SyncResponse> | null = null;
  ```
- If a sync request arrives while another sync is actively executing (`activeSyncPromise !== null`), the incoming request attaches to `activeSyncPromise` and awaits the same result.
- Once completed (success or failure), `activeSyncPromise` is reset to `null` inside a `finally` block.
- This ensures concurrent requests are safely coalesced into a single authoritative sync cycle.

### 3.4 Upstream Network Timeout Guard (T2.15.4)
Vercel serverless execution limits on Hobby tier have a 10s default timeout. To prevent unhandled 504 gateway timeouts:
- Wrap upstream adapter execution with a 9,000ms (9s) timeout guard.
- If upstream APIs fail to respond within 9 seconds, catch the timeout and activate cached fallback metrics (`cached_fallback_used: true`).

### 3.5 Dual-Mode Platform Sync Workflow
For each platform loaded from `repository.getSocialPlatforms()`:
1. **`sync_mode === 'MANUAL'`**:
   - External APIs are **never** called.
   - Admin-entered metrics (`followers_count`, `avg_views`, `avg_likes`, `avg_comments`, `engagement_rate`) are untouched.
   - Database update is bypassed.
   - Result item:
     ```typescript
     {
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
     }
     ```
2. **`sync_mode === 'AUTO_API'`**:
   - Dispatch platform sync via adapter: `const result = await getAdapter(platform.platform_id).sync(platform)`.
   - Update `repository`:
     ```typescript
     await repository.updateSocialPlatform(platform.id, {
       followers_count: result.metrics.followers_count,
       engagement_rate: result.metrics.engagement_rate,
       avg_views: result.metrics.avg_views,
       avg_likes: result.metrics.avg_likes,
       avg_comments: result.metrics.avg_comments,
       last_synced_at: syncTimestamp,
     });
     ```
   - Result item:
     ```typescript
     {
       platform_id: platform.platform_id,
       platform_name: platform.platform_name,
       status: result.cached_fallback_used ? 'cached_fallback' : 'synced',
       sync_mode: 'AUTO_API',
       metrics: result.metrics,
       cached_fallback_used: result.cached_fallback_used,
       source: result.source,
       last_synced_at: syncTimestamp,
       error: result.error,
     }
     ```

### 3.6 Interface Contract 2 Compliant Response Payload
Conforming strictly to `PROJECT.md` Contract 2:
```json
{
  "success": true,
  "timestamp": "2026-11-07T05:30:00.000Z",
  "platforms_processed": 5,
  "synced_platforms": [
    {
      "platform_id": "instagram",
      "platform_name": "Instagram",
      "status": "synced",
      "sync_mode": "AUTO_API",
      "metrics": {
        "followers_count": 854700,
        "engagement_rate": 4.85,
        "avg_views": 183000,
        "avg_likes": 38300,
        "avg_comments": 3260
      },
      "cached_fallback_used": false,
      "source": "live_api",
      "last_synced_at": "2026-11-07T05:30:00.000Z"
    },
    {
      "platform_id": "tiktok",
      "platform_name": "TikTok",
      "status": "cached_fallback",
      "sync_mode": "AUTO_API",
      "metrics": {
        "followers_count": 1240000,
        "engagement_rate": 6.42,
        "avg_views": 450000,
        "avg_likes": 72000,
        "avg_comments": 7600
      },
      "cached_fallback_used": true,
      "source": "last_cache",
      "last_synced_at": "2026-11-07T05:30:00.000Z"
    },
    {
      "platform_id": "facebook",
      "platform_name": "Facebook",
      "status": "skipped_manual",
      "sync_mode": "MANUAL",
      "metrics": {
        "followers_count": 520000,
        "engagement_rate": 3.15,
        "avg_views": 65000,
        "avg_likes": 14200,
        "avg_comments": 2180
      },
      "cached_fallback_used": false,
      "source": "last_cache",
      "last_synced_at": "2026-11-07T04:00:00.000Z"
    }
  ]
}
```

---

## 4. Proposed Implementation: `src/app/api/sync-socials/route.ts`

The following complete TypeScript implementation is designed for drop-in placement by the M2 Worker:

```typescript
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
// 1. Concurrency Control (Single-Flight Lock)
// ==============================================================================
let activeSyncPromise: Promise<SyncResponse> | null = null;

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
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
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
// 4. Timeout Wrapper (9s Guard)
// ==============================================================================
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 9000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: Operation exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// ==============================================================================
// 5. Core Metric Sync Execution
// ==============================================================================
async function executeMetricSync(filterPlatformId?: PlatformId): Promise<SyncResponse> {
  const syncTimestamp = new Date().toISOString();
  const allPlatforms = await repository.getSocialPlatforms();

  const targetPlatforms = filterPlatformId
    ? allPlatforms.filter((p) => p.platform_id === filterPlatformId && p.is_active !== false)
    : allPlatforms.filter((p) => p.is_active !== false);

  const syncedResults: SyncPlatformResult[] = [];

  for (const platform of targetPlatforms) {
    // MANUAL mode: strictly preserve admin-entered metrics
    if (platform.sync_mode === 'MANUAL') {
      syncedResults.push({
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
      });
      continue;
    }

    // AUTO_API mode: trigger adapter sync with timeout guard
    try {
      const adapter = getAdapter(platform.platform_id);
      const adapterResult = await withTimeout(adapter.sync(platform), 9000);

      // Persist refreshed metrics to ResilientRepository
      await repository.updateSocialPlatform(platform.id, {
        followers_count: adapterResult.metrics.followers_count,
        engagement_rate: adapterResult.metrics.engagement_rate,
        avg_views: adapterResult.metrics.avg_views,
        avg_likes: adapterResult.metrics.avg_likes,
        avg_comments: adapterResult.metrics.avg_comments,
        last_synced_at: syncTimestamp,
      });

      syncedResults.push({
        platform_id: platform.platform_id,
        platform_name: platform.platform_name,
        status: adapterResult.cached_fallback_used ? 'cached_fallback' : 'synced',
        sync_mode: 'AUTO_API',
        metrics: adapterResult.metrics,
        cached_fallback_used: adapterResult.cached_fallback_used,
        source: adapterResult.source,
        last_synced_at: syncTimestamp,
        error: adapterResult.error,
      });
    } catch (err: unknown) {
      // Graceful fallback to existing platform metrics on unhandled error
      const errorMessage = err instanceof Error ? err.message : String(err);
      syncedResults.push({
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
      });
    }
  }

  return {
    success: true,
    timestamp: syncTimestamp,
    platforms_processed: syncedResults.length,
    synced_platforms: syncedResults,
  };
}

// Coalesce concurrent executions
async function runSingleFlightSync(filterPlatformId?: PlatformId): Promise<SyncResponse> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = executeMetricSync(filterPlatformId);

  try {
    return await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
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
```

---

## 5. Worker Implementation Guide

For the Milestone 2 implementation worker:

1. **Prerequisite**: Ensure `src/lib/adapters` is implemented or stubbed with `getAdapter(platformId)` exporting an object with a `sync(platform: SocialPlatform): Promise<AdapterResult>` method.
2. **File Creation**: Create `src/app/api/sync-socials/route.ts` with the exact implementation from Section 4.
3. **Directory Structure**:
   ```
   src/
   └── app/
       └── api/
           └── sync-socials/
               └── route.ts
   ```
4. **Adapter Coordination**: Confirm that `getAdapter(platform_id).sync(platform)` returns an object adhering to:
   ```typescript
   export interface AdapterSyncResult {
     metrics: PlatformMetrics;
     cached_fallback_used: boolean;
     source: SyncSource;
     error?: string;
   }
   ```
5. **Validation**:
   - Run strict TypeScript check: `npx tsc --noEmit`.
   - Run E2E test runner: `npx tsx tests/e2e/runner.ts`.
   - Verify all tests in F15, F16, F17, P14, and S3 pass cleanly with zero failures.

---

## 6. Synthesis & Dependencies

- **M2 Explorer 2 Coordination**: Adapters in `src/lib/adapters/*.ts` provide the platform metric fetching and `SmartCacheLayer`. The route handler delegates the platform-specific API details to `getAdapter(platform.platform_id).sync(platform)`.
- **M2 Explorer 3 Coordination**: Vercel Cron in `vercel.json` calls `/api/sync-socials` with `schedule: "0 */6 * * *"`. The route handler accepts this request and propagates database updates through `repository.updateSocialPlatform()`, which automatically triggers Supabase Realtime in production or `BroadcastChannel` in mock mode.
