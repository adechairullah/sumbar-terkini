import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  PortfolioItem,
  BroadcastSyncEvent,
  RealtimeTable,
  ReactionType,
} from '@/types';
import {
  initialSiteSettings,
  initialSocialPlatforms,
  initialEndorsePackages,
  initialVisitorReactions,
  initialPortfolioItems,
} from './mock-data';

interface LocalDatabaseState {
  siteSettings: SiteSettings;
  socialPlatforms: SocialPlatform[];
  endorsePackages: EndorsePackage[];
  visitorReactions: VisitorReaction[];
  portfolioItems: PortfolioItem[];
}

const STORAGE_KEYS = {
  SITE_SETTINGS: 'sumbar_settings_store',
  SOCIAL_PLATFORMS: 'sumbar_socials_store',
  ENDORSE_PACKAGES: 'sumbar_packages_store',
  VISITOR_REACTIONS: 'sumbar_reactions_store',
  PORTFOLIO_ITEMS: 'sumbar_portfolio_store',
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
    portfolioItems: initialPortfolioItems.map((item) => ({ ...item })),
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
      const storedPortfolio = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ITEMS);

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.business_email !== 'mrrobot4444@gmail.com') {
          parsed.business_email = 'mrrobot4444@gmail.com';
        }
        if (parsed.whatsapp_number !== '6289617662378') {
          parsed.whatsapp_number = '6289617662378';
        }
        globalThis.__SUMBAR_LOCAL_STORE__.siteSettings = parsed;
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
      if (storedPortfolio) {
        globalThis.__SUMBAR_LOCAL_STORE__.portfolioItems = JSON.parse(storedPortfolio);
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
        } else if (key === 'portfolioItems') {
          localStorage.setItem(STORAGE_KEYS.PORTFOLIO_ITEMS, JSON.stringify(value));
        }
      } catch {
        // Storage quota exceeded or blocked
      }

      this.broadcast(table, action, value);

      // Asynchronously mirror client-side state mutation to server memory
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        void fetch('/api/sync-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        }).catch(() => {});
      }
    }
  }

  /**
   * Synchronously increments a reaction counter atomically in memory and local storage,
   * avoiding async read-modify-write race conditions under concurrent burst calls.
   */
  public static atomicIncrementReaction(reactionType: ReactionType): number {
    const state = this.getState();
    const target = state.visitorReactions.find(
      (r) => r.reaction_type === reactionType || r.id === reactionType
    );

    if (!target) {
      throw new Error(`Reaction ${reactionType} not found`);
    }

    target.count += 1;
    target.updated_at = new Date().toISOString();

    this.saveState('visitorReactions', state.visitorReactions, 'visitor_reactions', 'UPDATE');

    return target.count;
  }

  /**
   * Synchronously and atomically creates a package in memory and localStorage.
   */
  public static atomicCreatePackage(pkg: EndorsePackage): EndorsePackage {
    const state = this.getState();
    const newList = [...state.endorsePackages, pkg];
    this.saveState('endorsePackages', newList, 'endorse_packages', 'INSERT');
    return pkg;
  }

  /**
   * Synchronously and atomically updates an existing package in memory and localStorage.
   * Throws an error if the package ID is not found.
   */
  public static atomicUpdatePackage(id: string, data: Partial<EndorsePackage>): EndorsePackage {
    const state = this.getState();
    const index = state.endorsePackages.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Endorse package with id ${id} not found`);
    }

    const target = state.endorsePackages[index]!;
    const updated: EndorsePackage = {
      ...target,
      ...data,
      updated_at: new Date().toISOString(),
    };

    const updatedList = [...state.endorsePackages];
    updatedList[index] = updated;

    this.saveState('endorsePackages', updatedList, 'endorse_packages', 'UPDATE');
    return updated;
  }

  /**
   * Synchronously and atomically deletes a package from memory and localStorage.
   * Returns true if deleted, false if package ID was not found.
   */
  public static atomicDeletePackage(id: string): boolean {
    const state = this.getState();
    const index = state.endorsePackages.findIndex((p) => p.id === id);

    if (index === -1) {
      return false;
    }

    const filtered = state.endorsePackages.filter((p) => p.id !== id);
    this.saveState('endorsePackages', filtered, 'endorse_packages', 'DELETE');
    return true;
  }

  /**
   * Synchronously and atomically creates a portfolio item in memory and localStorage.
   */
  public static atomicCreatePortfolioItem(item: PortfolioItem): PortfolioItem {
    const state = this.getState();
    const newList = [...state.portfolioItems, item];
    this.saveState('portfolioItems', newList, 'portfolio_items', 'INSERT');
    return item;
  }

  /**
   * Synchronously and atomically updates an existing portfolio item in memory and localStorage.
   */
  public static atomicUpdatePortfolioItem(id: string, data: Partial<PortfolioItem>): PortfolioItem {
    const state = this.getState();
    const index = state.portfolioItems.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Portfolio item with id ${id} not found`);
    }

    const target = state.portfolioItems[index]!;
    const updated: PortfolioItem = {
      ...target,
      ...data,
    };

    const updatedList = [...state.portfolioItems];
    updatedList[index] = updated;

    this.saveState('portfolioItems', updatedList, 'portfolio_items', 'UPDATE');
    return updated;
  }

  /**
   * Synchronously and atomically deletes a portfolio item from memory and localStorage.
   */
  public static atomicDeletePortfolioItem(id: string): boolean {
    const state = this.getState();
    const index = state.portfolioItems.findIndex((p) => p.id === id);

    if (index === -1) {
      return false;
    }

    const filtered = state.portfolioItems.filter((p) => p.id !== id);
    this.saveState('portfolioItems', filtered, 'portfolio_items', 'DELETE');
    return true;
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
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIO_ITEMS);
    }
  }
}
