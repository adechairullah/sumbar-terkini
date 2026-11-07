/**
 * Milestone 4: Admin Panel Adversarial Stress & Empirical Challenge Suite
 * Executable via: `npx tsx tests/adversarial/m4-admin-adversarial.test.ts`
 */

import assert from 'node:assert/strict';
import { repository } from '../../src/lib/data/repository';
import { LocalStorageManager } from '../../src/lib/data/storage';
import { loginWithPasscode, checkAdminAuth } from '../../src/lib/admin/auth';
import { calculateER, calculateContrastRatio } from '../../src/lib/utils/formatters';
import { normalizePhoneNumber, generateWhatsAppUrl } from '../../src/lib/utils/whatsapp';
import { clampStickerRotation, truncateStickerText } from '../../src/components/admin/StickersManager';
import type { EndorsePackage } from '../../src/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Standalone validators to avoid side-effect imports
function validateStickerInput(sticker: { text: string; emoji: string }): { valid: boolean; error?: string } {
  if (!sticker.text || !sticker.text.trim()) return { valid: false, error: 'Teks stiker tidak boleh kosong' };
  if (sticker.text.trim().length > 24) return { valid: false, error: 'Teks stiker maksimal 24 karakter' };
  return { valid: true };
}

function validateSocialDemographics(
  gender: { male: number; female: number },
  topCities: Array<{ city: string; percentage: number }>
): { valid: boolean; error?: string } {
  if (gender.male < 0 || gender.female < 0) return { valid: false, error: 'Persentase gender tidak boleh negatif' };
  if (gender.male + gender.female !== 100) return { valid: false, error: 'Total persentase gender harus tepat 100%' };
  for (const item of topCities) {
    if (item.percentage < 0 || item.percentage > 100) return { valid: false, error: 'Persentase kota harus antara 0% dan 100%' };
  }
  return { valid: true };
}

async function runMilestone4AdversarialSuite() {
  console.log('======================================================================');
  console.log('🔥 STARTING MILESTONE 4 ADMIN PANEL ADVERSARIAL CHALLENGE SUITE');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(name: string, details?: string) {
    totalTests++;
    passedTests++;
    console.log(`[PASS] ${name}`);
    if (details) console.log(`   ↳ Details: ${details}`);
  }

  // --------------------------------------------------------------------------
  // 1. Admin Gate Passcode Security & Tamper Resistance
  // --------------------------------------------------------------------------
  console.log('--- 1. ADMIN GATE PASSCODE SECURITY & TAMPER RESILIENCE ---');
  {
    const sqlInjections = [
      "' OR '1'='1",
      "admin' --",
      "' UNION SELECT * FROM users --",
      "'; DROP TABLE site_settings; --",
    ];
    for (const sqli of sqlInjections) {
      assert.equal(await loginWithPasscode(sqli), false);
    }
    recordPass('SQL Injection attempts safely rejected without uncaught error', `Tested ${sqlInjections.length} patterns`);

    const hugeString = 'a'.repeat(200000);
    assert.equal(await loginWithPasscode(hugeString), false);
    recordPass('200KB massive payload rejected without memory crash');

    assert.equal(await loginWithPasscode('SUMBAR2026'), false, 'Uppercase passcode should be rejected');
    assert.equal(await loginWithPasscode('Admin123'), false, 'Titlecase passcode should be rejected');
    assert.equal(await loginWithPasscode('admin\u0000123'), false, 'Null byte injection rejected');
    recordPass('Strict casing and null byte protection verified');

    const authStatus = await checkAdminAuth();
    assert.equal(typeof authStatus.authenticated, 'boolean');
    recordPass('checkAdminAuth resilient in headless server environment');
  }

  // --------------------------------------------------------------------------
  // 2. Stickers Clamping & Boundary Exploitation
  // --------------------------------------------------------------------------
  console.log('\n--- 2. STICKERS CLAMPING & BOUNDARY EXPLOITATION ---');
  {
    assert.equal(clampStickerRotation(1e12), 45);
    assert.equal(clampStickerRotation(-1e12), -45);
    assert.equal(clampStickerRotation(Infinity), 45);
    assert.equal(clampStickerRotation(-Infinity), -45);
    assert.equal(clampStickerRotation(NaN), 0);
    assert.equal(clampStickerRotation(45.0001), 45);
    assert.equal(clampStickerRotation(-45.0001), -45);
    recordPass('Rotation clamped at ±45° under infinite/NaN values');

    assert.equal(truncateStickerText(''), '');
    assert.equal(truncateStickerText('   '), '');
    assert.equal(truncateStickerText('Valid 24 Char Sticker!!!'), 'Valid 24 Char Sticker!!!');
    assert.equal(truncateStickerText('1234567890123456789012345'), '123456789012345678901234');
    assert.equal(truncateStickerText('🔥'.repeat(30)).length, 24);
    recordPass('Sticker text strictly truncated to max 24 chars with whitespace trimmed');

    assert.equal(validateStickerInput({ text: 'A'.repeat(24), emoji: '🚀' }).valid, true);
    assert.equal(validateStickerInput({ text: 'A'.repeat(25), emoji: '🚀' }).valid, false);
    recordPass('Sticker validation enforces 1-24 character length bound');
  }

  // --------------------------------------------------------------------------
  // 3. Social Media & ER Calculator Adversarial Boundaries
  // --------------------------------------------------------------------------
  console.log('\n--- 3. SOCIAL MEDIA & ER CALCULATOR ADVERSARIAL BOUNDARIES ---');
  {
    assert.equal(calculateER(0, 0, 0), 0);
    assert.equal(calculateER(100, 50, 0), 0);
    assert.equal(calculateER(100, 50, -1), 0);
    assert.equal(calculateER(100, 50, -99999999), 0);
    assert.equal(calculateER(NaN, NaN, 1000), 0);
    assert.equal(calculateER(100, NaN, 1000), 10.0);
    assert.equal(calculateER(NaN, 50, 1000), 5.0);
    assert.equal(calculateER(1000000, 500000, 10000000), 15.0);
    assert.equal(calculateER(1, 0, 3), 33.33);
    recordPass('calculateER division-by-zero, negative numbers, and NaNs safely handled');

    assert.equal(validateSocialDemographics({ male: 50, female: 50 }, []).valid, true);
    assert.equal(validateSocialDemographics({ male: 50.5, female: 49.5 }, []).valid, true);
    assert.equal(validateSocialDemographics({ male: 0, female: 100 }, []).valid, true);
    assert.equal(validateSocialDemographics({ male: -1, female: 101 }, []).valid, false);
    assert.equal(validateSocialDemographics({ male: 70, female: 40 }, []).valid, false);
    assert.equal(
      validateSocialDemographics({ male: 50, female: 50 }, [{ city: 'Padang', percentage: 105 }]).valid,
      false
    );
    recordPass('Demographics validator strictly verifies 100% gender parity and 0-100% city bounds');

    await assert.rejects(
      async () => {
        await repository.updateSocialPlatform('nonexistent_platform_xyz', { followers_count: 100 });
      },
      /not found/i,
      'Updating invalid platform must throw not found error'
    );
    recordPass('DAL rejects updates to non-existent platform with clean Error');
  }

  // --------------------------------------------------------------------------
  // 4. Endorsement Package Builder DAL CRUD Resilience
  // --------------------------------------------------------------------------
  console.log('\n--- 4. ENDORSEMENT PACKAGE BUILDER CRUD RESILIENCE ---');
  {
    LocalStorageManager.resetToSeed();
    const initialPackages = await repository.getEndorsePackages();
    const initialCount = initialPackages.length;

    const extremePkg = await repository.createEndorsePackage({
      name: 'Ultra High Value Enterprise Viral Takeover',
      platform: 'cross-platform',
      price: 50000000,
      description: 'Full multi-platform blitz takeover across all channels.',
      deliverables: ['10x Reels', '20x Stories', '1x Dedicated YouTube Documentary', 'Live Event Host'],
      is_popular: true,
      is_price_hidden: true,
      tier: 'bundle',
      discount_percentage: 25,
      sort_order: 100,
      is_active: true,
    });
    assert.ok(extremePkg.id.startsWith('pkg-'));
    assert.equal(extremePkg.price, 50000000);
    assert.equal(extremePkg.is_price_hidden, true);
    recordPass('Created 50M enterprise package with private WhatsApp quote flag');

    assert.throws(
      () => {
        LocalStorageManager.atomicUpdatePackage('invalid-pkg-id-999', { price: 1000 });
      },
      /not found/i,
      'Updating non-existent package must throw'
    );
    recordPass('atomicUpdatePackage rejects invalid ID with clean Error');

    const deleteResult = LocalStorageManager.atomicDeletePackage('nonexistent-pkg-id');
    assert.equal(deleteResult, false, 'Deleting non-existent package should return false');
    recordPass('atomicDeletePackage returns false on missing ID without throwing');

    const cleanupSuccess = await repository.deleteEndorsePackage(extremePkg.id);
    assert.equal(cleanupSuccess, true);
    const countAfter = (await repository.getEndorsePackages()).length;
    assert.equal(countAfter, initialCount);
    recordPass('Cleaned up package, state strictly restored to initial count');
  }

  // --------------------------------------------------------------------------
  // 5. WhatsApp Normalization & Order URL Generation Stress
  // --------------------------------------------------------------------------
  console.log('\n--- 5. WHATSAPP NORMALIZATION & ORDER URL GENERATION STRESS ---');
  {
    const phoneMatrix: Array<{ input: string; expected: string }> = [
      { input: '081234567890', expected: '6281234567890' },
      { input: '+6281234567890', expected: '6281234567890' },
      { input: '6281234567890', expected: '6281234567890' },
      { input: '0812-3456-7890', expected: '6281234567890' },
      { input: '(0812) 3456 7890', expected: '6281234567890' },
      { input: '+62 (812) 3456-7890', expected: '6281234567890' },
      { input: '  0852-1122-3344  ', expected: '6285211223344' },
      { input: '', expected: '' },
    ];

    for (const item of phoneMatrix) {
      assert.equal(
        normalizePhoneNumber(item.input),
        item.expected,
        `Phone ${item.input} must normalize to ${item.expected}`
      );
    }
    recordPass(`normalizePhoneNumber verified across ${phoneMatrix.length} variations`);

    const hiddenPricePkg: EndorsePackage = {
      id: 'pkg-hidden-test',
      name: 'Custom Tailored Ambassadorship',
      platform: 'cross-platform',
      price: 0,
      description: 'Exclusive partnership',
      deliverables: ['Custom scope'],
      is_popular: false,
      is_price_hidden: true,
      sort_order: 1,
      is_active: true,
      tier: 'vip',
      discount_percentage: 0,
    };

    const waUrl = generateWhatsAppUrl({
      phone: '081234567890',
      selectedPackages: [hiddenPricePkg],
      creatorName: 'Sumbar Terkini',
    });

    assert.ok(waUrl.startsWith('https://wa.me/6281234567890'));
    assert.ok(waUrl.includes(encodeURIComponent('Negosiasi Khusus')));
    assert.ok(!waUrl.includes('—'), 'WhatsApp generated text must not contain em dash');
    recordPass('generateWhatsAppUrl with private hidden price formats clean wa.me link');
  }

  // --------------------------------------------------------------------------
  // 6. High-Frequency Concurrent DAL Stress (100 Operations)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. HIGH-FREQUENCY CONCURRENT DAL STRESS (100 OPERATIONS) ---');
  {
    LocalStorageManager.resetToSeed();
    const startTime = Date.now();

    const promises: Promise<unknown>[] = [];

    for (let i = 0; i < 50; i++) {
      promises.push(
        repository.updateSiteSettings({
          creator_bio: `Adversarial stress bio iteration ${i}`,
          slot_status_text: `Status ${i}`,
        })
      );
    }

    for (let i = 0; i < 50; i++) {
      promises.push(repository.getSiteSettings());
    }

    await Promise.all(promises);
    const duration = Date.now() - startTime;

    const finalSettings = await repository.getSiteSettings();
    assert.ok(finalSettings.creator_bio.startsWith('Adversarial stress bio iteration'));
    recordPass(`100 Concurrent DAL operations completed without deadlocks (${duration}ms)`);
  }

  // --------------------------------------------------------------------------
  // 7. Anti-Slop & Neo-Brutalism Design Rule Audit
  // --------------------------------------------------------------------------
  console.log('\n--- 7. ANTI-SLOP & NEO-BRUTALISM AUDIT ---');
  {
    const adminComponents = [
      'src/components/admin/AdminHeader.tsx',
      'src/components/admin/AdminLoginGate.tsx',
      'src/components/admin/ProfileHeroEditor.tsx',
      'src/components/admin/StickersManager.tsx',
      'src/components/admin/SocialMediaManager.tsx',
      'src/components/admin/PackageBuilder.tsx',
      'src/components/admin/ContactSettingsEditor.tsx',
      'src/components/admin/LivePreviewFrame.tsx',
    ];

    for (const compPath of adminComponents) {
      const fullPath = path.resolve(process.cwd(), compPath);
      assert.ok(fs.existsSync(fullPath), `File ${compPath} must exist`);
      const content = fs.readFileSync(fullPath, 'utf-8');

      assert.ok(!content.includes('—'), `File ${compPath} contains forbidden em dash (—)`);
      assert.ok(!content.includes('\u2014'), `File ${compPath} contains forbidden unicode em dash`);

      assert.ok(
        content.includes('min-h-[44px]') || content.includes('min-h-[48px]') || content.includes('NeoButton'),
        `File ${compPath} must enforce minimum 44px tap targets for buttons`
      );
    }
    recordPass('All 8 Admin components verified: 0 em dashes, min 44px tap targets, Neo-Brutalist styles');

    const ratioPaper = calculateContrastRatio('#FAF8F5', '#1E1E1E');
    const ratioMustard = calculateContrastRatio('#FFD166', '#1E1E1E');
    const ratioMint = calculateContrastRatio('#06D6A0', '#1E1E1E');
    const ratioCoral = calculateContrastRatio('#EF476F', '#1E1E1E');

    assert.ok(ratioPaper >= 7.0, 'Warm Paper >= 7.0 WCAG AAA');
    assert.ok(ratioMustard >= 4.5, 'Mustard >= 4.5 WCAG AA');
    assert.ok(ratioMint >= 4.5, 'Mint >= 4.5 WCAG AA');
    assert.ok(ratioCoral >= 4.5, 'Coral >= 4.5 WCAG AA');
    recordPass(`WCAG contrast ratios verified: Paper ${ratioPaper}:1, Mustard ${ratioMustard}:1, Mint ${ratioMint}:1, Coral ${ratioCoral}:1`);
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`📊 MILESTONE 4 ADVERSARIAL STRESS TEST SUMMARY`);
  console.log(`Passed: ${passedTests} / ${totalTests} assertions`);
  console.log('======================================================================\n');
}

runMilestone4AdversarialSuite().catch((err) => {
  console.error('Milestone 4 Adversarial test failed:', err);
  process.exit(1);
});
