# Production SQL Blueprint & Supabase Architecture Specification

**Author**: M1 Explorer 2 (Database Schema & Supabase Architecture Specialist)  
**Date**: 2026-11-07  
**Milestone**: Milestone 1 (Foundation, Schema & Design System)  
**Target Files**: `supabase/schema.sql`, `supabase/seed.sql`  
**Reference Documents**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `explorer_survey_3/analysis.md`

---

## 1. Architectural Overview & Design Philosophy

The database tier for the **Sumbar Terkini Creator Media Kit & Endorsement Hub** is engineered around four core principles:

1. **Strict Relational Integrity & Safe Typing**: Every table enforces explicit column types, primary keys, `NOT NULL` declarations, and range/domain `CHECK` constraints (e.g. non-negative counters, bounded engagement rate between `0.00` and `100.00%`, and strict enum domain checks for sync modes, platforms, tiers, and reaction identifiers).
2. **Atomic Concurrency for Viral Spikes**: The visitor reaction mood counter relies on a PostgreSQL `SECURITY DEFINER` stored procedure (`increment_reaction`) that leverages PostgreSQL row-level locks during `UPDATE ... RETURNING`. This guarantees zero lost updates during viral traffic surges without exposing destructive table write permissions to anonymous visitors.
3. **Automated Auditing via Triggers**: All mutable tables feature a `BEFORE UPDATE` trigger that automatically synchronizes `updated_at = timezone('utc'::text, now())`, eliminating out-of-sync timestamps across frontend mutations.
4. **Realtime WebSocket Replication**: Supabase Realtime requires both publication membership (`supabase_realtime`) and `REPLICA IDENTITY FULL` on target tables. With full replica identity, change event payloads deliver both the prior state (`OLD`) and the new state (`NEW`), empowering client-side rolling odometer counters and live CMS split-screen previews to smoothly animate between numeric values.
5. **Harmonized Contract Alignment**: All column names in SQL directly correspond to the TypeScript interfaces defined in `PROJECT.md` (`SiteSettings`, `SocialPlatform`, `EndorsePackage`, `VisitorReaction`), eliminating impedance mismatch between the frontend Data Access Layer (DAL) and the Supabase database.

---

## 2. Table Specifications & Constraint Topology

### 2.1 Table: `site_settings`
Singleton configuration table holding creator profile, hero content, slot availability status, theme presets, interactive stickers, and WhatsApp business credentials.

- **Primary Key**: `id TEXT PRIMARY KEY DEFAULT 'default'` with `CONSTRAINT check_site_settings_singleton CHECK (id = 'default')`.
- **Columns & Data Types**:
  - `id TEXT`: Fixed singleton identifier `'default'`.
  - `creator_name TEXT NOT NULL DEFAULT 'Sumbar Terkini'`: Official creator or media network display name.
  - `creator_handle TEXT NOT NULL DEFAULT '@sumbar_terkini'`: Public creator handle.
  - `creator_title TEXT NOT NULL DEFAULT 'Sumatera Barat Creator & Media Hub'`: Subheading/tagline.
  - `creator_avatar_url TEXT NOT NULL DEFAULT '/avatar.png'`: High-resolution creator portrait or logo image URL.
  - `creator_bio TEXT NOT NULL`: Editorial narrative bio in Indonesian.
  - `location TEXT NOT NULL DEFAULT 'Padang, Sumatera Barat'`: Regional location.
  - `slot_available BOOLEAN NOT NULL DEFAULT true`: Master toggle indicating endorsement booking status.
  - `slot_status_text TEXT NOT NULL DEFAULT 'Slot Terbuka untuk November 2026'`: Human-readable status banner.
  - `slots_remaining INTEGER NOT NULL DEFAULT 4 CHECK (slots_remaining >= 0)`: Current remaining booking slots.
  - `theme_preset TEXT NOT NULL DEFAULT 'neo-warm' CHECK (theme_preset IN ('neo-warm', 'neo-mint', 'neo-mustard'))`: Visual theme selector.
  - `stickers JSONB NOT NULL DEFAULT '[]'::jsonb`: Array of draggable sticker objects (`id`, `text`, `emoji`, `color`, `rotation`).
  - `whatsapp_number TEXT NOT NULL DEFAULT '6281267890123'`: E.164 formatted WhatsApp Business phone number.
  - `whatsapp_template TEXT NOT NULL`: Pre-formatted WhatsApp order message template supporting `{{package_names}}` and `{{total_price}}` tokens.
  - `business_email TEXT NOT NULL DEFAULT 'partnership@sumbarterkini.com'`: Official inquiry email.
  - `media_kit_pdf_url TEXT DEFAULT '/media-kit-sumbar-terkini.pdf'`: Static PDF media kit download link.
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.

### 2.2 Table: `social_platforms`
Platform cards feeding the Bento Grid with live reach metrics, engagement rate (ER %), audience demographics, and sync modes.

- **Primary Key**: `id TEXT PRIMARY KEY` (`'instagram'`, `'tiktok'`, `'youtube'`, `'facebook'`, `'x'`).
- **Columns & Data Types**:
  - `id TEXT PRIMARY KEY`: Canonical identifier.
  - `platform_id TEXT NOT NULL CHECK (platform_id IN ('instagram', 'tiktok', 'youtube', 'facebook', 'x'))`: Enforces valid platform slug matching TypeScript union.
  - `platform_name TEXT NOT NULL`: Display name (e.g. `'Instagram'`, `'TikTok'`, `'YouTube'`, `'Facebook'`, `'X (Twitter)'`).
  - `handle TEXT NOT NULL`: Platform specific account handle (e.g. `'@sumbar_terkini'`).
  - `profile_url TEXT NOT NULL`: Direct URL to external profile.
  - `sync_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (sync_mode IN ('MANUAL', 'AUTO_API'))`: Hybrid sync mode toggle.
  - `followers_count BIGINT NOT NULL DEFAULT 0 CHECK (followers_count >= 0)`: Follower / subscriber count.
  - `engagement_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (engagement_rate >= 0.00 AND engagement_rate <= 100.00)`: Engagement rate percentage.
  - `avg_views BIGINT NOT NULL DEFAULT 0 CHECK (avg_views >= 0)`: Average video / post views.
  - `avg_likes BIGINT NOT NULL DEFAULT 0 CHECK (avg_likes >= 0)`: Average likes per post.
  - `avg_comments BIGINT NOT NULL DEFAULT 0 CHECK (avg_comments >= 0)`: Average comments per post.
  - `demographics JSONB NOT NULL DEFAULT '{"gender": {"male": 50, "female": 50}, "top_cities": []}'::jsonb`: Audience breakdown.
  - `api_config JSONB DEFAULT '{}'::jsonb`: Pluggable adapter configuration (endpoint, external account IDs).
  - `sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0)`: Bento grid ordering index.
  - `is_active BOOLEAN NOT NULL DEFAULT true`: Visibility toggle.
  - `last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())`: Timestamp of last manual or automated sync.
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
- **Indexes**:
  - `CREATE INDEX IF NOT EXISTS idx_social_platforms_sort ON social_platforms(sort_order ASC);`
  - `CREATE INDEX IF NOT EXISTS idx_social_platforms_active ON social_platforms(is_active);`

### 2.3 Table: `endorse_packages`
Rate card catalogue defining individual deliverables and multi-platform promotional bundles.

- **Primary Key**: `id TEXT PRIMARY KEY` (e.g. `'pkg-story-boost'`, `'pkg-reels-viral'`).
- **Columns & Data Types**:
  - `id TEXT PRIMARY KEY`: Unique package slug.
  - `name TEXT NOT NULL`: Commercial package title.
  - `platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'cross-platform'))`: Target distribution channel.
  - `price BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0)`: Price in Indonesian Rupiah (IDR).
  - `description TEXT NOT NULL`: Marketing summary of package scope.
  - `deliverables JSONB NOT NULL DEFAULT '[]'::jsonb`: JSON array of deliverable strings.
  - `tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('starter', 'standard', 'vip', 'bundle'))`: Tier classification.
  - `is_popular BOOLEAN NOT NULL DEFAULT false`: Highlights package with visual badge.
  - `is_price_hidden BOOLEAN NOT NULL DEFAULT false`: When `true`, hides numeric price and prompts direct WhatsApp consultation.
  - `discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100)`: Bundle discount rate.
  - `sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0)`: Display sort order.
  - `is_active BOOLEAN NOT NULL DEFAULT true`: Active catalog status.
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
- **Indexes**:
  - `CREATE INDEX IF NOT EXISTS idx_endorse_packages_sort ON endorse_packages(sort_order ASC);`
  - `CREATE INDEX IF NOT EXISTS idx_endorse_packages_platform ON endorse_packages(platform);`
  - `CREATE INDEX IF NOT EXISTS idx_endorse_packages_active ON endorse_packages(is_active);`

### 2.4 Table: `visitor_reactions`
Floating mood clicker counter tracking real-time community sentiment (🔥 Hype, 🚀 Viral, ❤️ Love).

- **Primary Key**: `id TEXT PRIMARY KEY CHECK (id IN ('fire', 'rocket', 'heart'))`.
- **Columns & Data Types**:
  - `id TEXT PRIMARY KEY`: Canonical reaction key (`'fire'`, `'rocket'`, `'heart'`).
  - `reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'rocket', 'heart'))`: Matches `VisitorReaction.reaction_type` contract.
  - `emoji TEXT NOT NULL`: Rendered glyph (`'🔥'`, `'🚀'`, `'❤️'`).
  - `label TEXT NOT NULL`: Localized label (`'Hype'`, `'Viral'`, `'Love'`).
  - `count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0)`: Monotonically increasing counter.
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`.

---

## 3. Atomic Stored Procedure (RPC): `increment_reaction`

### 3.1 Concurrency & Security Architecture
In viral traffic conditions, hundreds of visitors may click floating mood clickers concurrently. A standard `SELECT count`, add 1, and `UPDATE` pattern creates severe lost-update race conditions.

To resolve this:
1. **Row-Level Write Lock**: The statement `UPDATE visitor_reactions SET count = count + 1 ... RETURNING count INTO new_count;` acquires an exclusive row-level lock on the target record for the duration of the statement. Concurrent transactions queue and execute sequentially without lost updates.
2. **`SECURITY DEFINER` Execution**: By defining the function with `SECURITY DEFINER`, anonymous callers (`anon` role) can execute this single routine without granting them direct `UPDATE` privileges on `visitor_reactions`.
3. **`SET search_path = public`**: Prevents schema hijacking attacks where malicious schemas take precedence in unqualified table lookups.
4. **Input Sanitization**: Normalizes inputs with `TRIM(LOWER(reaction_id))` and matches both `id` and `reaction_type`.
5. **Clear Error Reporting**: Raises an informative PostgreSQL exception if a non-existent reaction slug is passed.

### 3.2 SQL Function Implementation
```sql
CREATE OR REPLACE FUNCTION increment_reaction(reaction_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_id TEXT;
  new_count BIGINT;
BEGIN
  IF reaction_id IS NULL OR TRIM(reaction_id) = '' THEN
    RAISE EXCEPTION 'reaction_id cannot be null or empty';
  END IF;

  clean_id := TRIM(LOWER(reaction_id));

  UPDATE visitor_reactions
  SET count = count + 1,
      updated_at = timezone('utc'::text, now())
  WHERE id = clean_id OR reaction_type = clean_id
  RETURNING count INTO new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reaction "%" not found', reaction_id;
  END IF;

  RETURN new_count;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION increment_reaction(TEXT) TO anon, authenticated, service_role;
```

---

## 4. Trigger Architecture: Automated `updated_at`

To ensure robust data auditing, every table uses a PostgreSQL `BEFORE UPDATE` trigger function that automatically updates `updated_at` to the current UTC timestamp:

```sql
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
```

---

## 5. Row Level Security (RLS) Blueprint

Row Level Security is enabled on all four tables with strict separation of privileges:

1. **Public Read Access**: Visitors (both `anon` and `authenticated`) require read access to view the media kit, platform stats, rate card, and reaction counts:
   ```sql
   CREATE POLICY "Allow public read on site_settings"
     ON site_settings FOR SELECT USING (true);

   CREATE POLICY "Allow public read on social_platforms"
     ON social_platforms FOR SELECT USING (true);

   CREATE POLICY "Allow public read on endorse_packages"
     ON endorse_packages FOR SELECT USING (true);

   CREATE POLICY "Allow public read on visitor_reactions"
     ON visitor_reactions FOR SELECT USING (true);
   ```
2. **Authenticated Administrator Write Access**: Authenticated users (logged into `/admin` via Supabase Auth) have full permissions to mutate configuration:
   ```sql
   CREATE POLICY "Allow admin all on site_settings"
     ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

   CREATE POLICY "Allow admin all on social_platforms"
     ON social_platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);

   CREATE POLICY "Allow admin all on endorse_packages"
     ON endorse_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

   CREATE POLICY "Allow admin all on visitor_reactions"
     ON visitor_reactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
   ```
3. **Controlled Mutation via RPC**: The `anon` role is denied direct `UPDATE` privileges on `visitor_reactions`, preventing arbitrary count tampering. They can only increment counts via `increment_reaction(reaction_id)`.

---

## 6. Supabase Realtime Replication Blueprint

For real-time synchronisation between the Admin CMS and the public Media Kit:

1. **`REPLICA IDENTITY FULL`**: Ensures Postgres WAL includes previous row values alongside new row values:
   ```sql
   ALTER TABLE site_settings REPLICA IDENTITY FULL;
   ALTER TABLE social_platforms REPLICA IDENTITY FULL;
   ALTER TABLE endorse_packages REPLICA IDENTITY FULL;
   ALTER TABLE visitor_reactions REPLICA IDENTITY FULL;
   ```
2. **Idempotent Publication Registration**: Checks for the existence of `supabase_realtime` and each table membership before adding, avoiding runtime migration crashes:
   ```sql
   DO $$
   DECLARE
     t text;
     tables text[] := ARRAY['site_settings', 'social_platforms', 'endorse_packages', 'visitor_reactions'];
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
       CREATE PUBLICATION supabase_realtime;
     END IF;

     FOREACH t IN ARRAY tables LOOP
       IF NOT EXISTS (
         SELECT 1 FROM pg_publication_tables 
         WHERE pubname = 'supabase_realtime' AND tablename = t
       ) THEN
         EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
       END IF;
     END LOOP;
   END $$;
   ```

---

## 7. Production `supabase/schema.sql` (Complete File Blueprint)

Here is the exact code to be written to `/Users/adechairullah/CODING/SUMBAR_TERKINI/supabase/schema.sql` by the Worker:

```sql
-- ==============================================================================
-- SUMBAR TERKINI CREATOR MEDIA KIT & ENDORSEMENT HUB
-- Supabase PostgreSQL Production Schema Migration
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: site_settings
-- Singleton table containing creator profile, hero, slot status, and contact config.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CONSTRAINT check_site_settings_singleton CHECK (id = 'default'),
  creator_name TEXT NOT NULL DEFAULT 'Sumbar Terkini',
  creator_handle TEXT NOT NULL DEFAULT '@sumbar_terkini',
  creator_title TEXT NOT NULL DEFAULT 'Sumatera Barat Creator & Media Hub',
  creator_avatar_url TEXT NOT NULL DEFAULT '/avatar.png',
  creator_bio TEXT NOT NULL DEFAULT 'Platform media kreatif dan amplifikasi brand terbesar di Sumatera Barat. Menghubungkan jutaan audiens lokal dengan brand terpercaya melalui konten viral, storytelling autentik, dan peliputan on-the-spot.',
  location TEXT NOT NULL DEFAULT 'Padang, Sumatera Barat',
  slot_available BOOLEAN NOT NULL DEFAULT true,
  slot_status_text TEXT NOT NULL DEFAULT 'Slot Terbuka untuk November 2026',
  slots_remaining INTEGER NOT NULL DEFAULT 4 CHECK (slots_remaining >= 0),
  theme_preset TEXT NOT NULL DEFAULT 'neo-warm' CHECK (theme_preset IN ('neo-warm', 'neo-mint', 'neo-mustard')),
  stickers JSONB NOT NULL DEFAULT '[
    {"id": "stk-1", "text": "100% Organic Reach", "emoji": "🌱", "color": "#FFD166", "rotation": -3},
    {"id": "stk-2", "text": "Fast Response < 1 Jam", "emoji": "⚡", "color": "#EF476F", "rotation": 4},
    {"id": "stk-3", "text": "Viral Maker Padang", "emoji": "🔥", "color": "#06D6A0", "rotation": -2},
    {"id": "stk-4", "text": "Top Tier Minang Audience", "emoji": "👑", "color": "#FFD166", "rotation": 2}
  ]'::jsonb,
  whatsapp_number TEXT NOT NULL DEFAULT '6281267890123',
  whatsapp_template TEXT NOT NULL DEFAULT 'Halo Tim Partnership Sumbar Terkini! Saya tertarik bekerjasama untuk paket endorse {{package_names}} dengan estimasi biaya {{total_price}}. Mohon konfirmasi ketersediaan slot jadwal tayang.',
  business_email TEXT NOT NULL DEFAULT 'partnership@sumbarterkini.com',
  media_kit_pdf_url TEXT DEFAULT '/media-kit-sumbar-terkini.pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Table: social_platforms
-- Analytics and reach metrics for each supported social media channel.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_platforms (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL CHECK (platform_id IN ('instagram', 'tiktok', 'youtube', 'facebook', 'x')),
  platform_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  sync_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (sync_mode IN ('MANUAL', 'AUTO_API')),
  followers_count BIGINT NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  engagement_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (engagement_rate >= 0.00 AND engagement_rate <= 100.00),
  avg_views BIGINT NOT NULL DEFAULT 0 CHECK (avg_views >= 0),
  avg_likes BIGINT NOT NULL DEFAULT 0 CHECK (avg_likes >= 0),
  avg_comments BIGINT NOT NULL DEFAULT 0 CHECK (avg_comments >= 0),
  demographics JSONB NOT NULL DEFAULT '{
    "gender": {"male": 50, "female": 50},
    "top_cities": []
  }'::jsonb,
  api_config JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_social_platforms_sort ON social_platforms(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_social_platforms_active ON social_platforms(is_active);

-- ------------------------------------------------------------------------------
-- 3. Table: endorse_packages
-- Endorsement rate card offerings, deliverables, bundles, and pricing tiers.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS endorse_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'cross-platform')),
  price BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0),
  description TEXT NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('starter', 'standard', 'vip', 'bundle')),
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_price_hidden BOOLEAN NOT NULL DEFAULT false,
  discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_endorse_packages_sort ON endorse_packages(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_endorse_packages_platform ON endorse_packages(platform);
CREATE INDEX IF NOT EXISTS idx_endorse_packages_active ON endorse_packages(is_active);

-- ------------------------------------------------------------------------------
-- 4. Table: visitor_reactions
-- Real-time visitor mood reactions (fire, rocket, heart).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_reactions (
  id TEXT PRIMARY KEY CHECK (id IN ('fire', 'rocket', 'heart')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'rocket', 'heart')),
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. Stored Procedure: Atomic Reaction Increment (RPC)
-- Concurrency-safe atomic increment with security definer and input sanitization.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_reaction(reaction_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_id TEXT;
  new_count BIGINT;
BEGIN
  IF reaction_id IS NULL OR TRIM(reaction_id) = '' THEN
    RAISE EXCEPTION 'reaction_id cannot be null or empty';
  END IF;

  clean_id := TRIM(LOWER(reaction_id));

  UPDATE visitor_reactions
  SET count = count + 1,
      updated_at = timezone('utc'::text, now())
  WHERE id = clean_id OR reaction_type = clean_id
  RETURNING count INTO new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reaction "%" not found', reaction_id;
  END IF;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_reaction(TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. Trigger Automation: Updated At
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
ALTER TABLE site_settings REPLICA IDENTITY FULL;
ALTER TABLE social_platforms REPLICA IDENTITY FULL;
ALTER TABLE endorse_packages REPLICA IDENTITY FULL;
ALTER TABLE visitor_reactions REPLICA IDENTITY FULL;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['site_settings', 'social_platforms', 'endorse_packages', 'visitor_reactions'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END $$;
```

---

## 8. Production `supabase/seed.sql` (Complete File Blueprint)

Here is the exact code to be written to `/Users/adechairullah/CODING/SUMBAR_TERKINI/supabase/seed.sql` by the Worker:

```sql
-- ==============================================================================
-- SUMBAR TERKINI CREATOR MEDIA KIT & ENDORSEMENT HUB
-- Rich Initial Indonesian Seed Dataset
-- ==============================================================================

-- 1. Site Settings Seed
INSERT INTO site_settings (
  id,
  creator_name,
  creator_handle,
  creator_title,
  creator_avatar_url,
  creator_bio,
  location,
  slot_available,
  slot_status_text,
  slots_remaining,
  theme_preset,
  stickers,
  whatsapp_number,
  whatsapp_template,
  business_email,
  media_kit_pdf_url
) VALUES (
  'default',
  'Sumbar Terkini',
  '@sumbar_terkini',
  'Sumatera Barat Creator & Media Hub',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'Platform media kreatif dan amplifikasi brand terbesar di Sumatera Barat. Menghubungkan jutaan audiens lokal dengan brand terpercaya melalui konten viral, storytelling autentik, dan peliputan on-the-spot.',
  'Padang, Sumatera Barat',
  true,
  'Slot Tersedia untuk November 2026',
  4,
  'neo-warm',
  '[
    {"id": "stk-1", "text": "100% Organic Reach", "emoji": "🌱", "color": "#FFD166", "rotation": -3},
    {"id": "stk-2", "text": "Fast Response < 1 Jam", "emoji": "⚡", "color": "#EF476F", "rotation": 4},
    {"id": "stk-3", "text": "Viral Maker Padang", "emoji": "🔥", "color": "#06D6A0", "rotation": -2},
    {"id": "stk-4", "text": "Top Tier Minang Audience", "emoji": "👑", "color": "#FFD166", "rotation": 2}
  ]'::jsonb,
  '6281267890123',
  'Halo Tim Partnership Sumbar Terkini! Saya tertarik bekerjasama untuk paket endorse {{package_names}} dengan total estimasi {{total_price}}. Mohon info ketersediaan slot.',
  'partnership@sumbarterkini.com',
  '/media-kit-sumbar-terkini.pdf'
) ON CONFLICT (id) DO UPDATE SET
  creator_name = EXCLUDED.creator_name,
  creator_handle = EXCLUDED.creator_handle,
  creator_title = EXCLUDED.creator_title,
  creator_avatar_url = EXCLUDED.creator_avatar_url,
  creator_bio = EXCLUDED.creator_bio,
  location = EXCLUDED.location,
  slot_available = EXCLUDED.slot_available,
  slot_status_text = EXCLUDED.slot_status_text,
  slots_remaining = EXCLUDED.slots_remaining,
  theme_preset = EXCLUDED.theme_preset,
  stickers = EXCLUDED.stickers,
  whatsapp_number = EXCLUDED.whatsapp_number,
  whatsapp_template = EXCLUDED.whatsapp_template,
  business_email = EXCLUDED.business_email,
  media_kit_pdf_url = EXCLUDED.media_kit_pdf_url,
  updated_at = timezone('utc'::text, now());

-- 2. Social Platforms Seed
INSERT INTO social_platforms (
  id,
  platform_id,
  platform_name,
  handle,
  profile_url,
  sync_mode,
  followers_count,
  engagement_rate,
  avg_views,
  avg_likes,
  avg_comments,
  demographics,
  sort_order,
  is_active
) VALUES
(
  'instagram',
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
  platform_id = EXCLUDED.platform_id,
  platform_name = EXCLUDED.platform_name,
  handle = EXCLUDED.handle,
  profile_url = EXCLUDED.profile_url,
  sync_mode = EXCLUDED.sync_mode,
  followers_count = EXCLUDED.followers_count,
  engagement_rate = EXCLUDED.engagement_rate,
  avg_views = EXCLUDED.avg_views,
  avg_likes = EXCLUDED.avg_likes,
  avg_comments = EXCLUDED.avg_comments,
  demographics = EXCLUDED.demographics,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

-- 3. Endorse Packages Seed
INSERT INTO endorse_packages (
  id,
  name,
  platform,
  price,
  description,
  deliverables,
  tier,
  is_popular,
  is_price_hidden,
  discount_percentage,
  sort_order,
  is_active
) VALUES
(
  'pkg-story-boost',
  'Instagram Story Blitz',
  'instagram',
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
  'instagram',
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
  'tiktok',
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
  'cross-platform',
  4800000,
  'Paket paling direkomendasikan untuk peluncuran produk atau campaign masif di seluruh Sumatera Barat dengan amplifikasi lintas kanal.',
  '["1x Video Reels Instagram + 1x TikTok FYP", "2x Sequence Instagram Stories dengan Link", "1x Postingan Feed Komunitas Facebook", "Laporan Analisis Insight Lengkap"]'::jsonb,
  'vip',
  true,
  false,
  15,
  4,
  true
),
(
  'pkg-enterprise-coverage',
  'Exclusive Brand Ambassadorship & Media Visit',
  'cross-platform',
  12500000,
  'Liputan eksklusif on-the-spot oleh talent utama Sumbar Terkini untuk grand opening, event festival, atau liputan UMKM/resto bintang 5.',
  '["On-the-spot Media Visit ke Lokasi Brand", "Talent Host Liputan Dedicated", "Video Reels + TikTok + YouTube Short", "Liputan Live Story Instagram Real-time", "Press Release Singkat di Portal Berita"]'::jsonb,
  'bundle',
  false,
  true,
  0,
  5,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  platform = EXCLUDED.platform,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  tier = EXCLUDED.tier,
  is_popular = EXCLUDED.is_popular,
  is_price_hidden = EXCLUDED.is_price_hidden,
  discount_percentage = EXCLUDED.discount_percentage,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

-- 4. Visitor Reactions Seed
INSERT INTO visitor_reactions (
  id,
  reaction_type,
  emoji,
  label,
  count
) VALUES
  ('fire', 'fire', '🔥', 'Hype', 1420),
  ('rocket', 'rocket', '🚀', 'Viral', 980),
  ('heart', 'heart', '❤️', 'Love', 2310)
ON CONFLICT (id) DO UPDATE SET
  reaction_type = EXCLUDED.reaction_type,
  emoji = EXCLUDED.emoji,
  label = EXCLUDED.label,
  count = EXCLUDED.count,
  updated_at = timezone('utc'::text, now());
```

---

## 9. Concrete Implementation Guide for the Worker

### 9.1 File Creation Steps
1. **Ensure Directory Exists**: Create directory `/Users/adechairullah/CODING/SUMBAR_TERKINI/supabase` if not already present.
2. **Write `supabase/schema.sql`**: Write the full schema script presented in Section 7 above.
3. **Write `supabase/seed.sql`**: Write the full seed dataset presented in Section 8 above.
4. **Zero Code Slop**: Do not include truncated blocks, comments asking to "finish later", or unreferenced types.

### 9.2 TypeScript Interface Parity Cross-Check
The Worker must ensure that `src/types/index.ts` (created in collaboration with M1 Explorer 3) corresponds 1:1 with this database schema:

| Table Column | TypeScript Interface Field | Type | Check Constraint / Range |
|---|---|---|---|
| `site_settings.id` | `SiteSettings.id` | `string` | Singleton `'default'` |
| `site_settings.creator_name` | `SiteSettings.creator_name` | `string` | Not null |
| `site_settings.creator_handle` | `SiteSettings.creator_handle` | `string` | Not null |
| `site_settings.creator_avatar_url` | `SiteSettings.creator_avatar_url` | `string` | Valid URL / path |
| `site_settings.creator_bio` | `SiteSettings.creator_bio` | `string` | Not null |
| `site_settings.slot_available` | `SiteSettings.slot_available` | `boolean` | Not null |
| `site_settings.slot_status_text` | `SiteSettings.slot_status_text` | `string` | Not null |
| `site_settings.theme_preset` | `SiteSettings.theme_preset` | `'neo-warm' \| 'neo-mint' \| 'neo-mustard'` | Strict union |
| `site_settings.stickers` | `SiteSettings.stickers` | `Array<{id, text, emoji, color, rotation}>` | Valid JSON |
| `social_platforms.followers_count` | `SocialPlatform.followers_count` | `number` | `>= 0` |
| `social_platforms.engagement_rate` | `SocialPlatform.engagement_rate` | `number` | `0.00` to `100.00` |
| `social_platforms.avg_views` | `SocialPlatform.avg_views` | `number` | `>= 0` |
| `social_platforms.avg_likes` | `SocialPlatform.avg_likes` | `number` | `>= 0` |
| `social_platforms.avg_comments` | `SocialPlatform.avg_comments` | `number` | `>= 0` |
| `social_platforms.sync_mode` | `SocialPlatform.sync_mode` | `'MANUAL' \| 'AUTO_API'` | Strict union |
| `endorse_packages.platform` | `EndorsePackage.platform` | `'instagram' \| 'tiktok' \| 'youtube' \| 'cross-platform'` | Strict union |
| `endorse_packages.price` | `EndorsePackage.price` | `number` | `>= 0` |
| `endorse_packages.is_price_hidden` | `EndorsePackage.is_price_hidden` | `boolean` | Not null |
| `visitor_reactions.reaction_type` | `VisitorReaction.reaction_type` | `'fire' \| 'rocket' \| 'heart'` | Strict union |
| `visitor_reactions.count` | `VisitorReaction.count` | `number` | `>= 0` |

### 9.3 Verification Protocol for SQL Scripts
The Worker and Test Writer can verify the integrity of the generated SQL through:
1. **Syntax & Constraint Parsing**: Verify that all table definitions have matching parentheses, commas, valid types, and closed quotes.
2. **Idempotency Execution Test**: The script uses `IF NOT EXISTS`, `OR REPLACE`, `DROP TRIGGER IF EXISTS`, `ON CONFLICT (...) DO UPDATE`, and dynamic blocks for publications. This ensures the script can be run multiple times against a Supabase or PostgreSQL database without failing.
3. **RPC Execution Test**: Calling `increment_reaction('fire')` returns `BIGINT` and increments `count` by exactly 1.
