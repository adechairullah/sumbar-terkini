# Technical Analysis: Data Engine, Schema Architecture & Admin CMS
**Agent**: Explorer Survey 3 (Data Engine & API Explorer)  
**Date**: 2026-11-07  
**Scope**: Requirements R2 (Hybrid Social Media Metric Engine), R3 (CMS Admin Panel), and R4 (Database Schema & Fallback Mock Data)

---

## 1. Executive Summary & Architectural Overview

The **Sumbar Terkini Creator Media Kit & Endorsement Hub** requires a resilient, dual-layered data architecture capable of operating in two distinct environments without code changes:
1. **Cloud Production Mode**: Powered by **Supabase PostgreSQL** with Row Level Security (RLS), stored procedures (RPC), and **Supabase Realtime** replication over WebSocket channels.
2. **Resilient Local / Offline Preview Mode**: Zero-dependency fallback using an in-memory & localStorage typed Data Access Layer (DAL). When Supabase environment variables are missing, blank, or unreachable, the application continues to run flawlessly with authentic Indonesian seed data and functional mutations.

```
+---------------------------------------------------------------------------------------+
|                                    APPLICATION LAYER                                  |
|     Public Media Kit (/)                  Admin CMS (/admin)            Vercel Cron   |
+--------------------------+-----------------------+-----------------------+------------+
                           |                       |                       |
                           v                       v                       v
+---------------------------------------------------------------------------------------+
|                             DATA ACCESS LAYER (DAL) / REPOSITORY                      |
|                                                                                       |
|   isSupabaseConfigured() ? CloudSupabaseRepository : MockSeedRepository               |
|                                                                                       |
|   * fetchSiteSettings()        * updateSiteSettings()                                 |
|   * fetchSocialPlatforms()     * updateSocialPlatform()                               |
|   * fetchEndorsePackages()     * create/update/deletePackage()                        |
|   * fetchVisitorReactions()    * incrementReaction() [RPC / atomic]                   |
|   * subscribeToChanges()       * syncSocialMetrics() [Manual vs Auto]                 |
+--------------------------+-----------------------------------------------+------------+
                           |                                               |
              [If configured & online]                          [If unset or offline]
                           v                                               v
+------------------------------------------+    +---------------------------------------+
|            SUPABASE CLOUD                |    |          LOCAL / MOCK STORE           |
|                                          |    |                                       |
|  * PostgreSQL 15+ Schema                 |    |  * TypeScript In-Memory Store         |
|  * Row Level Security (RLS)              |    |  * Browser LocalStorage (Admin sync)  |
|  * Realtime Replication Publication      |    |  * BroadcastChannel (Cross-tab sync)  |
|  * Supabase Auth & JWT Validation        |    |  * Password Gate Fallback (cookie)    |
+------------------------------------------+    +---------------------------------------+
```

---

## 2. Supabase PostgreSQL Schema Specification (`supabase/schema.sql`)

The database architecture is designed with strict relational constraints, normalized tables, and JSONB extensions for flexible multi-variant structures (such as platform demographics and draggable stickers).

### 2.1 Complete SQL Migration Script (`supabase/schema.sql`)

```sql
-- ==============================================================================
-- SUMBAR TERKINI CREATOR MEDIA KIT & ENDORSEMENT HUB
-- Supabase PostgreSQL Schema Migration
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: site_settings (Singleton row for creator profile and global settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  creator_name TEXT NOT NULL DEFAULT 'Sumbar Terkini',
  creator_title TEXT NOT NULL DEFAULT 'Sumatera Barat Creator & Media Hub',
  bio TEXT NOT NULL DEFAULT 'Platform media kreatif dan amplifikasi brand terbesar di Sumatera Barat. Menghubungkan jutaan audiens lokal dengan brand terpercaya.',
  avatar_url TEXT NOT NULL DEFAULT '/avatar.png',
  location TEXT NOT NULL DEFAULT 'Padang, Sumatera Barat',
  is_available BOOLEAN NOT NULL DEFAULT true,
  availability_status TEXT NOT NULL DEFAULT 'Slot Terbuka untuk November 2026',
  slots_remaining INTEGER NOT NULL DEFAULT 4 CHECK (slots_remaining >= 0),
  theme_preset TEXT NOT NULL DEFAULT 'neo_brutalist',
  stickers JSONB NOT NULL DEFAULT '[
    {"id": "stk-1", "text": "100% Organic Reach", "emoji": "🌱", "color": "#FFD166", "rotation": -3},
    {"id": "stk-2", "text": "Fast Response < 1 Jam", "emoji": "⚡", "color": "#EF476F", "rotation": 4},
    {"id": "stk-3", "text": "Viral Maker Padang", "emoji": "🔥", "color": "#06D6A0", "rotation": -2}
  ]'::jsonb,
  whatsapp_number TEXT NOT NULL DEFAULT '6281234567890',
  whatsapp_template TEXT NOT NULL DEFAULT 'Halo Tim Partnership Sumbar Terkini! Saya tertarik bekerjasama untuk paket {{package_names}} dengan estimasi biaya {{total_price}}. Mohon konfirmasi ketersediaan slot jadwal tayang.',
  business_email TEXT NOT NULL DEFAULT 'partnership@sumbarterkini.com',
  portfolio_url TEXT DEFAULT 'https://instagram.com/sumbar_terkini',
  media_kit_pdf_url TEXT DEFAULT '/media-kit-sumbar-terkini.pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Table: social_platforms (Multi-platform engagement & analytics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_platforms (
  id TEXT PRIMARY KEY, -- 'instagram', 'tiktok', 'youtube', 'facebook', 'x'
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  sync_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (sync_mode IN ('MANUAL', 'AUTO_API')),
  followers_count BIGINT NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  engagement_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (engagement_rate >= 0.00),
  average_views BIGINT NOT NULL DEFAULT 0 CHECK (average_views >= 0),
  average_likes BIGINT NOT NULL DEFAULT 0 CHECK (average_likes >= 0),
  average_comments BIGINT NOT NULL DEFAULT 0 CHECK (average_comments >= 0),
  demographics JSONB NOT NULL DEFAULT '{
    "gender": {"male": 44, "female": 56},
    "top_cities": [
      {"city": "Padang", "percentage": 52},
      {"city": "Bukittinggi", "percentage": 18},
      {"city": "Payakumbuh", "percentage": 12},
      {"city": "Solok", "percentage": 10},
      {"city": "Lainnya", "percentage": 8}
    ]
  }'::jsonb,
  api_config JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_social_platforms_sort ON social_platforms(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 3. Table: endorse_packages (Endorsement services, bundles, & rate cards)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS endorse_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'Instagram', 'TikTok', 'YouTube', 'Cross-Platform'
  price BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0),
  description TEXT NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of string deliverables
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('starter', 'standard', 'vip', 'bundle')),
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_price_hidden BOOLEAN NOT NULL DEFAULT false, -- If true, displays "Hubungi Admin via WhatsApp"
  discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_endorse_packages_sort ON endorse_packages(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 4. Table: visitor_reactions (Real-time mood reaction counter)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_reactions (
  id TEXT PRIMARY KEY, -- 'fire', 'rocket', 'heart'
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. Stored Procedure (RPC): Atomic Reaction Increment
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_reaction(reaction_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE visitor_reactions
  SET count = count + 1,
      updated_at = timezone('utc'::text, now())
  WHERE id = reaction_id
  RETURNING count INTO new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reaction with id % not found', reaction_id;
  END IF;

  RETURN new_count;
END;
$$;

-- Grant execution permission to anon and authenticated callers
GRANT EXECUTE ON FUNCTION increment_reaction(TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. Updated_at Trigger Automation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_social_platforms_updated_at ON social_platforms;
CREATE TRIGGER trg_social_platforms_updated_at
  BEFORE UPDATE ON social_platforms
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_endorse_packages_updated_at ON endorse_packages;
CREATE TRIGGER trg_endorse_packages_updated_at
  BEFORE UPDATE ON endorse_packages
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_visitor_reactions_updated_at ON visitor_reactions;
CREATE TRIGGER trg_visitor_reactions_updated_at
  BEFORE UPDATE ON visitor_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorse_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_reactions ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated users have read access
CREATE POLICY "Allow public read on site_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Allow public read on social_platforms"
  ON social_platforms FOR SELECT USING (true);

CREATE POLICY "Allow public read on endorse_packages"
  ON endorse_packages FOR SELECT USING (true);

CREATE POLICY "Allow public read on visitor_reactions"
  ON visitor_reactions FOR SELECT USING (true);

-- Authenticated Admin / Service Role has write access
CREATE POLICY "Allow admin all on site_settings"
  ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin all on social_platforms"
  ON social_platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin all on endorse_packages"
  ON endorse_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin all on visitor_reactions"
  ON visitor_reactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. Supabase Realtime Publication Setup
-- ------------------------------------------------------------------------------
-- Set replica identity to full so change payloads contain complete old/new row
ALTER TABLE site_settings REPLICA IDENTITY FULL;
ALTER TABLE social_platforms REPLICA IDENTITY FULL;
ALTER TABLE endorse_packages REPLICA IDENTITY FULL;
ALTER TABLE visitor_reactions REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE 
  site_settings,
  social_platforms,
  endorse_packages,
  visitor_reactions;
```

---

## 3. Seed Data Specification (`supabase/seed.sql`)

The seed data captures the brand identity of **Sumbar Terkini**, a leading regional digital publisher and creator hub in Sumatera Barat, with realistic metric proportions, demographics, and endorsement pricing in Indonesian Rupiah (IDR).

```sql
-- ==============================================================================
-- SUMBAR TERKINI SEED DATA
-- ==============================================================================

-- 1. Site Settings Seed
INSERT INTO site_settings (
  id, creator_name, creator_title, bio, avatar_url, location,
  is_available, availability_status, slots_remaining, theme_preset,
  stickers, whatsapp_number, whatsapp_template, business_email, portfolio_url
) VALUES (
  'default',
  'Sumbar Terkini',
  'Sumatera Barat Creator & Media Hub',
  'Platform media kreatif dan amplifikasi brand terbesar di Sumatera Barat. Menghubungkan jutaan audiens lokal dengan brand terpercaya melalui konten viral, storytelling autentik, dan peliputan on-the-spot.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'Padang, Sumatera Barat',
  true,
  'Slot Tersedia untuk November 2026',
  4,
  'neo_brutalist',
  '[
    {"id": "stk-1", "text": "100% Organic Reach", "emoji": "🌱", "color": "#FFD166", "rotation": -3},
    {"id": "stk-2", "text": "Fast Response < 1 Jam", "emoji": "⚡", "color": "#EF476F", "rotation": 4},
    {"id": "stk-3", "text": "Viral Maker Padang", "emoji": "🔥", "color": "#06D6A0", "rotation": -2},
    {"id": "stk-4", "text": "Top Tier Minang Audience", "emoji": "👑", "color": "#FFD166", "rotation": 2}
  ]'::jsonb,
  '6281267890123',
  'Halo Tim Partnership Sumbar Terkini! Saya tertarik bekerjasama untuk paket endorse {{package_names}} dengan total estimasi {{total_price}}. Mohon info ketersediaan slot.',
  'partnership@sumbarterkini.com',
  'https://instagram.com/sumbar_terkini'
) ON CONFLICT (id) DO UPDATE SET
  creator_name = EXCLUDED.creator_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- 2. Social Platforms Seed
INSERT INTO social_platforms (
  id, name, handle, profile_url, sync_mode,
  followers_count, engagement_rate, average_views, average_likes, average_comments,
  demographics, sort_order, is_active
) VALUES
(
  'instagram',
  'Instagram',
  '@sumbar_terkini',
  'https://instagram.com/sumbar_terkini',
  'MANUAL',
  854200,
  4.85,
  450000,
  38200,
  3250,
  '{
    "gender": {"male": 43, "female": 57},
    "top_cities": [
      {"city": "Padang", "percentage": 54},
      {"city": "Bukittinggi", "percentage": 17},
      {"city": "Payakumbuh", "percentage": 12},
      {"city": "Pariaman", "percentage": 9},
      {"city": "Solok", "percentage": 8}
    ]
  }'::jsonb,
  1,
  true
),
(
  'tiktok',
  'TikTok',
  '@sumbarterkini_official',
  'https://tiktok.com/@sumbarterkini_official',
  'AUTO_API',
  1280000,
  7.42,
  920000,
  86000,
  9000,
  '{
    "gender": {"male": 38, "female": 62},
    "top_cities": [
      {"city": "Padang", "percentage": 48},
      {"city": "Pekanbaru", "percentage": 20},
      {"city": "Bukittinggi", "percentage": 15},
      {"city": "Solok", "percentage": 10},
      {"city": "Payakumbuh", "percentage": 7}
    ]
  }'::jsonb,
  2,
  true
),
(
  'youtube',
  'YouTube',
  'Sumbar Terkini TV',
  'https://youtube.com/@sumbarterkinitv',
  'AUTO_API',
  425000,
  6.10,
  210000,
  18500,
  2200,
  '{
    "gender": {"male": 52, "female": 48},
    "top_cities": [
      {"city": "Padang", "percentage": 45},
      {"city": "Jabodetabek", "percentage": 25},
      {"city": "Bukittinggi", "percentage": 18},
      {"city": "Payakumbuh", "percentage": 12}
    ]
  }'::jsonb,
  3,
  true
),
(
  'facebook',
  'Facebook',
  'Sumbar Terkini Media',
  'https://facebook.com/sumbarterkiniofficial',
  'MANUAL',
  620000,
  3.40,
  280000,
  14200,
  2800,
  '{
    "gender": {"male": 55, "female": 45},
    "top_cities": [
      {"city": "Padang", "percentage": 50},
      {"city": "Solok", "percentage": 20},
      {"city": "Pesisir Selatan", "percentage": 16},
      {"city": "Tanah Datar", "percentage": 14}
    ]
  }'::jsonb,
  4,
  true
),
(
  'x',
  'X (Twitter)',
  '@Sumbar_Terkini',
  'https://x.com/sumbar_terkini',
  'MANUAL',
  215000,
  4.12,
  180000,
  7400,
  1450,
  '{
    "gender": {"male": 58, "female": 42},
    "top_cities": [
      {"city": "Padang", "percentage": 60},
      {"city": "Jakarta", "percentage": 22},
      {"city": "Bukittinggi", "percentage": 18}
    ]
  }'::jsonb,
  5,
  true
)
ON CONFLICT (id) DO UPDATE SET
  followers_count = EXCLUDED.followers_count,
  engagement_rate = EXCLUDED.engagement_rate,
  average_views = EXCLUDED.average_views;

-- 3. Endorse Packages Seed
INSERT INTO endorse_packages (
  id, name, platform, price, description, deliverables,
  tier, is_popular, is_price_hidden, discount_percentage, sort_order, is_active
) VALUES
(
  'pkg-story-boost',
  'Instagram Story Blitz',
  'Instagram',
  750000,
  'Paket cepat 3x Instagram Stories dengan Swipe-Up / Link Sticker langsung ke landing page atau WhatsApp bisnis Anda.',
  '["3x Sequence Stories (24 Jam)", "Sticker Link Aktif & Tag Akun Brand", "Report Insight Impressions dalam 48 Jam"]'::jsonb,
  'starter',
  false,
  false,
  0,
  1,
  true
),
(
  'pkg-reels-viral',
  'Instagram Reels Viral Maker',
  'Instagram',
  2500000,
  'Video kreatif Reels berdurasi hingga 60 detik dengan hook lokal Sumatera Barat, direct CTA, dan penempatan permanen di grid.',
  '["1x Video Reels High Definition (1080p)", "Keep Selamanya di Feed & Grid", "Pinned Comment Call-to-Action 7 Hari", "Bonus 1x Repost ke Instagram Story"]'::jsonb,
  'standard',
  true,
  false,
  0,
  2,
  true
),
(
  'pkg-tiktok-fyps',
  'TikTok FYP Booster Video',
  'TikTok',
  2800000,
  'Video TikTok diproduksi dengan trending audio Minang / nasional, skrip hook dalam 3 detik pertama, dan garansi tayang FYP.',
  '["1x Video TikTok 60 Detik Audio Trending", "Caption SEO-optimized & Brand Hashtags", "Interaksi Komentar Aktif dari Tim", "Format 9:16 Vertical Storytelling"]'::jsonb,
  'standard',
  false,
  false,
  0,
  3,
  true
),
(
  'pkg-bundle-viral',
  'VIP Viral Cross-Post Bundle',
  'Cross-Platform',
  4800000,
  'Paket paling direkomendasikan untuk peluncuran produk atau campaign masif di seluruh Sumatera Barat dengan amplifikasi lintas kanal.',
  '["1x Video Reels Instagram + 1x TikTok FYP", "2x Sequence Instagram Stories dengan Link", "1x Postingan Feed Komunitas Facebook", "Laporan Analisis Insight Lengkap"]'::jsonb,
  'vip',
  true,
  false,
  15, -- 15% bundle discount
  4,
  true
),
(
  'pkg-enterprise-coverage',
  'Exclusive Brand Ambassadorship & Media Visit',
  'Cross-Platform',
  12500000,
  'Liputan eksklusif on-the-spot oleh talent utama Sumbar Terkini untuk grand opening, event festival, atau liputan UMKM/resto bintang 5.',
  '["On-the-spot Media Visit ke Lokasi Brand", "Talent Host Liputan Dedicated", "Video Reels + TikTok + YouTube Short", "Liputan Live Story Instagram Real-time", "Press Release Singkat di Portal Berita"]'::jsonb,
  'bundle',
  false,
  true, -- Price hidden: "Hubungi via WhatsApp untuk negosiasi"
  0,
  5,
  true
)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description;

-- 4. Visitor Reactions Seed
INSERT INTO visitor_reactions (id, emoji, label, count) VALUES
  ('fire', '🔥', 'Hype', 1420),
  ('rocket', '🚀', 'Viral', 980),
  ('heart', '❤️', 'Love', 2310)
ON CONFLICT (id) DO UPDATE SET
  count = EXCLUDED.count;
```

---

## 4. Mock/Seed Fallback Engine Architecture (Zero Crash Guarantee)

### 4.1 The Offline / Unconfigured Problem
Next.js server-side and client-side rendering crash when `process.env.NEXT_PUBLIC_SUPABASE_URL` is undefined, empty, or set to invalid placeholders during `createClient()`.
Furthermore, local evaluators must be able to clone the repository and run:
```bash
npm install
npm run dev
```
and instantly experience the full interactive media kit and admin panel without configuring a third-party Supabase account!

### 4.2 Architecture of Data Access Layer (DAL)

We specify an elegant Repository Abstraction:

```typescript
// lib/data/dal.ts

export interface DataRepository {
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;
  getSocialPlatforms(): Promise<SocialPlatform[]>;
  updateSocialPlatform(id: string, data: Partial<SocialPlatform>): Promise<SocialPlatform>;
  getEndorsePackages(): Promise<EndorsePackage[]>;
  createEndorsePackage(pkg: Omit<EndorsePackage, 'id' | 'created_at' | 'updated_at'>): Promise<EndorsePackage>;
  updateEndorsePackage(id: string, data: Partial<EndorsePackage>): Promise<EndorsePackage>;
  deleteEndorsePackage(id: string): Promise<boolean>;
  getVisitorReactions(): Promise<VisitorReaction[]>;
  incrementReaction(reactionId: string): Promise<number>;
}
```

#### Credential Detection Logic
```typescript
// lib/supabase/config.ts
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes('your-project') || url.includes('placeholder')) return false;
  if (!url.startsWith('https://')) return false;

  return true;
}
```

#### Resilient In-Memory & LocalStorage Store
When `isSupabaseConfigured()` is `false`:
- Server Components read from the typed static seed (`initialSiteSettings`, `initialSocialPlatforms`, etc.).
- Client Components check `localStorage` for any admin modifications made during the preview session; if absent, they populate from initial seed data.
- Mutations update both in-memory state and `localStorage`, and broadcast updates via a cross-tab `BroadcastChannel('sumbar_terkini_sync')`.
- This ensures **Live Preview works 100% locally** even without Supabase!

```typescript
// Cross-tab sync for local mock mode:
if (typeof window !== 'undefined') {
  const syncChannel = new BroadcastChannel('sumbar_terkini_channel');
  syncChannel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATED') {
      // Re-trigger React state revalidation
    }
  };
}
```

---

## 5. Hybrid Social Media Metric Engine (`/api/sync-socials`) (R2)

### 5.1 Dual-Mode Operation Flowchart

```
                 [Vercel Cron / Admin Manual "Test Sync"]
                                    |
                                    v
                       GET/POST /api/sync-socials
                                    |
                  Verify CRON_SECRET or Admin Session
                                    |
              +---------------------+---------------------+
              |                                           |
              v                                           v
      Platform in MANUAL mode?                 Platform in AUTO_API mode?
              |                                           |
    [Keep Admin input]                     Attempt Pluggable Adapter Fetch
    [Mark as synced]                                      |
                                          +---------------+---------------+
                                          |                               |
                                      [Success]                       [Failed / 429]
                                          |                               |
                             Update DB with new metrics      Serve Cached Last-Known Metrics
                             Set last_synced_at = now()      Emit warning, NO zero-overwrite
                                          |                               |
                                          +---------------+---------------+
                                                          |
                                                          v
                                              Return JSON Sync Report
                                          Realtime pushes to Public Bento
```

### 5.2 Pluggable Adapter Registry Design

```typescript
// lib/adapters/types.ts
export interface AdapterResult {
  followersCount: number;
  engagementRate: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  status: 'synced' | 'cached_fallback';
  source: 'live_api' | 'mock_jitter' | 'last_cache';
  error?: string;
}

export interface PlatformAdapter {
  platformId: string;
  fetch(currentMetrics: SocialPlatform): Promise<AdapterResult>;
}
```

1. **`InstagramAdapter`**:
   - Inspects `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_BUSINESS_ACCOUNT_ID`.
   - If present: calls Meta Graph API `GET /{account-id}?fields=followers_count,media{like_count,comments_count,insights}`.
   - If absent or rate-limited: generates realistic organic variance:
     * Followers: `current + Math.floor(Math.random() * 25) - 5`
     * Recalculates ER dynamically using the official formula.
2. **`TikTokAdapter`**:
   - Inspects `TIKTOK_API_KEY`.
   - If absent: generates realistic organic engagement drift (+0.05% to +0.15% ER).
3. **`YouTubeAdapter`**:
   - Inspects `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID`.
   - If present: calls `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`.
   - Extracts `subscriberCount` and `viewCount`.
   - If missing: falls back cleanly to cached metrics.
4. **`FacebookAdapter` & `XAdapter`**:
   - Follows identical pluggable interface with resilient caching fallback.

### 5.3 Vercel Cron Configuration (`vercel.json`)

To run the sync engine automatically on a schedule for free on Vercel:

```json
{
  "crons": [
    {
      "path": "/api/sync-socials",
      "schedule": "0 */6 * * *"
    }
  ]
}
```
*Note*: `0 */6 * * *` executes every 6 hours, well within Vercel's free hobby tier cron allowances (1 daily or regular intervals).

### 5.4 API Route Specification (`/api/sync-socials`)

- **Method**: `GET` (for Vercel Cron) and `POST` (for Admin Panel Manual Trigger)
- **Path**: `/api/sync-socials`
- **Query Parameters**:
  * `platform` (optional): `instagram` | `tiktok` | `youtube` | `facebook` | `x`
  * `force` (optional): `true` | `false`
- **Headers**:
  * `Authorization`: `Bearer <CRON_SECRET>` (mandatory in production when called by Vercel Cron)
- **Response Format**:
  ```json
  {
    "success": true,
    "timestamp": "2026-11-07T04:30:00.000Z",
    "platformsProcessed": 5,
    "results": [
      {
        "id": "instagram",
        "name": "Instagram",
        "syncMode": "MANUAL",
        "action": "skipped_manual_mode",
        "followersCount": 854200,
        "engagementRate": 4.85
      },
      {
        "id": "tiktok",
        "name": "TikTok",
        "syncMode": "AUTO_API",
        "action": "synced",
        "source": "mock_jitter",
        "followersCount": 1280340,
        "engagementRate": 7.42,
        "averageViews": 920500,
        "lastSyncedAt": "2026-11-07T04:30:00.000Z"
      }
    ]
  }
  ```

---

## 6. Authenticated Admin Panel Architecture (`/admin`) (R3)

### 6.1 Dual-Gate Authentication Architecture

To satisfy R3 with zero friction:
1. **Primary Gate**: Supabase Auth (email/password). Uses `@supabase/ssr` cookies.
2. **Local / Fallback Password Gate**:
   - When Supabase Auth is unavailable or during local evaluation, an admin password gate protects `/admin`.
   - Default master passcode: `admin123` (configurable via `ADMIN_PASSWORD` env).
   - Upon correct entry: sets an HTTP-only signed session cookie `sumbar_admin_token`.
   - Middleware and `/admin` layout verify the session cookie or Supabase session before granting access.

### 6.2 Admin Modules Specification

#### Module 1: Profile & Hero Editor
- **Inputs**:
  * `creator_name` (Text input)
  * `creator_title` (Text input)
  * `avatar_url` (Image URL or preset selector)
  * `bio` (Multi-line textarea)
  * `location` (Text input)
  * `is_available` (Toggle switch: Open / Full)
  * `availability_status` (Text input e.g. "Slot Terbuka untuk November 2026")
  * `slots_remaining` (Number input)
  * `theme_preset` (Selector: Neo-Brutalist, Warm Paper, Mint Pop)
- **Sticker Manager**:
  * Visual list of active stickers.
  * Form to add sticker: Text, Emoji Picker (🌱, ⚡, 🔥, 👑, 🚀, 🎯), Color Picker (Mustard `#FFD166`, Coral `#EF476F`, Mint `#06D6A0`), initial tilt angle.
  * Delete sticker button.

#### Module 2: Social Media & Engagement Manager
- Platform Tabs: Instagram | TikTok | YouTube | Facebook | X
- Controls per platform:
  * Mode Switcher: Radio or toggle between `MANUAL` and `AUTO_API`.
  * Metric inputs:
    - Followers / Subscribers count
    - Average Views
    - Average Likes
    - Average Comments
  * **Automatic ER Calculator Helper**:
    - Embedded calculation widget:
      $$\text{ER } (\%) = \left( \frac{\text{Average Likes} + \text{Average Comments}}{\text{Followers}} \right) \times 100$$
    - Live computed output display (e.g., `((38,200 + 3,250) / 854,200) * 100 = 4.85%`).
    - Visual status pill:
      * **Excellent**: ER $\ge 4.5\%$ (Mint Green badge)
      * **Good**: $2.5\% \le \text{ER} < 4.5\%$ (Mustard Yellow badge)
      * **Moderate**: $1.5\% \le \text{ER} < 2.5\%$ (Coral badge)
      * **Low**: $\text{ER} < 1.5\%$ (Gray badge)
    - **"Terapkan ke Engagement Rate"** button: Automatically writes the calculated value into the platform's `engagement_rate` field.
  * **Demographics Manager**:
    - Gender slider (Male % vs Female %, auto-balancing to 100%).
    - Top Cities list: City name + percentage share, with "Tambah Kota" and remove buttons.
  * **"Test Sync" Action**:
    - Dispatches a call to `/api/sync-socials?platform=<id>`.
    - Shows live toast feedback with sync source, execution latency, and updated values.

#### Module 3: Rate Card & Package Builder
- **Package List**:
  * Displays all endorsement cards with drag-to-reorder or sort buttons.
  * Badges for Platform, Tier (`starter`, `standard`, `vip`, `bundle`), Popular status, and Hidden Price.
- **Package Form Modal / Drawer**:
  * Package Name (e.g. "Instagram Reels Viral Maker")
  * Platform selector (Instagram, TikTok, YouTube, Cross-Platform)
  * Price in IDR (formatted with Thousand separators e.g. `Rp 2.500.000`)
  * Description
  * Deliverables Builder: Dynamic list of string items (add, edit, remove bullet points)
  * Tier Selector (`starter`, `standard`, `vip`, `bundle`)
  * `is_popular` Toggle (Highlights card with bold neo-brutalist badge)
  * `is_price_hidden` Toggle ("Tanya Admin via WhatsApp" instead of showing numeric price)
  * Discount percentage (e.g. 15% off for bundle)
  * Active status toggle.

#### Module 4: Contact & WhatsApp Template Settings
- **Settings**:
  * WhatsApp Business Number (e.g. `6281267890123`)
  * Business Email (e.g. `partnership@sumbarterkini.com`)
  * Media Kit PDF Download Link
- **Automated WhatsApp Order Message Template**:
  * Template editor with live replacement chips:
    - `{{package_names}}` (Names of packages selected by client in rate calculator)
    - `{{total_price}}` (Total formatted price in IDR)
    - `{{creator_name}}` (e.g. "Sumbar Terkini")
  * **Live WhatsApp Message Preview Box**: Shows the real-time compiled text message formatted exactly as it will appear in WhatsApp Web / App.

#### Module 5: Real-Time Live Preview Capability
- Integrated Live Preview drawer or split screen.
- Edits made in the CMS instantly reflect in the preview iframe or component tree via React Context and Supabase Realtime subscriptions.

---

## 7. Realtime Subscription Protocol (WebSocket & Fallback)

### 7.1 Supabase Realtime Client Implementation
```typescript
// lib/supabase/realtime.ts
export function subscribeToPlatformChanges(callback: (payload: any) => void) {
  if (!isSupabaseConfigured()) {
    // In mock mode, listen to BroadcastChannel
    const channel = new BroadcastChannel('sumbar_terkini_channel');
    channel.onmessage = (e) => {
      if (e.data.table === 'social_platforms') {
        callback(e.data);
      }
    };
    return () => channel.close();
  }

  const supabase = createClient();
  const channel = supabase
    .channel('social_platforms_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'social_platforms' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

### 7.2 Reaction Mood Clicker Realtime Architecture
- Visitor clicks 🔥 reaction on `/`.
- Client optimistically increments local reaction count with particle burst animation.
- Background POST request dispatched to `/api/reactions` with payload `{ reactionId: 'fire' }`.
- API route invokes Supabase RPC `increment_reaction('fire')`.
- Supabase triggers Realtime broadcast to all connected visitors.
- If in mock offline mode, the increment is saved to memory / localStorage and broadcast via `BroadcastChannel`, allowing multiple open browser tabs to update simultaneously.

---

## 8. Anti-Slop Code & Architecture Standards

In adherence to the anti-slop guidelines:
1. **Zero Fake Placeholders**: No `// TODO: Implement later` or empty stubs. All adapters and repositories must be fully functional.
2. **Resilience over Failure**: Never display empty bento cards or broken NaN values. If external APIs fail or are rate-limited, cached fallback data must be seamlessly served.
3. **Purposeful Types**: Clean, strict TypeScript interfaces for all database entities, API payloads, and form schemas (using Zod validation).
4. **Authentic Localization**: Authentic Indonesian numbers, currency formatting (`Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`), and regional Minang cultural context (Sumatera Barat).

---

## 9. Verification & Validation Plan

1. **Schema Validation**:
   - Verify `supabase/schema.sql` syntax against PostgreSQL 15 syntax standards.
   - Verify Realtime publication statements.
   - Verify security definer on `increment_reaction`.
2. **Offline Resilience Validation**:
   - Run Next.js without any `.env` file; ensure home page `/` and `/admin` render completely without unhandled errors.
3. **Metric Calculation Validation**:
   - Verify ER formula: with 854,200 followers, 38,200 likes, 3,250 comments $\rightarrow$ $4.85\%$.
4. **Sync API Validation**:
   - Call `/api/sync-socials` with `GET` and `POST` and confirm JSON response format.
5. **Vercel Cron Validation**:
   - Verify `vercel.json` format conforms to Vercel Cron specifications.
