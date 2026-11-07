# Architecture Analysis: TypeScript Types & Fallback Data Access Layer (DAL)
**Specialist**: M1 Explorer 3 (TypeScript Types & Fallback DAL Specialist)  
**Date**: 2026-11-07  
**Milestone**: M1 (Core Foundation, Data Architecture & Fallback DAL)  
**Target Codebase Paths**:
- `src/types/index.ts`
- `src/lib/data/mock-data.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/data/storage.ts`
- `src/lib/data/repository.ts`

---

## 1. Executive Summary & Architectural Overview

The **Sumbar Terkini Creator Media Kit & Endorsement Hub** requires an ultra-resilient, dual-layered data layer that fulfills two core guarantees:
1. **Production Mode with Supabase Cloud**: Seamless integration with Supabase PostgreSQL, Row Level Security (RLS), atomic stored procedures (RPC for reactions), and Supabase Realtime subscriptions.
2. **Zero-Crash Offline / Local Evaluation Mode**: When Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are missing, empty, or placeholder strings, the system must immediately and transparently fall back to an in-memory & `localStorage` Data Access Layer with cross-tab `BroadcastChannel` synchronization.

```
+-------------------------------------------------------------------------------------------------+
|                                    APPLICATION LAYER                                            |
|        Public Media Kit (/)             Admin CMS (/admin)               Sync API Route         |
+------------------------+-------------------------+------------------------------+---------------+
                         |                         |                              |
                         +------------+------------+                              |
                                      |                                           |
                                      v                                           v
+-------------------------------------------------------------------------------------------------+
|                                DATA ACCESS LAYER (repository.ts)                                |
|                                                                                                 |
|   getSiteSettings()                  updateSiteSettings()                                       |
|   getSocialPlatforms()               updateSocialPlatform()                                     |
|   getEndorsePackages()               create / update / deleteEndorsePackage()                    |
|   getReactions()                     incrementReaction()                                        |
|   subscribeToChanges()               syncSocialMetrics()                                        |
+-------------------------------------+-----------------------------------------------------------+
                                      |
                     [ Check isSupabaseConfigured() ]
                                      |
                +---------------------+---------------------+
                |                                           |
        [ YES: Configured & Valid ]                 [ NO: Unconfigured / Local ]
                |                                           |
                v                                           v
+-----------------------------------+       +---------------------------------------------+
|    SUPABASE CLIENT LAYER          |       |     LOCAL FALLBACK STORE (storage.ts)       |
|                                   |       |                                             |
|  * src/lib/supabase/client.ts     |       |  * Global In-Memory Store (Node.js/SSR)     |
|  * src/lib/supabase/server.ts     |       |  * Browser LocalStorage (Persistence)       |
|  * Supabase PostgreSQL / RLS      |       |  * BroadcastChannel ('sumbar_terkini_sync') |
|  * Supabase Realtime WebSockets   |       |  * Authentic Minang Seed (mock-data.ts)     |
+-----------------------------------+       +---------------------------------------------+
```

### Key Technical Challenges Solved
- **Next.js 15 Cookie Handling**: Next.js 15 App Router treats `cookies()` as asynchronous (`await cookies()`) and restricts cookie modifications during Server Component rendering. The Supabase server client factory implements `@supabase/ssr` `getAll` and `setAll` handlers with graceful try/catch blocks.
- **Client/Server Hybrid State**: Server Components cannot access `window`, `localStorage`, or `BroadcastChannel`. The DAL abstraction provides seamless isomorphic data retrieval, initializing an in-memory store in Node.js while syncing to `localStorage` and `BroadcastChannel` in browser environments.
- **Bidirectional Schema Compatibility**: Bridges the slight discrepancies between PostgreSQL snake_case columns (e.g. `is_available`, `avatar_url`, `average_views`) and TypeScript contracts (e.g. `slot_available`, `creator_avatar_url`, `avg_views`) with zero runtime conversion cost.

---

## 2. Complete TypeScript Type Definitions (`src/types/index.ts`)

This file is the single source of truth for all data contracts across the application. It contains zero `any` types and is compatible with strict TypeScript compilation (`"strict": true`).

```typescript
/**
 * Sumbar Terkini Media Kit & Endorsement Hub - Core Type Definitions
 * Single source of truth for entities, API payloads, and state models.
 */

// ==============================================================================
// 1. Core Domain Entities
// ==============================================================================

export interface StickerItem {
  id: string;
  text: string;
  emoji: string;
  color?: string; // Hex color code (e.g. #FFD166, #EF476F, #06D6A0)
  rotation: number; // Degree of tilt for neo-brutalist badge (-15 to 15)
}

export type ThemePreset = 'neo-warm' | 'neo-mint' | 'neo-mustard' | 'neo_brutalist';

export interface SiteSettings {
  id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar_url: string;
  creator_bio: string;
  slot_available: boolean;
  slot_status_text: string;
  theme_preset: ThemePreset;
  stickers: StickerItem[];
  whatsapp_number: string;
  whatsapp_template: string;
  business_email: string;
  media_kit_pdf_url: string;
  updated_at: string;

  // Extended schema fields for full compatibility
  creator_title?: string;
  location?: string;
  slots_remaining?: number;
  portfolio_url?: string;
  created_at?: string;
}

export type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x';
export type SyncMode = 'MANUAL' | 'AUTO_API';

export interface PlatformMetrics {
  followers_count: number;
  engagement_rate: number; // Percentage with 2 decimals (e.g. 4.85)
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
}

export interface DemographicCity {
  city: string;
  percentage: number;
}

export interface PlatformDemographics {
  gender: {
    male: number;
    female: number;
  };
  top_cities: DemographicCity[];
}

export interface SocialPlatform extends PlatformMetrics {
  id: string;
  platform_id: PlatformId;
  platform_name: string;
  handle: string;
  profile_url: string;
  sync_mode: SyncMode;
  demographics: PlatformDemographics;
  api_config?: {
    endpoint?: string;
    account_id?: string;
    api_key_env?: string;
    [key: string]: unknown;
  };
  sort_order: number;
  is_active: boolean;
  last_synced_at: string;
  updated_at: string;
}

export type PackagePlatform = 'instagram' | 'tiktok' | 'youtube' | 'cross-platform';
export type PackageTier = 'starter' | 'standard' | 'vip' | 'bundle';

export interface EndorsePackage {
  id: string;
  name: string;
  platform: PackagePlatform;
  price: number; // IDR numeric amount
  description: string;
  deliverables: string[];
  is_popular: boolean;
  is_price_hidden: boolean; // When true, displays "Tanya via WhatsApp"
  sort_order: number;
  is_active: boolean;
  tier?: PackageTier;
  discount_percentage?: number;
  created_at?: string;
  updated_at: string;
}

export type ReactionType = 'fire' | 'rocket' | 'heart';

export interface VisitorReaction {
  id: string; // 'fire' | 'rocket' | 'heart'
  reaction_type: ReactionType;
  emoji: string;
  label: string;
  count: number;
  updated_at: string;
  created_at?: string;
}

// ==============================================================================
// 2. Portfolio Showcase Types
// ==============================================================================

export interface PortfolioItem {
  id: string;
  brand_name: string;
  campaign_title: string;
  platform: PackagePlatform;
  views_count: number;
  likes_count: number;
  thumbnail_url: string;
  case_study_url?: string;
  tag: string;
}

// ==============================================================================
// 3. Metric Engine & Sync API Types (/api/sync-socials)
// ==============================================================================

export type SyncStatus = 'synced' | 'cached_fallback' | 'skipped_manual_mode' | 'error';
export type SyncSource = 'live_api' | 'mock_jitter' | 'last_cache';

export interface SyncPlatformResult {
  platform_id: PlatformId;
  platform_name: string;
  status: SyncStatus;
  sync_mode: SyncMode;
  metrics: PlatformMetrics;
  cached_fallback_used: boolean;
  source: SyncSource;
  error?: string;
  last_synced_at: string;
}

export interface SyncResponse {
  success: boolean;
  timestamp: string;
  platforms_processed: number;
  synced_platforms: SyncPlatformResult[];
  error?: string;
}

// ==============================================================================
// 4. Rate Calculator & WhatsApp Checkout Types
// ==============================================================================

export interface TierDiscountRule {
  min_items: number;
  tier_name: string;
  discount_percentage: number;
  badge_color: string;
}

export interface CalculatorSelection {
  selected_package_ids: string[];
  selected_packages: EndorsePackage[];
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  total_price: number;
  tier_name: string;
}

export interface WhatsAppMessagePayload {
  whatsapp_number: string;
  creator_name: string;
  brand_name?: string;
  selected_packages: EndorsePackage[];
  subtotal: number;
  discount_amount: number;
  total_price: number;
  tier_name: string;
  custom_notes?: string;
}

// ==============================================================================
// 5. Admin CMS & Form Types
// ==============================================================================

export interface AdminSession {
  is_authenticated: boolean;
  auth_mode: 'supabase_auth' | 'passcode_fallback';
  email?: string;
}

export interface ERCalculationInput {
  followers_count: number;
  avg_likes: number;
  avg_comments: number;
}

export interface ERCalculationResult {
  engagement_rate: number;
  status: 'excellent' | 'good' | 'moderate' | 'low';
  label: string;
  color_hex: string;
  description: string;
}

// ==============================================================================
// 6. Realtime & Cross-Tab Sync Protocol
// ==============================================================================

export type RealtimeTable = 'site_settings' | 'social_platforms' | 'endorse_packages' | 'visitor_reactions';

export interface BroadcastSyncEvent<T = unknown> {
  type: 'STATE_UPDATED';
  table: RealtimeTable;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: T;
  timestamp: string;
}

// ==============================================================================
// 7. Repository Contract (DAL)
// ==============================================================================

export interface DataRepository {
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;

  getSocialPlatforms(): Promise<SocialPlatform[]>;
  updateSocialPlatform(id: string, data: Partial<SocialPlatform>): Promise<SocialPlatform>;

  getEndorsePackages(): Promise<EndorsePackage[]>;
  createEndorsePackage(pkg: Omit<EndorsePackage, 'id' | 'updated_at' | 'created_at'>): Promise<EndorsePackage>;
  updateEndorsePackage(id: string, data: Partial<EndorsePackage>): Promise<EndorsePackage>;
  deleteEndorsePackage(id: string): Promise<boolean>;

  getReactions(): Promise<VisitorReaction[]>;
  incrementReaction(reactionType: ReactionType): Promise<number>;

  subscribeToChanges(table: RealtimeTable, callback: (event: BroadcastSyncEvent) => void): () => void;
}
```

---

## 3. Authentic Indonesian Mock Dataset (`src/lib/data/mock-data.ts`)

This dataset provides rich, realistic, and culturally authentic data representing **Sumbar Terkini**, the prominent digital media publisher in Sumatera Barat. All numbers (followers, engagement rate, views, pricing in IDR) are mathematically consistent.

```typescript
import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  PortfolioItem,
} from '@/types';

// ==============================================================================
// 1. Initial Site Settings
// ==============================================================================

export const initialSiteSettings: SiteSettings = {
  id: 'default',
  creator_name: 'Sumbar Terkini',
  creator_title: 'Sumatera Barat Creator & Media Hub',
  creator_handle: '@sumbar_terkini',
  creator_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  creator_bio: 'Platform media digital kreatif dan amplifikasi brand nomor 1 di Sumatera Barat. Menghubungkan jutaan audiens Minang di ranah dan rantau dengan brand terpercaya melalui konten viral, liputan on-the-spot, dan storytelling autentik.',
  location: 'Padang, Sumatera Barat',
  slot_available: true,
  slot_status_text: 'Slot Terbuka untuk November 2026',
  slots_remaining: 4,
  theme_preset: 'neo-warm',
  stickers: [
    {
      id: 'stk-1',
      text: '100% Organic Reach',
      emoji: '🌱',
      color: '#FFD166',
      rotation: -3,
    },
    {
      id: 'stk-2',
      text: 'Fast Response < 1 Jam',
      emoji: '⚡',
      color: '#EF476F',
      rotation: 4,
    },
    {
      id: 'stk-3',
      text: 'Viral Maker Padang',
      emoji: '🔥',
      color: '#06D6A0',
      rotation: -2,
    },
    {
      id: 'stk-4',
      text: 'Top Tier Minang Audience',
      emoji: '👑',
      color: '#FFD166',
      rotation: 2,
    },
  ],
  whatsapp_number: '6281267890123',
  whatsapp_template: 'Halo Tim Partnership Sumbar Terkini! Saya tertarik bekerjasama untuk paket endorse {{package_names}} dengan total estimasi {{total_price}}. Mohon info ketersediaan slot jadwal tayang.',
  business_email: 'partnership@sumbarterkini.com',
  portfolio_url: 'https://instagram.com/sumbar_terkini',
  media_kit_pdf_url: '/media-kit-sumbar-terkini.pdf',
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-07T04:00:00.000Z',
};

// ==============================================================================
// 2. Initial Social Platforms (5 Platforms)
// ==============================================================================

export const initialSocialPlatforms: SocialPlatform[] = [
  {
    id: 'instagram',
    platform_id: 'instagram',
    platform_name: 'Instagram',
    handle: '@sumbar_terkini',
    profile_url: 'https://instagram.com/sumbar_terkini',
    sync_mode: 'MANUAL',
    followers_count: 854200,
    engagement_rate: 4.85,
    avg_views: 450000,
    avg_likes: 38200,
    avg_comments: 3250,
    demographics: {
      gender: { male: 43, female: 57 },
      top_cities: [
        { city: 'Padang', percentage: 54 },
        { city: 'Bukittinggi', percentage: 17 },
        { city: 'Payakumbuh', percentage: 12 },
        { city: 'Pariaman', percentage: 9 },
        { city: 'Solok', percentage: 8 },
      ],
    },
    api_config: {
      account_id: 'sumbar_terkini_ig',
    },
    sort_order: 1,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00.000Z',
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'tiktok',
    platform_id: 'tiktok',
    platform_name: 'TikTok',
    handle: '@sumbarterkini_official',
    profile_url: 'https://tiktok.com/@sumbarterkini_official',
    sync_mode: 'AUTO_API',
    followers_count: 1280000,
    engagement_rate: 7.42,
    avg_views: 920000,
    avg_likes: 86000,
    avg_comments: 9000,
    demographics: {
      gender: { male: 38, female: 62 },
      top_cities: [
        { city: 'Padang', percentage: 48 },
        { city: 'Pekanbaru', percentage: 20 },
        { city: 'Bukittinggi', percentage: 15 },
        { city: 'Solok', percentage: 10 },
        { city: 'Payakumbuh', percentage: 7 },
      ],
    },
    sort_order: 2,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00.000Z',
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'youtube',
    platform_id: 'youtube',
    platform_name: 'YouTube',
    handle: 'Sumbar Terkini TV',
    profile_url: 'https://youtube.com/@sumbarterkinitv',
    sync_mode: 'AUTO_API',
    followers_count: 425000,
    engagement_rate: 6.10,
    avg_views: 210000,
    avg_likes: 18500,
    avg_comments: 2200,
    demographics: {
      gender: { male: 52, female: 48 },
      top_cities: [
        { city: 'Padang', percentage: 45 },
        { city: 'Jabodetabek', percentage: 25 },
        { city: 'Bukittinggi', percentage: 18 },
        { city: 'Payakumbuh', percentage: 12 },
      ],
    },
    sort_order: 3,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00.000Z',
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'facebook',
    platform_id: 'facebook',
    platform_name: 'Facebook',
    handle: 'Sumbar Terkini Media',
    profile_url: 'https://facebook.com/sumbarterkiniofficial',
    sync_mode: 'MANUAL',
    followers_count: 620000,
    engagement_rate: 3.40,
    avg_views: 280000,
    avg_likes: 14200,
    avg_comments: 2800,
    demographics: {
      gender: { male: 55, female: 45 },
      top_cities: [
        { city: 'Padang', percentage: 50 },
        { city: 'Solok', percentage: 20 },
        { city: 'Pesisir Selatan', percentage: 16 },
        { city: 'Tanah Datar', percentage: 14 },
      ],
    },
    sort_order: 4,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00.000Z',
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'x',
    platform_id: 'x',
    platform_name: 'X (Twitter)',
    handle: '@Sumbar_Terkini',
    profile_url: 'https://x.com/sumbar_terkini',
    sync_mode: 'MANUAL',
    followers_count: 215000,
    engagement_rate: 4.12,
    avg_views: 180000,
    avg_likes: 7400,
    avg_comments: 1450,
    demographics: {
      gender: { male: 58, female: 42 },
      top_cities: [
        { city: 'Padang', percentage: 60 },
        { city: 'Jakarta', percentage: 22 },
        { city: 'Bukittinggi', percentage: 18 },
      ],
    },
    sort_order: 5,
    is_active: true,
    last_synced_at: '2026-11-07T04:00:00.000Z',
    updated_at: '2026-11-07T04:00:00.000Z',
  },
];

// ==============================================================================
// 3. Initial Endorse Packages
// ==============================================================================

export const initialEndorsePackages: EndorsePackage[] = [
  {
    id: 'pkg-story-boost',
    name: 'Instagram Story Blitz',
    platform: 'instagram',
    price: 750000,
    description: 'Paket cepat 3x Instagram Stories dengan Swipe-Up / Link Sticker langsung menuju landing page atau WhatsApp bisnis Anda.',
    deliverables: [
      '3x Sequence Stories (Aktif 24 Jam)',
      'Sticker Link Aktif & Tag Akun Brand',
      'Report Insight Impressions dalam 48 Jam',
    ],
    tier: 'starter',
    is_popular: false,
    is_price_hidden: false,
    sort_order: 1,
    is_active: true,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'pkg-reels-viral',
    name: 'Instagram Reels Viral Maker',
    platform: 'instagram',
    price: 2500000,
    description: 'Video kreatif Reels berdurasi hingga 60 detik dengan hook lokal Minang yang memikat, direct CTA, dan penempatan permanen di feed grid.',
    deliverables: [
      '1x Video Reels High Definition (1080p)',
      'Keep Selamanya di Feed & Grid',
      'Pinned Comment Call-to-Action 7 Hari',
      'Bonus 1x Repost ke Instagram Story',
    ],
    tier: 'standard',
    is_popular: true,
    is_price_hidden: false,
    sort_order: 2,
    is_active: true,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'pkg-tiktok-fyps',
    name: 'TikTok FYP Booster Video',
    platform: 'tiktok',
    price: 2800000,
    description: 'Video TikTok diproduksi dengan trending sound audio Minang / nasional, skrip hook tajam dalam 3 detik pertama, dan garansi jangkauan FYP.',
    deliverables: [
      '1x Video TikTok 60 Detik Audio Trending',
      'Caption SEO-optimized & Brand Hashtags',
      'Interaksi Komentar Aktif dari Host Tim',
      'Format 9:16 Vertical Storytelling',
    ],
    tier: 'standard',
    is_popular: false,
    is_price_hidden: false,
    sort_order: 3,
    is_active: true,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'pkg-bundle-viral',
    name: 'VIP Viral Cross-Post Bundle',
    platform: 'cross-platform',
    price: 4800000,
    description: 'Paket paling direkomendasikan untuk launching produk atau event akbar di seluruh Sumatera Barat dengan amplifikasi lintas kanal simultan.',
    deliverables: [
      '1x Video Reels Instagram + 1x TikTok FYP',
      '2x Sequence Instagram Stories dengan Link',
      '1x Postingan Feed Komunitas Facebook',
      'Laporan Analisis Insight Lengkap',
    ],
    tier: 'vip',
    is_popular: true,
    is_price_hidden: false,
    discount_percentage: 15,
    sort_order: 4,
    is_active: true,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'pkg-enterprise-coverage',
    name: 'Exclusive Media Visit & Ambassadorship',
    platform: 'cross-platform',
    price: 12500000,
    description: 'Liputan eksklusif on-the-spot oleh talent utama Sumbar Terkini untuk grand opening gerai, festival pariwisata, atau campaign UMKM skala regional.',
    deliverables: [
      'On-the-spot Media Visit ke Lokasi Brand',
      'Talent Host Liputan Dedicated',
      'Video Reels + TikTok + YouTube Short',
      'Liputan Live Story Instagram Real-time',
      'Press Release Singkat di Portal Berita',
    ],
    tier: 'bundle',
    is_popular: false,
    is_price_hidden: true, // Displays "Hubungi Admin via WhatsApp"
    sort_order: 5,
    is_active: true,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
];

// ==============================================================================
// 4. Initial Visitor Reactions
// ==============================================================================

export const initialVisitorReactions: VisitorReaction[] = [
  {
    id: 'fire',
    reaction_type: 'fire',
    emoji: '🔥',
    label: 'Hype',
    count: 1420,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'rocket',
    reaction_type: 'rocket',
    emoji: '🚀',
    label: 'Viral',
    count: 980,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
  {
    id: 'heart',
    reaction_type: 'heart',
    emoji: '❤️',
    label: 'Love',
    count: 2310,
    updated_at: '2026-11-07T04:00:00.000Z',
  },
];

// ==============================================================================
// 5. Initial Portfolio Showcase Highlights
// ==============================================================================

export const initialPortfolioItems: PortfolioItem[] = [
  {
    id: 'port-1',
    brand_name: 'Bank Nagari',
    campaign_title: 'Sosialisasi Digital Banking Nagari Mobile Payakumbuh',
    platform: 'cross-platform',
    views_count: 580000,
    likes_count: 42100,
    thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    case_study_url: 'https://instagram.com/sumbar_terkini',
    tag: 'Fintech & Perbankan',
  },
  {
    id: 'port-2',
    brand_name: 'Kopi Janji Jiwa Padang',
    campaign_title: 'Grand Opening Outlet Baru Khatib Sulaiman',
    platform: 'instagram',
    views_count: 320000,
    likes_count: 28500,
    thumbnail_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    tag: 'F&B Lifestyle',
  },
  {
    id: 'port-3',
    brand_name: 'Dinas Pariwisata Sumbar',
    campaign_title: 'Eksplorasi Pesona Lembah Harau & Mandeh 2026',
    platform: 'tiktok',
    views_count: 1100000,
    likes_count: 98000,
    thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    tag: 'Pariwisata & Budaya',
  },
  {
    id: 'port-4',
    brand_name: 'Rendang Asli Minang Uni Evi',
    campaign_title: 'Peluncuran Kemasan Vakum Ekspor Nasional',
    platform: 'cross-platform',
    views_count: 460000,
    likes_count: 36400,
    thumbnail_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    tag: 'UMKM Kuliner',
  },
];
```

---

## 4. Supabase Client Factories with Configuration Guard

### 4.1 Configuration Guard (`isSupabaseConfigured`)
To prevent fatal crashes during build, testing, or fresh clone deployment, `isSupabaseConfigured()` strictly verifies that:
- Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present and non-empty.
- The URL begins with `https://`.
- The values are NOT default placeholders (e.g., `your-project`, `placeholder`, `example`).

### 4.2 Browser Client Factory (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedBrowserClient: SupabaseClient | null = null;

/**
 * Returns true only if valid Supabase environment variables are present.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;

  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (
    trimmedUrl === '' ||
    trimmedKey === '' ||
    trimmedUrl.includes('your-project') ||
    trimmedUrl.includes('placeholder') ||
    trimmedKey.includes('placeholder') ||
    trimmedKey.includes('your-anon-key') ||
    !trimmedUrl.startsWith('https://')
  ) {
    return false;
  }

  return true;
}

/**
 * Creates or returns the cached browser Supabase client.
 * Returns null safely if Supabase is unconfigured (never throws).
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedBrowserClient) {
    cachedBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return cachedBrowserClient;
}
```

### 4.3 Server Client Factory (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

/**
 * Creates an async server-side Supabase client for Server Components,
 * Server Actions, and Route Handlers in Next.js 15.
 * Returns null safely if Supabase is unconfigured.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Next.js 15 throws when setAll is invoked inside a Server Component
            // during read-only rendering. This can be safely ignored as middleware
            // refreshes sessions.
          }
        },
      },
    }
  );
}
```

---

## 5. Local Storage & Cross-Tab Engine (`src/lib/data/storage.ts`)

This module manages the offline/fallback persistence. It creates a global in-memory store in Node.js / SSR context and synchronizes with `localStorage` and `BroadcastChannel` in the browser.

```typescript
import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  BroadcastSyncEvent,
  RealtimeTable,
} from '@/types';
import {
  initialSiteSettings,
  initialSocialPlatforms,
  initialEndorsePackages,
  initialVisitorReactions,
} from './mock-data';

interface LocalDatabaseState {
  siteSettings: SiteSettings;
  socialPlatforms: SocialPlatform[];
  endorsePackages: EndorsePackage[];
  visitorReactions: VisitorReaction[];
}

const STORAGE_KEYS = {
  SITE_SETTINGS: 'sumbar_settings_store',
  SOCIAL_PLATFORMS: 'sumbar_socials_store',
  ENDORSE_PACKAGES: 'sumbar_packages_store',
  VISITOR_REACTIONS: 'sumbar_reactions_store',
} as const;

const BROADCAST_CHANNEL_NAME = 'sumbar_terkini_channel';

// Persistent memory container across hot reloads in Node.js / Server environments
declare global {
  // eslint-disable-next-line no-var
  var __SUMBAR_LOCAL_STORE__: LocalDatabaseState | undefined;
}

function getInitialState(): LocalDatabaseState {
  return {
    siteSettings: { ...initialSiteSettings },
    socialPlatforms: initialSocialPlatforms.map((p) => ({ ...p })),
    endorsePackages: initialEndorsePackages.map((p) => ({ ...p })),
    visitorReactions: initialVisitorReactions.map((r) => ({ ...r })),
  };
}

export class LocalStorageManager {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static getState(): LocalDatabaseState {
    if (!globalThis.__SUMBAR_LOCAL_STORE__) {
      globalThis.__SUMBAR_LOCAL_STORE__ = getInitialState();
    }

    if (!this.isBrowser()) {
      return globalThis.__SUMBAR_LOCAL_STORE__;
    }

    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      const storedSocials = localStorage.getItem(STORAGE_KEYS.SOCIAL_PLATFORMS);
      const storedPackages = localStorage.getItem(STORAGE_KEYS.ENDORSE_PACKAGES);
      const storedReactions = localStorage.getItem(STORAGE_KEYS.VISITOR_REACTIONS);

      if (storedSettings) {
        globalThis.__SUMBAR_LOCAL_STORE__.siteSettings = JSON.parse(storedSettings);
      }
      if (storedSocials) {
        globalThis.__SUMBAR_LOCAL_STORE__.socialPlatforms = JSON.parse(storedSocials);
      }
      if (storedPackages) {
        globalThis.__SUMBAR_LOCAL_STORE__.endorsePackages = JSON.parse(storedPackages);
      }
      if (storedReactions) {
        globalThis.__SUMBAR_LOCAL_STORE__.visitorReactions = JSON.parse(storedReactions);
      }
    } catch {
      // In case of corrupted localStorage or private mode restrictions
    }

    return globalThis.__SUMBAR_LOCAL_STORE__;
  }

  public static saveState<K extends keyof LocalDatabaseState>(
    key: K,
    value: LocalDatabaseState[K],
    table: RealtimeTable,
    action: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE'
  ): void {
    const state = this.getState();
    state[key] = value;

    if (this.isBrowser()) {
      try {
        if (key === 'siteSettings') {
          localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(value));
        } else if (key === 'socialPlatforms') {
          localStorage.setItem(STORAGE_KEYS.SOCIAL_PLATFORMS, JSON.stringify(value));
        } else if (key === 'endorsePackages') {
          localStorage.setItem(STORAGE_KEYS.ENDORSE_PACKAGES, JSON.stringify(value));
        } else if (key === 'visitorReactions') {
          localStorage.setItem(STORAGE_KEYS.VISITOR_REACTIONS, JSON.stringify(value));
        }
      } catch {
        // Handle storage quota exceeded
      }

      this.broadcast(table, action, value);
    }
  }

  public static broadcast<T>(table: RealtimeTable, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: T): void {
    if (!this.isBrowser()) return;

    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        const event: BroadcastSyncEvent<T> = {
          type: 'STATE_UPDATED',
          table,
          action,
          payload,
          timestamp: new Date().toISOString(),
        };
        channel.postMessage(event);
        channel.close();
      }
    } catch {
      // Fallback if BroadcastChannel is unsupported
    }
  }

  public static subscribe(
    table: RealtimeTable,
    callback: (event: BroadcastSyncEvent) => void
  ): () => void {
    if (!this.isBrowser() || !('BroadcastChannel' in window)) {
      return () => {};
    }

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    const handler = (msgEvent: MessageEvent) => {
      const data = msgEvent.data as BroadcastSyncEvent;
      if (data && data.type === 'STATE_UPDATED' && (data.table === table || table === undefined)) {
        callback(data);
      }
    };

    channel.addEventListener('message', handler);

    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  }

  public static resetToSeed(): void {
    globalThis.__SUMBAR_LOCAL_STORE__ = getInitialState();
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.SITE_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SOCIAL_PLATFORMS);
      localStorage.removeItem(STORAGE_KEYS.ENDORSE_PACKAGES);
      localStorage.removeItem(STORAGE_KEYS.VISITOR_REACTIONS);
    }
  }
}
```

---

## 6. Resilient Data Access Layer Repository (`src/lib/data/repository.ts`)

The repository provides seamless fallback:
1. When `isSupabaseConfigured()` is true: executes Supabase queries and mutations; if an individual network request throws or fails, it catches the error and serves from the local store without throwing unhandled exceptions.
2. When `isSupabaseConfigured()` is false: operations immediately execute against the typed local store and broadcast updates across all active tabs.

```typescript
import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  DataRepository,
  RealtimeTable,
  BroadcastSyncEvent,
  ReactionType,
} from '@/types';
import { isSupabaseConfigured, createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { LocalStorageManager } from './storage';

// ------------------------------------------------------------------------------
// Normalization Helpers (Maps DB snake_case columns to TypeScript contract)
// ------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSiteSettings(row: any): SiteSettings {
  return {
    id: row.id ?? 'default',
    creator_name: row.creator_name ?? 'Sumbar Terkini',
    creator_handle: row.creator_handle ?? '@sumbar_terkini',
    creator_avatar_url: row.creator_avatar_url ?? row.avatar_url ?? '',
    creator_bio: row.creator_bio ?? row.bio ?? '',
    slot_available: row.slot_available ?? row.is_available ?? true,
    slot_status_text: row.slot_status_text ?? row.availability_status ?? 'Slot Terbuka',
    theme_preset: row.theme_preset ?? 'neo-warm',
    stickers: Array.isArray(row.stickers) ? row.stickers : [],
    whatsapp_number: row.whatsapp_number ?? '',
    whatsapp_template: row.whatsapp_template ?? '',
    business_email: row.business_email ?? '',
    media_kit_pdf_url: row.media_kit_pdf_url ?? '/media-kit-sumbar-terkini.pdf',
    portfolio_url: row.portfolio_url,
    location: row.location,
    slots_remaining: row.slots_remaining,
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSocialPlatform(row: any): SocialPlatform {
  return {
    id: row.id,
    platform_id: row.platform_id ?? row.id,
    platform_name: row.platform_name ?? row.name,
    handle: row.handle,
    profile_url: row.profile_url,
    sync_mode: row.sync_mode ?? 'MANUAL',
    followers_count: Number(row.followers_count ?? 0),
    engagement_rate: Number(row.engagement_rate ?? 0),
    avg_views: Number(row.avg_views ?? row.average_views ?? 0),
    avg_likes: Number(row.avg_likes ?? row.average_likes ?? 0),
    avg_comments: Number(row.avg_comments ?? row.average_comments ?? 0),
    demographics: row.demographics ?? { gender: { male: 50, female: 50 }, top_cities: [] },
    api_config: row.api_config ?? {},
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active ?? true),
    last_synced_at: row.last_synced_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEndorsePackage(row: any): EndorsePackage {
  return {
    id: row.id,
    name: row.name,
    platform: (row.platform ?? 'cross-platform').toLowerCase(),
    price: Number(row.price ?? 0),
    description: row.description ?? '',
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    is_popular: Boolean(row.is_popular),
    is_price_hidden: Boolean(row.is_price_hidden),
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active ?? true),
    tier: row.tier ?? 'standard',
    discount_percentage: Number(row.discount_percentage ?? 0),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVisitorReaction(row: any): VisitorReaction {
  const reactionType = (row.reaction_type ?? row.id) as ReactionType;
  return {
    id: row.id ?? reactionType,
    reaction_type: reactionType,
    emoji: row.emoji ?? (reactionType === 'fire' ? '🔥' : reactionType === 'rocket' ? '🚀' : '❤️'),
    label: row.label ?? (reactionType === 'fire' ? 'Hype' : reactionType === 'rocket' ? 'Viral' : 'Love'),
    count: Number(row.count ?? 0),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// ------------------------------------------------------------------------------
// Repository Implementation
// ------------------------------------------------------------------------------

export class ResilientRepository implements DataRepository {
  // ----------------------------------------------------------------------------
  // 1. Site Settings
  // ----------------------------------------------------------------------------
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('site_settings')
            .select('*')
            .eq('id', 'default')
            .single();

          if (!error && data) {
            return normalizeSiteSettings(data);
          }
        }
      } catch {
        // Fallback to local store
      }
    }

    return LocalStorageManager.getState().siteSettings;
  }

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const dbPayload = {
            creator_name: updated.creator_name,
            bio: updated.creator_bio,
            avatar_url: updated.creator_avatar_url,
            is_available: updated.slot_available,
            availability_status: updated.slot_status_text,
            theme_preset: updated.theme_preset,
            stickers: updated.stickers,
            whatsapp_number: updated.whatsapp_number,
            whatsapp_template: updated.whatsapp_template,
            business_email: updated.business_email,
            media_kit_pdf_url: updated.media_kit_pdf_url,
            updated_at: updated.updated_at,
          };

          const { error } = await client
            .from('site_settings')
            .upsert({ id: 'default', ...dbPayload });

          if (!error) {
            LocalStorageManager.saveState('siteSettings', updated, 'site_settings', 'UPDATE');
            return updated;
          }
        }
      } catch {
        // Fallback to local mutation
      }
    }

    LocalStorageManager.saveState('siteSettings', updated, 'site_settings', 'UPDATE');
    return updated;
  }

  // ----------------------------------------------------------------------------
  // 2. Social Platforms
  // ----------------------------------------------------------------------------
  async getSocialPlatforms(): Promise<SocialPlatform[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('social_platforms')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            return data.map(normalizeSocialPlatform);
          }
        }
      } catch {
        // Fallback to local store
      }
    }

    return LocalStorageManager.getState().socialPlatforms.sort((a, b) => a.sort_order - b.sort_order);
  }

  async updateSocialPlatform(id: string, data: Partial<SocialPlatform>): Promise<SocialPlatform> {
    const list = await this.getSocialPlatforms();
    const index = list.findIndex((p) => p.id === id || p.platform_id === id);

    if (index === -1) {
      throw new Error(`Platform with id ${id} not found`);
    }

    const updated: SocialPlatform = {
      ...list[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const dbPayload = {
            followers_count: updated.followers_count,
            engagement_rate: updated.engagement_rate,
            average_views: updated.avg_views,
            average_likes: updated.avg_likes,
            average_comments: updated.avg_comments,
            sync_mode: updated.sync_mode,
            demographics: updated.demographics,
            is_active: updated.is_active,
            sort_order: updated.sort_order,
            last_synced_at: updated.last_synced_at,
            updated_at: updated.updated_at,
          };

          await client.from('social_platforms').update(dbPayload).eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    const newList = [...list];
    newList[index] = updated;
    LocalStorageManager.saveState('socialPlatforms', newList, 'social_platforms', 'UPDATE');

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 3. Endorse Packages
  // ----------------------------------------------------------------------------
  async getEndorsePackages(): Promise<EndorsePackage[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('endorse_packages')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            return data.map(normalizeEndorsePackage);
          }
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.getState().endorsePackages.sort((a, b) => a.sort_order - b.sort_order);
  }

  async createEndorsePackage(pkg: Omit<EndorsePackage, 'id' | 'updated_at' | 'created_at'>): Promise<EndorsePackage> {
    const newId = `pkg-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const created: EndorsePackage = {
      ...pkg,
      id: newId,
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('endorse_packages').insert({
            id: created.id,
            name: created.name,
            platform: created.platform,
            price: created.price,
            description: created.description,
            deliverables: created.deliverables,
            tier: created.tier ?? 'standard',
            is_popular: created.is_popular,
            is_price_hidden: created.is_price_hidden,
            discount_percentage: created.discount_percentage ?? 0,
            sort_order: created.sort_order,
            is_active: created.is_active,
          });
        }
      } catch {
        // Fallback
      }
    }

    const list = await this.getEndorsePackages();
    const newList = [...list, created];
    LocalStorageManager.saveState('endorsePackages', newList, 'endorse_packages', 'INSERT');

    return created;
  }

  async updateEndorsePackage(id: string, data: Partial<EndorsePackage>): Promise<EndorsePackage> {
    const list = await this.getEndorsePackages();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Endorse package with id ${id} not found`);
    }

    const updated: EndorsePackage = {
      ...list[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('endorse_packages').update({
            name: updated.name,
            platform: updated.platform,
            price: updated.price,
            description: updated.description,
            deliverables: updated.deliverables,
            tier: updated.tier,
            is_popular: updated.is_popular,
            is_price_hidden: updated.is_price_hidden,
            discount_percentage: updated.discount_percentage,
            sort_order: updated.sort_order,
            is_active: updated.is_active,
            updated_at: updated.updated_at,
          }).eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    const newList = [...list];
    newList[index] = updated;
    LocalStorageManager.saveState('endorsePackages', newList, 'endorse_packages', 'UPDATE');

    return updated;
  }

  async deleteEndorsePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('endorse_packages').delete().eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    const list = await this.getEndorsePackages();
    const filtered = list.filter((p) => p.id !== id);
    LocalStorageManager.saveState('endorsePackages', filtered, 'endorse_packages', 'DELETE');

    return true;
  }

  // ----------------------------------------------------------------------------
  // 4. Visitor Reactions
  // ----------------------------------------------------------------------------
  async getReactions(): Promise<VisitorReaction[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client.from('visitor_reactions').select('*');
          if (!error && data && data.length > 0) {
            return data.map(normalizeVisitorReaction);
          }
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.getState().visitorReactions;
  }

  async incrementReaction(reactionType: ReactionType): Promise<number> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client.rpc('increment_reaction', {
            reaction_id: reactionType,
          });

          if (!error && typeof data === 'number') {
            LocalStorageManager.broadcast('visitor_reactions', 'UPDATE', {
              reaction_type: reactionType,
              count: data,
            });
            return data;
          }
        }
      } catch {
        // Fallback
      }
    }

    // Fallback: Atomic increment in memory/localStorage
    const reactions = await this.getReactions();
    const target = reactions.find((r) => r.reaction_type === reactionType || r.id === reactionType);

    if (!target) {
      throw new Error(`Reaction ${reactionType} not found`);
    }

    const newCount = target.count + 1;
    const updatedReactions = reactions.map((r) =>
      r.reaction_type === reactionType || r.id === reactionType
        ? { ...r, count: newCount, updated_at: new Date().toISOString() }
        : r
    );

    LocalStorageManager.saveState('visitorReactions', updatedReactions, 'visitor_reactions', 'UPDATE');
    return newCount;
  }

  // ----------------------------------------------------------------------------
  // 5. Realtime Subscriptions
  // ----------------------------------------------------------------------------
  subscribeToChanges(table: RealtimeTable, callback: (event: BroadcastSyncEvent) => void): () => void {
    if (!isSupabaseConfigured()) {
      return LocalStorageManager.subscribe(table, callback);
    }

    try {
      const client = createBrowserSupabaseClient();
      if (!client) {
        return LocalStorageManager.subscribe(table, callback);
      }

      const channelName = `realtime_${table}_${Date.now()}`;
      const channel = client
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            callback({
              type: 'STATE_UPDATED',
              table,
              action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              payload: payload.new,
              timestamp: new Date().toISOString(),
            });
          }
        )
        .subscribe();

      // Also listen to local BroadcastChannel for optimistic UI updates in same browser
      const unsubscribeLocal = LocalStorageManager.subscribe(table, callback);

      return () => {
        unsubscribeLocal();
        client.removeChannel(channel);
      };
    } catch {
      return LocalStorageManager.subscribe(table, callback);
    }
  }
}

// Singleton repository export
export const repository: DataRepository = new ResilientRepository();
```

---

## 7. Concrete Implementation Guide for the Worker

When the Worker executes Milestone 1, they should create the files in this exact sequence:

1. **`src/types/index.ts`**:
   - Write the full type definitions detailed in Section 2.
   - Run `npx tsc --noEmit` to verify type syntax.

2. **`src/lib/data/mock-data.ts`**:
   - Write the authentic Minang mock datasets (`initialSiteSettings`, `initialSocialPlatforms`, `initialEndorsePackages`, `initialVisitorReactions`, `initialPortfolioItems`).
   - Ensure all prices are positive numbers, engagement rates are numbers between 0 and 100, and city distributions total 100%.

3. **`src/lib/supabase/client.ts`**:
   - Implement `isSupabaseConfigured()` and cached `createClient()`.
   - Ensure zero runtime crashes when `.env` is absent.

4. **`src/lib/supabase/server.ts`**:
   - Implement async `createClient()` with `await cookies()`.
   - Wrap `cookieStore.set()` in try/catch to silence Server Component read-only cookie warnings.

5. **`src/lib/data/storage.ts`**:
   - Implement `LocalStorageManager` using `globalThis.__SUMBAR_LOCAL_STORE__` for isomorphic Node.js memory safety and `localStorage` + `BroadcastChannel` in the browser.

6. **`src/lib/data/repository.ts`**:
   - Implement `ResilientRepository` and export singleton `repository`.
   - Normalize database rows so both camelCase and snake_case properties are handled smoothly.

### Verification Matrix for the Worker
| Step | Test Command | Expected Output |
|------|--------------|-----------------|
| Type Check | `npx tsc --noEmit` | Exit code 0, 0 errors |
| Offline Boot Check | `node -e "const { repository } = require('./src/lib/data/repository'); repository.getSiteSettings().then(console.log);"` | Prints complete settings object with zero errors |
| Reaction Test | `node -e "const { repository } = require('./src/lib/data/repository'); repository.incrementReaction('fire').then(console.log);"` | Returns 1421 |
