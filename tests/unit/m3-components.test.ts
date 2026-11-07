import assert from 'node:assert/strict';
import {
  formatIDR,
  formatCompactNumber,
  calculateDiscountTier,
  calculateER,
  calculateContrastRatio,
} from '../../src/lib/utils/formatters';
import {
  normalizePhoneNumber,
  generateWhatsAppUrl,
} from '../../src/lib/utils/whatsapp';
import {
  normalizeGenderPercentages,
} from '../../src/components/socials/DemographicsBar';
import {
  getErStatus,
} from '../../src/components/socials/BentoCard';
import {
  getBentoGridSpan,
} from '../../src/components/socials/BentoGrid';
import { seedEndorsePackages } from '../e2e/contracts';

async function runMilestone3UnitTests() {
  console.log('--- Testing M3 Currency & Compact Formatters ---');
  assert.equal(formatIDR(0), 'Rp 0');
  assert.equal(formatIDR(750000), 'Rp 750.000');
  assert.equal(formatIDR(2500000), 'Rp 2.500.000');
  assert.equal(formatIDR(NaN), 'Rp 0');

  assert.equal(formatCompactNumber(1240000), '1.2M');
  assert.equal(formatCompactNumber(854200), '854K');
  assert.equal(formatCompactNumber(500), '500');
  assert.equal(formatCompactNumber(0), '0');
  assert.equal(formatCompactNumber(-1500000), '-1.5M');

  console.log('--- Testing M3 Rate Tier Discount Engine ---');
  // 0 packages
  const emptyTier = calculateDiscountTier([]);
  assert.equal(emptyTier.subtotal, 0);
  assert.equal(emptyTier.discountPercent, 0);
  assert.equal(emptyTier.discountAmount, 0);
  assert.equal(emptyTier.total, 0);
  assert.equal(emptyTier.tierName, 'Pilih Paket');

  // 1 package (Starter)
  const starterTier = calculateDiscountTier([seedEndorsePackages[1]!]);
  assert.equal(starterTier.discountPercent, 0);
  assert.equal(starterTier.tierName, 'Starter Package');
  assert.equal(starterTier.total, 2500000);

  // 2 packages (Growth Duo 5%)
  const duoTier = calculateDiscountTier([seedEndorsePackages[0]!, seedEndorsePackages[1]!]);
  assert.equal(duoTier.discountPercent, 5);
  assert.equal(duoTier.tierName, 'Growth Duo');
  assert.equal(duoTier.subtotal, 3250000);
  assert.equal(duoTier.discountAmount, 162500);
  assert.equal(duoTier.total, 3087500);

  // 3 packages (VIP Viral Bundle 10%)
  const vipTier = calculateDiscountTier([
    seedEndorsePackages[0]!,
    seedEndorsePackages[1]!,
    seedEndorsePackages[2]!,
  ]);
  assert.equal(vipTier.discountPercent, 10);
  assert.equal(vipTier.tierName, 'VIP Viral Bundle');
  assert.equal(vipTier.subtotal, 5450000);
  assert.equal(vipTier.discountAmount, 545000);
  assert.equal(vipTier.total, 4905000);

  console.log('--- Testing M3 ER Helper & WCAG Contrast ---');
  assert.equal(calculateER(38200, 3250, 854200), 4.85);
  assert.equal(calculateER(0, 0, 0), 0);
  assert.equal(calculateER(100, 50, -100), 0);

  const darkInk = '#1E1E1E';
  assert.ok(calculateContrastRatio('#FFD166', darkInk) >= 4.5);
  assert.ok(calculateContrastRatio('#06D6A0', darkInk) >= 4.5);
  assert.ok(calculateContrastRatio('#EF476F', darkInk) >= 4.5);
  assert.ok(calculateContrastRatio('#FAF8F5', darkInk) >= 7.0);

  console.log('--- Testing M3 WhatsApp URL & Phone Normalizer ---');
  assert.equal(normalizePhoneNumber('0812-3456-7890'), '6281234567890');
  assert.equal(normalizePhoneNumber('+62 812-3456-7890'), '6281234567890');
  assert.equal(normalizePhoneNumber('6281234567890'), '6281234567890');
  assert.equal(normalizePhoneNumber(''), '');

  const waUrl = generateWhatsAppUrl({
    phone: '081234567890',
    creatorName: 'Sumbar Terkini',
    selectedPackages: [seedEndorsePackages[0]!, seedEndorsePackages[1]!],
  });
  assert.ok(waUrl.startsWith('https://wa.me/6281234567890'));
  assert.ok(decodeURIComponent(waUrl).includes('Growth Duo'));
  assert.ok(decodeURIComponent(waUrl).includes('Rp 3.087.500'));

  console.log('--- Testing Demographics & Bento Layout Spans ---');
  const normalizedGender = normalizeGenderPercentages(43, 57);
  assert.equal(normalizedGender.male + normalizedGender.female, 100);
  assert.equal(normalizedGender.male, 43);
  assert.equal(normalizedGender.female, 57);

  const zeroGender = normalizeGenderPercentages(0, 0);
  assert.equal(zeroGender.male, 50);
  assert.equal(zeroGender.female, 50);

  assert.equal(getErStatus(5.5).status, 'Viral Maker');
  assert.equal(getErStatus(3.2).status, 'Healthy');
  assert.equal(getErStatus(1.5).status, 'Steady');

  assert.ok(getBentoGridSpan('instagram').includes('lg:col-span-7'));
  assert.ok(getBentoGridSpan('tiktok').includes('lg:col-span-5'));
  assert.ok(getBentoGridSpan('youtube').includes('lg:col-span-4'));

  console.log('✅ ALL M3 UNIT ASSERTIONS PASSED CLEANLY!');
}

runMilestone3UnitTests().catch((err) => {
  console.error('M3 unit test failed:', err);
  process.exit(1);
});

