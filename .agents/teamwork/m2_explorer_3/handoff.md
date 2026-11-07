# Handoff Report: Vercel Cron & Realtime Event Synchronization

**Agent**: M2 Explorer 3 (Vercel Cron & Realtime Event Synchronization Specialist)  
**Date**: 2026-11-07  
**Type**: Hard Handoff (Investigation & Architecture Design Complete)

---

## 1. Observation

1. **`vercel.json` Inspection**:
   - Path: `/Users/adechairullah/CODING/SUMBAR_TERKINI/vercel.json`
   - Content (lines 1-8):
     ```json
     {
       "crons": [
         {
           "path": "/api/sync-socials",
           "schedule": "0 */6 * * *"
         }
       ]
     }
     ```
   - Valid JSON syntax; defines 5-part cron schedule `0 */6 * * *` targeting `/api/sync-socials`.

2. **Test Suite Verification**:
   - Executed command: `npx tsx tests/e2e/runner.ts`
   - Output: `Passed: 281 | Failed: 0 | Skipped: 0`
   - Specific assertions for Milestone 2:
     - `T1.15.1 – T1.15.5`: Hybrid Metric Engine API (`GET`/`POST`, schema, `AUTO_API` refresh, `MANUAL` preservation, optional `Bearer <CRON_SECRET>` authorization).
     - `T1.16.1 – T1.16.5`: Pluggable Adapters & Smart Cache (5 adapters, schema mapping, TTL cache, HTTP 429 rate limit fallback, `cached_fallback_used: true`).
     - `T1.17.1 – T1.17.5`: Vercel Cron Configuration (`crons` array, path, 5-part expression, Vercel platform standards).
     - `T2.15.1 – T2.15.5`: Boundaries (405 for PUT/DELETE, 401 for bad secret, 10s timeout, concurrent sync debouncing).
     - `T2.17.1 – T2.17.5`: Cron validation (missing crons check, 5-part validation, minimum interval, trailing comma check).
     - `P06`, `P25`, `S3`, `S4`: Multi-tab synchronization via `BroadcastChannel` and scheduled cron background sync with cached fallback.

3. **Database Schema & Publication Setup**:
   - Path: `/Users/adechairullah/CODING/SUMBAR_TERKINI/supabase/schema.sql`
   - Lines 43-65: `social_platforms` table definition with `sync_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (sync_mode IN ('MANUAL', 'AUTO_API'))`, metrics columns (`followers_count`, `engagement_rate`, `avg_views`, `avg_likes`, `avg_comments`), and `last_synced_at`.
   - Lines 213-235: `ALTER TABLE social_platforms REPLICA IDENTITY FULL;` and inclusion of `social_platforms` in publication `supabase_realtime`.
   - Lines 188-202: RLS policies where `anon` role has `SELECT` only; `authenticated` has write access. Server-side API route without user session requires `SUPABASE_SERVICE_ROLE_KEY` to perform updates on Supabase.

4. **Data Access Layer & Realtime Subscriptions**:
   - Path: `/Users/adechairullah/CODING/SUMBAR_TERKINI/src/lib/data/repository.ts`
   - Lines 176-247: `updateSocialPlatform(id, data)` updates database when configured and always syncs to `LocalStorageManager.saveState('socialPlatforms', ...)`.
   - Lines 416-455: `subscribeToChanges(table, callback)` subscribes to Supabase Realtime channel `postgres_changes` on `social_platforms` when configured, and delegates to `LocalStorageManager.subscribe(table, callback)` in mock mode.
   - Path: `/Users/adechairullah/CODING/SUMBAR_TERKINI/src/lib/data/storage.ts`
   - Lines 31, 190-233: `BROADCAST_CHANNEL_NAME = 'sumbar_terkini_channel'`. Dispatches `BroadcastSyncEvent` (`STATE_UPDATED`) to all open browser tabs.

5. **Type Contracts**:
   - Path: `/Users/adechairullah/CODING/SUMBAR_TERKINI/src/types/index.ts`
   - Lines 44-86: `PlatformId`, `SyncMode`, `PlatformMetrics`, `SocialPlatform`.
   - Lines 137-162: `SyncStatus`, `SyncSource`, `SyncPlatformResult`, `SyncResponse`.
   - Lines 224-233: `RealtimeTable`, `BroadcastSyncEvent`.

---

## 2. Logic Chain

1. **Vercel Cron Trigger**:
   - Observation 1 confirms `vercel.json` is correctly placed and specifies `0 */6 * * *` pointing to `/api/sync-socials`.
   - Vercel Cron will issue an HTTP `GET` request every 6 hours with `Authorization: Bearer <CRON_SECRET>`.
   - As verified in Observation 2 (`T1.15.5` and `P14`), the route handler must check `CRON_SECRET`: if unset (dev mode), proceed; if set and header matches, proceed; if set and header mismatches or is missing, return 401 Unauthorized.

2. **Dual-Mode Arbitration**:
   - From Observation 3 and 5, each platform has an explicit `sync_mode`: `'MANUAL'` or `'AUTO_API'`.
   - When `/api/sync-socials` iterates through platforms:
     - **If `sync_mode === 'MANUAL'`**: The platform is explicitly skipped from external adapter execution. Admin-entered metrics are preserved verbatim. No database write occurs. The result array records `{ platform_id, status: 'skipped_manual', sync_mode: 'MANUAL', metrics, cached_fallback_used: false }` (fulfilling `T1.15.4` and `S3`).
     - **If `sync_mode === 'AUTO_API'`**: The route invokes the platform adapter (IG, TikTok, YouTube, FB, X). The adapter returns updated numbers or cached fallback on HTTP 429 (fulfilling `T1.15.3`, `T1.16.4`, `T2.16.2`). The route computes `engagement_rate = ((likes + comments) / followers) * 100` (fulfilling `T1.21.1-5`) and persists the update via `repository.updateSocialPlatform()`.

3. **Metric Persistence & Realtime Event Propagation**:
   - From Observation 3 and 4, `repository.updateSocialPlatform()` updates the database table `social_platforms`.
   - In production with Supabase:
     - Because `social_platforms` is enrolled in publication `supabase_realtime` with `REPLICA IDENTITY FULL`, Postgres emits a CDC event over Supabase Realtime WebSocket.
     - Browser clients subscribed via `repository.subscribeToChanges('social_platforms', callback)` receive the change payload and trigger animated odometer updates on the bento grid cards without page reload.
   - In development / offline mock mode:
     - `LocalStorageManager` updates `globalThis.__SUMBAR_LOCAL_STORE__`.
     - In browser context (e.g. admin test sync button), `LocalStorageManager.broadcast` sends a `STATE_UPDATED` event through `BroadcastChannel('sumbar_terkini_channel')`, synchronizing across tabs within 5ms (fulfilling `P06`, `P25`, `S4`).

4. **Concurrency & Execution Resilience**:
   - As tested in `T2.15.5`, concurrent sync calls must debounce to prevent conflicting parallel writes.
   - An in-memory atomic lock (`isSyncInProgress`) ensures subsequent overlapping requests return cleanly with status 200 without duplicate upstream polling.

---

## 3. Caveats

1. **Vercel Hobby Tier Execution Limits**: Vercel Hobby serverless functions have a 10-second hard limit. All platform adapter queries must run concurrently via `Promise.allSettled` with individual 3000ms abort signals to guarantee completion within ~2-3 seconds.
2. **Supabase Server-Side RLS**: Anonymous users (`anon`) have `SELECT`-only permissions on `social_platforms`. Route handlers running server-side must use `SUPABASE_SERVICE_ROLE_KEY` if configured to bypass RLS when updating platform metrics. If `SUPABASE_SERVICE_ROLE_KEY` is not provided, the DAL gracefully falls back to local memory storage.
3. **Mock Mode Cross-Process vs Cross-Tab**: Node.js route handlers run in a separate OS process from browser tabs. In offline mock mode, server-side cron updates mutate `globalThis.__SUMBAR_LOCAL_STORE__`. When the browser makes a request or when the admin triggers a test sync from the CMS UI, the client receives the fresh data and dispatches to `BroadcastChannel`, updating all open browser windows.

---

## 4. Conclusion

1. `vercel.json` is **100% verified and compliant** with Vercel platform standards and test suite requirements.
2. The **Dual Sync Mode architecture** is clearly defined:
   - `MANUAL` platforms are strictly protected against automated overwrites.
   - `AUTO_API` platforms refresh automatically with rate-limit cached fallback.
3. The **Realtime Propagation pipeline** is fully designed:
   - Supabase Realtime WebSocket via `supabase_realtime` publication in production.
   - `BroadcastChannel('sumbar_terkini_channel')` across tabs in offline mock mode.
4. The implementation specifications are fully ready for the M2 Worker.

---

## 5. Verification Method

To independently verify the configuration and architecture:

1. **Execute the E2E Test Suite**:
   ```bash
   npx tsx tests/e2e/runner.ts
   ```
   *Expected output*: `Passed: 281 | Failed: 0 | Skipped: 0`.

2. **Verify `vercel.json` Syntax and Platform Compliance**:
   ```bash
   node -e "const c = require('./vercel.json'); console.assert(c.crons[0].path === '/api/sync-socials'); console.assert(c.crons[0].schedule === '0 */6 * * *'); console.log('vercel.json VALID');"
   ```

3. **Verify Milestone 2 Test Coverage**:
   - Inspect `tests/e2e/tier1-features.test.ts` (lines 675–823 for F15, F16, F17).
   - Inspect `tests/e2e/tier2-boundaries.test.ts` (lines 596–760 for boundary conditions).
   - Inspect `tests/e2e/tier4-workloads.test.ts` (lines 140–215 for Scenario S3 cron sync).

4. **Invalidation Conditions**:
   - Any modification to `vercel.json` changing `path` away from `/api/sync-socials` or `schedule` away from `0 */6 * * *`.
   - Overwriting a `MANUAL` platform's metric fields during an automated sync execution.
   - Crashing with HTTP 500 when external APIs return HTTP 429 instead of returning cached fallback data.
