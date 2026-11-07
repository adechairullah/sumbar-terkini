import { EndorsePackage } from '@/types';

/**
 * Format IDR currency with Indonesian locale thousand separators.
 * Example: 2500000 -> "Rp 2.500.000"
 */
export function formatIDR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Compact number formatting for high volume metrics (e.g. 1.2M, 854K).
 */
export function formatCompactNumber(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (absVal >= 1000000) {
    const formatted = (absVal / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${isNegative ? '-' : ''}${formatted}M`;
  }
  if (absVal >= 1000) {
    const formatted = (absVal / 1000).toFixed(0);
    return `${isNegative ? '-' : ''}${formatted}K`;
  }
  return `${isNegative ? '-' : ''}${Math.round(absVal).toLocaleString('id-ID')}`;
}

/**
 * Tier discount calculation strictly matching E2E test contracts.
 * - 0 packages: 0% discount, 0 total, 'Pilih Paket'
 * - 1 package: 0% discount, 'Starter Package'
 * - 2 packages: 5% discount, 'Growth Duo'
 * - 3+ packages: 10% discount, 'VIP Viral Bundle'
 */
export function calculateDiscountTier(selectedPackages: EndorsePackage[]): {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  tierName: string;
  hasHiddenPrice: boolean;
} {
  if (!Array.isArray(selectedPackages) || selectedPackages.length === 0) {
    return {
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      tierName: 'Pilih Paket',
      hasHiddenPrice: false,
    };
  }

  const hasHiddenPrice = selectedPackages.some((pkg) => pkg.is_price_hidden);
  const subtotal = selectedPackages.reduce(
    (sum, pkg) => sum + (pkg.is_price_hidden ? 0 : pkg.price || 0),
    0
  );

  const count = selectedPackages.length;
  let discountPercent = 0;
  let tierName = 'Starter Package';

  if (count === 1) {
    discountPercent = 0;
    tierName = 'Starter Package';
  } else if (count === 2) {
    discountPercent = 5;
    tierName = 'Growth Duo';
  } else if (count >= 3) {
    discountPercent = 10;
    tierName = 'VIP Viral Bundle';
  }

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    total,
    tierName,
    hasHiddenPrice,
  };
}

/**
 * Automatic Engagement Rate (ER) calculation helper.
 * Formula: ((Likes + Comments) / Followers) * 100
 * Clamped & rounded to 2 decimal places. Returns 0 when followers <= 0.
 */
export function calculateER(avgLikes: number, avgComments: number, followers: number): number {
  if (typeof followers !== 'number' || followers <= 0 || isNaN(followers)) {
    return 0;
  }
  const safeLikes = Math.max(0, typeof avgLikes === 'number' && !isNaN(avgLikes) ? avgLikes : 0);
  const safeComments = Math.max(0, typeof avgComments === 'number' && !isNaN(avgComments) ? avgComments : 0);
  const rawER = ((safeLikes + safeComments) / followers) * 100;
  return Math.round(rawER * 100) / 100;
}

/**
 * WCAG 2.1 Color Contrast Ratio calculation (Relative Luminance formula).
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  function getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const [rLum = 0, gLum = 0, bLum = 0] = [r, g, b].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  }

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}
