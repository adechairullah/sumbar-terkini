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
