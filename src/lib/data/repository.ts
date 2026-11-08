import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  PortfolioItem,
  DataRepository,
  RealtimeTable,
  BroadcastSyncEvent,
  ReactionType,
} from '@/types';
import { isSupabaseConfigured, createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { LocalStorageManager } from './storage';

type DbRow = Record<string, unknown>;

// ------------------------------------------------------------------------------
// Normalization Helpers (Maps DB snake_case columns to TypeScript contract)
// ------------------------------------------------------------------------------

function normalizeSiteSettings(row: DbRow): SiteSettings {
  return {
    id: String(row['id'] ?? 'default'),
    creator_name: String(row['creator_name'] ?? 'Sumbar Terkini'),
    creator_handle: String(row['creator_handle'] ?? '@sumbar_terkini'),
    creator_avatar_url: String(row['creator_avatar_url'] ?? row['avatar_url'] ?? ''),
    creator_bio: String(row['creator_bio'] ?? row['bio'] ?? ''),
    slot_available: Boolean(row['slot_available'] ?? row['is_available'] ?? true),
    slot_status_text: String(row['slot_status_text'] ?? row['availability_status'] ?? 'Slot Terbuka'),
    theme_preset: (row['theme_preset'] as SiteSettings['theme_preset']) ?? 'neo-warm',
    stickers: Array.isArray(row['stickers']) ? (row['stickers'] as SiteSettings['stickers']) : [],
    whatsapp_number: String(row['whatsapp_number'] ?? ''),
    whatsapp_template: String(row['whatsapp_template'] ?? ''),
    business_email:
      row['business_email'] && String(row['business_email']).includes('@') && !String(row['business_email']).includes('sumbarterkini')
        ? String(row['business_email'])
        : 'mrrobot4444@gmail.com',
    media_kit_pdf_url: String(row['media_kit_pdf_url'] ?? '/media-kit-sumbar-terkini.pdf'),
    creator_title: row['creator_title'] ? String(row['creator_title']) : undefined,
    portfolio_url: row['portfolio_url'] ? String(row['portfolio_url']) : undefined,
    location: row['location'] ? String(row['location']) : undefined,
    slots_remaining: row['slots_remaining'] !== undefined ? Number(row['slots_remaining']) : undefined,
    logo_text: row['logo_text'] ? String(row['logo_text']) : 'ST',
    logo_url: row['logo_url'] ? String(row['logo_url']) : undefined,
    announcement_text: row['announcement_text'] ? String(row['announcement_text']) : undefined,
    bento_badge_text: row['bento_badge_text'] ? String(row['bento_badge_text']) : undefined,
    bento_title_text: row['bento_title_text'] ? String(row['bento_title_text']) : undefined,
    bento_subtitle_text: row['bento_subtitle_text'] ? String(row['bento_subtitle_text']) : undefined,
    header_menu_items: Array.isArray(row['header_menu_items'])
      ? (row['header_menu_items'] as SiteSettings['header_menu_items'])
      : undefined,
    header_cta_text: row['header_cta_text'] ? String(row['header_cta_text']) : undefined,
    header_cta_href: row['header_cta_href'] ? String(row['header_cta_href']) : undefined,
    show_interactive_hub: row['show_interactive_hub'] !== undefined ? Boolean(row['show_interactive_hub']) : true,
    interactive_hub_default_tab: (row['interactive_hub_default_tab'] as SiteSettings['interactive_hub_default_tab']) ?? 'predictor',
    interactive_hub_title: row['interactive_hub_title'] ? String(row['interactive_hub_title']) : undefined,
    show_audience_pulse: row['show_audience_pulse'] !== undefined ? Boolean(row['show_audience_pulse']) : true,
    audience_pulse_title: row['audience_pulse_title'] ? String(row['audience_pulse_title']) : undefined,
    audience_pulse_badge: row['audience_pulse_badge'] ? String(row['audience_pulse_badge']) : undefined,
    show_trust_radar: row['show_trust_radar'] !== undefined ? Boolean(row['show_trust_radar']) : true,
    trust_radar_title: row['trust_radar_title'] ? String(row['trust_radar_title']) : undefined,
    trust_guarantee_1: row['trust_guarantee_1'] ? String(row['trust_guarantee_1']) : undefined,
    trust_guarantee_2: row['trust_guarantee_2'] ? String(row['trust_guarantee_2']) : undefined,
    trust_guarantee_3: row['trust_guarantee_3'] ? String(row['trust_guarantee_3']) : undefined,
    trust_bonus_text: row['trust_bonus_text'] ? String(row['trust_bonus_text']) : undefined,
    updated_at: String(row['updated_at'] ?? new Date().toISOString()),
  };
}

function normalizeSocialPlatform(row: DbRow): SocialPlatform {
  return {
    id: String(row['id']),
    platform_id: (row['platform_id'] ?? row['id']) as SocialPlatform['platform_id'],
    platform_name: String(row['platform_name'] ?? row['name'] ?? ''),
    handle: String(row['handle'] ?? ''),
    profile_url: String(row['profile_url'] ?? ''),
    sync_mode: (row['sync_mode'] ?? 'MANUAL') as SocialPlatform['sync_mode'],
    followers_count: Number(row['followers_count'] ?? 0),
    engagement_rate: Number(row['engagement_rate'] ?? 0),
    avg_views: Number(row['avg_views'] ?? row['average_views'] ?? 0),
    avg_likes: Number(row['avg_likes'] ?? row['average_likes'] ?? 0),
    avg_comments: Number(row['avg_comments'] ?? row['average_comments'] ?? 0),
    demographics: (row['demographics'] as SocialPlatform['demographics']) ?? {
      gender: { male: 50, female: 50 },
      top_cities: [],
    },
    api_config: (row['api_config'] as SocialPlatform['api_config']) ?? {},
    sort_order: Number(row['sort_order'] ?? 0),
    is_active: Boolean(row['is_active'] ?? true),
    last_synced_at: String(row['last_synced_at'] ?? new Date().toISOString()),
    updated_at: String(row['updated_at'] ?? new Date().toISOString()),
  };
}

function normalizeEndorsePackage(row: DbRow): EndorsePackage {
  return {
    id: String(row['id']),
    name: String(row['name'] ?? ''),
    platform: (String(row['platform'] ?? 'cross-platform').toLowerCase()) as EndorsePackage['platform'],
    price: Number(row['price'] ?? 0),
    description: String(row['description'] ?? ''),
    deliverables: Array.isArray(row['deliverables']) ? (row['deliverables'] as string[]) : [],
    is_popular: Boolean(row['is_popular']),
    is_price_hidden: Boolean(row['is_price_hidden']),
    sort_order: Number(row['sort_order'] ?? 0),
    is_active: Boolean(row['is_active'] ?? true),
    tier: (row['tier'] as EndorsePackage['tier']) ?? 'standard',
    discount_percentage: Number(row['discount_percentage'] ?? 0),
    updated_at: String(row['updated_at'] ?? new Date().toISOString()),
  };
}

function normalizeVisitorReaction(row: DbRow): VisitorReaction {
  const reactionType = (row['reaction_type'] ?? row['id']) as ReactionType;
  return {
    id: String(row['id'] ?? reactionType),
    reaction_type: reactionType,
    emoji: String(row['emoji'] ?? (reactionType === 'fire' ? '🔥' : reactionType === 'rocket' ? '🚀' : '❤️')),
    label: String(row['label'] ?? (reactionType === 'fire' ? 'Hype' : reactionType === 'rocket' ? 'Viral' : 'Love')),
    count: Number(row['count'] ?? 0),
    updated_at: String(row['updated_at'] ?? new Date().toISOString()),
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
            return normalizeSiteSettings(data as DbRow);
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
            creator_bio: updated.creator_bio,
            creator_avatar_url: updated.creator_avatar_url,
            slot_available: updated.slot_available,
            slot_status_text: updated.slot_status_text,
            theme_preset: updated.theme_preset,
            stickers: updated.stickers,
            whatsapp_number: updated.whatsapp_number,
            whatsapp_template: updated.whatsapp_template,
            business_email: updated.business_email,
            media_kit_pdf_url: updated.media_kit_pdf_url,
            location: updated.location,
            creator_title: updated.creator_title,
            logo_text: updated.logo_text,
            logo_url: updated.logo_url,
            announcement_text: updated.announcement_text,
            bento_badge_text: updated.bento_badge_text,
            bento_title_text: updated.bento_title_text,
            bento_subtitle_text: updated.bento_subtitle_text,
            header_menu_items: updated.header_menu_items,
            header_cta_text: updated.header_cta_text,
            header_cta_href: updated.header_cta_href,
            show_interactive_hub: updated.show_interactive_hub,
            interactive_hub_default_tab: updated.interactive_hub_default_tab,
            interactive_hub_title: updated.interactive_hub_title,
            show_audience_pulse: updated.show_audience_pulse,
            audience_pulse_title: updated.audience_pulse_title,
            audience_pulse_badge: updated.audience_pulse_badge,
            show_trust_radar: updated.show_trust_radar,
            trust_radar_title: updated.trust_radar_title,
            trust_guarantee_1: updated.trust_guarantee_1,
            trust_guarantee_2: updated.trust_guarantee_2,
            trust_guarantee_3: updated.trust_guarantee_3,
            trust_bonus_text: updated.trust_bonus_text,
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
            return (data as DbRow[]).map(normalizeSocialPlatform);
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

    const target = list[index];
    if (!target) {
      throw new Error(`Platform with id ${id} not found`);
    }

    const updated: SocialPlatform = {
      ...target,
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const dbPayload = {
            platform_name: updated.platform_name,
            handle: updated.handle,
            profile_url: updated.profile_url,
            followers_count: updated.followers_count,
            engagement_rate: updated.engagement_rate,
            avg_views: updated.avg_views,
            avg_likes: updated.avg_likes,
            avg_comments: updated.avg_comments,
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
            return (data as DbRow[]).map(normalizeEndorsePackage);
          }
        }
      } catch {
        // Fallback
      }
    }

    return [...LocalStorageManager.getState().endorsePackages].sort((a, b) => a.sort_order - b.sort_order);
  }

  async createEndorsePackage(pkg: Omit<EndorsePackage, 'id' | 'updated_at' | 'created_at'>): Promise<EndorsePackage> {
    const newId = `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
          const { error } = await client.from('endorse_packages').insert({
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

          if (!error) {
            return LocalStorageManager.atomicCreatePackage(created);
          }
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.atomicCreatePackage(created);
  }

  async updateEndorsePackage(id: string, data: Partial<EndorsePackage>): Promise<EndorsePackage> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const dbPayload: DbRow = {
            updated_at: new Date().toISOString(),
          };
          if (data.name !== undefined) dbPayload.name = data.name;
          if (data.platform !== undefined) dbPayload.platform = data.platform;
          if (data.price !== undefined) dbPayload.price = data.price;
          if (data.description !== undefined) dbPayload.description = data.description;
          if (data.deliverables !== undefined) dbPayload.deliverables = data.deliverables;
          if (data.tier !== undefined) dbPayload.tier = data.tier;
          if (data.is_popular !== undefined) dbPayload.is_popular = data.is_popular;
          if (data.is_price_hidden !== undefined) dbPayload.is_price_hidden = data.is_price_hidden;
          if (data.discount_percentage !== undefined) dbPayload.discount_percentage = data.discount_percentage;
          if (data.sort_order !== undefined) dbPayload.sort_order = data.sort_order;
          if (data.is_active !== undefined) dbPayload.is_active = data.is_active;

          const { error } = await client.from('endorse_packages').update(dbPayload).eq('id', id);
          if (!error) {
            return LocalStorageManager.atomicUpdatePackage(id, data);
          }
        }
      } catch {
        // Fallback to local mutation
      }
    }

    return LocalStorageManager.atomicUpdatePackage(id, data);
  }

  async deleteEndorsePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { error } = await client.from('endorse_packages').delete().eq('id', id);
          if (!error) {
            return LocalStorageManager.atomicDeletePackage(id);
          }
        }
      } catch {
        // Fallback to local mutation
      }
    }

    return LocalStorageManager.atomicDeletePackage(id);
  }

  // ----------------------------------------------------------------------------
  // 4. Portfolio Items (Viral Collaborations)
  // ----------------------------------------------------------------------------
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('portfolio_items')
            .select('*');

          if (!error && data && data.length > 0) {
            return data as unknown as PortfolioItem[];
          }
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.getState().portfolioItems;
  }

  async createPortfolioItem(item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> {
    const newId = `port-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const created: PortfolioItem = {
      ...item,
      id: newId,
    };

    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('portfolio_items').insert(created);
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.atomicCreatePortfolioItem(created);
  }

  async updatePortfolioItem(id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('portfolio_items').update(data).eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.atomicUpdatePortfolioItem(id, data);
  }

  async deletePortfolioItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          await client.from('portfolio_items').delete().eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    return LocalStorageManager.atomicDeletePortfolioItem(id);
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
            return (data as DbRow[]).map(normalizeVisitorReaction);
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

    // Fallback: Synchronous atomic increment in memory/localStorage
    return LocalStorageManager.atomicIncrementReaction(reactionType);
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
        void client.removeChannel(channel);
      };
    } catch {
      return LocalStorageManager.subscribe(table, callback);
    }
  }
}

// Singleton repository export
export const repository: DataRepository = new ResilientRepository();
