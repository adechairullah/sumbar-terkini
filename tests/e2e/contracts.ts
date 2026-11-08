/**
 * Authoritative Interface Contracts and Reference Implementations
 * Strictly derived from PROJECT.md, ORIGINAL_REQUEST.md, and TEST_INFRA.md.
 */

export interface SiteSettings {
  id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar_url: string;
  creator_bio: string;
  slot_available: boolean;
  slot_status_text: string;
  theme_preset: 'neo-warm' | 'neo-mint' | 'neo-mustard';
  stickers: Array<{ id: string; text: string; emoji: string; rotation: number }>;
  whatsapp_number: string;
  whatsapp_template: string;
  business_email: string;
  media_kit_pdf_url: string;
  updated_at: string;
}

export interface SocialPlatform {
  id: string;
  platform_id: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x';
  platform_name: string;
  handle: string;
  profile_url: string;
  sync_mode: 'MANUAL' | 'AUTO_API';
  followers_count: number;
  engagement_rate: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  demographics: {
    gender: { male: number; female: number };
    top_cities: Array<{ city: string; percentage: number }>;
  };
  api_config?: {
    endpoint?: string;
    account_id?: string;
  };
  sort_order: number;
  is_active: boolean;
  last_synced_at: string;
  updated_at: string;
}

export interface EndorsePackage {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'cross-platform';
  price: number;
  description: string;
  deliverables: string[];
  is_popular: boolean;
  is_price_hidden: boolean;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface VisitorReaction {
  reaction_type: 'fire' | 'rocket' | 'heart';
  count: number;
  updated_at: string;
}

export interface SyncSocialsResponse {
  success: boolean;
  timestamp: string;
  synced_platforms: Array<{
    platform_id: string;
    status: 'synced' | 'cached_fallback' | 'skipped_manual';
    sync_mode: 'AUTO_API' | 'MANUAL';
    metrics: {
      followers_count: number;
      engagement_rate: number;
      avg_views: number;
      avg_likes: number;
      avg_comments: number;
    };
    cached_fallback_used: boolean;
  }>;
}

/**
 * Standard Indonesian Seed Dataset (PROJECT.md & TEST_INFRA.md)
 */
export const seedSiteSettings: SiteSettings = {
  id: 'site-settings-singleton',
  creator_name: 'Sumbar Terkini',
  creator_handle: '@sumbar_terkini',
  creator_avatar_url: '/avatar-sumbar.jpg',
  creator_bio: 'Portal Informasi Terkini & Kreator Konten Viral Terbesar di Sumatera Barat. Menjangkau jutaan audiens Ranah Minang.',
  slot_available: true,
  slot_status_text: 'Slot Endorsement Tersedia: 3 Slot Minggu Ini',
  theme_preset: 'neo-warm',
  stickers: [
    { id: 'stk-1', text: '100% Organic Reach', emoji: '🌱', rotation: -4 },
    { id: 'stk-2', text: 'Fast Response', emoji: '⚡', rotation: 3 },
    { id: 'stk-3', text: 'Viral Maker', emoji: '🔥', rotation: -2 }
  ],
  whatsapp_number: '6281234567890',
  whatsapp_template: 'Halo Admin Sumbar Terkini! Saya ingin booking endorsement untuk brand saya.',
  business_email: 'mrrobot4444@gmail.com',
  media_kit_pdf_url: '/media-kit-sumbar-terkini-2026.pdf',
  updated_at: '2026-11-07T04:00:00Z'
};

export const seedSocialPlatforms: SocialPlatform[] = [
  {
    id: 'sp-ig',
    platform_id: 'instagram',
    platform_name: 'Instagram',
    handle: '@sumbar_terkini',
    profile_url: 'https://instagram.com/sumbar_terkini',
    sync_mode: 'AUTO_API',
    followers_count: 854200,
    engagement_rate: 4.85,
    avg_views: 182000,
    avg_likes: 38200,
    avg_comments: 3250,
    demographics: {
      gender: { male: 48, female: 52 },
      top_cities: [
        { city: 'Padang', percentage: 42 },
        { city: 'Bukittinggi', percentage: 24 },
        { city: 'Payakumbuh', percentage: 16 },
        { city: 'Pariaman', percentage: 10 },
        { city: 'Solok', percentage: 8 }
      ]
    },
    sort_order: 1,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00Z',
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'sp-tiktok',
    platform_id: 'tiktok',
    platform_name: 'TikTok',
    handle: '@sumbar.terkini',
    profile_url: 'https://tiktok.com/@sumbar.terkini',
    sync_mode: 'AUTO_API',
    followers_count: 1240000,
    engagement_rate: 6.42,
    avg_views: 450000,
    avg_likes: 72000,
    avg_comments: 7600,
    demographics: {
      gender: { male: 45, female: 55 },
      top_cities: [
        { city: 'Padang', percentage: 38 },
        { city: 'Bukittinggi', percentage: 22 },
        { city: 'Pekanbaru', percentage: 18 },
        { city: 'Payakumbuh', percentage: 12 },
        { city: 'Jabodetabek', percentage: 10 }
      ]
    },
    sort_order: 2,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00Z',
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'sp-yt',
    platform_id: 'youtube',
    platform_name: 'YouTube',
    handle: 'SumbarTerkiniOfficial',
    profile_url: 'https://youtube.com/@SumbarTerkiniOfficial',
    sync_mode: 'AUTO_API',
    followers_count: 315000,
    engagement_rate: 5.12,
    avg_views: 95000,
    avg_likes: 4200,
    avg_comments: 660,
    demographics: {
      gender: { male: 62, female: 38 },
      top_cities: [
        { city: 'Padang', percentage: 40 },
        { city: 'Jabodetabek', percentage: 25 },
        { city: 'Bukittinggi', percentage: 15 },
        { city: 'Medan', percentage: 10 },
        { city: 'Bandung', percentage: 10 }
      ]
    },
    sort_order: 3,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00Z',
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'sp-fb',
    platform_id: 'facebook',
    platform_name: 'Facebook',
    handle: 'SumbarTerkiniNews',
    profile_url: 'https://facebook.com/SumbarTerkiniNews',
    sync_mode: 'MANUAL',
    followers_count: 520000,
    engagement_rate: 3.15,
    avg_views: 65000,
    avg_likes: 14200,
    avg_comments: 2180,
    demographics: {
      gender: { male: 54, female: 46 },
      top_cities: [
        { city: 'Padang', percentage: 45 },
        { city: 'Pariaman', percentage: 18 },
        { city: 'Bukittinggi', percentage: 15 },
        { city: 'Solok', percentage: 12 },
        { city: 'Agam', percentage: 10 }
      ]
    },
    sort_order: 4,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00Z',
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'sp-x',
    platform_id: 'x',
    platform_name: 'X (Twitter)',
    handle: '@sumbar_terkini',
    profile_url: 'https://x.com/sumbar_terkini',
    sync_mode: 'AUTO_API',
    followers_count: 185000,
    engagement_rate: 2.84,
    avg_views: 42000,
    avg_likes: 4200,
    avg_comments: 1050,
    demographics: {
      gender: { male: 58, female: 42 },
      top_cities: [
        { city: 'Padang', percentage: 50 },
        { city: 'Jabodetabek', percentage: 22 },
        { city: 'Bukittinggi', percentage: 14 },
        { city: 'Bandung', percentage: 8 },
        { city: 'Yogyakarta', percentage: 6 }
      ]
    },
    sort_order: 5,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00Z',
    updated_at: '2026-11-07T04:00:00Z'
  }
];

export const seedEndorsePackages: EndorsePackage[] = [
  {
    id: 'pkg-ig-story',
    name: 'Instagram Story (3x Slides + Link)',
    platform: 'instagram',
    price: 750000,
    description: '3 slide berurutan dengan swipe-up/sticker link dan call-to-action menarik.',
    deliverables: ['3x IG Story Slides', 'Direct Link Sticker', '24 Jam Tayang', 'Insight Screenshot'],
    is_popular: false,
    is_price_hidden: false,
    sort_order: 1,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'pkg-ig-reels',
    name: 'Instagram Reels Video Viral',
    platform: 'instagram',
    price: 2500000,
    description: 'Video sinematik 60 detik diproduksi tim kreatif Sumbar Terkini, posting di prime time.',
    deliverables: ['1x Reels Video (HD 1080p)', 'Voiceover Minang/Indonesia', 'Collab Post Tag', 'Pinned 7 Hari'],
    is_popular: true,
    is_price_hidden: false,
    sort_order: 2,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'pkg-tiktok-video',
    name: 'TikTok Dedicated Feature Video',
    platform: 'tiktok',
    price: 2200000,
    description: 'Konten storytelling / review produk dengan hook kuat dan trending audio.',
    deliverables: ['1x TikTok Video (9:16 HD)', 'Original Audio Hook', 'Caption & Hashtag SEO', 'Pinned 7 Hari'],
    is_popular: true,
    is_price_hidden: false,
    sort_order: 3,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'pkg-youtube-review',
    name: 'YouTube Dedicated Review & Liputan',
    platform: 'youtube',
    price: 4500000,
    description: 'Liputan mendalam 5-10 menit untuk brand/bisnis dengan kualitas sinematik 4K.',
    deliverables: ['1x Full Episode Video (4K)', 'Custom Thumbnail Clickable', 'Permanent Video Listing', 'Link di Deskripsi & Pinned Comment'],
    is_popular: false,
    is_price_hidden: false,
    sort_order: 4,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'pkg-cross-bundle',
    name: 'Mega Viral Cross-Platform Campaign',
    platform: 'cross-platform',
    price: 8000000,
    description: 'Paket terintegrasi tayang serentak di Instagram Reels, TikTok, Facebook, dan X.',
    deliverables: ['1x IG Reels + 3x Story', '1x TikTok Video', '1x Facebook Post Video', '1x Thread X Promo', 'Laporan Analytics Lengkap'],
    is_popular: false,
    is_price_hidden: false,
    sort_order: 5,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  },
  {
    id: 'pkg-vip-exclusive',
    name: 'Brand Ambassador & Exclusive Retainer',
    platform: 'cross-platform',
    price: 0,
    description: 'Kolaborasi eksklusif 3 bulan meliputi hak cipta konten, event kehadiran langsung, dan kampanye multi-channel.',
    deliverables: ['Eksklusivitas Kategori Brand', '12x Konten Multi-Platform', 'Live Attendance Brand Event', 'Dedicated Campaign Manager'],
    is_popular: false,
    is_price_hidden: true,
    sort_order: 6,
    is_active: true,
    updated_at: '2026-11-07T04:00:00Z'
  }
];

export const seedVisitorReactions: VisitorReaction[] = [
  { reaction_type: 'fire', count: 12480, updated_at: '2026-11-07T04:00:00Z' },
  { reaction_type: 'rocket', count: 8730, updated_at: '2026-11-07T04:00:00Z' },
  { reaction_type: 'heart', count: 15920, updated_at: '2026-11-07T04:00:00Z' }
];

/**
 * 1. Automatic Engagement Rate (ER) Calculation Helper
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
 * 2. Rate Card Tier Discount Calculator
 * - 0 packages: 0% discount, 0 total, 'No Package'
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
      hasHiddenPrice: false
    };
  }

  const hasHiddenPrice = selectedPackages.some(pkg => pkg.is_price_hidden);
  const subtotal = selectedPackages.reduce((sum, pkg) => sum + (pkg.is_price_hidden ? 0 : (pkg.price || 0)), 0);

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
    hasHiddenPrice
  };
}

/**
 * 3. Currency Formatter (Indonesian Rupiah)
 */
export function formatIDR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * 4. WhatsApp Phone Number Normalizer
 * Converts local Indonesian numbers (08xxx), international (+62xxx, 62xxx),
 * stripping non-digit characters.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * 5. Pre-formatted WhatsApp Order URL Generator
 */
export function generateWhatsAppUrl(params: {
  phone: string;
  template?: string;
  selectedPackages: EndorsePackage[];
  creatorName?: string;
}): string {
  const cleanPhone = normalizePhoneNumber(params.phone || '6281234567890');
  const creator = params.creatorName || 'Sumbar Terkini';
  const calculation = calculateDiscountTier(params.selectedPackages);

  const deliverablesLines = params.selectedPackages.map((pkg, idx) => {
    const priceText = pkg.is_price_hidden ? 'Negosiasi Khusus' : formatIDR(pkg.price);
    return `${idx + 1}. *${pkg.name}* (${priceText})`;
  }).join('\n');

  let messageText = `Halo Admin *${creator}*! 👋\n\n`;
  messageText += `Saya tertarik untuk melakukan booking endorsement media kit dengan rincian berikut:\n\n`;
  messageText += `📦 *Paket Deliverable:*\n${deliverablesLines || '- Belum memilih paket'}\n\n`;

  if (params.selectedPackages.length > 0) {
    messageText += `🏷️ *Tier:* ${calculation.tierName}\n`;
    if (calculation.discountPercent > 0) {
      messageText += `✨ *Diskon:* ${calculation.discountPercent}% (-${formatIDR(calculation.discountAmount)})\n`;
    }
    if (calculation.hasHiddenPrice) {
      messageText += `💰 *Estimasi Total:* ${formatIDR(calculation.total)} (+ Paket Negosiasi Khusus)\n\n`;
    } else {
      messageText += `💰 *Total Investasi:* ${formatIDR(calculation.total)}\n\n`;
    }
  }

  messageText += `Mohon info ketersediaan slot jadwal dan tahapan selanjutnya. Terima kasih!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * 6. WCAG 2.1 Color Contrast Ratio Calculation (Relative Luminance Formula)
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  function getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const sRGB = [r, g, b].map(val => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * 7. Mock Smart Cache Layer for API Adapters
 */
export class SmartCacheLayer<T> {
  private cache: Map<string, { data: T; expiresAt: number }> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number = 3600) {
    this.ttlMs = ttlSeconds * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  clear(): void {
    this.cache.clear();
  }
}
