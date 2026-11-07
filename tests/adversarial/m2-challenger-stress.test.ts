/**
 * M2 Iteration 2 Challenger Empirical Stress Harness
 * Independent Verification for Milestone 2 Remediation
 */

import assert from 'node:assert/strict';
import { GET, POST } from '../../src/app/api/sync-socials/route';
import { repository } from '../../src/lib/data/repository';
import { LocalStorageManager } from '../../src/lib/data/storage';
import {
  instagramAdapter,
  tiktokAdapter,
  youtubeAdapter,
  facebookAdapter,
  xAdapter,
  SmartCacheLayer,
  smartCache,
  syncSinglePlatform,
} from '../../src/lib/adapters';
import type { SocialPlatform, PlatformId } from '../../src/types';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

const suiteResults: TestResult[] = [];

function record(category: string, name: string, passed: boolean, durationMs: number, details: string) {
  suiteResults.push({ category, name, passed, durationMs, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${category}] ${status}: ${name} (${durationMs.toFixed(2)}ms)`);
  console.log(`   ↳ ${details}`);
}

async function runChallengerStressTests() {
  console.log('======================================================================');
  console.log('🛡️  M2 ITERATION 2 CHALLENGER INDEPENDENT EMPIRICAL STRESS HARNESS');
  console.log('======================================================================\n');

  delete process.env.CRON_SECRET;
  LocalStorageManager.resetToSeed();

  // ==========================================================================
  // TEST 1: Concurrency Cross-Talk Isolation Test
  // ==========================================================================
  console.log('--- 1. CONCURRENCY CROSS-TALK ISOLATION ---');

  // 1.1 Direct concurrent pair: instagram vs tiktok
  {
    const start = performance.now();
    try {
      const reqIg = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
      const reqTt = new Request('http://localhost:3000/api/sync-socials?platform=tiktok');

      const [resIg, resTt] = await Promise.all([GET(reqIg), GET(reqTt)]);
      assert.equal(resIg.status, 200);
      assert.equal(resTt.status, 200);

      const dataIg = await resIg.json();
      const dataTt = await resTt.json();

      assert.equal(dataIg.success, true);
      assert.equal(dataTt.success, true);

      assert.equal(dataIg.synced_platforms.length, 1, 'Instagram request must return exactly 1 platform');
      assert.equal(dataTt.synced_platforms.length, 1, 'TikTok request must return exactly 1 platform');

      assert.equal(dataIg.synced_platforms[0].platform_id, 'instagram', 'Instagram request must return instagram data');
      assert.equal(dataTt.synced_platforms[0].platform_id, 'tiktok', 'TikTok request must return tiktok data');

      const duration = performance.now() - start;
      record(
        'Cross-Talk Isolation',
        'Simultaneous GET ?platform=instagram & ?platform=tiktok return isolated platforms with zero cross-talk',
        true,
        duration,
        `Req1 got [${dataIg.synced_platforms[0].platform_id}], Req2 got [${dataTt.synced_platforms[0].platform_id}]`
      );
    } catch (err: any) {
      record('Cross-Talk Isolation', 'Simultaneous GET ?platform=instagram & ?platform=tiktok', false, performance.now() - start, err.message);
    }
  }

  // 1.2 5-way simultaneous requests for all platforms
  {
    const start = performance.now();
    try {
      const platforms: PlatformId[] = ['instagram', 'tiktok', 'youtube', 'facebook', 'x'];
      const requests = platforms.map((p) =>
        GET(new Request(`http://localhost:3000/api/sync-socials?platform=${p}`))
      );

      const responses = await Promise.all(requests);
      const jsonList = await Promise.all(responses.map((r) => r.json()));

      let allIsolated = true;
      const detailsArr: string[] = [];

      for (let i = 0; i < platforms.length; i++) {
        const expected = platforms[i];
        const actual = jsonList[i].synced_platforms;
        if (actual.length !== 1 || actual[0].platform_id !== expected) {
          allIsolated = false;
          detailsArr.push(`Expected ${expected}, got ${JSON.stringify(actual)}`);
        } else {
          detailsArr.push(`${expected}: OK`);
        }
      }

      const duration = performance.now() - start;
      record(
        'Cross-Talk Isolation',
        '5-way concurrent GET requests for all 5 platforms return strictly isolated single platforms',
        allIsolated,
        duration,
        detailsArr.join(', ')
      );
    } catch (err: any) {
      record('Cross-Talk Isolation', '5-way concurrent GET requests', false, performance.now() - start, err.message);
    }
  }

  // 1.3 High-load 50 concurrent interleaved requests with random platform filters
  {
    const start = performance.now();
    try {
      const platforms: PlatformId[] = ['instagram', 'tiktok', 'youtube', 'facebook', 'x'];
      const BURST_SIZE = 50;
      const tasks = Array.from({ length: BURST_SIZE }, (_, i) => {
        const p = platforms[i % platforms.length]!;
        if (i % 2 === 0) {
          return {
            expected: p,
            prom: GET(new Request(`http://localhost:3000/api/sync-socials?platform=${p}&burst=${i}`)),
          };
        } else {
          return {
            expected: p,
            prom: POST(
              new Request('http://localhost:3000/api/sync-socials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform_id: p }),
              })
            ),
          };
        }
      });

      const responses = await Promise.all(tasks.map((t) => t.prom));
      const jsonResults = await Promise.all(responses.map((r) => r.json()));

      let burstPassed = true;
      let mismatchCount = 0;

      for (let i = 0; i < tasks.length; i++) {
        const expected = tasks[i]!.expected;
        const actual = jsonResults[i].synced_platforms;
        if (!actual || actual.length !== 1 || actual[0].platform_id !== expected) {
          burstPassed = false;
          mismatchCount++;
        }
      }

      const duration = performance.now() - start;
      record(
        'Cross-Talk Isolation',
        `50 Interleaved concurrent GET/POST requests maintain 100% platform isolation under stress`,
        burstPassed,
        duration,
        `Processed 50 concurrent queries in ${duration.toFixed(2)}ms; mismatches: ${mismatchCount}/50`
      );
    } catch (err: any) {
      record('Cross-Talk Isolation', '50 Interleaved concurrent requests', false, performance.now() - start, err.message);
    }
  }

  // ==========================================================================
  // TEST 2: Full Sync Isolation Test
  // ==========================================================================
  console.log('\n--- 2. FULL SYNC ISOLATION ---');

  // 2.1 Simultaneous single-platform (?platform=instagram) and full sync (/api/sync-socials)
  {
    const start = performance.now();
    try {
      const reqSingle = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
      const reqFull = new Request('http://localhost:3000/api/sync-socials');

      const [resSingle, resFull] = await Promise.all([GET(reqSingle), GET(reqFull)]);
      assert.equal(resSingle.status, 200);
      assert.equal(resFull.status, 200);

      const jsonSingle = await resSingle.json();
      const jsonFull = await resFull.json();

      assert.equal(jsonSingle.synced_platforms.length, 1, 'Single platform query must return exactly 1 platform');
      assert.equal(jsonSingle.synced_platforms[0].platform_id, 'instagram');

      assert.equal(jsonFull.synced_platforms.length, 5, 'Full sync query must return exactly all 5 platforms');
      const fullPlatformIds = jsonFull.synced_platforms.map((p: any) => p.platform_id).sort();
      assert.deepEqual(fullPlatformIds, ['facebook', 'instagram', 'tiktok', 'x', 'youtube']);

      const duration = performance.now() - start;
      record(
        'Full Sync Isolation',
        'Simultaneous GET ?platform=instagram & GET /api/sync-socials: full sync returns all 5 platforms, single returns 1',
        true,
        duration,
        `Single sync: ${jsonSingle.synced_platforms.length} platform; Full sync: ${jsonFull.synced_platforms.length} platforms ([${fullPlatformIds.join(', ')}])`
      );
    } catch (err: any) {
      record('Full Sync Isolation', 'Simultaneous single & full sync', false, performance.now() - start, err.message);
    }
  }

  // 2.2 Concurrent race: 10 single-platform requests + 10 full sync requests
  {
    const start = performance.now();
    try {
      const fullSyncRequests = Array.from({ length: 10 }, (_, i) =>
        GET(new Request(`http://localhost:3000/api/sync-socials?sync_run=${i}`))
      );
      const singleSyncRequests = Array.from({ length: 10 }, (_, i) =>
        GET(new Request(`http://localhost:3000/api/sync-socials?platform=tiktok&run=${i}`))
      );

      // Launch all 20 simultaneously
      const [fullResponses, singleResponses] = await Promise.all([
        Promise.all(fullSyncRequests),
        Promise.all(singleSyncRequests),
      ]);

      const fullBodies = await Promise.all(fullResponses.map((r) => r.json()));
      const singleBodies = await Promise.all(singleResponses.map((r) => r.json()));

      const allFullHave5 = fullBodies.every((b) => b.synced_platforms.length === 5);
      const allSingleHave1 = singleBodies.every(
        (b) => b.synced_platforms.length === 1 && b.synced_platforms[0].platform_id === 'tiktok'
      );

      const duration = performance.now() - start;
      record(
        'Full Sync Isolation',
        'Race stress: 10 full syncs + 10 single syncs concurrently; zero platform dropping in full syncs',
        allFullHave5 && allSingleHave1,
        duration,
        `All 10 full syncs returned 5 platforms; all 10 single syncs returned 1 platform`
      );
    } catch (err: any) {
      record('Full Sync Isolation', 'Race stress with 10 full syncs + 10 single syncs', false, performance.now() - start, err.message);
    }
  }

  // ==========================================================================
  // TEST 3: Zero Followers Test
  // ==========================================================================
  console.log('\n--- 3. ZERO FOLLOWERS & ENGAGEMENT RATE INTEGRITY ---');

  // 3.1 All 5 adapters with live API returning 0 followers
  {
    const start = performance.now();
    const originalFetch = globalThis.fetch;
    try {
      const adapters = [
        { name: 'instagram', adapter: instagramAdapter, envKey: 'INSTAGRAM_ACCESS_TOKEN' },
        { name: 'tiktok', adapter: tiktokAdapter, envKey: 'TIKTOK_ACCESS_TOKEN' },
        { name: 'youtube', adapter: youtubeAdapter, envKey: 'YOUTUBE_API_KEY', extraEnv: { YOUTUBE_CHANNEL_ID: 'yt-channel' } },
        { name: 'facebook', adapter: facebookAdapter, envKey: 'FACEBOOK_PAGE_ACCESS_TOKEN' },
        { name: 'x', adapter: xAdapter, envKey: 'TWITTER_BEARER_TOKEN' },
      ];

      let allPassed = true;
      const detailsList: string[] = [];

      for (const { name, adapter, envKey, extraEnv } of adapters) {
        // Mock fetch response returning 0 followers
        if (name === 'instagram') {
          globalThis.fetch = async () => new Response(JSON.stringify({ followers_count: 0 }), { status: 200 });
        } else if (name === 'tiktok') {
          globalThis.fetch = async () =>
            new Response(JSON.stringify({ data: { user: { follower_count: 0, likes_count: 500 } } }), { status: 200 });
        } else if (name === 'youtube') {
          globalThis.fetch = async () =>
            new Response(
              JSON.stringify({ items: [{ statistics: { subscriberCount: '0', viewCount: '1000' } }] }),
              { status: 200 }
            );
        } else if (name === 'facebook') {
          globalThis.fetch = async () =>
            new Response(JSON.stringify({ followers_count: 0, fan_count: 0 }), { status: 200 });
        } else if (name === 'x') {
          globalThis.fetch = async () =>
            new Response(
              JSON.stringify({ data: { public_metrics: { followers_count: 0 } } }),
              { status: 200 }
            );
        }

        process.env[envKey] = 'mock-token';
        if (extraEnv) {
          Object.assign(process.env, extraEnv);
        }

        const platform = (await repository.getSocialPlatforms()).find((p) => p.platform_id === name)!;
        const res = await adapter.fetchMetrics(platform);

        const er = res.metrics.engagement_rate;
        const serialized = JSON.stringify(res.metrics);

        const isZero = er === 0;
        const isFinite = Number.isFinite(er);
        const notNull = er !== null;
        const jsonHasZero = serialized.includes('"engagement_rate":0');

        if (!isZero || !isFinite || !notNull || !jsonHasZero) {
          allPassed = false;
          detailsList.push(`${name} FAILED: er=${er}, json=${serialized}`);
        } else {
          detailsList.push(`${name}: ER=0 (finite)`);
        }

        delete process.env[envKey];
      }

      const duration = performance.now() - start;
      record(
        'Zero Followers ER Guard',
        'All 5 adapters guard division by zero when API returns 0 followers: ER is 0 (not null, Infinity, or NaN)',
        allPassed,
        duration,
        detailsList.join('; ')
      );
    } catch (err: any) {
      record('Zero Followers ER Guard', 'Adapters zero followers live API response', false, performance.now() - start, err.message);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // 3.2 Platform in repository configured with 0 followers and sync via route
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const platforms = await repository.getSocialPlatforms();
      const ig = platforms.find((p) => p.platform_id === 'instagram')!;

      // Update IG to 0 followers, 0 likes, 0 comments, sync_mode = MANUAL
      await repository.updateSocialPlatform(ig.id, {
        followers_count: 0,
        engagement_rate: 0,
        avg_likes: 0,
        avg_comments: 0,
        avg_views: 0,
        sync_mode: 'MANUAL',
      });

      const res = await GET(new Request('http://localhost:3000/api/sync-socials?platform=instagram'));
      assert.equal(res.status, 200);

      const body = await res.json();
      const igResult = body.synced_platforms[0];

      assert.equal(igResult.metrics.followers_count, 0);
      assert.equal(igResult.metrics.engagement_rate, 0);
      assert.equal(Number.isFinite(igResult.metrics.engagement_rate), true);
      assert.equal(JSON.stringify(igResult.metrics).includes('"engagement_rate":0'), true);

      const duration = performance.now() - start;
      record(
        'Zero Followers ER Guard',
        'Platform with 0 followers synced via route returns engagement_rate: 0 in JSON response',
        true,
        duration,
        `Followers: 0 -> ER: ${igResult.metrics.engagement_rate}, JSON serialized safely`
      );
    } catch (err: any) {
      record('Zero Followers ER Guard', 'Platform 0 followers in route', false, performance.now() - start, err.message);
    }
  }

  // ==========================================================================
  // TEST 4: Nullish Coalescing (0 Values Preservation) Test
  // ==========================================================================
  console.log('\n--- 4. NULLISH COALESCING (PRESERVATION OF 0 VALUES) ---');

  // 4.1 Update all metrics to 0 in repository and verify sync preserves 0 (not reverting to seed)
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const platforms = await repository.getSocialPlatforms();
      const fb = platforms.find((p) => p.platform_id === 'facebook')!;

      // Facebook is MANUAL. Set all metrics to 0
      await repository.updateSocialPlatform(fb.id, {
        followers_count: 0,
        engagement_rate: 0,
        avg_views: 0,
        avg_likes: 0,
        avg_comments: 0,
        sync_mode: 'MANUAL',
      });

      const res = await GET(new Request('http://localhost:3000/api/sync-socials?platform=facebook'));
      assert.equal(res.status, 200);

      const body = await res.json();
      const metrics = body.synced_platforms[0].metrics;

      // Seed values for Facebook were: followers 620000, er 3.4, views 280000, likes 14200, comments 2800.
      // If logical OR (||) was used, 0 || 620000 -> 620000 (bug!).
      // With nullish coalescing (??), 0 ?? 620000 -> 0.
      const followersPreserved = metrics.followers_count === 0;
      const erPreserved = metrics.engagement_rate === 0;
      const viewsPreserved = metrics.avg_views === 0;
      const likesPreserved = metrics.avg_likes === 0;
      const commentsPreserved = metrics.avg_comments === 0;

      const allZeroPreserved =
        followersPreserved && erPreserved && viewsPreserved && likesPreserved && commentsPreserved;

      const duration = performance.now() - start;
      record(
        'Nullish Coalescing Preservation',
        'MANUAL platform with all metrics set to 0 preserves 0 across sync without reverting to seed constants',
        allZeroPreserved,
        duration,
        `followers: ${metrics.followers_count}, er: ${metrics.engagement_rate}, views: ${metrics.avg_views}, likes: ${metrics.avg_likes}, comments: ${metrics.avg_comments}`
      );
    } catch (err: any) {
      record('Nullish Coalescing Preservation', 'MANUAL platform metrics 0 preservation', false, performance.now() - start, err.message);
    }
  }

  // 4.2 AUTO_API platform fallback with 0 values on rate limit (HTTP 429)
  {
    const start = performance.now();
    const originalFetch = globalThis.fetch;
    try {
      smartCache.clear();
      // Upstream 429
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ error: 'rate limited' }), { status: 429 });

      process.env.TIKTOK_ACCESS_TOKEN = 'mock-tiktok-token';

      // TikTok platform with 0 likes and 0 comments
      const platform: SocialPlatform = {
        id: 'tt-zero-test',
        platform_id: 'tiktok',
        platform_name: 'TikTok',
        handle: '@sumbar_terkini',
        profile_url: 'https://tiktok.com/@sumbar_terkini',
        sync_mode: 'AUTO_API',
        followers_count: 500000,
        engagement_rate: 0,
        avg_views: 0,
        avg_likes: 0,
        avg_comments: 0,
        demographics: { gender: { male: 50, female: 50 }, top_cities: [] },
        sort_order: 1,
        is_active: true,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await tiktokAdapter.fetchMetrics(platform);
      assert.equal(result.cached_fallback_used, true);
      assert.equal(result.status, 'cached_fallback');

      // Check fallback preserves 0 metrics
      const likesPreserved = result.metrics.avg_likes === 0;
      const commentsPreserved = result.metrics.avg_comments === 0;
      const viewsPreserved = result.metrics.avg_views === 0;
      const erPreserved = result.metrics.engagement_rate === 0;

      const passed = likesPreserved && commentsPreserved && viewsPreserved && erPreserved;

      const duration = performance.now() - start;
      record(
        'Nullish Coalescing Preservation',
        'AUTO_API HTTP 429 fallback preserves platform 0 metrics without replacing with seed constants',
        passed,
        duration,
        `likes: ${result.metrics.avg_likes}, comments: ${result.metrics.avg_comments}, views: ${result.metrics.avg_views}, er: ${result.metrics.engagement_rate}`
      );
    } catch (err: any) {
      record('Nullish Coalescing Preservation', 'AUTO_API 429 fallback 0 preservation', false, performance.now() - start, err.message);
    } finally {
      delete process.env.TIKTOK_ACCESS_TOKEN;
      globalThis.fetch = originalFetch;
    }
  }

  // 4.3 SmartCacheLayer.sanitizeMetrics with 0 values
  {
    const start = performance.now();
    try {
      const fallbackSeed = {
        followers_count: 854200,
        engagement_rate: 4.85,
        avg_views: 450000,
        avg_likes: 38200,
        avg_comments: 3250,
      };

      const zeroPayload = {
        followers_count: 0,
        engagement_rate: 0,
        avg_views: 0,
        avg_likes: 0,
        avg_comments: 0,
      };

      const sanitized = SmartCacheLayer.sanitizeMetrics(zeroPayload, fallbackSeed);

      const preservesAllZeroes =
        sanitized.followers_count === 0 &&
        sanitized.engagement_rate === 0 &&
        sanitized.avg_views === 0 &&
        sanitized.avg_likes === 0 &&
        sanitized.avg_comments === 0;

      const duration = performance.now() - start;
      record(
        'Nullish Coalescing Preservation',
        'SmartCacheLayer.sanitizeMetrics strictly preserves valid 0 values across all fields',
        preservesAllZeroes,
        duration,
        `All 5 numeric fields preserved at 0 without defaulting to fallbackSeed`
      );
    } catch (err: any) {
      record('Nullish Coalescing Preservation', 'SmartCacheLayer.sanitizeMetrics 0 preservation', false, performance.now() - start, err.message);
    }
  }

  // ==========================================================================
  // TEST 5: Keyed Single-Flight Cleanup & Leak Proof Verification
  // ==========================================================================
  console.log('\n--- 5. KEYED SINGLE-FLIGHT CLEANUP & LEAK PROOF ---');

  {
    const start = performance.now();
    try {
      // Execute 20 concurrent requests across platforms
      const promises = Array.from({ length: 20 }, (_, i) => {
        const platform = i % 2 === 0 ? 'instagram' : 'tiktok';
        return GET(new Request(`http://localhost:3000/api/sync-socials?platform=${platform}&test_id=${i}`));
      });

      await Promise.all(promises);

      // Subsequent independent requests immediately after must not reuse stale promises
      const freshReq1 = new Request('http://localhost:3000/api/sync-socials?platform=instagram&ts=fresh1');
      const freshRes1 = await GET(freshReq1);
      const freshJson1 = await freshRes1.json();

      // Wait a tiny bit and issue another
      await new Promise((r) => setTimeout(r, 20));

      const freshReq2 = new Request('http://localhost:3000/api/sync-socials?platform=instagram&ts=fresh2');
      const freshRes2 = await GET(freshReq2);
      const freshJson2 = await freshRes2.json();

      // Because flights clean up in `finally`, freshReq2 must generate a fresh flight with newer timestamp
      const timestampsDiffer = freshJson1.timestamp !== freshJson2.timestamp;

      const duration = performance.now() - start;
      record(
        'Keyed Flight Cleanup',
        'inFlightSyncs deletes flight key upon completion; consecutive calls receive fresh executions',
        timestampsDiffer,
        duration,
        `Flight 1 ts: ${freshJson1.timestamp}, Flight 2 ts: ${freshJson2.timestamp} (cleanly updated)`
      );
    } catch (err: any) {
      record('Keyed Flight Cleanup', 'inFlightSyncs deletion verification', false, performance.now() - start, err.message);
    }
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n======================================================================');
  console.log('📊 M2 CHALLENGER EMPIRICAL VERIFICATION SUMMARY');
  console.log('======================================================================');

  const passed = suiteResults.filter((r) => r.passed).length;
  const failed = suiteResults.filter((r) => !r.passed).length;

  console.log(`Total Scenarios Tested: ${suiteResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failures Detected:');
    for (const f of suiteResults.filter((r) => !r.passed)) {
      console.log(`  - [${f.category}] ${f.name}: ${f.details}`);
    }
    process.exit(1);
  } else {
    console.log('\n🎉 ALL EMPIRICAL CHALLENGER TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runChallengerStressTests().catch((err) => {
  console.error('Fatal challenger harness failure:', err);
  process.exit(1);
});
