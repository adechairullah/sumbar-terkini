# M2 Investigation Analysis: Vercel Cron & Realtime Metric Synchronization Engine

**Author**: M2 Explorer 3 (Vercel Cron & Realtime Event Synchronization Specialist)  
**Date**: 2026-11-07  
**Scope**: Milestone 2 — Hybrid Social Media Metric Engine (`/api/sync-socials`), Vercel Cron Configuration (`vercel.json`), Dual Sync Mode Rules (`MANUAL` vs `AUTO_API`), and Realtime Metric Propagation (Supabase Realtime & Mock `BroadcastChannel`).

---

## 1. Executive Summary

Milestone 2 establishes the metric synchronization engine that powers the Sumbar Terkini Creator Media Kit and Endorsement Hub. This investigation designs and verifies the two foundational data pipelines:
1. **Background Polling Automation**: Periodic background execution orchestrated by Vercel Cron Jobs (`vercel.json`) invoking `/api/sync-socials` every 6 hours (`0 */6 * * *`).
2. **Dual-Mode Metric Governance & Realtime Propagation**:
   - **`MANUAL` Mode**: Platforms configured in MANUAL mode are strictly immutable during automated sync calls. Their admin-entered numbers remain 100% authoritative, returning `status: 'skipped_manual'` with zero database overwrites.
   - **`AUTO_API` Mode**: Platforms configured in AUTO_API mode query modular platform adapters (with smart caching fallback against HTTP 429 rate limits), updating `followers_count`, `avg_views`, `avg_likes`, `avg_comments`, `engagement_rate`, and `last_synced_at`.
   - **Realtime Propagation**: In production, Supabase PostgreSQL updates trigger instant WebSocket broadcasts via the `supabase_realtime` publication. In offline/mock mode, `BroadcastChannel('sumbar_terkini_channel')` provides cross-tab synchronization with sub-5ms latency.

---

## 2. Vercel Cron Integration Specification (`vercel.json`)

### 2.1 Configuration File Verification

The existing `vercel.json` file at the repository root was inspected and validated against Vercel platform standards and test assertions (T1.17.1 – T1.17.5, T2.17.1 – T2.17.5):

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

### 2.2 Schedule Syntax & Platform Compliance

- **Cron Expression**: `0 */6 * * *`
  - Field 1 (`0`): Minute 0.
  - Field 2 (`*/6`): Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC).
  - Field 3 (`*`): Every day of the month.
  - Field 4 (`*`): Every month.
  - Field 5 (`*`): Every day of the week.
- **Vercel Platform Constraints**:
  - Conforms to POSIX 5-field cron syntax.
  - Avoids sub-hour intervals that violate Vercel Hobby tier limits (T2.17.3).
  - Vercel executes cron jobs via an **HTTP `GET`** request to the configured path.
  - Vercel automatically injects the header `Authorization: Bearer <CRON_SECRET>` when the environment variable `CRON_SECRET` is configured in the project settings.
- **Execution Budget**:
  - Vercel Serverless Function execution timeout: 10 seconds (Hobby) / 60 seconds (Pro).
  - Metric adapter calls must be parallelized (via `Promise.allSettled`) and protected with individual timeouts (e.g., 3000ms) to guarantee that `/api/sync-socials` responds well under 5 seconds even if upstream social APIs hang.

---

## 3. Dual Sync Mode Architecture (`MANUAL` vs `AUTO_API`)

### 3.1 Mode Invariants

The data model for `SocialPlatform` in `src/types/index.ts` specifies:
```typescript
export type SyncMode = 'MANUAL' | 'AUTO_API';
```

| Dimension | `MANUAL` Sync Mode | `AUTO_API` Sync Mode |
|---|---|---|
| **Authoritative Source** | CMS Admin manual entry | External platform adapter (IG, TikTok, YT, FB, X) |
| **Cron Sync Behavior** | **STRICTLY SKIPPED** (No API calls, no DB write) | **REFRESHED** via adapter or cached fallback |
| **Updated Fields on Sync** | None (metrics remain frozen) | `followers_count`, `avg_views`, `avg_likes`, `avg_comments`, `engagement_rate`, `last_synced_at` |
| **API Response Status** | `skipped_manual` | `synced` (or `cached_fallback` if 429 rate-limited) |
| **Realtime Event Dispatched** | None during cron sync | `STATE_UPDATED` on `social_platforms` |
| **CMS Edit Behavior** | Admin inputs raw counts; auto-ER helper calculates ER % | Admin can force manual refresh or toggle to MANUAL |

### 3.2 Dual Sync Coordination Flowchart

```
                          ┌──────────────────────────┐
                          │   /api/sync-socials      │
                          │   (Cron or POST Trigger) │
                          └─────────────┬────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │ ResilientRepository:     │
                          │ getSocialPlatforms()     │
                          └─────────────┬────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │ For each active platform │
                          └─────────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [sync_mode === 'MANUAL']               [sync_mode === 'AUTO_API']
                    │                                       │
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │ - DO NOT call adapter  │              │ - Query PlatformAdapter│
       │ - DO NOT mutate DB     │              │ - Catch 429 -> Cache   │
       │ - Record result:       │              │ - Compute ER %         │
       │   status:              │              │ - Update Repository    │
       │   'skipped_manual'     │              │ - Record result:       │
       └────────────────────────┘              │   status: 'synced' /   │
                                               │   'cached_fallback'    │
                                               └────────────────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │ Return HTTP 200 JSON:    │
                          │ { success, timestamp,    │
                          │   synced_platforms }     │
                          └──────────────────────────┘
```

### 3.3 Formula & Precision Guards for `AUTO_API`

When an adapter returns fresh follower, like, and comment counts, `engagement_rate` must be computed with precision and division-by-zero protection (satisfying `T1.21.1` - `T1.21.5`):

```typescript
export function calculateER(avgLikes: number, avgComments: number, followersCount: number): number {
  if (!followersCount || followersCount <= 0) {
    return 0.00;
  }
  const rawER = ((avgLikes + avgComments) / followersCount) * 100;
  return Math.round(rawER * 100) / 100; // Guarantee 2 decimal places
}
```

---

## 4. Repository Updates & Realtime Metric Propagation

### 4.1 Production Pipeline: Supabase Realtime Publication

In production (`isSupabaseConfigured() === true`):

1. **Table Schema & Identity (`supabase/schema.sql`)**:
   - `social_platforms` has `REPLICA IDENTITY FULL` enabled.
   - `social_platforms` is added to the `supabase_realtime` publication:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE social_platforms;
     ```
2. **Server-Side API Write Authorization**:
   - In Supabase, the `anon` key only has `SELECT` permission under Row Level Security (RLS).
   - Route handler `/api/sync-socials` runs server-side without a user cookie.
   - The server must instantiate a Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (or admin client) to perform the `UPDATE` query:
     ```typescript
     await supabaseAdmin
       .from('social_platforms')
       .update({
         followers_count: metrics.followers_count,
         avg_views: metrics.avg_views,
         avg_likes: metrics.avg_likes,
         avg_comments: metrics.avg_comments,
         engagement_rate: metrics.engagement_rate,
         last_synced_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
       })
       .eq('id', platform.id);
     ```
3. **Realtime Broadcast to Browser Clients**:
   - The PostgreSQL `UPDATE` is detected by the Supabase Realtime daemon.
   - WebSocket message is pushed to browser clients subscribed via `repository.subscribeToChanges('social_platforms', callback)`.
   - The client callback receives:
     ```typescript
     {
       type: 'STATE_UPDATED',
       table: 'social_platforms',
       action: 'UPDATE',
       payload: updatedRow,
       timestamp: '2026-11-07T05:15:00.000Z'
     }
     ```
   - Client React components update their local state:
     - Follower count rolls mechanically on the `RollingOdometer`.
     - ER badge updates (e.g., transitions to "Viral Maker" if ER >= 4.0%).
     - Zero page refresh or reload required.

### 4.2 Offline / Mock Pipeline: BroadcastChannel & LocalStorage

In development or offline clone environments (`isSupabaseConfigured() === false`):

1. **Server-Side Route Handler**:
   - `/api/sync-socials` updates the in-memory store `globalThis.__SUMBAR_LOCAL_STORE__.socialPlatforms`.
   - Node.js runtime has no DOM `window` or `BroadcastChannel`. Server-side execution safely mutates `__SUMBAR_LOCAL_STORE__` and returns the synced JSON payload.
2. **Browser-Side CMS & Test Trigger**:
   - When an admin triggers manual sync or updates platform metrics in `/admin`:
     - Executed in browser context where `LocalStorageManager.isBrowser() === true`.
     - Updated array is persisted to `localStorage.setItem('sumbar_socials_store', ...)`.
     - Dispatched over `BroadcastChannel('sumbar_terkini_channel')`:
       ```typescript
       const channel = new BroadcastChannel('sumbar_terkini_channel');
       channel.postMessage({
         type: 'STATE_UPDATED',
         table: 'social_platforms',
         action: 'UPDATE',
         payload: updatedPlatforms,
         timestamp: new Date().toISOString(),
       });
       channel.close();
       ```
3. **Cross-Tab Synchronization**:
   - Other tabs (public media kit at `/` or split-screen preview) listening on `BroadcastChannel('sumbar_terkini_channel')` receive the message within 5ms.
   - Tests `P06`, `P25`, and `S4` assert that split-screen live preview and multi-tab state stay 100% in sync without Supabase credentials.

---

## 5. Concurrency Control & Rate Limiting Guards

### 5.1 Debounce & Serialization (`T2.15.5`)

Boundary test `T2.15.5` requires that concurrent sync requests serialize or debounce safely:
- If a Vercel cron triggers while a manual admin sync is already processing, the route must not execute parallel conflicting writes.
- Implementation: An in-memory atomic lock (`let isSyncRunning = false`) with an expiration timeout (e.g. 15 seconds) rejects or coalesces duplicate concurrent runs:
  ```typescript
  if (isSyncInProgress()) {
    return NextResponse.json({
      success: true,
      message: 'Sync currently in progress; skipping duplicate run',
      synced_platforms: [],
    }, { status: 200 });
  }
  ```

### 5.2 Upstream HTTP 429 Interception (`T1.16.4`, `T2.16.2`, `S3`)

- If an external adapter experiences HTTP 429 (Rate Limit Exceeded) or HTTP 500:
  - Smart cache layer (`SmartCacheLayer`) retrieves the last valid cached metric snapshot.
  - If cache is empty, fallback to seed platform data (`seedSocialPlatforms`).
  - Response sets `cached_fallback_used: true` and `status: 'cached_fallback'`.
  - The endpoint returns HTTP 200 (never crashes with HTTP 500).

---

## 6. End-to-End Test Matrix Mapping

| Test Assertion | Covered Requirement | Verification Method |
|---|---|---|
| `T1.15.1` – `T1.15.2` | Route handles GET & POST, returns Contract 2 JSON | Invoke `/api/sync-socials` via GET and POST; assert schema |
| `T1.15.3` | `AUTO_API` platforms refreshed | Check `synced_platforms` for `sync_mode: 'AUTO_API'` status |
| `T1.15.4` | `MANUAL` platforms preserved without overwrite | Verify `sync_mode: 'MANUAL'` has `status: 'skipped_manual'` |
| `T1.15.5`, `P14` | Optional `Bearer <CRON_SECRET>` authorization | Verify 200 when valid/unset, 401 when invalid secret passed |
| `T1.16.1` – `T1.16.5` | Pluggable adapters & 429 cached fallback | Inject 429 error; verify `cached_fallback_used: true` |
| `T1.17.1` – `T1.17.5` | `vercel.json` crons specification (`0 */6 * * *`) | Parse `vercel.json`; validate 5-part cron syntax & path |
| `T2.15.1` | Method rejection (PUT, DELETE return 405) | Send unsupported method; verify 405 Method Not Allowed |
| `T2.15.5` | Simultaneous concurrent sync serialization | Run concurrent sync calls; verify debounce lock |
| `P06`, `P25`, `S4` | Mock mode BroadcastChannel & live preview sync | Post message to channel; verify state updates without reload |
| `S3` | End-to-end scheduled background sync scenario | Execute complete workflow from cron trigger to cached fallback |
