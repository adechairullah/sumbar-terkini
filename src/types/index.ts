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

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  is_active: boolean;
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
  logo_text?: string;
  logo_url?: string;
  announcement_text?: string;
  bento_badge_text?: string;
  bento_title_text?: string;
  bento_subtitle_text?: string;
  header_menu_items?: HeaderMenuItem[];
  header_cta_text?: string;
  header_cta_href?: string;
  show_interactive_hub?: boolean;
  interactive_hub_default_tab?: 'predictor' | 'highfive' | 'stats';
  interactive_hub_title?: string;
  show_audience_pulse?: boolean;
  audience_pulse_title?: string;
  audience_pulse_badge?: string;
  show_trust_radar?: boolean;
  trust_radar_title?: string;
  trust_guarantee_1?: string;
  trust_guarantee_2?: string;
  trust_guarantee_3?: string;
  trust_bonus_text?: string;
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

export type SyncStatus = 'synced' | 'cached_fallback' | 'skipped_manual' | 'skipped_manual_mode' | 'error';
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

export type RealtimeTable = 'site_settings' | 'social_platforms' | 'endorse_packages' | 'visitor_reactions' | 'portfolio_items';

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

  getPortfolioItems(): Promise<PortfolioItem[]>;
  createPortfolioItem(item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem>;
  updatePortfolioItem(id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem>;
  deletePortfolioItem(id: string): Promise<boolean>;

  getReactions(): Promise<VisitorReaction[]>;
  incrementReaction(reactionType: ReactionType): Promise<number>;

  subscribeToChanges(table: RealtimeTable, callback: (event: BroadcastSyncEvent) => void): () => void;
}
