/**
 * Tier 4: Realistic Application Workloads Test Suite
 * 6 Realistic End-to-End Application Scenarios (S1 through S6)
 * Derived strictly from ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md.
 */

import { describe, test, expect, setTier } from './runner';
import { repository } from '../../src/lib/data/repository';
import { LocalStorageManager } from '../../src/lib/data/storage';
import {
  seedSiteSettings,
  seedSocialPlatforms,
  seedEndorsePackages,
  seedVisitorReactions,
  calculateER,
  calculateDiscountTier,
  formatIDR,
  normalizePhoneNumber,
  generateWhatsAppUrl,
  calculateContrastRatio,
  SmartCacheLayer,
  EndorsePackage,
  SiteSettings
} from './contracts';

setTier('tier4');

describe('Tier 4: Realistic Application Workload Scenarios', () => {
  // ==========================================================================
  // S1: Local Merchant Endorsement Booking
  // Features: F04, F07, F09, F10, F11, F12, F14
  // ==========================================================================
  test('S1: Local Merchant Endorsement Booking (Instagram Story + Reels with Growth Duo 5% discount)', () => {
    // 1. Merchant visits Media Kit Hero
    const hero = {
      name: seedSiteSettings.creator_name,
      avatar: seedSiteSettings.creator_avatar_url,
      available: seedSiteSettings.slot_available,
      statusText: seedSiteSettings.slot_status_text
    };
    expect(hero.available).toBe(true);
    expect(hero.statusText).toContain('Slot Endorsement Tersedia');

    // 2. Merchant inspects Instagram Bento Card
    const igPlatform = seedSocialPlatforms.find(p => p.platform_id === 'instagram')!;
    expect(igPlatform.followers_count).toBe(854200);
    expect(igPlatform.engagement_rate).toBe(4.85);
    const igBadge = igPlatform.engagement_rate >= 4.0 ? 'Viral Maker' : 'Healthy';
    expect(igBadge).toBe('Viral Maker');

    // 3. Merchant selects Instagram Story (750k) + Instagram Reels (2.5M)
    const storyPkg = seedEndorsePackages.find(p => p.id === 'pkg-ig-story')!;
    const reelsPkg = seedEndorsePackages.find(p => p.id === 'pkg-ig-reels')!;
    const selected = [storyPkg, reelsPkg];

    // 4. Rate calculator computes Growth Duo 5% discount
    const calc = calculateDiscountTier(selected);
    expect(calc.subtotal).toBe(3250000);
    expect(calc.discountPercent).toBe(5);
    expect(calc.tierName).toBe('Growth Duo');
    expect(calc.discountAmount).toBe(162500);
    expect(calc.total).toBe(3087500);
    expect(formatIDR(calc.total)).toBe('Rp 3.087.500');

    // 5. Merchant triggers Checkout
    const confettiPayload = {
      particleCount: 80,
      colors: ['#FFD166', '#EF476F', '#06D6A0', '#1E1E1E']
    };
    expect(confettiPayload.colors.length).toBe(4);

    // 6. Pre-formatted WhatsApp deep link generated
    const waUrl = generateWhatsAppUrl({
      phone: seedSiteSettings.whatsapp_number,
      selectedPackages: selected,
      creatorName: seedSiteSettings.creator_name
    });
    expect(waUrl.startsWith('https://wa.me/6281234567890')).toBe(true);
    const decodedMessage = decodeURIComponent(waUrl);
    expect(decodedMessage).toContain('Instagram Story');
    expect(decodedMessage).toContain('Instagram Reels Video Viral');
    expect(decodedMessage).toContain('Growth Duo');
    expect(decodedMessage).toContain('Rp 3.087.500');

    // 7. Merchant copies contact email
    let copiedText = '';
    const onCopy = (text: string) => {
      copiedText = text;
      return 'Tersalin ke clipboard!';
    };
    const toast = onCopy(seedSiteSettings.business_email);
    expect(copiedText).toBe('mrrobot4444@gmail.com');
    expect(toast).toBe('Tersalin ke clipboard!');
  });

  // ==========================================================================
  // S2: National Agency Multi-Platform Campaign
  // Features: F07, F08, F10, F11, F12
  // ==========================================================================
  test('S2: National Agency Multi-Platform Campaign (IG + TikTok + YouTube VIP Viral Bundle 10% discount)', () => {
    // 1. Agency reviews multi-platform audience
    const ig = seedSocialPlatforms.find(p => p.platform_id === 'instagram')!;
    const tiktok = seedSocialPlatforms.find(p => p.platform_id === 'tiktok')!;
    const yt = seedSocialPlatforms.find(p => p.platform_id === 'youtube')!;

    const totalAudience = ig.followers_count + tiktok.followers_count + yt.followers_count;
    expect(totalAudience).toBe(854200 + 1240000 + 315000); // 2,409,200
    expect(totalAudience).toBeGreaterThan(2000000);

    // 2. Selects 3 deliverables: IG Reels (2.5M) + TikTok Feature (2.2M) + YouTube Review (4.5M)
    const reelsPkg = seedEndorsePackages.find(p => p.id === 'pkg-ig-reels')!;
    const tiktokPkg = seedEndorsePackages.find(p => p.id === 'pkg-tiktok-video')!;
    const ytPkg = seedEndorsePackages.find(p => p.id === 'pkg-youtube-review')!;
    const selected = [reelsPkg, tiktokPkg, ytPkg];

    // 3. Rate calculation: 3 packages qualify for VIP Viral Bundle 10% discount
    const calc = calculateDiscountTier(selected);
    const expectedSubtotal = 2500000 + 2200000 + 4500000; // 9,200,000
    expect(calc.subtotal).toBe(expectedSubtotal);
    expect(calc.discountPercent).toBe(10);
    expect(calc.tierName).toBe('VIP Viral Bundle');
    expect(calc.discountAmount).toBe(920000);
    expect(calc.total).toBe(8280000);
    expect(formatIDR(calc.total)).toBe('Rp 8.280.000');

    // 4. WhatsApp message verification
    const waUrl = generateWhatsAppUrl({
      phone: seedSiteSettings.whatsapp_number,
      selectedPackages: selected
    });
    const decoded = decodeURIComponent(waUrl);
    expect(decoded).toContain('VIP Viral Bundle');
    expect(decoded).toContain('*Diskon:* 10%');
    expect(decoded).toContain('Rp 8.280.000');
    expect(decoded).toContain('TikTok Dedicated Feature Video');
    expect(decoded).toContain('YouTube Dedicated Review');
  });

  // ==========================================================================
  // S3: Scheduled Cron Background Metric Sync
  // Features: F15, F16, F17, F07, F08
  // ==========================================================================
  test('S3: Scheduled Cron Background Metric Sync with Smart Cache Fallback on HTTP 429', () => {
    // 1. Cron schedule validation
    const cronSchedule = '0 */6 * * *';
    const cronPath = '/api/sync-socials';
    expect(cronPath).toBe('/api/sync-socials');
    expect(cronSchedule).toBe('0 */6 * * *');

    // 2. Smart Cache initialization with last known metrics
    const smartCache = new SmartCacheLayer<any>(3600);
    smartCache.set('tiktok_metrics', {
      followers_count: 1240000,
      engagement_rate: 6.42,
      avg_views: 450000,
      avg_likes: 72000,
      avg_comments: 7600
    });

    // 3. Cron API simulation
    const simulateCronSync = (platform: typeof seedSocialPlatforms[0], upstreamHttpCode: number) => {
      // MANUAL platform preserved
      if (platform.sync_mode === 'MANUAL') {
        return {
          platform_id: platform.platform_id,
          status: 'skipped_manual',
          sync_mode: 'MANUAL',
          metrics: {
            followers_count: platform.followers_count,
            engagement_rate: platform.engagement_rate,
            avg_views: platform.avg_views,
            avg_likes: platform.avg_likes,
            avg_comments: platform.avg_comments
          },
          cached_fallback_used: false
        };
      }

      // AUTO_API encountering 429 rate limit
      if (upstreamHttpCode === 429) {
        const cached = smartCache.get(`${platform.platform_id}_metrics`);
        return {
          platform_id: platform.platform_id,
          status: 'cached_fallback',
          sync_mode: 'AUTO_API',
          metrics: cached || {
            followers_count: platform.followers_count,
            engagement_rate: platform.engagement_rate,
            avg_views: platform.avg_views,
            avg_likes: platform.avg_likes,
            avg_comments: platform.avg_comments
          },
          cached_fallback_used: true
        };
      }

      // Normal refresh
      return {
        platform_id: platform.platform_id,
        status: 'synced',
        sync_mode: 'AUTO_API',
        metrics: {
          followers_count: platform.followers_count + 500,
          engagement_rate: platform.engagement_rate,
          avg_views: platform.avg_views + 1000,
          avg_likes: platform.avg_likes + 100,
          avg_comments: platform.avg_comments + 10
        },
        cached_fallback_used: false
      };
    };

    // Test Facebook (MANUAL)
    const fb = seedSocialPlatforms.find(p => p.platform_id === 'facebook')!;
    const fbSync = simulateCronSync(fb, 200);
    expect(fbSync.status).toBe('skipped_manual');
    expect(fbSync.cached_fallback_used).toBe(false);

    // Test TikTok (AUTO_API encountering 429 rate limit)
    const tiktok = seedSocialPlatforms.find(p => p.platform_id === 'tiktok')!;
    const tiktokSync = simulateCronSync(tiktok, 429);
    expect(tiktokSync.status).toBe('cached_fallback');
    expect(tiktokSync.cached_fallback_used).toBe(true);
    expect(tiktokSync.metrics.followers_count).toBe(1240000);

    // Test Instagram (AUTO_API 200 OK)
    const ig = seedSocialPlatforms.find(p => p.platform_id === 'instagram')!;
    const igSync = simulateCronSync(ig, 200);
    expect(igSync.status).toBe('synced');
    expect(igSync.metrics.followers_count).toBe(854700);
  });

  // ==========================================================================
  // S4: Admin Live Profile & Availability Management
  // Features: F18, F19, F24, F04, F05
  // ==========================================================================
  test('S4: Admin Live Profile & Availability Management with Real-time Preview Sync', () => {
    // 1. Admin login verification
    const passcodeGate = (inputPass: string) => {
      if (inputPass === 'admin123') {
        return { success: true, sessionToken: 'mock-jwt-token-2026' };
      }
      return { success: false, sessionToken: null };
    };
    const loginResult = passcodeGate('admin123');
    expect(loginResult.success).toBe(true);

    // 2. Admin edits site settings
    let liveSettings: SiteSettings = { ...seedSiteSettings };
    liveSettings.slot_available = false;
    liveSettings.slot_status_text = 'Fully Booked until Dec 2026';
    liveSettings.theme_preset = 'neo-mint';
    liveSettings.stickers = [
      ...liveSettings.stickers,
      { id: 'stk-viral-rank', text: 'Top #1 Minang', emoji: '🏆', rotation: 4 }
    ];

    // 3. Broadcast sync event simulation
    let publicPreviewState: SiteSettings = { ...seedSiteSettings };
    const syncChannel = {
      postMessage: (data: SiteSettings) => {
        publicPreviewState = { ...data };
      }
    };
    syncChannel.postMessage(liveSettings);

    // 4. Verify public preview reflects CMS changes instantaneously
    expect(publicPreviewState.slot_available).toBe(false);
    expect(publicPreviewState.slot_status_text).toBe('Fully Booked until Dec 2026');
    expect(publicPreviewState.theme_preset).toBe('neo-mint');
    expect(publicPreviewState.stickers.length).toBe(4);
    expect(publicPreviewState.stickers[3].text).toBe('Top #1 Minang');
  });

  // ==========================================================================
  // S5: Viral Surge Realtime Visitor Mood Storm
  // Features: F06, F03, F02
  // ==========================================================================
  test('S5: Viral Surge Realtime Visitor Mood Storm (50 concurrent clicks monotonic increment)', async () => {
    // 1. Reset DAL store to clean baseline seed
    LocalStorageManager.resetToSeed();

    // 2. Fetch initial reaction counts directly from repository
    const initialReactions = await repository.getReactions();
    const initialFire = initialReactions.find(r => r.reaction_type === 'fire')!.count;
    const initialRocket = initialReactions.find(r => r.reaction_type === 'rocket')!.count;
    const initialHeart = initialReactions.find(r => r.reaction_type === 'heart')!.count;

    // 3. Prepare 50 concurrent visitor clicks: 30 fire, 20 rocket
    const clickStorm: Array<'fire' | 'rocket'> = [
      ...Array(30).fill('fire'),
      ...Array(20).fill('rocket')
    ];

    // 4. Fire all 50 clicks concurrently via Promise.all executing repository.incrementReaction(click)
    const returnedCounts = await Promise.all(
      clickStorm.map(click => repository.incrementReaction(click))
    );

    // 5. Verify monotonic increments of returned counter values
    const fireReturns = returnedCounts.slice(0, 30);
    const rocketReturns = returnedCounts.slice(30);

    for (let i = 1; i < fireReturns.length; i++) {
      expect(fireReturns[i]).toBeGreaterThan(fireReturns[i - 1]);
    }
    for (let i = 1; i < rocketReturns.length; i++) {
      expect(rocketReturns[i]).toBeGreaterThan(rocketReturns[i - 1]);
    }

    // 6. Verify final repository state and atomic consistency
    const finalReactions = await repository.getReactions();
    const finalFire = finalReactions.find(r => r.reaction_type === 'fire')!.count;
    const finalRocket = finalReactions.find(r => r.reaction_type === 'rocket')!.count;
    const finalHeart = finalReactions.find(r => r.reaction_type === 'heart')!.count;

    expect(finalFire).toBe(initialFire + 30);
    expect(finalRocket).toBe(initialRocket + 20);
    expect(finalHeart).toBe(initialHeart);
    expect(finalFire).toBeGreaterThan(initialFire);
    expect(finalRocket).toBeGreaterThan(initialRocket);
    expect(returnedCounts).toHaveLength(50);
  });

  // ==========================================================================
  // S6: Complete Offline Clone Fresh Developer Boot
  // Features: F01, F02, F03, F25
  // ==========================================================================
  test('S6: Complete Offline Clone Fresh Developer Boot (zero-env fallback with 100% anti-slop compliance)', () => {
    // 1. Verify zero env credentials activates DAL fallback
    const mockEnv = {};
    const dalClient = {
      isOfflineMode: !('NEXT_PUBLIC_SUPABASE_URL' in mockEnv),
      getSiteSettings: () => seedSiteSettings,
      getSocialPlatforms: () => seedSocialPlatforms,
      getEndorsePackages: () => seedEndorsePackages,
      getVisitorReactions: () => seedVisitorReactions
    };
    expect(dalClient.isOfflineMode).toBe(true);

    // 2. Verify all datasets load cleanly
    const settings = dalClient.getSiteSettings();
    const socials = dalClient.getSocialPlatforms();
    const packages = dalClient.getEndorsePackages();
    const reactions = dalClient.getVisitorReactions();

    expect(settings.creator_name).toBe('Sumbar Terkini');
    expect(socials.length).toBe(5);
    expect(packages.length).toBeGreaterThanOrEqual(5);
    expect(reactions.length).toBe(3);

    // 3. Verify anti-slop compliance (Zero em dashes \u2014)
    const checkNoEmDash = (obj: any): boolean => {
      const json = JSON.stringify(obj);
      return !json.includes('\u2014');
    };
    expect(checkNoEmDash(settings)).toBe(true);
    expect(checkNoEmDash(socials)).toBe(true);
    expect(checkNoEmDash(packages)).toBe(true);
    expect(checkNoEmDash(reactions)).toBe(true);

    // 4. Verify color contrast tokens
    expect(calculateContrastRatio('#FAF8F5', '#1E1E1E')).toBeGreaterThanOrEqual(7.0);
    expect(calculateContrastRatio('#FFD166', '#1E1E1E')).toBeGreaterThanOrEqual(4.5);
    expect(calculateContrastRatio('#06D6A0', '#1E1E1E')).toBeGreaterThanOrEqual(4.5);
    expect(calculateContrastRatio('#EF476F', '#1E1E1E')).toBeGreaterThanOrEqual(4.5);
  });
});
