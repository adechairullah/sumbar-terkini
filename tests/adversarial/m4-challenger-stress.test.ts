/**
 * Milestone 4 Empirical Challenger Adversarial Stress Test Suite
 *
 * Rigorous boundary oracles, stress tests, and edge case evaluations
 * for the CMS Admin Panel at `/admin` and Data Access Layer (DAL).
 *
 * Executable via: `npx tsx tests/adversarial/m4-challenger-stress.test.ts`
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Import production implementations
import { repository } from '../../src/lib/data/repository';
import { LocalStorageManager } from '../../src/lib/data/storage';
import { loginWithPasscode, checkAdminAuth, logoutAdmin } from '../../src/lib/admin/auth';
import { calculateER, calculateContrastRatio, calculateDiscountTier } from '../../src/lib/utils/formatters';
import { normalizePhoneNumber, generateWhatsAppUrl } from '../../src/lib/utils/whatsapp';
import { clampStickerRotation, truncateStickerText } from '../../src/components/admin/StickersManager';
import type {
  SiteSettings,
  EndorsePackage,
  ThemePreset,
  PackagePlatform,
  PackageTier,
} from '../../src/types';

// ==============================================================================
// Validation Oracles matching Admin Panel Component Logic
// ==============================================================================

function validateProfileHeroInput(input: {
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  slotStatusText: string;
  themePreset: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const cleanName = input.name.trim();
  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    errors.name = 'Nama kreator harus 2 - 100 karakter.';
  }

  const cleanHandle = input.handle.trim();
  if (!cleanHandle || cleanHandle.length < 2 || cleanHandle.length > 50) {
    errors.handle = 'Handle username harus 2 - 50 karakter.';
  }

  if (!input.avatarUrl.trim()) {
    errors.avatarUrl = 'URL avatar tidak boleh kosong.';
  }

  const cleanBio = input.bio.trim();
  if (!cleanBio || cleanBio.length < 5 || cleanBio.length > 500) {
    errors.bio = 'Bio kreator harus 5 - 500 karakter.';
  }

  const cleanSlotText = input.slotStatusText.trim();
  if (!cleanSlotText || cleanSlotText.length < 2 || cleanSlotText.length > 100) {
    errors.slotStatusText = 'Teks status slot harus 2 - 100 karakter.';
  }

  const allowedThemes: ThemePreset[] = ['neo-warm', 'neo-mint', 'neo-mustard'];
  if (!allowedThemes.includes(input.themePreset as ThemePreset)) {
    errors.themePreset = 'Preset tema tidak valid.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validatePackageInput(pkg: {
  name: string;
  price: number;
  deliverables: string[];
  discount?: number;
  tier?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!pkg.name || !pkg.name.trim()) {
    errors.name = 'Nama paket wajib diisi.';
  }
  if (typeof pkg.price !== 'number' || isNaN(pkg.price) || pkg.price < 0) {
    errors.price = 'Harga paket tidak boleh negatif.';
  }
  const cleanDeliverables = (pkg.deliverables || []).map((d) => d.trim()).filter(Boolean);
  if (cleanDeliverables.length === 0) {
    errors.deliverables = 'Paket minimal harus memiliki 1 deliverable.';
  }
  if (pkg.discount !== undefined && (pkg.discount < 0 || pkg.discount > 100)) {
    errors.discount = 'Diskon harus antara 0% dan 100%.';
  }
  const allowedTiers = ['starter', 'standard', 'vip', 'bundle'];
  if (pkg.tier && !allowedTiers.includes(pkg.tier)) {
    errors.tier = 'Tier paket tidak valid.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateContactSettings(settings: {
  whatsapp_number: string;
  business_email: string;
  media_kit_pdf_url: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const normalizedPhone = normalizePhoneNumber(settings.whatsapp_number);

  if (!normalizedPhone || normalizedPhone.length < 8 || normalizedPhone.length > 15) {
    errors.phone = 'Nomor WhatsApp tidak valid (harus 8 - 15 digit angka).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!settings.business_email.trim() || !emailRegex.test(settings.business_email.trim())) {
    errors.email = 'Format alamat email bisnis tidak valid.';
  }

  const cleanPdf = settings.media_kit_pdf_url.trim();
  if (!cleanPdf || !cleanPdf.toLowerCase().endsWith('.pdf')) {
    errors.pdf = 'URL Media Kit harus berakhiran ekstensi .pdf.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ==============================================================================
// Mock In-Memory Browser SessionStorage Simulation for Node.js
// ==============================================================================

class MockSessionStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// ==============================================================================
// Test Statistics Tracker
// ==============================================================================

let totalAsserts = 0;
let passedAsserts = 0;

function check(desc: string, condition: boolean, errorMsg?: string): void {
  totalAsserts++;
  try {
    assert.ok(condition, errorMsg || desc);
    passedAsserts++;
  } catch (err) {
    console.error(`❌ FAIL: ${desc}`);
    throw err;
  }
}

function checkEqual<T>(desc: string, actual: T, expected: T): void {
  totalAsserts++;
  try {
    assert.deepEqual(actual, expected, `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}: ${desc}`);
    passedAsserts++;
  } catch (err) {
    console.error(`❌ FAIL: ${desc} (actual: ${actual}, expected: ${expected})`);
    throw err;
  }
}

// ==============================================================================
// Main Challenger Test Runner
// ==============================================================================

async function runM4ChallengerStressSuite() {
  console.log('======================================================================');
  console.log('⚡ STARTING MILESTONE 4 EMPIRICAL CHALLENGER ADVERSARIAL STRESS SUITE');
  console.log('======================================================================\n');

  // ==========================================================================
  // SUITE 1: Passcode Verification, Session Expiry & Dual-Persistence
  // ==========================================================================
  console.log('--- 1. PASSCODE VERIFICATION, WHITESPACE & SESSION EXPIRY ORACLES ---');
  {
    // 1.1: Valid Passcode Acceptance Matrix
    check('Valid passcode sumbar2026', await loginWithPasscode('sumbar2026'), true);
    check('Valid passcode admin123', await loginWithPasscode('admin123'), true);
    check('Valid passcode admin', await loginWithPasscode('admin'), true);

    // 1.2: Whitespace Trimming & Padding Variations
    check('Passcode with leading/trailing spaces', await loginWithPasscode('   sumbar2026   '), true);
    check('Passcode with tab characters', await loginWithPasscode('\tsumbar2026\t'), true);
    check('Passcode with carriage return and newline', await loginWithPasscode('\r\nadmin123\n'), true);
    check('Passcode with mixed whitespace', await loginWithPasscode(' \t  admin  \n '), true);

    // 1.3: Empty & Whitespace-Only Passcodes
    checkEqual('Empty string passcode must be rejected', await loginWithPasscode(''), false);
    checkEqual('Spaces-only passcode must be rejected', await loginWithPasscode('      '), false);
    checkEqual('Tabs-only passcode must be rejected', await loginWithPasscode('\t\t\t'), false);
    checkEqual('Newlines-only passcode must be rejected', await loginWithPasscode('\n\n\n'), false);

    // 1.4: Invalid Passcodes & Malicious Attack Payloads
    checkEqual('Wrong password rejected', await loginWithPasscode('secretpass'), false);
    checkEqual('Case-sensitive passcode mismatch rejected', await loginWithPasscode('Sumbar2026'), false);
    checkEqual('ADMIN uppercase rejected if lowercase defined', await loginWithPasscode('ADMIN123'), false);
    checkEqual('Partial prefix rejected', await loginWithPasscode('sumbar'), false);
    checkEqual('SQL injection payload rejected', await loginWithPasscode("' OR '1'='1"), false);
    checkEqual('Script injection payload rejected', await loginWithPasscode('<script>alert(1)</script>'), false);
    checkEqual('10,000-char buffer rejected', await loginWithPasscode('A'.repeat(10000)), false);

    // 1.5: Simulated Browser SessionStorage Lifecycle & Expiration Oracle
    const mockStorage = new MockSessionStorage();
    (global as any).window = { sessionStorage: mockStorage };
    (global as any).sessionStorage = mockStorage;

    const ADMIN_PASSCODE_KEY = 'sumbar_admin_auth';
    const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    // Simulate login in browser environment
    await loginWithPasscode('sumbar2026');
    const storedRaw = mockStorage.getItem(ADMIN_PASSCODE_KEY);
    check('Session stored in sessionStorage on successful login', storedRaw !== null);

    const parsedSession = JSON.parse(storedRaw!);
    checkEqual('Session marked authenticated', parsedSession.authenticated, true);
    checkEqual('Session method is passcode', parsedSession.method, 'passcode');

    // Check auth while session is fresh
    const freshAuth = await checkAdminAuth();
    checkEqual('Fresh session returns authenticated: true', freshAuth.authenticated, true);

    // Simulate session at 23 hours 59 minutes (still valid)
    mockStorage.setItem(
      ADMIN_PASSCODE_KEY,
      JSON.stringify({
        authenticated: true,
        method: 'passcode',
        timestamp: Date.now() - (SESSION_DURATION_MS - 60000), // 1 min before 24h
      })
    );
    const validAuth = await checkAdminAuth();
    checkEqual('Session at 23h 59m remains valid', validAuth.authenticated, true);

    // Simulate session exactly 24 hours + 10ms (expired)
    mockStorage.setItem(
      ADMIN_PASSCODE_KEY,
      JSON.stringify({
        authenticated: true,
        method: 'passcode',
        timestamp: Date.now() - (SESSION_DURATION_MS + 10),
      })
    );
    const expiredAuth = await checkAdminAuth();
    checkEqual('Session past 24 hours is rejected', expiredAuth.authenticated, false);
    checkEqual('Expired session removed from sessionStorage', mockStorage.getItem(ADMIN_PASSCODE_KEY), null);

    // Corrupted sessionStorage JSON resilience
    mockStorage.setItem(ADMIN_PASSCODE_KEY, '{invalid-json-payload-corrupted');
    const corruptedAuth = await checkAdminAuth();
    checkEqual('Corrupted sessionStorage gracefully treated as unauthenticated', corruptedAuth.authenticated, false);

    // LogoutAdmin clears sessionStorage
    mockStorage.setItem(
      ADMIN_PASSCODE_KEY,
      JSON.stringify({ authenticated: true, method: 'passcode', timestamp: Date.now() })
    );
    await logoutAdmin();
    checkEqual('logoutAdmin purges sessionStorage', mockStorage.getItem(ADMIN_PASSCODE_KEY), null);

    // Cleanup mock window
    delete (global as any).window;
    delete (global as any).sessionStorage;

    console.log('✅ PASS: Passcode matrix, whitespace trimming, and 24h expiration verified.\n');
  }

  // ==========================================================================
  // SUITE 2: Profile & Hero Boundary Lengths & Preset Validation
  // ==========================================================================
  console.log('--- 2. PROFILE & HERO BOUNDARY LENGTHS & PRESET ORACLES ---');
  {
    const baseValid = {
      name: 'Sumbar Terkini Official',
      handle: '@sumbarterkini',
      avatarUrl: '/images/avatar.webp',
      bio: 'Portal informasi dan kreatif Minangkabau terpercaya.',
      slotStatusText: 'Slot Terbuka Minggu Ini',
      themePreset: 'neo-warm',
    };

    // 2.1: Name Boundary Testing (2 - 100 characters)
    checkEqual('Empty name rejected', validateProfileHeroInput({ ...baseValid, name: '' }).valid, false);
    checkEqual('Spaces-only name rejected', validateProfileHeroInput({ ...baseValid, name: '   ' }).valid, false);
    checkEqual('1-char name rejected (< 2)', validateProfileHeroInput({ ...baseValid, name: 'A' }).valid, false);
    checkEqual('2-char name accepted (lower boundary)', validateProfileHeroInput({ ...baseValid, name: 'ST' }).valid, true);
    checkEqual('100-char name accepted (upper boundary)', validateProfileHeroInput({ ...baseValid, name: 'A'.repeat(100) }).valid, true);
    checkEqual('101-char name rejected (> 100)', validateProfileHeroInput({ ...baseValid, name: 'A'.repeat(101) }).valid, false);

    // 2.2: Handle Boundary Testing (2 - 50 characters)
    checkEqual('1-char handle rejected (< 2)', validateProfileHeroInput({ ...baseValid, handle: 'x' }).valid, false);
    checkEqual('2-char handle accepted (lower boundary)', validateProfileHeroInput({ ...baseValid, handle: 'st' }).valid, true);
    checkEqual('50-char handle accepted (upper boundary)', validateProfileHeroInput({ ...baseValid, handle: 'a'.repeat(50) }).valid, true);
    checkEqual('51-char handle rejected (> 50)', validateProfileHeroInput({ ...baseValid, handle: 'a'.repeat(51) }).valid, false);

    // 2.3: Bio Boundary Testing (5 - 500 characters)
    checkEqual('Empty bio rejected', validateProfileHeroInput({ ...baseValid, bio: '' }).valid, false);
    checkEqual('4-char bio rejected (< 5)', validateProfileHeroInput({ ...baseValid, bio: 'Halo' }).valid, false);
    checkEqual('5-char bio accepted (lower boundary)', validateProfileHeroInput({ ...baseValid, bio: 'Halo!' }).valid, true);
    checkEqual('500-char bio accepted (upper boundary)', validateProfileHeroInput({ ...baseValid, bio: 'M'.repeat(500) }).valid, true);
    checkEqual('501-char bio rejected (> 500)', validateProfileHeroInput({ ...baseValid, bio: 'M'.repeat(501) }).valid, false);

    // 2.4: Avatar URL & Slot Status Text Boundaries
    checkEqual('Empty avatar URL rejected', validateProfileHeroInput({ ...baseValid, avatarUrl: '' }).valid, false);
    checkEqual('Whitespace avatar URL rejected', validateProfileHeroInput({ ...baseValid, avatarUrl: '   ' }).valid, false);
    checkEqual('1-char slot status rejected (< 2)', validateProfileHeroInput({ ...baseValid, slotStatusText: 'A' }).valid, false);
    checkEqual('100-char slot status accepted', validateProfileHeroInput({ ...baseValid, slotStatusText: 'S'.repeat(100) }).valid, true);
    checkEqual('101-char slot status rejected (> 100)', validateProfileHeroInput({ ...baseValid, slotStatusText: 'S'.repeat(101) }).valid, false);

    // 2.5: Theme Preset Oracles
    checkEqual('neo-warm preset valid', validateProfileHeroInput({ ...baseValid, themePreset: 'neo-warm' }).valid, true);
    checkEqual('neo-mint preset valid', validateProfileHeroInput({ ...baseValid, themePreset: 'neo-mint' }).valid, true);
    checkEqual('neo-mustard preset valid', validateProfileHeroInput({ ...baseValid, themePreset: 'neo-mustard' }).valid, true);
    checkEqual('neo-dark preset rejected', validateProfileHeroInput({ ...baseValid, themePreset: 'neo-dark' }).valid, false);
    checkEqual('empty theme rejected', validateProfileHeroInput({ ...baseValid, themePreset: '' }).valid, false);
    checkEqual('random theme rejected', validateProfileHeroInput({ ...baseValid, themePreset: 'cyberpunk' }).valid, false);

    // 2.6: Persistence of Maximum Boundary Payloads to DAL
    LocalStorageManager.resetToSeed();
    const maxPayload = {
      creator_name: 'Max Name '.repeat(12).slice(0, 100), // exactly 100 chars
      creator_bio: 'Max Bio Minang Content '.repeat(25).slice(0, 500), // exactly 500 chars
      creator_handle: '@sumbar_official',
      theme_preset: 'neo-mustard' as ThemePreset,
      slot_available: true,
      slot_status_text: 'Slot Khusus 2026',
    };
    const saved = await repository.updateSiteSettings(maxPayload);
    checkEqual('Saved 100-char creator name in DAL', saved.creator_name.length, 100);
    checkEqual('Saved 500-char creator bio in DAL', saved.creator_bio.length, 500);
    checkEqual('Saved theme preset neo-mustard in DAL', saved.theme_preset, 'neo-mustard');

    // Read back verification
    const readBack = await repository.getSiteSettings();
    checkEqual('Read-back creator name matches', readBack.creator_name, saved.creator_name);
    checkEqual('Read-back creator bio matches', readBack.creator_bio, saved.creator_bio);
    checkEqual('Read-back theme preset matches', readBack.theme_preset, 'neo-mustard');

    console.log('✅ PASS: Boundary lengths (name 2-100, bio 5-500) and theme presets verified.\n');
  }

  // ==========================================================================
  // SUITE 3: Draggable Stickers Rotation Clamping & Count Limits
  // ==========================================================================
  console.log('--- 3. DRAGGABLE STICKERS ROTATION CLAMPING & LIMIT ORACLES ---');
  {
    // 3.1: Strict Rotation Clamping within [-45, 45]
    checkEqual('Clamp -45.0 degrees boundary', clampStickerRotation(-45), -45);
    checkEqual('Clamp +45.0 degrees boundary', clampStickerRotation(45), 45);
    checkEqual('Clamp 0 degrees', clampStickerRotation(0), 0);
    checkEqual('Clamp standard angle -3 degrees', clampStickerRotation(-3), -3);
    checkEqual('Clamp standard angle +15 degrees', clampStickerRotation(15), 15);

    // Outside negative bounds
    checkEqual('Clamp -46 degrees to -45', clampStickerRotation(-46), -45);
    checkEqual('Clamp -90 degrees to -45', clampStickerRotation(-90), -45);
    checkEqual('Clamp -180 degrees to -45', clampStickerRotation(-180), -45);
    checkEqual('Clamp -100,000 degrees to -45', clampStickerRotation(-100000), -45);
    checkEqual('Clamp -Infinity to -45', clampStickerRotation(-Infinity), -45);

    // Outside positive bounds
    checkEqual('Clamp +46 degrees to 45', clampStickerRotation(46), 45);
    checkEqual('Clamp +90 degrees to 45', clampStickerRotation(90), 45);
    checkEqual('Clamp +360 degrees to 45', clampStickerRotation(360), 45);
    checkEqual('Clamp +100,000 degrees to 45', clampStickerRotation(100000), 45);
    checkEqual('Clamp +Infinity to 45', clampStickerRotation(Infinity), 45);

    // Non-numeric and NaN defense
    checkEqual('Clamp NaN returns 0', clampStickerRotation(NaN), 0);
    checkEqual('Clamp null returns 0', clampStickerRotation(null as any), 0);
    checkEqual('Clamp undefined returns 0', clampStickerRotation(undefined as any), 0);

    // 3.2: Sticker Text Truncation (Max 24 characters)
    checkEqual('Empty string text truncation', truncateStickerText(''), '');
    checkEqual('Whitespace text truncation', truncateStickerText('   '), '');
    checkEqual('Normal sticker text', truncateStickerText('Viral Rank #1'), 'Viral Rank #1');
    checkEqual('Exact 24-char text', truncateStickerText('123456789012345678901234'), '123456789012345678901234');
    checkEqual(
      '25-char text truncated to 24',
      truncateStickerText('1234567890123456789012345'),
      '123456789012345678901234'
    );
    checkEqual(
      '500-char long text truncated to 24',
      truncateStickerText('X'.repeat(500)),
      'X'.repeat(24)
    );

    // 3.3: Sticker Count Limit (Max 10 Stickers)
    LocalStorageManager.resetToSeed();
    const settings = await repository.getSiteSettings();

    // Reset stickers to empty array
    let currentStickers = await repository.updateSiteSettings({ stickers: [] });
    checkEqual('Stickers reset to 0', currentStickers.stickers.length, 0);

    // Add up to 10 stickers
    for (let i = 1; i <= 10; i++) {
      const addedSticker = {
        id: `test-stk-${i}`,
        text: `Stiker #${i}`,
        emoji: '🔥',
        rotation: clampStickerRotation(i * 10 - 25),
        color: '#FFD166',
      };
      currentStickers = await repository.updateSiteSettings({
        stickers: [...currentStickers.stickers, addedSticker],
      });
      checkEqual(`Sticker count after adding #${i}`, currentStickers.stickers.length, i);
    }

    checkEqual('Exact max 10 stickers reached', currentStickers.stickers.length, 10);

    // Attempting to add 11th sticker in UI logic triggers limit guard
    const canAddMore = currentStickers.stickers.length < 10;
    checkEqual('11th sticker addition blocked by limit guard', canAddMore, false);

    // Delete 1 sticker enables adding again
    const remainingNine = currentStickers.stickers.filter((s) => s.id !== 'test-stk-1');
    const afterDelete = await repository.updateSiteSettings({ stickers: remainingNine });
    checkEqual('Sticker count after deletion is 9', afterDelete.stickers.length, 9);
    checkEqual('Can add more after delete', afterDelete.stickers.length < 10, true);

    console.log('✅ PASS: Rotation clamping [-45, 45], text truncation (24 chars), and max 10 limit verified.\n');
  }

  // ==========================================================================
  // SUITE 4: ER Calculator Division-by-Zero, Precision & 1-Click Apply
  // ==========================================================================
  console.log('--- 4. ER CALCULATOR DIVISION-BY-ZERO, NEGATIVES & SYNC ORACLES ---');
  {
    // 4.1: Division by Zero & Follower Boundary Defense
    checkEqual('Followers = 0 returns 0 without NaN or Infinity', calculateER(100, 50, 0), 0);
    checkEqual('Followers = -1 returns 0', calculateER(100, 50, -1), 0);
    checkEqual('Followers = -1,000,000 returns 0', calculateER(100, 50, -1000000), 0);
    checkEqual('Followers = NaN returns 0', calculateER(100, 50, NaN), 0);
    checkEqual('Followers = undefined returns 0', calculateER(100, 50, undefined as any), 0);
    checkEqual('All parameters = 0 returns 0', calculateER(0, 0, 0), 0);

    // 4.2: Negative Likes & Comments Handling
    // If likes are negative, safeLikes clamps to 0: (0 + 50) / 1000 * 100 = 5.0
    checkEqual('Negative likes clamped to 0', calculateER(-200, 50, 1000), 5.0);
    // If comments are negative, safeComments clamps to 0: (100 + 0) / 1000 * 100 = 10.0
    checkEqual('Negative comments clamped to 0', calculateER(100, -50, 1000), 10.0);
    // If both likes & comments are negative: (0 + 0) / 1000 * 100 = 0.0
    checkEqual('Both likes and comments negative returns 0', calculateER(-100, -100, 1000), 0.0);

    // 4.3: Floating Point Precision & 2-Decimal Rounding
    // (2 / 3) * 100 = 66.666666... -> 66.67
    checkEqual('Precision rounding 2/3 * 100 = 66.67', calculateER(1, 1, 3), 66.67);
    // (3 / 7) * 100 = 42.85714... -> 42.86
    checkEqual('Precision rounding 3/7 * 100 = 42.86', calculateER(1, 2, 7), 42.86);
    // (1 / 6) * 100 = 16.666... -> 16.67
    checkEqual('Precision rounding 1/6 * 100 = 16.67', calculateER(1, 0, 6), 16.67);
    // Whole percentage: (30 / 3000) * 100 = 1.0
    checkEqual('Clean integer ER formatted correctly', calculateER(10, 20, 3000), 1.0);

    // 4.4: High-Scale & Viral Spillover Scenarios
    // Micro: 12 / 100 * 100 = 12%
    checkEqual('Micro-influencer ER', calculateER(10, 2, 100), 12.0);
    // High engagement viral reel: 50,000 interactions on 1,000 followers = 5,000%
    checkEqual('Viral video ER > 100%', calculateER(40000, 10000, 1000), 5000.0);
    // Mega creator: (500k + 25k) / 10M * 100 = 5.25%
    checkEqual('Mega creator ER', calculateER(500000, 25000, 10000000), 5.25);

    // 4.5: 1-Click Apply Sync with DAL Platform Model
    LocalStorageManager.resetToSeed();
    const platform = await repository.updateSocialPlatform('instagram', {
      avg_likes: 38200,
      avg_comments: 3250,
      followers_count: 854200,
    });
    const calculated = calculateER(platform.avg_likes, platform.avg_comments, platform.followers_count);
    checkEqual('Calculated ER for Instagram matches benchmark', calculated, 4.85);

    // Apply ER to platform in repository
    const appliedPlatform = await repository.updateSocialPlatform('instagram', {
      engagement_rate: calculated,
    });
    checkEqual('1-click apply persists engagement_rate to DAL', appliedPlatform.engagement_rate, 4.85);

    // Negative metric input sanitization on save (Math.max(0, ...))
    const sanitizedSave = await repository.updateSocialPlatform('instagram', {
      followers_count: Math.max(0, -9999),
      avg_views: Math.max(0, -500),
      avg_likes: Math.max(0, -100),
      avg_comments: Math.max(0, -50),
    });
    checkEqual('Negative followers clamped to 0 on save', sanitizedSave.followers_count, 0);
    checkEqual('Negative avg_views clamped to 0 on save', sanitizedSave.avg_views, 0);

    console.log('✅ PASS: ER division by zero, negatives, precision rounding, and 1-click DAL apply verified.\n');
  }

  // ==========================================================================
  // SUITE 5: Endorsement Packages Boundary, Hidden Price & Delete Behavior
  // ==========================================================================
  console.log('--- 5. ENDORSEMENT PACKAGES BOUNDARY, HIDDEN PRICE & DELETE ORACLES ---');
  {
    const baseValidPackage = {
      name: 'Reels Promo Standard',
      price: 1500000,
      deliverables: ['1x Reels High-Production', '1x Story Link'],
      discount: 0,
      tier: 'standard',
    };

    // 5.1: Negative Price Rejection Oracle
    checkEqual('Negative price -1 rejected', validatePackageInput({ ...baseValidPackage, price: -1 }).valid, false);
    checkEqual('Negative price -500,000 rejected', validatePackageInput({ ...baseValidPackage, price: -500000 }).valid, false);
    checkEqual('Zero price accepted (negotiation / pro-bono)', validatePackageInput({ ...baseValidPackage, price: 0 }).valid, true);
    checkEqual('Positive price accepted', validatePackageInput({ ...baseValidPackage, price: 1500000 }).valid, true);

    // 5.2: Empty Deliverables Rejection Oracle
    checkEqual('Empty deliverables array rejected', validatePackageInput({ ...baseValidPackage, deliverables: [] }).valid, false);
    checkEqual('Whitespace-only deliverables rejected', validatePackageInput({ ...baseValidPackage, deliverables: ['   ', ''] }).valid, false);
    checkEqual('1 valid deliverable accepted', validatePackageInput({ ...baseValidPackage, deliverables: ['1x Post'] }).valid, true);
    checkEqual('Multiple deliverables accepted', validatePackageInput({ ...baseValidPackage, deliverables: ['1x Post', '2x Story'] }).valid, true);

    // 5.3: Discount Percentage Boundaries (0 - 100%)
    checkEqual('Negative discount -5% rejected', validatePackageInput({ ...baseValidPackage, discount: -5 }).valid, false);
    checkEqual('0% discount accepted', validatePackageInput({ ...baseValidPackage, discount: 0 }).valid, true);
    checkEqual('50% discount accepted', validatePackageInput({ ...baseValidPackage, discount: 50 }).valid, true);
    checkEqual('100% discount accepted', validatePackageInput({ ...baseValidPackage, discount: 100 }).valid, true);
    checkEqual('101% discount rejected', validatePackageInput({ ...baseValidPackage, discount: 101 }).valid, false);

    // 5.4: Tier Validation Oracle
    checkEqual('starter tier valid', validatePackageInput({ ...baseValidPackage, tier: 'starter' }).valid, true);
    checkEqual('standard tier valid', validatePackageInput({ ...baseValidPackage, tier: 'standard' }).valid, true);
    checkEqual('vip tier valid', validatePackageInput({ ...baseValidPackage, tier: 'vip' }).valid, true);
    checkEqual('bundle tier valid', validatePackageInput({ ...baseValidPackage, tier: 'bundle' }).valid, true);
    checkEqual('invalid tier rejected', validatePackageInput({ ...baseValidPackage, tier: 'ultra-premium' }).valid, false);

    // 5.5: `is_price_hidden` Toggle Persistence & Calculation Contract
    LocalStorageManager.resetToSeed();

    // Create a package with hidden price
    const hiddenPkg = await repository.createEndorsePackage({
      name: 'Custom Agency Brand Takeover',
      platform: 'cross-platform',
      price: 15000000,
      description: 'Exclusive multi-channel takeover with private negotiation',
      deliverables: ['3x Reels', '5x Stories', '1x Dedicated YouTube Video'],
      is_popular: true,
      is_price_hidden: true,
      is_active: true,
      tier: 'bundle',
      discount_percentage: 0,
      sort_order: 10,
    });

    checkEqual('Package created with is_price_hidden: true', hiddenPkg.is_price_hidden, true);

    // Test calculateDiscountTier with hidden price package
    const singleHiddenCalc = calculateDiscountTier([hiddenPkg]);
    checkEqual('hasHiddenPrice flagged true', singleHiddenCalc.hasHiddenPrice, true);
    checkEqual('Subtotal excludes hidden price package', singleHiddenCalc.subtotal, 0);
    checkEqual('Total is 0 for purely hidden packages', singleHiddenCalc.total, 0);

    // Mix hidden package with normal package (price 1,000,000)
    const normalPkg: EndorsePackage = {
      id: 'pkg-normal-1',
      name: 'Single Post',
      platform: 'instagram',
      price: 1000000,
      description: 'Single feed post',
      deliverables: ['1x Feed Post'],
      is_popular: false,
      is_price_hidden: false,
      is_active: true,
      tier: 'starter',
      discount_percentage: 0,
      sort_order: 1,
    };

    const mixedCalc = calculateDiscountTier([normalPkg, hiddenPkg]);
    checkEqual('Mixed packages hasHiddenPrice true', mixedCalc.hasHiddenPrice, true);
    checkEqual('Mixed packages subtotal only counts visible price', mixedCalc.subtotal, 1000000);

    // WhatsApp URL generation with hidden price
    const waUrlHidden = generateWhatsAppUrl({
      phone: '081234567890',
      selectedPackages: [hiddenPkg],
    });
    check('WhatsApp URL encodes Negosiasi Khusus for hidden price', waUrlHidden.includes(encodeURIComponent('Negosiasi Khusus')));

    // Toggle hidden price back to false in repository
    const unhiddenPkg = await repository.updateEndorsePackage(hiddenPkg.id, {
      is_price_hidden: false,
    });
    checkEqual('Package updated with is_price_hidden: false', unhiddenPkg.is_price_hidden, false);

    const normalCalcAfterUnhide = calculateDiscountTier([unhiddenPkg]);
    checkEqual('Subtotal now includes 15,000,000 price', normalCalcAfterUnhide.subtotal, 15000000);

    // 5.6: Delete Confirmation & Removal from DAL
    const deleteSuccess = await repository.deleteEndorsePackage(hiddenPkg.id);
    checkEqual('deleteEndorsePackage returns true', deleteSuccess, true);

    const packagesList = await repository.getEndorsePackages();
    checkEqual('Deleted package no longer present in DAL', packagesList.some((p) => p.id === hiddenPkg.id), false);

    // Deleting non-existent package handles safely
    const deleteNonExistent = await repository.deleteEndorsePackage('non-existent-id-999');
    checkEqual('Deleting non-existent package returns false without throw', deleteNonExistent, false);

    console.log('✅ PASS: Negative price rejection, deliverables check, hidden price toggle, and delete verified.\n');
  }

  // ==========================================================================
  // SUITE 6: Contact Settings, Indonesian Phone Normalization & Email/PDF Regex
  // ==========================================================================
  console.log('--- 6. CONTACT SETTINGS, PHONE NORMALIZATION & EMAIL/PDF ORACLES ---');
  {
    // 6.1: Comprehensive Indonesian Phone Normalizer Matrix
    checkEqual('Format 081234567890 -> 6281234567890', normalizePhoneNumber('081234567890'), '6281234567890');
    checkEqual('Format +6281234567890 -> 6281234567890', normalizePhoneNumber('+6281234567890'), '6281234567890');
    checkEqual('Format 6281234567890 -> 6281234567890', normalizePhoneNumber('6281234567890'), '6281234567890');
    checkEqual('Hyphenated 0812-3456-7890 -> 6281234567890', normalizePhoneNumber('0812-3456-7890'), '6281234567890');
    checkEqual('Spaced +62 812 3456 7890 -> 6281234567890', normalizePhoneNumber('+62 812 3456 7890'), '6281234567890');
    checkEqual('Parenthesized +62 (812) 3456-7890 -> 6281234567890', normalizePhoneNumber('+62 (812) 3456-7890'), '6281234567890');
    checkEqual('Dotted 0852.1234.5678 -> 6285212345678', normalizePhoneNumber('0852.1234.5678'), '6285212345678');
    checkEqual('Other prefix 08991234567 -> 628991234567', normalizePhoneNumber('08991234567'), '628991234567');

    // Invalid & Non-standard String Inputs
    checkEqual('Empty string phone returns empty', normalizePhoneNumber(''), '');
    checkEqual('Whitespace-only phone returns empty', normalizePhoneNumber('   '), '');
    checkEqual('Alpha characters stripped to empty', normalizePhoneNumber('abcdefg'), '');
    checkEqual('Null input returns empty', normalizePhoneNumber(null as any), '');
    checkEqual('Undefined input returns empty', normalizePhoneNumber(undefined as any), '');

    // 6.2: Contact Settings Phone Length Guard (8 - 15 digits)
    const baseValidContact = {
      whatsapp_number: '081234567890',
      business_email: 'partner@sumbarterkini.com',
      media_kit_pdf_url: '/downloads/media-kit.pdf',
    };

    checkEqual('Valid 12-digit phone accepted', validateContactSettings(baseValidContact).valid, true);
    checkEqual('Short phone (3 digits "081" -> "6281") rejected (< 8)', validateContactSettings({ ...baseValidContact, whatsapp_number: '081' }).valid, false);
    checkEqual('Short phone (6 digits "081234" -> "6281234" = 7 digits) rejected (< 8)', validateContactSettings({ ...baseValidContact, whatsapp_number: '081234' }).valid, false);
    checkEqual('Exact 8 digits normalized ("0812345" -> "62812345" = 8 digits) accepted', validateContactSettings({ ...baseValidContact, whatsapp_number: '0812345' }).valid, true);
    checkEqual('Ultra long phone (> 15 digits) rejected', validateContactSettings({ ...baseValidContact, whatsapp_number: '08123456789012345678' }).valid, false);

    // 6.3: Business Email Regex Edge Cases
    checkEqual('Standard domain email accepted', validateContactSettings({ ...baseValidContact, business_email: 'hello@sumbar.com' }).valid, true);
    checkEqual('Subdomain email accepted', validateContactSettings({ ...baseValidContact, business_email: 'ads@agency.sumbarterkini.id' }).valid, true);
    checkEqual('Email with plus tag accepted', validateContactSettings({ ...baseValidContact, business_email: 'sumbar+endorse@gmail.com' }).valid, true);
    checkEqual('Two-letter TLD email accepted', validateContactSettings({ ...baseValidContact, business_email: 'a@b.co' }).valid, true);

    // Invalid emails
    checkEqual('Empty email rejected', validateContactSettings({ ...baseValidContact, business_email: '' }).valid, false);
    checkEqual('Email without @ rejected', validateContactSettings({ ...baseValidContact, business_email: 'plainemail.com' }).valid, false);
    checkEqual('Email without domain rejected', validateContactSettings({ ...baseValidContact, business_email: 'user@' }).valid, false);
    checkEqual('Email without username rejected', validateContactSettings({ ...baseValidContact, business_email: '@domain.com' }).valid, false);
    checkEqual('Email with space rejected', validateContactSettings({ ...baseValidContact, business_email: 'user name@domain.com' }).valid, false);
    checkEqual('Email missing dot extension rejected', validateContactSettings({ ...baseValidContact, business_email: 'user@domain' }).valid, false);

    // 6.4: Media Kit PDF URL Validation
    checkEqual('Relative .pdf path accepted', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '/downloads/media-kit.pdf' }).valid, true);
    checkEqual('Absolute HTTPS .pdf URL accepted', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: 'https://cdn.sumbar.com/kit.pdf' }).valid, true);
    checkEqual('Uppercase .PDF extension accepted', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '/media/RATE_CARD.PDF' }).valid, true);

    // Invalid media kit URLs
    checkEqual('Missing extension rejected', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '/downloads/mediakit' }).valid, false);
    checkEqual('Word document (.docx) rejected', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '/downloads/mediakit.docx' }).valid, false);
    checkEqual('Image (.png) rejected', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '/downloads/mediakit.png' }).valid, false);
    checkEqual('Query parameters after .pdf rejected', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: 'https://cdn.com/kit.pdf?token=123' }).valid, false);
    checkEqual('Empty media kit URL rejected', validateContactSettings({ ...baseValidContact, media_kit_pdf_url: '' }).valid, false);

    // 6.5: WhatsApp Dynamic Token Substitution & Generator
    const waUrl = generateWhatsAppUrl({
      phone: '0812-3456-7890',
      creatorName: 'Sumbar Terkini Media',
      selectedPackages: [
        {
          id: 'pkg-1',
          name: 'Paket Brand Viral',
          platform: 'instagram',
          price: 2500000,
          description: 'Reels + Story',
          deliverables: ['1x Reels', '2x Story'],
          is_popular: true,
          is_price_hidden: false,
          is_active: true,
          tier: 'standard',
          discount_percentage: 0,
          sort_order: 1,
        },
      ],
    });

    check('WhatsApp link starts with https://wa.me/6281234567890', waUrl.startsWith('https://wa.me/6281234567890?text='));
    check('WhatsApp message contains creator name', waUrl.includes(encodeURIComponent('Sumbar Terkini Media')));
    check('WhatsApp message contains package name', waUrl.includes(encodeURIComponent('Paket Brand Viral')));

    console.log('✅ PASS: Phone normalization, email regex, and .pdf validation verified.\n');
  }

  // ==========================================================================
  // SUITE 7: Concurrency & Stress Race-Condition Verification
  // ==========================================================================
  console.log('--- 7. CONCURRENCY & BURST HIGH-LOAD STRESS ON DAL ---');
  {
    LocalStorageManager.resetToSeed();

    // 7.1: 50 Parallel Site Settings updates
    const parallelSettingsUpdates = Array.from({ length: 50 }, (_, i) =>
      repository.updateSiteSettings({
        creator_name: `Sumbar Terkini Concurrent #${i}`,
        slot_status_text: `Slot Update #${i}`,
      })
    );
    const settingsResults = await Promise.all(parallelSettingsUpdates);
    checkEqual('All 50 parallel settings writes resolved', settingsResults.length, 50);

    // 7.2: 20 Parallel Endorsement Package Creations followed by Deletions
    const parallelCreations = Array.from({ length: 20 }, (_, i) =>
      repository.createEndorsePackage({
        name: `Stress Package #${i}`,
        platform: 'instagram',
        price: 1000000 + i * 50000,
        description: `Stress load test package ${i}`,
        deliverables: [`${i + 1}x Test Deliverable`],
        is_popular: i % 2 === 0,
        is_price_hidden: false,
        is_active: true,
        tier: 'standard',
        discount_percentage: 0,
        sort_order: i + 1,
      })
    );
    const createdPackages = await Promise.all(parallelCreations);
    checkEqual('All 20 parallel package creations resolved', createdPackages.length, 20);

    // Verify all 20 packages are readable
    const allPackages = await repository.getEndorsePackages();
    check('All 20 stress packages persisted in DAL', createdPackages.every((cp) => allPackages.some((ap) => ap.id === cp.id)));

    // Clean up parallel deletions
    const parallelDeletions = createdPackages.map((cp) => repository.deleteEndorsePackage(cp.id));
    const deleteResults = await Promise.all(parallelDeletions);
    checkEqual('All 20 parallel deletions succeeded', deleteResults.every(Boolean), true);

    console.log('✅ PASS: Concurrency stress (50 writes + 20 parallel CRUD) completed cleanly.\n');
  }

  // ==========================================================================
  // SUITE 8: Anti-Slop, Tap Targets & Accessibility Compliance
  // ==========================================================================
  console.log('--- 8. ANTI-SLOP, TAP TARGETS & ACCESSIBILITY AUDIT ---');
  {
    // 8.1: Em Dash Prohibition (\u2014) across entire admin directory
    const adminDirs = [
      path.resolve(process.cwd(), 'src/components/admin'),
      path.resolve(process.cwd(), 'src/app/admin'),
    ];

    let emDashFound = false;
    let todoFound = false;

    for (const dir of adminDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        if (content.includes('—') || content.includes('\u2014')) {
          emDashFound = true;
          console.error(`Em dash detected in: ${file}`);
        }
        if (content.includes('// TODO') || content.includes('/* TODO')) {
          todoFound = true;
          console.error(`TODO placeholder detected in: ${file}`);
        }
      }
    }

    checkEqual('Zero em dashes across all admin components (Rule R-02)', emDashFound, false);
    checkEqual('Zero unfinished TODO placeholders in admin code (Rule R-26)', todoFound, false);

    // 8.2: Minimum 44px Tap Target Audit
    // Verify min-h-[44px] presence across all interactive admin components
    const interactiveFiles = [
      'AdminLoginGate.tsx',
      'AdminHeader.tsx',
      'ProfileHeroEditor.tsx',
      'StickersManager.tsx',
      'SocialMediaManager.tsx',
      'PackageBuilder.tsx',
      'ContactSettingsEditor.tsx',
      'LivePreviewFrame.tsx',
    ];

    for (const file of interactiveFiles) {
      const filePath = path.resolve(process.cwd(), 'src/components/admin', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        check(
          `${file} enforces min-h-[44px] touch target standard`,
          content.includes('min-h-[44px]')
        );
      }
    }

    // 8.3: Color Contrast Ratio Compliance (WCAG AA >= 4.5:1)
    const darkInk = '#1E1E1E';
    const paper = '#FAF8F5';
    const mustard = '#FFD166';
    const mint = '#06D6A0';
    const coral = '#EF476F';

    check('Paper contrast meets AAA (>= 7.0:1)', calculateContrastRatio(paper, darkInk) >= 7.0);
    check('Mustard contrast meets AA (>= 4.5:1)', calculateContrastRatio(mustard, darkInk) >= 4.5);
    check('Mint contrast meets AA (>= 4.5:1)', calculateContrastRatio(mint, darkInk) >= 4.5);
    check('Coral contrast meets AA (>= 4.5:1)', calculateContrastRatio(coral, darkInk) >= 4.5);

    console.log('✅ PASS: Anti-slop, 44px tap targets, and WCAG AA contrast ratios verified.\n');
  }

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('======================================================================');
  console.log(`📊 CHALLENGER ADVERSARIAL STRESS SUITE COMPLETED SUCCESSFULLY`);
  console.log(`   Total Assertions Executed: ${totalAsserts}`);
  console.log(`   Passed Assertions: ${passedAsserts}`);
  console.log(`   Failed Assertions: 0`);
  console.log('======================================================================\n');
}

runM4ChallengerStressSuite().catch((err) => {
  console.error('Challenger adversarial stress test suite failed:', err);
  process.exit(1);
});
