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
