# Milestone 2 Iteration 2 Explorer 2: Adapter Arithmetic & Nullish Coalescing Analysis

## 1. Executive Summary & Root Cause Analysis

During Milestone 2 review, Reviewer 1 identified two critical arithmetic and data integrity defects across the social media platform adapters in `src/lib/adapters/{instagram,tiktok,youtube,facebook,x}.ts`:

1. **Defect 1: Division by Zero & `Infinity` / `null` Propagation in Engagement Rate (ER) Calculation**
   - **Root Cause**: In all 5 platform adapters (`instagram.ts`, `tiktok.ts`, `youtube.ts`, `facebook.ts`, `x.ts`), the Engagement Rate is computed using:
     ```typescript
     const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
     const engagement_rate = Math.round(rawEr * 100) / 100;
     ```
   - When a platform has `followers_count === 0` (e.g., a newly registered account or zero-follower test profile), JavaScript evaluates `(likes + comments) / 0` to `Infinity` (or `NaN` if likes and comments are also 0).
   - In JSON serialization, `JSON.stringify({ engagement_rate: Infinity })` evaluates to `{"engagement_rate": null}`.
   - This violates the PostgreSQL database schema (`engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (engagement_rate >= 0.00 AND engagement_rate <= 100.00)`), the TypeScript contract (`engagement_rate: number`), and triggers crashes or broken odometer reel animations in public bento cards.

2. **Defect 2: Fallback Metric Getters Falsy Coalescing (`||`) Clobbering Legitimate `0` Values**
   - **Root Cause**: In all 5 adapters, `getFallbackMetrics(platform)` defaults missing metrics using logical OR (`||`):
     ```typescript
     followers_count: platform.followers_count || seed.followers_count,
     engagement_rate: platform.engagement_rate || seed.engagement_rate,
     avg_views: platform.avg_views || seed.avg_views,
     avg_likes: platform.avg_likes || seed.avg_likes,
     avg_comments: platform.avg_comments || seed.avg_comments,
     ```
   - In JavaScript, `0` is falsy. Therefore, if an administrator deliberately configures or resets a metric to `0` (e.g., brand-new platform handle with 0 followers, 0 views, or 0 ER), `0 || seed.followers_count` evaluates to `seed.followers_count` (e.g. 854,200 for Instagram, 1,280,000 for TikTok).
   - Replacing `||` with nullish coalescing (`??`) guarantees that intentional `0` values are strictly preserved, while `undefined` and `null` correctly fall back to seed values.

---

## 2. Comprehensive File Audit

### 2.1 Overview of Impacted Files

| File | Division by Zero (`rawEr`) | Falsy Fallbacks (`||`) | Additional Hardening |
|---|---|---|---|
| `src/lib/adapters/instagram.ts` | Line 100 | Lines 21, 23-27 | Safe `rawEr` ternary guard, `??` for seed & metric fields |
| `src/lib/adapters/tiktok.ts` | Line 100 | Lines 21, 23-27 | Safe `rawEr` ternary guard, `??` for seed & metric fields |
| `src/lib/adapters/youtube.ts` | Line 102 | Lines 21, 23-27 | Safe `rawEr` ternary guard, `??` for seed & metric fields |
| `src/lib/adapters/facebook.ts` | Line 103 | Lines 21, 23-27 | Safe `rawEr` ternary guard, `??` for seed & metric fields |
| `src/lib/adapters/x.ts` | Line 104 | Lines 20, 22-26 | Safe `rawEr` ternary guard, `??` for seed & metric fields |
| `src/lib/adapters/simulation.ts` | Line 85 | Line 65 | Safe `rawEr` ternary guard, `??` for platform profile |
| `src/lib/adapters/index.ts` | N/A | Lines 76, 113 | Replace `cached || { ... }` with `cached ?? { ... }` |
| `src/lib/adapters/cache.ts` | N/A | Lines 97-115 | Replace `!Number.isNaN` with `Number.isFinite` in `sanitizeMetrics` |

---

## 3. Drop-in Implementation Guide for the Worker

### 3.1 `src/lib/adapters/instagram.ts`

#### Change 1: Replace `||` with `??` in `getFallbackMetrics` (Lines 19-29)

**Before:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'instagram') || SEED_IG_METRICS;
    return {
      followers_count: platform.followers_count || seed.followers_count,
      engagement_rate: platform.engagement_rate || seed.engagement_rate,
      avg_views: platform.avg_views || seed.avg_views,
      avg_likes: platform.avg_likes || seed.avg_likes,
      avg_comments: platform.avg_comments || seed.avg_comments,
    };
  }
```

**After:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'instagram') ?? SEED_IG_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }
```

#### Change 2: Guard ER calculation against division by zero (Line 100)

**Before:**
```typescript
      const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.2 `src/lib/adapters/tiktok.ts`

#### Change 1: Replace `||` with `??` in `getFallbackMetrics` (Lines 19-29)

**Before:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'tiktok') || SEED_TIKTOK_METRICS;
    return {
      followers_count: platform.followers_count || seed.followers_count,
      engagement_rate: platform.engagement_rate || seed.engagement_rate,
      avg_views: platform.avg_views || seed.avg_views,
      avg_likes: platform.avg_likes || seed.avg_likes,
      avg_comments: platform.avg_comments || seed.avg_comments,
    };
  }
```

**After:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'tiktok') ?? SEED_TIKTOK_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }
```

#### Change 2: Guard ER calculation against division by zero (Line 100)

**Before:**
```typescript
      const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.3 `src/lib/adapters/youtube.ts`

#### Change 1: Replace `||` with `??` in `getFallbackMetrics` (Lines 19-29)

**Before:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'youtube') || SEED_YOUTUBE_METRICS;
    return {
      followers_count: platform.followers_count || seed.followers_count,
      engagement_rate: platform.engagement_rate || seed.engagement_rate,
      avg_views: platform.avg_views || seed.avg_views,
      avg_likes: platform.avg_likes || seed.avg_likes,
      avg_comments: platform.avg_comments || seed.avg_comments,
    };
  }
```

**After:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'youtube') ?? SEED_YOUTUBE_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }
```

#### Change 2: Guard ER calculation against division by zero (Line 102)

**Before:**
```typescript
      const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.4 `src/lib/adapters/facebook.ts`

#### Change 1: Replace `||` with `??` in `getFallbackMetrics` (Lines 19-29)

**Before:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'facebook') || SEED_FACEBOOK_METRICS;
    return {
      followers_count: platform.followers_count || seed.followers_count,
      engagement_rate: platform.engagement_rate || seed.engagement_rate,
      avg_views: platform.avg_views || seed.avg_views,
      avg_likes: platform.avg_likes || seed.avg_likes,
      avg_comments: platform.avg_comments || seed.avg_comments,
    };
  }
```

**After:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed =
      initialSocialPlatforms.find((p) => p.platform_id === 'facebook') ?? SEED_FACEBOOK_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }
```

#### Change 2: Guard ER calculation against division by zero (Line 103)

**Before:**
```typescript
      const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.5 `src/lib/adapters/x.ts`

#### Change 1: Replace `||` with `??` in `getFallbackMetrics` (Lines 19-28)

**Before:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed = initialSocialPlatforms.find((p) => p.platform_id === 'x') || SEED_X_METRICS;
    return {
      followers_count: platform.followers_count || seed.followers_count,
      engagement_rate: platform.engagement_rate || seed.engagement_rate,
      avg_views: platform.avg_views || seed.avg_views,
      avg_likes: platform.avg_likes || seed.avg_likes,
      avg_comments: platform.avg_comments || seed.avg_comments,
    };
  }
```

**After:**
```typescript
  private getFallbackMetrics(platform: SocialPlatform): PlatformMetrics {
    const seed = initialSocialPlatforms.find((p) => p.platform_id === 'x') ?? SEED_X_METRICS;
    return {
      followers_count: platform.followers_count ?? seed.followers_count,
      engagement_rate: platform.engagement_rate ?? seed.engagement_rate,
      avg_views: platform.avg_views ?? seed.avg_views,
      avg_likes: platform.avg_likes ?? seed.avg_likes,
      avg_comments: platform.avg_comments ?? seed.avg_comments,
    };
  }
```

#### Change 2: Guard ER calculation against division by zero (Line 104)

**Before:**
```typescript
      const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
      const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
      const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.6 `src/lib/adapters/simulation.ts`

#### Change 1: Replace `||` with `??` in profile fallback (Line 65)

**Before:**
```typescript
  const profile = PLATFORM_ORGANIC_PROFILES[platformId] || PLATFORM_ORGANIC_PROFILES.instagram;
```

**After:**
```typescript
  const profile = PLATFORM_ORGANIC_PROFILES[platformId] ?? PLATFORM_ORGANIC_PROFILES.instagram;
```

#### Change 2: Guard ER calculation against division by zero (Line 85)

**Before:**
```typescript
  const rawEr = ((avg_likes + avg_comments) / followers_count) * 100;
  const engagement_rate = Math.round(rawEr * 100) / 100;
```

**After:**
```typescript
  const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
  const engagement_rate = Math.round(rawEr * 100) / 100;
```

---

### 3.7 `src/lib/adapters/index.ts`

#### Change: Replace `cached || { ... }` with `cached ?? { ... }` (Lines 76-83 and 113-120)

**Before:**
```typescript
    const fallbackMetrics: PlatformMetrics = cached || {
      followers_count: platform.followers_count,
      engagement_rate: platform.engagement_rate,
      avg_views: platform.avg_views,
      avg_likes: platform.avg_likes,
      avg_comments: platform.avg_comments,
    };
```

**After:**
```typescript
    const fallbackMetrics: PlatformMetrics = cached ?? {
      followers_count: platform.followers_count,
      engagement_rate: platform.engagement_rate,
      avg_views: platform.avg_views,
      avg_likes: platform.avg_likes,
      avg_comments: platform.avg_comments,
    };
```

---

### 3.8 `src/lib/adapters/cache.ts` (Defense in Depth)

In `SmartCacheLayer.sanitizeMetrics` (lines 96-116), use `Number.isFinite(...)` instead of `!Number.isNaN(...)`.
In JavaScript, `!Number.isNaN(Infinity)` evaluates to `true`, which allows `Infinity` into the cache. With `Number.isFinite(...)`, `Number.isFinite(Infinity)` evaluates to `false`, correctly rejecting `Infinity` and `-Infinity` and falling back to `fallbackSeed`.

**Before:**
```typescript
    const followers =
      typeof record.followers_count === 'number' && !Number.isNaN(record.followers_count)
        ? Math.max(0, record.followers_count)
        : fallbackSeed.followers_count;
    const er =
      typeof record.engagement_rate === 'number' && !Number.isNaN(record.engagement_rate)
        ? Math.max(0, Math.min(100, record.engagement_rate))
        : fallbackSeed.engagement_rate;
    const views =
      typeof record.avg_views === 'number' && !Number.isNaN(record.avg_views)
        ? Math.max(0, record.avg_views)
        : fallbackSeed.avg_views;
    const likes =
      typeof record.avg_likes === 'number' && !Number.isNaN(record.avg_likes)
        ? Math.max(0, record.avg_likes)
        : fallbackSeed.avg_likes;
    const comments =
      typeof record.avg_comments === 'number' && !Number.isNaN(record.avg_comments)
        ? Math.max(0, record.avg_comments)
        : fallbackSeed.avg_comments;
```

**After:**
```typescript
    const followers =
      typeof record.followers_count === 'number' && Number.isFinite(record.followers_count)
        ? Math.max(0, record.followers_count)
        : fallbackSeed.followers_count;
    const er =
      typeof record.engagement_rate === 'number' && Number.isFinite(record.engagement_rate)
        ? Math.max(0, Math.min(100, record.engagement_rate))
        : fallbackSeed.engagement_rate;
    const views =
      typeof record.avg_views === 'number' && Number.isFinite(record.avg_views)
        ? Math.max(0, record.avg_views)
        : fallbackSeed.avg_views;
    const likes =
      typeof record.avg_likes === 'number' && Number.isFinite(record.avg_likes)
        ? Math.max(0, record.avg_likes)
        : fallbackSeed.avg_likes;
    const comments =
      typeof record.avg_comments === 'number' && Number.isFinite(record.avg_comments)
        ? Math.max(0, record.avg_comments)
        : fallbackSeed.avg_comments;
```

---

## 4. Empirical Test Specification for Worker Verification

The Worker can independently verify these fixes by executing the following test script via `npx tsx`:

```typescript
import assert from 'node:assert/strict';
import { instagramAdapter } from './src/lib/adapters/instagram';
import { tiktokAdapter } from './src/lib/adapters/tiktok';
import { youtubeAdapter } from './src/lib/adapters/youtube';
import { facebookAdapter } from './src/lib/adapters/facebook';
import { xAdapter } from './src/lib/adapters/x';
import { simulateOrganicMetrics } from './src/lib/adapters/simulation';
import { SmartCacheLayer } from './src/lib/adapters/cache';
import type { SocialPlatform } from './src/types';

async function verifyAdapterRemediation() {
  console.log('--- TEST 1: Zero-follower platform preserves 0 counts with ?? ---');
  const zeroPlatform: SocialPlatform = {
    id: 'test-zero',
    platform_id: 'instagram',
    platform_name: 'Instagram',
    handle: '@test',
    profile_url: 'https://instagram.com/test',
    sync_mode: 'AUTO_API',
    followers_count: 0,
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

  // Test fetchMetrics under simulation (token unset)
  const result = await instagramAdapter.fetchMetrics(zeroPlatform);
  assert.ok(typeof result.metrics.engagement_rate === 'number');
  assert.ok(Number.isFinite(result.metrics.engagement_rate));
  assert.notEqual(result.metrics.engagement_rate, Infinity);
  assert.notEqual(result.metrics.engagement_rate, null);

  console.log('--- TEST 2: Division by zero rawEr guard evaluates to 0 ---');
  const followers_count = 0;
  const avg_likes = 100;
  const avg_comments = 25;
  const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
  const engagement_rate = Math.round(rawEr * 100) / 100;
  assert.equal(rawEr, 0);
  assert.equal(engagement_rate, 0);
  assert.equal(JSON.stringify({ engagement_rate }), '{"engagement_rate":0}');

  console.log('--- TEST 3: Cache Sanitization rejects Infinity ---');
  const sanitized = SmartCacheLayer.sanitizeMetrics(
    { engagement_rate: Infinity, followers_count: Infinity },
    { followers_count: 1000, engagement_rate: 5.0, avg_views: 100, avg_likes: 10, avg_comments: 2 }
  );
  assert.equal(sanitized.engagement_rate, 5.0);
  assert.equal(sanitized.followers_count, 1000);

  console.log('✅ ALL ADAPTER REMEDIATION TESTS PASSED!');
}

verifyAdapterRemediation();
```
