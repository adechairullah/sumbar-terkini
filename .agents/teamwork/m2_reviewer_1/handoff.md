# Milestone 2 Independent Review & Adversarial Stress Report

**Reviewer**: `m2_reviewer_1` (`teamwork_reviewer`)  
**Roles**: Reviewer, Adversarial Critic  
**Date**: 2026-11-07  
**Milestone**: Milestone 2 — Hybrid Social Media Metric Engine & API Route Handler  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Direct File Observations

1. **Route Handler Concurrency Control** (`src/app/api/sync-socials/route.ts:19-20, 191-203`):
   ```typescript
   let activeSyncPromise: Promise<SyncResponse> | null = null;
   ...
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
   ```
   **Observation**: `activeSyncPromise` is a single module-level variable that is shared across all concurrent requests regardless of the `filterPlatformId` parameter.

2. **Division by Zero & `Infinity` Propagation in Adapters**:
   - `src/lib/adapters/instagram.ts:100`: `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;`
   - `src/lib/adapters/tiktok.ts:100`: `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;`
   - `src/lib/adapters/youtube.ts:102`: `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;`
   - `src/lib/adapters/facebook.ts:103`: `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;`
   - `src/lib/adapters/x.ts:104`: `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;`
   **Observation**: When `followers_count === 0`, `rawEr` evaluates to `Infinity`. In JSON serialization, `JSON.stringify({ rawEr: Infinity })` evaluates to `{"rawEr":null}`.

3. **Fallback Metrics Clobbering Legitimate `0` Values**:
   - `src/lib/adapters/instagram.ts:23`: `followers_count: platform.followers_count || seed.followers_count,`
   - `src/lib/adapters/tiktok.ts:23`: `followers_count: platform.followers_count || seed.followers_count,`
   - `src/lib/adapters/youtube.ts:23`: `followers_count: platform.followers_count || seed.followers_count,`
   - `src/lib/adapters/facebook.ts:23`: `followers_count: platform.followers_count || seed.followers_count,`
   - `src/lib/adapters/x.ts:22`: `followers_count: platform.followers_count || seed.followers_count,`
   **Observation**: Logical OR (`||`) treats `0` as falsy, replacing any metric set to `0` by an admin with the seed count (e.g. 854,200).

4. **Sequential Execution Timeout Accumulation** (`src/app/api/sync-socials/route.ts:111-180`):
   ```typescript
   for (const platform of targetPlatforms) {
     ...
     const adapterResult = await withTimeout(adapter.sync(platform), 9000);
   }
   ```
   **Observation**: Platform synchronization runs sequentially in a `for...of` loop with a 9-second timeout per platform, meaning cumulative execution time across 5 platforms under slow upstream network conditions can reach up to 45 seconds, well exceeding Vercel's 10-second serverless execution limit.

5. **Layout Compliance Violation**:
   `.agents/teamwork/m2_worker/adapters.test.ts` (220 lines).
   **Observation**: A test suite file was written into `.agents/teamwork/m2_worker/`. According to System Instructions and `PROJECT.md`:
   > "PROJECT.md layout: source in designated dirs, tests co-located, BUILD files per module. **.agents/teamwork/ must contain only metadata — source, tests, or data there is a violation.**"

### 1.2 Empirical Command Verification Results

The reviewer independently executed all 5 standard build and verification commands:

1. **`npx tsc --noEmit`**:
   - Exit code: `0` (Zero compilation errors).
2. **`npm run lint`**:
   - Exit code: `0` (`✔ No ESLint warnings or errors`).
3. **`npm run build`**:
   - Exit code: `0` (Compiled in 1418ms; App route `ƒ /api/sync-socials` dynamic).
4. **`npx tsx tests/e2e/runner.ts`**:
   - Exit code: `0` (281/281 passed in 0.02s).
5. **`npx tsx tests/adversarial/tier5-adversarial.test.ts`**:
   - Exit code: `0` (12/12 stress tests passed).

### 1.3 Empirical Adversarial Reproduction of Defects

1. **Reproduction of Single-Flight Cross-Talk**:
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
   # Output:
   # Req1 platform synced: instagram
   # Req2 platform synced: instagram
   ```
   **Result**: Request 2 asked for `tiktok`, but received `instagram` data because `activeSyncPromise` ignored the query filter.

2. **Reproduction of Dropped Platforms on Concurrent Cron Call**:
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
   # Output:
   # Req1 platforms_processed: 1
   # Req2 platforms_processed: 1
   ```
   **Result**: Request 2 (scheduled cron / full refresh) received only 1 platform instead of all 5 platforms.

---

## 2. Logic Chain

1. **From Observation 1.1.1 to Concurrency Defect**:
   - `runSingleFlightSync` uses a single `activeSyncPromise` reference.
   - Any concurrent request arriving while `activeSyncPromise` is pending will immediately return that promise, regardless of whether `filterPlatformId` is `undefined`, `'instagram'`, or `'tiktok'`.
   - In production, when an admin tests an individual platform via CMS while Vercel Cron triggers the 6-hour sync, the cron sync will coalesce into the admin's single-platform sync and fail to sync the remaining 4 platforms.
   - Therefore, single-flight coalescing must be scoped/keyed per filter target.

2. **From Observation 1.1.2 to Calculation Defect**:
   - `const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;` assumes `followers_count > 0`.
   - When `followers_count === 0`, JavaScript division yields `Infinity`.
   - In JSON, `Infinity` is serialized to `null`, violating the schema where `engagement_rate` is typed as `number`.
   - A defensive check `followers_count > 0 ? Math.round(rawEr * 100) / 100 : 0` is required.

3. **From Observation 1.1.3 to Data Integrity Defect**:
   - Using logical OR `||` coerces `0` to falsy.
   - An admin configuring a new social platform with 0 followers/views/likes will have those zeros silently replaced by seed numbers (e.g. 854,200).
   - Nullish coalescing `??` is required: `platform.followers_count ?? seed.followers_count`.

4. **From Observation 1.1.4 to Serverless Performance Defect**:
   - Vercel's free serverless runtime imposes a 10-second execution ceiling.
   - With 5 platforms running sequentially under individual 9s timeouts, two degrading platforms taking 5.5s each will cause the Vercel function to terminate with an unhandled gateway timeout (HTTP 504).
   - In contrast, `syncAllPlatforms` in `src/lib/adapters/index.ts` already implements concurrent `Promise.allSettled`, which executes all 5 platforms concurrently within ~2-3 seconds total.

5. **From Observation 1.1.5 to Layout Compliance Defect**:
   - The System Instructions mandate:
     "**.agents/teamwork/ must contain only metadata — source, tests, or data there is a violation.**"
   - `.agents/teamwork/m2_worker/adapters.test.ts` is a test file placed directly in `.agents/teamwork/m2_worker/`.
   - This violates the layout rule and must be relocated to `tests/` or removed.

---

## 3. Quality Review & Adversarial Challenge Report

### Quality Review Summary

**Verdict**: **REQUEST_CHANGES**

#### Findings

##### [Critical] Finding 1: Single-Flight Coalescing Concurrency Cross-Talk in Route Handler
- **What**: Concurrent requests with different platform filters coalesce into a single shared promise, causing full syncs to drop platforms or requests to receive wrong platform data.
- **Where**: `src/app/api/sync-socials/route.ts:19-20, 191-203`
- **Why**: `activeSyncPromise` is a single shared variable instead of a keyed single-flight map.
- **Suggestion**: Replace `activeSyncPromise` with a keyed map (e.g., `const inFlightSyncs = new Map<string, Promise<SyncResponse>>();` keyed by `filterPlatformId || '__ALL__'`).

##### [Major] Finding 2: Layout Compliance Violation in `.agents/teamwork/m2_worker/`
- **What**: Test file placed inside `.agents/teamwork/`.
- **Where**: `.agents/teamwork/m2_worker/adapters.test.ts`
- **Why**: System Instructions strictly forbid placing test or source files in `.agents/teamwork/`.
- **Suggestion**: Remove or relocate `.agents/teamwork/m2_worker/adapters.test.ts` to `tests/unit/adapters.test.ts`.

##### [Major] Finding 3: Division by Zero & `Infinity` / `null` Serialization in Adapters
- **What**: Adapters calculate ER without verifying `followers_count > 0`.
- **Where**: `src/lib/adapters/instagram.ts:100`, `tiktok.ts:100`, `youtube.ts:102`, `facebook.ts:103`, `x.ts:104`
- **Why**: `followers_count === 0` produces `Infinity`, serializing to `null` in JSON and corrupting database rows.
- **Suggestion**: Guard calculation: `const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;`.

##### [Major] Finding 4: Fallback Coalescing Overwrites Legitimate `0` Values
- **What**: Fallback metric getters use `||` instead of `??`.
- **Where**: `src/lib/adapters/instagram.ts:23-27`, `tiktok.ts:23-27`, `youtube.ts:23-27`, `facebook.ts:23-27`, `x.ts:22-26`
- **Why**: Treats 0 as falsy, overriding intentional 0 counts with seed defaults.
- **Suggestion**: Replace `||` with `??` across all metric fallback definitions.

##### [Minor] Finding 5: Sequential Execution Timeout Risk Under Upstream Degradation
- **What**: Sequential loop with per-item 9s timeout can exceed Vercel 10s ceiling.
- **Where**: `src/app/api/sync-socials/route.ts:111-180`
- **Why**: Sequential iteration accumulates latency across platforms.
- **Suggestion**: Use `Promise.allSettled` to sync platforms in parallel, and wrap the entire batch execution in an overall 9s timeout guard.

---

### Adversarial Challenge Summary

**Overall risk assessment**: **HIGH**

#### Challenges

##### [Critical] Challenge 1: Concurrent Admin Trigger Collides with Background Cron
- **Assumption challenged**: The worker assumed a single global promise `activeSyncPromise` is sufficient for concurrency debouncing.
- **Attack scenario**: Admin clicks "Test Sync Instagram" in `/admin` at `12:00:00`. At `12:00:00.100`, Vercel Cron triggers the 6-hour full sync. Vercel Cron is coalesced into the Instagram-only promise, receives `platforms_processed: 1`, and the other 4 platforms remain stale for another 6 hours.
- **Blast radius**: Creator metrics on public bento cards go unsynced and out of sync with reality.
- **Mitigation**: Key single-flight promises by requested platform target (`filterPlatformId || '__ALL__'`).

##### [High] Challenge 2: New Creator Account with 0 Followers Corrupts Schema
- **Assumption challenged**: The worker assumed `followers_count` is always positive.
- **Attack scenario**: A new platform account with 0 followers and 0 likes is added or fetched. `rawEr` evaluates to `Infinity`. `JSON.stringify` converts `Infinity` to `null`. Database column `engagement_rate NUMERIC` receives `null`, violating schema constraints or breaking frontend odometer animations.
- **Blast radius**: Bento card odometer crash or database query failure.
- **Mitigation**: Guard division with `followers_count > 0 ? ... : 0`.

---

## 4. Caveats

1. In local development without live Meta Graph, TikTok, Google, or X API credentials, all adapters correctly operate in organic jitter simulation mode (`mock_jitter`). This behavior is compliant with R2 and R4 zero-credential development requirements.
2. The 4-tier E2E runner (`tests/e2e/runner.ts`) and Tier 5 adversarial suite (`tests/adversarial/tier5-adversarial.test.ts`) currently pass 100% because their test assertions tested isolated mock calls rather than concurrent multi-parameter route handler invocations. Our adversarial stress tests surfaced the cross-talk bug.

---

## 5. Conclusion

While Milestone 2 exhibits clean TypeScript typing, strong organic simulation logic, and satisfies the static test suites, it contains:
1. A **Critical concurrency bug** in `src/app/api/sync-socials/route.ts` where single-flight coalescing cross-contaminates concurrent requests.
2. An **explicit layout violation** where a test file (`adapters.test.ts`) was placed inside `.agents/teamwork/m2_worker/`.
3. **Division by zero** and **falsy 0 clobbering** across platform adapters.

Verdict: **REQUEST_CHANGES**.

---

## 6. Verification Method

To independently verify these findings:

1. **Verify Concurrency Cross-Talk Defect**:
   ```bash
   npx tsx -e "
   import { GET } from './src/app/api/sync-socials/route';
   async function test() {
     const req1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
     const req2 = new Request('http://localhost:3000/api/sync-socials?platform=tiktok');
     const [res1, res2] = await Promise.all([GET(req1), GET(req2)]);
     const data1 = await res1.json();
     const data2 = await res2.json();
     console.log('Req1 platform:', data1.synced_platforms[0].platform_id);
     console.log('Req2 platform:', data2.synced_platforms[0].platform_id);
   }
   test();
   "
   ```
   *Expected defect behavior: Both print 'instagram' (Req2 should have been 'tiktok').*

2. **Verify Layout Violation**:
   ```bash
   ls -la .agents/teamwork/m2_worker/adapters.test.ts
   ```
   *Expected: File exists inside `.agents/teamwork/`, violating layout rules.*

3. **Verify Standard Toolchain**:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   npx tsx tests/e2e/runner.ts
   npx tsx tests/adversarial/tier5-adversarial.test.ts
   ```
