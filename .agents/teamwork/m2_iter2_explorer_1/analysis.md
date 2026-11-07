# Comprehensive Route Concurrency & Batch Execution Remediation Analysis

**Author**: M2 Iteration 2 Explorer 1 (Route Concurrency & Batch Specialist)  
**Date**: 2026-11-07  
**Target File**: `src/app/api/sync-socials/route.ts`  
**Reference Issues**: Reviewer 1 Finding 1 (Critical), Finding 5 (Minor), DEAD_ENDS.md entry M2-1  

---

## 1. Executive Summary

During Milestone 2 review, Reviewer 1 identified a **Critical Concurrency Defect** and a **Serverless Timeout Risk** in `src/app/api/sync-socials/route.ts`:
1. **Single-Flight Cross-Talk & Dropped Platforms**: `activeSyncPromise` was a single module-level variable (`let activeSyncPromise: Promise<SyncResponse> | null = null;`). When concurrent requests arrived with different query filters (e.g. `?platform=instagram` and `?platform=tiktok`), the second request returned the first request's promise, returning Instagram metrics to a caller requesting TikTok. Furthermore, when an admin triggered an individual sync while a scheduled Vercel Cron triggered a full sync, the cron request coalesced into the single-platform promise and dropped 4 out of 5 platforms (`platforms_processed: 1` instead of `5`).
2. **Sequential Timeout Accumulation**: The route iterated sequentially over target platforms in a `for...of` loop with an individual 9-second timeout per platform (`withTimeout(adapter.sync(platform), 9000)`). In a worst-case degradation scenario across 5 platforms, execution time could accumulate up to 45 seconds—far exceeding Vercel Serverless Function's 10-second ceiling on the free tier and triggering an unhandled HTTP 504 Gateway Timeout.

This analysis presents the complete, verified architectural design to resolve both defects:
- Replace `activeSyncPromise` with `const inFlightSyncs = new Map<string, Promise<SyncResponse>>()`, keyed by `filterPlatformId || '__ALL__'`.
- Replace sequential `for...of` execution with concurrent `Promise.allSettled` wrapped in a single 9-second timeout guard.
- Provide an exact drop-in implementation guide for the Worker.

---

## 2. Empirical Defect Verification

Before designing the fix, both defects were independently reproduced on the current codebase:

### 2.1 Reproduction of Single-Flight Cross-Talk
```bash
npx tsx -e "
import { GET } from './src/app/api/sync-socials/route';
async function test() {
  const req1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
  const req2 = new Request('http://localhost:3000/api/sync-socials?platform=tiktok');
  const [res1, res2] = await Promise.all([GET(req1), GET(req2)]);
  const data1 = await res1.json();
  const data2 = await res2.json();
  console.log('Req1 platform synced:', data1.synced_platforms[0].platform_id);
  console.log('Req2 platform synced:', data2.synced_platforms[0].platform_id);
}
test();
"
```
**Empirical Output**:
```
Req1 platform synced: instagram
Req2 platform synced: instagram
```
**Defect Confirmed**: Request 2 requested `tiktok`, but received `instagram` data because `activeSyncPromise` lacked key scoping.

### 2.2 Reproduction of Dropped Platforms During Cron Execution
```bash
npx tsx -e "
import { GET } from './src/app/api/sync-socials/route';
async function test() {
  const req1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
  const req2 = new Request('http://localhost:3000/api/sync-socials');
  const [res1, res2] = await Promise.all([GET(req1), GET(req2)]);
  const data1 = await res1.json();
  const data2 = await res2.json();
  console.log('Req1 platforms_processed:', data1.platforms_processed);
  console.log('Req2 platforms_processed:', data2.platforms_processed);
}
test();
"
```
**Empirical Output**:
```
Req1 platforms_processed: 1
Req2 platforms_processed: 1
```
**Defect Confirmed**: The cron job expecting all 5 platforms had 4 platforms completely dropped.

---

## 3. Architecture & Remediation Design

### 3.1 Keyed Single-Flight Map (`inFlightSyncs`)
Instead of a single module-level variable, in-flight operations are tracked in a module-scoped `Map`:
```typescript
const inFlightSyncs = new Map<string, Promise<SyncResponse>>();
```
The coalescing key is defined as:
```typescript
const flightKey = filterPlatformId || '__ALL__';
```

**Keying Behavior Matrix**:
| Influx Request Target | Filter Platform ID | Flight Key | Coalesces With | Isolated From |
|---|---|---|---|---|
| Full Refresh (Cron / Admin) | `undefined` | `'__ALL__'` | Other Full Refreshes | All individual platform syncs |
| Instagram Only | `'instagram'` | `'instagram'` | Concurrent Instagram requests | TikTok, YouTube, FB, X, and `__ALL__` |
| TikTok Only | `'tiktok'` | `'tiktok'` | Concurrent TikTok requests | Instagram, YouTube, FB, X, and `__ALL__` |
| YouTube Only | `'youtube'` | `'youtube'` | Concurrent YouTube requests | Other platforms and `__ALL__` |
| Facebook Only | `'facebook'` | `'facebook'` | Concurrent Facebook requests | Other platforms and `__ALL__` |
| X Only | `'x'` | `'x'` | Concurrent X requests | Other platforms and `__ALL__` |

**Lifecycle & Cleanup**:
```typescript
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
```
- **Reusability**: Concurrent callers arriving while `syncPromise` is pending will await the exact same promise instance and receive the identical timestamp.
- **Leak-Proof**: In the `finally` block, `inFlightSyncs.delete(flightKey)` guarantees removal upon either fulfillment or rejection, preventing memory leaks or poisoned rejection states for future requests.

---

### 3.2 Concurrent Batch Processing via `Promise.allSettled`

Instead of sequentially awaiting each platform inside a `for...of` loop, we decouple each platform into an independent asynchronous task (`syncSinglePlatformTask`) and run all target platforms concurrently via `Promise.allSettled`:

```typescript
async function syncSinglePlatformTask(
  platform: SocialPlatform,
  syncTimestamp: string
): Promise<SyncPlatformResult> {
  // 1. MANUAL mode: strictly preserve admin-entered metrics
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

  // 2. AUTO_API mode: trigger adapter sync
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
```

**Benefits**:
1. **Parallelism**: All 5 platforms execute concurrently. Total duration equals `max(platform_latencies)` instead of `sum(platform_latencies)`. In typical local/mock conditions, this drops execution from ~1000ms to ~200ms. In production under API latency (e.g. 1.5s per external call), execution drops from 7.5s to 1.5s.
2. **Failure Isolation**: An unhandled exception or rejected promise in one platform adapter never interrupts or degrades the synchronization of other platforms.

---

### 3.3 Single 9-Second Timeout Guard & Resilient Batch Fallback

To comply with Vercel's 10-second serverless execution ceiling, the entire concurrent batch is wrapped in a single 9000ms timeout guard:

```typescript
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
```

**Resilience Guarantee**:
- If external social media APIs hang or freeze for longer than 9 seconds, `withTimeout` rejects before Vercel's 10s cutoff.
- The `catch` block catches the timeout and returns a 200 OK JSON response containing cached fallback metrics for all target platforms, completely preventing unhandled 504 Gateway Timeouts and ensuring uninterrupted public site rendering.

---

## 4. Empirical Sandbox Verification Results

We verified the remediation design in an isolated Node.js test harness against the actual data repository and adapter classes. All 4 concurrency scenarios were tested:

| Test Scenario | Input Conditions | Observed Result | Status |
|---|---|---|---|
| **Scenario 1: Filter Isolation** | Concurrent `?platform=instagram` and `?platform=tiktok` | Req 1 received `['instagram']`, Req 2 received `['tiktok']`. Zero cross-talk. | **PASS** |
| **Scenario 2: Cron + Single Sync** | Concurrent full refresh (`undefined`) and `?platform=instagram` | Full refresh processed 5 platforms; single sync processed 1 platform. No platform dropped. | **PASS** |
| **Scenario 3: Same-Filter Coalescing** | 3 simultaneous full refresh requests (`undefined`) | All 3 resolved with the exact same coalesced timestamp. Single flight achieved. | **PASS** |
| **Scenario 4: In-Flight Map Cleanup** | Post-settlement check | `inFlightSyncs.size === 0`. No memory leak or residual entries. | **PASS** |
| **Scenario 5: Batch Timeout Fallback** | Adapter latency simulated at 500ms under 50ms guard | Caught timeout at 50ms, returned `success: true`, `status: 'cached_fallback'`, `error: 'Timeout: Operation exceeded 50ms'`. | **PASS** |

---

## 5. Drop-In Implementation Guide for the Worker

The Worker should apply the following modifications to `src/app/api/sync-socials/route.ts`:

### 5.1 Import Update (`src/app/api/sync-socials/route.ts:4-8`)
Add `SocialPlatform` to the imported types from `@/types`:
```typescript
import type {
  SyncResponse,
  SyncPlatformResult,
  PlatformId,
  SocialPlatform,
} from '@/types';
```

### 5.2 Section 1: Replace `activeSyncPromise` (`src/app/api/sync-socials/route.ts:16-20`)
```typescript
// ==============================================================================
// 1. Concurrency Control (Keyed Single-Flight Map)
// ==============================================================================
const inFlightSyncs = new Map<string, Promise<SyncResponse>>();
```

### 5.3 Sections 4, 5, and Concurrency Coalescing (`src/app/api/sync-socials/route.ts:78-204`)
Replace lines 78–204 with the refactored timeout wrapper, `syncSinglePlatformTask`, batch `executeMetricSync`, and keyed `runSingleFlightSync`:

```typescript
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
      // Persistence error in repository should not fail the platform result
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
    // Graceful fallback to existing platform metrics on unhandled error
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
```

---

## 6. Verification Plan for Worker & Reviewer

After implementing these changes:
1. **Adversarial Cross-Filter Stress Test**:
   ```bash
   npx tsx -e "
   import { GET } from './src/app/api/sync-socials/route';
   async function test() {
     const req1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
     const req2 = new Request('http://localhost:3000/api/sync-socials?platform=tiktok');
     const [res1, res2] = await Promise.all([GET(req1), GET(req2)]);
     const data1 = await res1.json();
     const data2 = await res2.json();
     console.log('Req1 platform synced:', data1.synced_platforms[0].platform_id);
     console.log('Req2 platform synced:', data2.synced_platforms[0].platform_id);
     if (data1.synced_platforms[0].platform_id === 'instagram' && data2.synced_platforms[0].platform_id === 'tiktok') {
       console.log('SUCCESS: Cross-filter isolation verified.');
     } else {
       console.error('FAIL: Filter collision detected.');
       process.exit(1);
     }
   }
   test();
   "
   ```
2. **Concurrent Full-Sync Stress Test**:
   ```bash
   npx tsx -e "
   import { GET } from './src/app/api/sync-socials/route';
   async function test() {
     const req1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
     const req2 = new Request('http://localhost:3000/api/sync-socials');
     const [res1, res2] = await Promise.all([GET(req1), GET(req2)]);
     const data1 = await res1.json();
     const data2 = await res2.json();
     console.log('Req1 platforms_processed:', data1.platforms_processed);
     console.log('Req2 platforms_processed:', data2.platforms_processed);
     if (data1.platforms_processed === 1 && data2.platforms_processed === 5) {
       console.log('SUCCESS: Full sync and single-platform sync executed independently.');
     } else {
       console.error('FAIL: Platforms were dropped in full sync.');
       process.exit(1);
     }
   }
   test();
   "
   ```
3. **Run Full Test Suites**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   - `npx tsx tests/e2e/runner.ts`
   - `npx tsx tests/adversarial/tier5-adversarial.test.ts`
   - `npx tsx tests/adversarial/m2-stress.test.ts`
