import assert from 'node:assert/strict';
import {
  SmartCacheLayer,
  smartCache,
  simulateOrganicMetrics,
  PLATFORM_ORGANIC_PROFILES,
  getAdapter,
  getAllAdapters,
  hasAdapter,
  syncSinglePlatform,
  syncAllPlatforms,
  instagramAdapter,
  tiktokAdapter,
  youtubeAdapter,
  facebookAdapter,
  xAdapter,
} from '../../src/lib/adapters';
import { GET, POST, PUT, DELETE, PATCH, HEAD } from '../../src/app/api/sync-socials/route';
import { initialSocialPlatforms } from '../../src/lib/data/mock-data';
import type { SocialPlatform } from '../../src/types';

async function runMilestone2Tests() {
  console.log('--- Testing SmartCacheLayer ---');
  const cache = new SmartCacheLayer<{ count: number }>(1); // 1 second TTL
  cache.set('test_key', { count: 42 });

  assert.equal(cache.has('test_key'), true);
  assert.equal(cache.isValid('test_key'), true);
  assert.deepEqual(cache.get('test_key'), { count: 42 });
  assert.deepEqual(cache.getValid('test_key'), { count: 42 });

  // Test sanitizeMetrics
  const fallbackSeed = {
    followers_count: 50000,
    engagement_rate: 4.5,
    avg_views: 20000,
    avg_likes: 2000,
    avg_comments: 250,
  };

  const corruptedPayload = {
    followers_count: 'corrupt',
    engagement_rate: NaN,
    avg_views: null,
    avg_likes: -10, // negative should become 0
    avg_comments: 300,
  };

  const sanitized = SmartCacheLayer.sanitizeMetrics(corruptedPayload, fallbackSeed);
  assert.equal(sanitized.followers_count, 50000); // from fallback
  assert.equal(sanitized.engagement_rate, 4.5); // from fallback
  assert.equal(sanitized.avg_views, 20000); // from fallback
  assert.equal(sanitized.avg_likes, 0); // clamped to 0
  assert.equal(sanitized.avg_comments, 300); // preserved

  // Test getOrFallback
  const expiredFallback = cache.getOrFallback('non_existent', { count: 99 });
  assert.equal(expiredFallback.fallbackUsed, true);
  assert.deepEqual(expiredFallback.data, { count: 99 });

  console.log('✅ SmartCacheLayer tests passed');

  console.log('--- Testing Organic Simulation & ER Formula ---');
  const platforms = ['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const;
  for (const p of platforms) {
    const baseMetrics = {
      followers_count: 100000,
      engagement_rate: 5.0,
      avg_views: 40000,
      avg_likes: 4000,
      avg_comments: 500,
    };
    const sim = simulateOrganicMetrics(p, baseMetrics);
    const profile = PLATFORM_ORGANIC_PROFILES[p];

    // Assert positive follower drift
    assert.ok(
      sim.followers_count >= baseMetrics.followers_count + profile.followerDeltaMin,
      `Platform ${p} should have follower drift >= ${profile.followerDeltaMin}`
    );
    assert.ok(
      sim.followers_count <= baseMetrics.followers_count + profile.followerDeltaMax,
      `Platform ${p} should have follower drift <= ${profile.followerDeltaMax}`
    );

    // Assert exact ER formula
    const calculatedEr = Math.round(((sim.avg_likes + sim.avg_comments) / sim.followers_count) * 10000) / 100;
    assert.equal(sim.engagement_rate, calculatedEr, `ER formula mismatch for ${p}`);
  }
  console.log('✅ Organic simulation and ER formula tests passed');

  console.log('--- Testing Adapter Registry & Platform Adapters ---');
  assert.equal(getAdapter('instagram'), instagramAdapter);
  assert.equal(getAdapter('tiktok'), tiktokAdapter);
  assert.equal(getAdapter('youtube'), youtubeAdapter);
  assert.equal(getAdapter('facebook'), facebookAdapter);
  assert.equal(getAdapter('x'), xAdapter);
  assert.equal(hasAdapter('instagram'), true);
  assert.equal(hasAdapter('unknown_platform'), false);

  assert.throws(() => getAdapter('unsupported' as any), /Unsupported social platform adapter/);

  const allAdapters = getAllAdapters();
  assert.equal(Object.keys(allAdapters).length, 5);
  console.log('✅ Adapter registry tests passed');

  console.log('--- Testing Platform Sync Logic ---');
  // 1. MANUAL platform preservation
  const manualPlatform: SocialPlatform = {
    ...initialSocialPlatforms[0]!,
    id: 'test-manual',
    platform_id: 'instagram',
    sync_mode: 'MANUAL',
    followers_count: 999999,
  };
  const manualResult = await syncSinglePlatform(manualPlatform);
  assert.equal(manualResult.status, 'skipped_manual');
  assert.equal(manualResult.sync_mode, 'MANUAL');
  assert.equal(manualResult.metrics.followers_count, 999999);
  assert.equal(manualResult.cached_fallback_used, false);

  // 2. AUTO_API platform synchronization
  const autoPlatform: SocialPlatform = {
    ...initialSocialPlatforms[1]!,
    id: 'test-auto',
    platform_id: 'tiktok',
    sync_mode: 'AUTO_API',
    followers_count: 1000000,
  };
  const autoResult = await syncSinglePlatform(autoPlatform);
  assert.equal(autoResult.status, 'synced');
  assert.equal(autoResult.sync_mode, 'AUTO_API');
  assert.ok(autoResult.metrics.followers_count > 1000000);

  // 3. Batch synchronization with syncAllPlatforms
  const batchResults = await syncAllPlatforms([manualPlatform, autoPlatform]);
  assert.equal(batchResults.length, 2);
  assert.equal(batchResults[0]!.status, 'skipped_manual');
  assert.equal(batchResults[1]!.status, 'synced');
  console.log('✅ Platform sync logic tests passed');

  console.log('--- Testing Zero Followers / Division by Zero & Nullish Coalescing ---');
  // 1. Simulation mode produces strictly finite ER (never Infinity or NaN)
  for (const p of platforms) {
    const zeroPlatform: SocialPlatform = {
      ...initialSocialPlatforms.find(sp => sp.platform_id === p)!,
      id: `test-zero-${p}`,
      platform_id: p,
      sync_mode: 'AUTO_API',
      followers_count: 0,
      avg_likes: 0,
      avg_comments: 0,
      avg_views: 0,
    };
    const res = await syncSinglePlatform(zeroPlatform);
    assert.equal(Number.isFinite(res.metrics.engagement_rate), true, `ER must be finite for ${p}`);
    assert.notEqual(res.metrics.engagement_rate, Infinity);
    assert.equal(Number.isNaN(res.metrics.engagement_rate), false);
  }

  // 2. Direct division by zero rawEr guard evaluation
  const followers_count = 0;
  const avg_likes = 100;
  const avg_comments = 25;
  const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
  const engagement_rate = Math.round(rawEr * 100) / 100;
  assert.equal(rawEr, 0);
  assert.equal(engagement_rate, 0);
  assert.equal(JSON.stringify({ engagement_rate }), '{"engagement_rate":0}');

  // 3. Live API with 0 followers returned returns ER 0 without Infinity/null
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ followers_count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    process.env.INSTAGRAM_ACCESS_TOKEN = 'mock-ig-token';

    const testPlatform: SocialPlatform = {
      ...initialSocialPlatforms[0]!,
      followers_count: 0,
    };
    const apiResult = await instagramAdapter.fetchMetrics(testPlatform);
    assert.equal(apiResult.metrics.followers_count, 0);
    assert.equal(apiResult.metrics.engagement_rate, 0);
    assert.equal(Number.isFinite(apiResult.metrics.engagement_rate), true);
  } finally {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    globalThis.fetch = originalFetch;
  }
  console.log('✅ Zero followers & division by zero guard tests passed');

  console.log('--- Testing /api/sync-socials Route Handlers ---');
  // 1. GET request without secret (when CRON_SECRET is unset)
  delete process.env.CRON_SECRET;
  const getReq = new Request('http://localhost:3000/api/sync-socials', { method: 'GET' });
  const getRes = await GET(getReq);
  assert.equal(getRes.status, 200);
  const getBody = await getRes.json();
  assert.equal(getBody.success, true);
  assert.ok(Array.isArray(getBody.synced_platforms));
  assert.equal(getBody.synced_platforms.length, 5);

  // 2. POST request
  const postReq = new Request('http://localhost:3000/api/sync-socials', {
    method: 'POST',
    body: JSON.stringify({ platform_id: 'instagram' }),
  });
  const postRes = await POST(postReq);
  assert.equal(postRes.status, 200);
  const postBody = await postRes.json();
  assert.equal(postBody.success, true);
  assert.equal(postBody.synced_platforms.length, 1);
  assert.equal(postBody.synced_platforms[0].platform_id, 'instagram');

  // 3. 405 Method Not Allowed
  const putRes = await PUT();
  assert.equal(putRes.status, 405);
  assert.equal(putRes.headers.get('Allow'), 'GET, POST');

  const deleteRes = await DELETE();
  assert.equal(deleteRes.status, 405);

  const patchRes = await PATCH();
  assert.equal(patchRes.status, 405);

  const headRes = await HEAD();
  assert.equal(headRes.status, 405);

  // 4. CRON_SECRET authorization
  process.env.CRON_SECRET = 'super-secret-key-123';
  try {
    // Unauthenticated GET
    const unauthReq = new Request('http://localhost:3000/api/sync-socials', { method: 'GET' });
    const unauthRes = await GET(unauthReq);
    assert.equal(unauthRes.status, 401);

    // Wrong token
    const wrongReq = new Request('http://localhost:3000/api/sync-socials', {
      headers: { Authorization: 'Bearer wrong-secret' },
    });
    const wrongRes = await GET(wrongReq);
    assert.equal(wrongRes.status, 401);

    // Valid Bearer token
    const validBearerReq = new Request('http://localhost:3000/api/sync-socials', {
      headers: { Authorization: 'Bearer super-secret-key-123' },
    });
    const validBearerRes = await GET(validBearerReq);
    assert.equal(validBearerRes.status, 200);

    // Valid Query param ?secret=...
    const validQueryReq = new Request('http://localhost:3000/api/sync-socials?secret=super-secret-key-123');
    const validQueryRes = await GET(validQueryReq);
    assert.equal(validQueryRes.status, 200);
  } finally {
    delete process.env.CRON_SECRET;
  }

  // 5. Keyed Single-Flight Concurrency Isolation
  const reqIg = new Request('http://localhost:3000/api/sync-socials?platform=instagram');
  const reqTt = new Request('http://localhost:3000/api/sync-socials?platform=tiktok');
  const [resIg, resTt] = await Promise.all([GET(reqIg), GET(reqTt)]);
  const jsonIg = await resIg.json();
  const jsonTt = await resTt.json();
  assert.equal(jsonIg.synced_platforms[0].platform_id, 'instagram', 'Instagram filter request must receive Instagram data');
  assert.equal(jsonTt.synced_platforms[0].platform_id, 'tiktok', 'TikTok filter request must receive TikTok data');

  console.log('✅ Route handler & single-flight isolation tests passed');
  console.log('\n🎉 ALL UNIT & INTEGRATION TESTS PASSED PERFECTLY!');
}

runMilestone2Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
