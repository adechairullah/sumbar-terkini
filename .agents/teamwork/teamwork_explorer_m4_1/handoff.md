# Handoff Report: Component Architecture & Admin Page Layout Plan (M4.1)

**Agent**: `teamwork_explorer_m4_1`  
**Milestone**: Milestone 4 (M4: Full CMS Admin Panel at `/admin`)  
**Scope**: Component Architecture, Authentication Gate Integration, Admin Page Shell Layout, Split-Screen Live Preview & Real-Time Reactivity Engine  
**Target Files Planned**:
- `src/app/admin/page.tsx` (New)
- `src/components/admin/AdminHeader.tsx` (New)
- `src/components/admin/LivePreviewFrame.tsx` (New)
- `src/lib/admin/auth.ts` (Cookie augmentation)

---

## 1. Observation

### 1.1 Existing Files and Codebase State
1. **Admin Directory**:
   - `src/app/admin/` does not currently exist (`ls: src/app/admin/: No such file or directory`).
   - `src/components/admin/` contains only `AdminLoginGate.tsx`.
2. **Authentication Subsystem (`src/lib/admin/auth.ts`)**:
   - In `src/lib/admin/auth.ts`:
     - Line 5: `const ADMIN_PASSCODE_KEY = 'sumbar_admin_auth';`
     - Line 6: `const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours`
     - Lines 27-41: Session verification only accesses `sessionStorage.getItem(ADMIN_PASSCODE_KEY)`.
     - Lines 90-95: Valid passcodes checked are `getPasscode()` (`NEXT_PUBLIC_ADMIN_PASSCODE || 'sumbar2026'`), `'admin123'`, `'sumbar2026'`, and `'admin'`.
     - Lines 141-156: `logoutAdmin()` removes `sessionStorage.removeItem(ADMIN_PASSCODE_KEY)` and calls `supabase.auth.signOut()` if Supabase is configured.
     - **Observation**: Currently, no cookie is set or checked in `auth.ts`. `sessionStorage` is isolated per browser tab. If an admin opens a new tab or refreshes in certain browser sandbox contexts, the session is not shared unless a cookie is synchronized.
3. **Login Gate Component (`src/components/admin/AdminLoginGate.tsx`)**:
   - Lines 10-12:
     ```typescript
     interface AdminLoginGateProps {
       onAuthenticated: () => void;
     }
     ```
   - Lines 25-39: `handlePasscodeLogin` calls `loginWithPasscode(passcode)`. If successful, invokes `onAuthenticated()`.
   - Lines 41-55: `handleSupabaseLogin` calls `loginWithSupabase(email, password)`. If successful, invokes `onAuthenticated()`.
   - Full Neo-Brutalist styling implemented with `NeoCard`, `NeoButton`, and Lucide icons.
4. **Data Access Layer & Realtime Synchronizer (`src/lib/data/repository.ts` & `src/lib/data/storage.ts`)**:
   - In `src/lib/data/storage.ts`:
     - Line 31: `const BROADCAST_CHANNEL_NAME = 'sumbar_terkini_channel';`
     - Lines 190-209: `LocalStorageManager.broadcast` creates a `new BroadcastChannel('sumbar_terkini_channel')` and posts `BroadcastSyncEvent<T>`.
     - Lines 211-233: `LocalStorageManager.subscribe(table, callback)` listens for incoming `BroadcastSyncEvent` and invokes the callback if `data.table === table || table === undefined`.
   - In `src/lib/data/repository.ts`:
     - Lines 416-455: `ResilientRepository.subscribeToChanges(table, callback)` handles dual subscriptions (PostgreSQL Supabase Realtime + local `LocalStorageManager.subscribe`), returning an unsubscribe teardown function `() => void`.
5. **Design System & Anti-Slop Specifications**:
   - `src/app/globals.css`:
     - Neo-Brutalist Soft tokens: `bg-paper` (`#FAF8F5`), `border-2 border-ink` (`#1E1E1E`), `shadow-neo` (`4px 4px 0px #1E1E1E`), `shadow-neo-sm` (`2px 2px 0px #1E1E1E`), mustard (`#FFD166`), coral (`#EF476F`), mint (`#06D6A0`).
     - Fonts: Plus Jakarta Sans (`font-sans`), Space Mono (`font-mono`).
     - Touch targets: `min-h-[44px]` for action buttons.
     - Contrast: All foreground/background color combinations satisfy WCAG AA >= 4.5:1 / AAA >= 7.0:1 (verified in `tests/unit/m3-components.test.ts`).

---

## 2. Logic Chain

### 2.1 Authentication State & Dual-Persistence (`sessionStorage` + Cookie)
1. **Problem**:
   - `sessionStorage` is strictly scoped to the current browser tab. If an admin opens a new tab to preview changes, or opens `/admin` in a new window, they would be prompted to log in again.
   - Server-side route handlers or middleware (if added) cannot read `sessionStorage`.
2. **Solution**:
   - Implement dual-persistence:
     - On successful login (`loginWithPasscode` or `loginWithSupabase`), write to both `sessionStorage` AND `document.cookie`:
       ```typescript
       document.cookie = `sumbar_admin_auth=true; path=/; max-age=86400; SameSite=Lax`;
       ```
     - In `checkAdminAuth()`, check `sessionStorage` first. If missing, check `document.cookie`. If the cookie exists, rehydrate `sessionStorage` so the active tab maintains the session.
     - On `logoutAdmin()`, clear both `sessionStorage.removeItem('sumbar_admin_auth')` and expire the cookie:
       ```typescript
       document.cookie = `sumbar_admin_auth=; path=/; max-age=0; SameSite=Lax`;
       ```
3. **Admin Page Gate Flow**:
   - `src/app/admin/page.tsx` starts with `authStatus = 'loading'`.
   - `useEffect` invokes `checkAdminAuth()`.
   - If unauthenticated, render `<AdminLoginGate onAuthenticated={() => setAuthStatus('authenticated')} />`.
   - If authenticated, render the full admin dashboard shell.
   - When the user clicks "Keluar" (Logout) in `AdminHeader`, execute `await logoutAdmin()` and transition `authStatus = 'unauthenticated'`.

### 2.2 Neo-Brutalist Layout Shell Architecture
1. **Header Component (`AdminHeader.tsx`)**:
   - Neo-Brutalist sticky navigation header (`sticky top-0 z-30 bg-paper/95 backdrop-blur border-b-2 border-ink`).
   - Visual status pill with pulsing green dot (`bg-mint`): shows "Passcode Mode" or "Supabase: admin@...".
   - Segmented tab control with 4 distinct tabs:
     1. `Profile & Hero` (`profile`): Creator identity, bio, avatar, slot availability, theme preset, stickers.
     2. `Social & Metrics` (`socials`): Social platforms list, MANUAL vs AUTO_API toggle, demographic editors, ER calculator helper, sync trigger.
     3. `Packages & Rates` (`packages`): Endorsement packages CRUD (name, platform, price, description, deliverables, tier, discount, toggles).
     4. `Contact & Settings` (`contact`): WhatsApp business number validation, order message template, email regex, PDF download URL.
   - Desktop view switcher: Segmented buttons for `Split Screen` (`Columns` icon) | `Editor Only` (`Maximize2` icon) | `Preview Only` (`Eye` icon).
   - Quick action link: "Lihat Publik" (`Link href="/" target="_blank"`) with `ExternalLink` icon.
   - Logout button: NeoButton with coral hover, calling `onLogout`.
2. **Responsive Screen Reflow**:
   - Desktop (`>= 1024px`):
     - `split` mode: Editor takes 58% width with smooth independent vertical scrolling (`overflow-y-auto max-h-[calc(100vh-73px)]`); Live Preview takes 42% width docked on the right side (`sticky top-[73px] h-[calc(100vh-73px)]`).
     - `editor` mode: Editor takes full width centered (`max-w-5xl mx-auto`).
     - `preview` mode: Preview takes full width.
   - Mobile & Tablet (`< 1024px`):
     - Single column editor for touch ergonomics (`min-h-[44px]` touch targets).
     - Fixed Floating Action Button (FAB) at bottom-right (`bg-mustard border-2 border-ink shadow-neo px-4 py-3 rounded-xl font-mono font-bold flex items-center gap-2`).
     - Clicking the FAB opens a mobile slide-over drawer / full-screen overlay rendering `<LivePreviewFrame onClose={() => setIsMobilePreviewOpen(false)} />`.

### 2.3 Real-Time Reactivity Engine & Split-Screen Preview (`LivePreviewFrame.tsx`)
1. **How Editor Changes Propagate**:
   - When an admin updates data in any editor tab (e.g. `repository.updateSiteSettings`, `repository.updateSocialPlatform`, `repository.updateEndorsePackage`):
     1. The repository updates internal memory and saves to `localStorage`.
     2. `LocalStorageManager.broadcast` sends a message to `BroadcastChannel('sumbar_terkini_channel')`.
     3. PostgreSQL Supabase Realtime emits `postgres_changes` event if Supabase is connected.
2. **Reactivity inside `LivePreviewFrame.tsx`**:
   - `LivePreviewFrame` mounts and calls `repository.subscribeToChanges` for:
     - `'site_settings'`
     - `'social_platforms'`
     - `'endorse_packages'`
     - `'visitor_reactions'`
   - Also listens to `window.BroadcastChannel('sumbar_terkini_channel')` and `window.addEventListener('storage')`.
   - On each event, it updates its local React state (`settings`, `platforms`, `packages`, `reactions`) and updates a "Synced at HH:mm:ss" indicator.
3. **Dual Preview Presentation Engine**:
   - **Mode A: Direct Reactive Components (Default)**:
     - Directly renders `<HeroSection settings={settings} reactions={reactions} />`, `<BentoGrid platforms={platforms} />`, `<RateCalculator packages={packages} ... />`, and `<ContactHub settings={settings} />`.
     - **Benefit**: Zero-latency (0ms), immediate feedback as the user edits or saves, no iframe reload flash, zero network round-trip.
   - **Mode B: True Viewport Iframe (`<iframe src="/" />`)**:
     - Embeds `/` inside an iframe.
     - When `BroadcastChannel` fires, the iframe is instructed to revalidate / reload smoothly.
     - **Benefit**: Genuine CSS media query evaluation (`@media (min-width: 640px)`) against isolated device widths (`375px`, `768px`, `100%`).
   - A toggle in the frame header allows admins to switch between "Komponen Langsung" (Instant) and "Iframe Browser" (Isolated).
4. **Device Viewport Controls**:
   - Mobile: `w-[375px]` with centered device frame bezel and shadows.
   - Tablet: `w-[768px]` with tablet frame styling.
   - Desktop: `w-full` fluid view.
   - Manual refresh button (`RotateCw`) and pop-out button (`ExternalLink`).

---

## 3. Caveats

1. **Subsequent Milestones Dependencies**:
   - `ProfileHeroEditor.tsx`, `StickersManager.tsx` are slated for Milestone 4.2.
   - `SocialMediaManager.tsx`, `PackageBuilder.tsx` are slated for Milestone 4.3.
   - `ContactSettingsEditor.tsx` is slated for Milestone 4.4.
   - In `src/app/admin/page.tsx`, clean modular placeholders / container slots must be provided so that M4.2-M4.4 implementers can insert their editor components without altering the layout shell or auth gate.
2. **Browser Storage Restrictions**:
   - In Safari Private Browsing or when third-party storage is blocked, `sessionStorage` or `BroadcastChannel` may throw if unhandled. Both `LocalStorageManager` and our proposed components include robust `try/catch` and fallback to in-memory state.
3. **Server-Side Rendering (SSR) Boundary**:
   - Both `src/app/admin/page.tsx` and `LivePreviewFrame.tsx` must be marked with `'use client'` because they access browser APIs (`window`, `sessionStorage`, `document.cookie`, `BroadcastChannel`).

---

## 4. Conclusion & Component Interface Specifications

### 4.1 Specification: `src/lib/admin/auth.ts` (Cookie Augmentation)
To ensure authentication survives new tabs and adheres to the dual-persistence requirement, update `src/lib/admin/auth.ts`:

```typescript
// Helper functions in src/lib/admin/auth.ts
const COOKIE_NAME = 'sumbar_admin_auth';

function setAuthCookie(maxAgeSeconds = 86400): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=true; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((item) => item.trim().startsWith(`${COOKIE_NAME}=`));
}
```

In `setStoredSession(session)`:
```typescript
function setStoredSession(session: StoredSession): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(ADMIN_PASSCODE_KEY, JSON.stringify(session));
    setAuthCookie(ADMIN_SESSION_DURATION_MS / 1000);
  } catch {
    // sessionStorage quota or private mode
  }
}
```

In `checkAdminAuth()`:
```typescript
// If sessionStorage is empty, check cookie fallback
const stored = getStoredSession();
if (stored?.authenticated) {
  return { authenticated: true, method: stored.method, email: stored.email };
}

if (hasAuthCookie()) {
  // Rehydrate sessionStorage from cookie
  setStoredSession({
    authenticated: true,
    method: 'passcode',
    timestamp: Date.now(),
  });
  return { authenticated: true, method: 'passcode' };
}
```

In `logoutAdmin()`:
```typescript
export async function logoutAdmin(): Promise<void> {
  if (isBrowser()) {
    sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
    clearAuthCookie();
  }
  // Supabase sign out...
}
```

---

### 4.2 Specification & Code: `src/components/admin/AdminHeader.tsx`

#### Interfaces & Props
```typescript
export type AdminTab = 'profile' | 'socials' | 'packages' | 'contact';
export type DesktopLayoutMode = 'split' | 'editor' | 'preview';

export interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  authMethod?: 'supabase' | 'passcode' | 'none';
  authEmail?: string;
  desktopLayoutMode: DesktopLayoutMode;
  onDesktopLayoutModeChange: (mode: DesktopLayoutMode) => void;
  onOpenMobilePreview: () => void;
}
```

#### Complete Implementation (`src/components/admin/AdminHeader.tsx`)
```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BarChart3,
  Package,
  Settings,
  Columns,
  Maximize2,
  Eye,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { NeoButton } from '@/components/ui/NeoButton';
import { cn } from '@/lib/utils/cn';

export type AdminTab = 'profile' | 'socials' | 'packages' | 'contact';
export type DesktopLayoutMode = 'split' | 'editor' | 'preview';

export interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  authMethod?: 'supabase' | 'passcode' | 'none';
  authEmail?: string;
  desktopLayoutMode: DesktopLayoutMode;
  onDesktopLayoutModeChange: (mode: DesktopLayoutMode) => void;
  onOpenMobilePreview: () => void;
}

const TABS: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'profile', label: 'Profile & Hero', icon: Sparkles },
  { id: 'socials', label: 'Social & Metrics', icon: BarChart3 },
  { id: 'packages', label: 'Packages & Rates', icon: Package },
  { id: 'contact', label: 'Contact & Settings', icon: Settings },
];

export function AdminHeader({
  activeTab,
  onTabChange,
  onLogout,
  authMethod = 'passcode',
  authEmail,
  desktopLayoutMode,
  onDesktopLayoutModeChange,
  onOpenMobilePreview,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-b-2 border-ink px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand & Auth Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-mustard text-ink font-mono font-black flex items-center justify-center border-2 border-ink shadow-neo-sm">
              ST
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-ink tracking-tight leading-tight">
                  Admin CMS Hub
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-ink bg-mint/20 text-ink font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  {authMethod === 'supabase' && authEmail ? authEmail : 'Passcode Mode'}
                </span>
              </div>
              <p className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider">
                Sumbar Terkini • Creator Media Kit
              </p>
            </div>
          </div>

          {/* Mobile Preview & Logout Action */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenMobilePreview}
              className="px-3 py-1.5 rounded-lg border-2 border-ink bg-mustard text-ink font-mono text-xs font-bold shadow-neo-sm flex items-center gap-1.5 min-h-[38px]"
              aria-label="Buka Live Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg border-2 border-ink bg-white text-coral hover:bg-coral/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Keluar dari Admin"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Admin Navigation Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border-2 border-ink font-mono text-xs font-bold whitespace-nowrap transition-all select-none min-h-[40px]',
                  isActive
                    ? 'bg-ink text-paper shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-ink hover:bg-mustard/30 shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-mustard' : 'text-ink/70')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls (Layout Switcher, Public View, Logout) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Split / Editor / Preview Viewport Mode Switcher */}
          <div className="flex items-center bg-white border-2 border-ink rounded-xl p-0.5 shadow-neo-sm">
            <button
              type="button"
              onClick={() => onDesktopLayoutModeChange('split')}
              title="Split View (Editor + Live Preview)"
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1 transition-colors min-h-[34px]',
                desktopLayoutMode === 'split' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
              )}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => onDesktopLayoutModeChange('editor')}
              title="Editor Penuh"
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1 transition-colors min-h-[34px]',
                desktopLayoutMode === 'editor' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
              )}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => onDesktopLayoutModeChange('preview')}
              title="Preview Penuh"
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1 transition-colors min-h-[34px]',
                desktopLayoutMode === 'preview' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Quick link to public page */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-button text-xs font-mono py-2 px-3 bg-white text-ink rounded-xl flex items-center gap-1.5 min-h-[38px] hover:bg-paper"
            title="Buka Website Publik di Tab Baru"
          >
            <span>Lihat Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink/70" />
          </Link>

          {/* Logout button */}
          <NeoButton
            variant="paper"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-coral border-coral hover:bg-coral hover:text-paper min-h-[38px]"
            title="Keluar dari Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </NeoButton>
        </div>
      </div>
    </header>
  );
}
```

---

### 4.3 Specification & Code: `src/components/admin/LivePreviewFrame.tsx`

#### Interfaces & Props
```typescript
export interface LivePreviewFrameProps {
  className?: string;
  onClose?: () => void; // Provided when rendered inside a mobile drawer
  initialDevice?: 'mobile' | 'tablet' | 'desktop';
  defaultViewMode?: 'components' | 'iframe';
}
```

#### Complete Implementation (`src/components/admin/LivePreviewFrame.tsx`)
```typescript
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ExternalLink,
  X,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import {
  SiteSettings,
  SocialPlatform,
  EndorsePackage,
  VisitorReaction,
  BroadcastSyncEvent,
} from '@/types';
import { HeroSection } from '@/components/hero/HeroSection';
import { BentoGrid } from '@/components/socials/BentoGrid';
import { RateCalculator } from '@/components/calculator/RateCalculator';
import { ContactHub } from '@/components/contact/ContactHub';
import { cn } from '@/lib/utils/cn';

export interface LivePreviewFrameProps {
  className?: string;
  onClose?: () => void;
  initialDevice?: 'mobile' | 'tablet' | 'desktop';
  defaultViewMode?: 'components' | 'iframe';
}

export function LivePreviewFrame({
  className,
  onClose,
  initialDevice = 'mobile',
  defaultViewMode = 'components',
}: LivePreviewFrameProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(initialDevice);
  const [viewMode, setViewMode] = useState<'components' | 'iframe'>(defaultViewMode);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [packages, setPackages] = useState<EndorsePackage[]>([]);
  const [reactions, setReactions] = useState<VisitorReaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Memuat...');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load initial repository state
  const loadInitialData = useCallback(async () => {
    try {
      const [s, pl, pk, rx] = await Promise.all([
        repository.getSiteSettings(),
        repository.getSocialPlatforms(),
        repository.getEndorsePackages(),
        repository.getReactions(),
      ]);
      setSettings(s);
      setPlatforms(pl);
      setPackages(pk);
      setReactions(rx);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // Real-time synchronization via DAL & BroadcastChannel
  useEffect(() => {
    const handleSync = (tableName: string) => {
      setIsSyncing(true);
      void loadInitialData().finally(() => {
        setTimeout(() => setIsSyncing(false), 400);
      });
      // Also reload iframe if in iframe mode
      if (viewMode === 'iframe' && iframeRef.current) {
        setIframeKey(Date.now());
      }
    };

    const unsubSettings = repository.subscribeToChanges('site_settings', () => handleSync('site_settings'));
    const unsubSocials = repository.subscribeToChanges('social_platforms', () => handleSync('social_platforms'));
    const unsubPackages = repository.subscribeToChanges('endorse_packages', () => handleSync('endorse_packages'));
    const unsubReactions = repository.subscribeToChanges('visitor_reactions', () => handleSync('visitor_reactions'));

    // Redundant window storage event for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('sumbar_')) {
        handleSync('storage');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubSettings();
      unsubSocials();
      unsubPackages();
      unsubReactions();
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadInitialData, viewMode]);

  const handleManualReload = () => {
    setIsSyncing(true);
    setIframeKey(Date.now());
    void loadInitialData().finally(() => {
      setTimeout(() => setIsSyncing(false), 400);
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-2 border-ink rounded-2xl shadow-neo overflow-hidden font-sans',
        className
      )}
    >
      {/* Frame Top Chrome / Control Toolbar */}
      <div className="bg-paper border-b-2 border-ink px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shrink-0">
        {/* Mock window traffic light dots & live badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-coral" />
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-mustard" />
            <span className="w-2.5 h-2.5 rounded-full border border-ink bg-mint" />
          </div>

          <div className="flex items-center gap-1.5 ml-2 font-mono text-[11px] font-bold text-ink/70">
            <span
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                isSyncing ? 'bg-mustard animate-ping' : 'bg-mint'
              )}
            />
            <span className="hidden sm:inline">
              {isSyncing ? 'Sinkronisasi...' : `Sinkron ${lastSyncTime}`}
            </span>
          </div>
        </div>

        {/* Device Viewport Selector */}
        <div className="flex items-center bg-white border-2 border-ink rounded-lg p-0.5 shadow-neo-sm">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            title="Mobile View (375px)"
            className={cn(
              'p-1.5 rounded font-mono text-xs font-bold transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center',
              device === 'mobile' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Mobile Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
            className={cn(
              'p-1.5 rounded font-mono text-xs font-bold transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center',
              device === 'tablet' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Tablet Viewport"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            title="Desktop / Fluid View (100%)"
            className={cn(
              'p-1.5 rounded font-mono text-xs font-bold transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center',
              device === 'desktop' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
            )}
            aria-label="Desktop Viewport"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Switcher & Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'components' ? 'iframe' : 'components'))}
            className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded border border-ink text-[10px] font-mono font-bold bg-white hover:bg-paper min-h-[30px]"
            title="Ganti Mode: Komponen Langsung vs Iframe Browser"
          >
            <Layers className="w-3 h-3" />
            <span>{viewMode === 'components' ? 'Komponen' : 'Iframe'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualReload}
            className="p-1.5 rounded border border-ink text-ink hover:bg-paper transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Refresh Live Preview"
            aria-label="Refresh Preview"
          >
            <RotateCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded border border-ink text-ink hover:bg-paper transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Buka Website di Tab Baru"
            aria-label="Open New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded border border-ink bg-coral/20 text-coral hover:bg-coral hover:text-paper transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center ml-1"
              title="Tutup Preview"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Body / Scaled Viewport Container */}
      <div className="flex-1 bg-paper/60 p-2 sm:p-4 overflow-y-auto flex items-start justify-center">
        <div
          className={cn(
            'bg-paper border-2 border-ink shadow-neo rounded-xl overflow-hidden transition-all duration-300 w-full',
            device === 'mobile' && 'max-w-[375px]',
            device === 'tablet' && 'max-w-[768px]',
            device === 'desktop' && 'max-w-full'
          )}
        >
          {viewMode === 'components' && settings ? (
            <div className="divide-y-2 divide-ink/20">
              {/* Preview Announcement Bar */}
              <div className="bg-mustard border-b-2 border-ink py-1.5 px-3 text-center font-mono text-[10px] font-bold text-ink flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>[PREVIEW MODE] Media Kit Sumbar Terkini</span>
              </div>

              {/* Live Rendered Public Sections */}
              <div className="p-3 sm:p-4 space-y-6">
                <HeroSection settings={settings} reactions={reactions} />
                <BentoGrid platforms={platforms} />
                <RateCalculator
                  packages={packages}
                  whatsappNumber={settings.whatsapp_number}
                  creatorName={settings.creator_name}
                />
                <ContactHub settings={settings} />
              </div>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/"
              title="Live Preview Website"
              className="w-full min-h-[750px] border-none bg-paper"
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 4.4 Specification & Code: `src/app/admin/page.tsx`

#### Complete Implementation (`src/app/admin/page.tsx`)
```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { checkAdminAuth, logoutAdmin } from '@/lib/admin/auth';
import { AdminLoginGate } from '@/components/admin/AdminLoginGate';
import { AdminHeader, AdminTab, DesktopLayoutMode } from '@/components/admin/AdminHeader';
import { LivePreviewFrame } from '@/components/admin/LivePreviewFrame';
import { NeoCard } from '@/components/ui/NeoCard';
import { Sparkles, BarChart3, Package, Settings, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [authMethod, setAuthMethod] = useState<'supabase' | 'passcode' | 'none'>('none');
  const [authEmail, setAuthEmail] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [desktopLayoutMode, setDesktopLayoutMode] = useState<DesktopLayoutMode>('split');
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState<boolean>(false);

  const verifyAuth = useCallback(async () => {
    try {
      const auth = await checkAdminAuth();
      if (auth.authenticated) {
        setAuthStatus('authenticated');
        setAuthMethod(auth.method);
        setAuthEmail(auth.email);
      } else {
        setAuthStatus('unauthenticated');
      }
    } catch {
      setAuthStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void verifyAuth();
  }, [verifyAuth]);

  const handleAuthenticated = () => {
    void verifyAuth();
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthStatus('unauthenticated');
    setAuthMethod('none');
    setAuthEmail(undefined);
  };

  // 1. Loading Skeleton Screen
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-sans">
        <NeoCard className="p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-mustard border-2 border-ink shadow-neo mx-auto flex items-center justify-center animate-bounce">
            <RefreshCw className="w-6 h-6 text-ink animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">Memverifikasi Sesi</h2>
            <p className="font-mono text-xs text-ink/60 mt-1">
              Menghubungkan ke Admin CMS Gate...
            </p>
          </div>
        </NeoCard>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (authStatus === 'unauthenticated') {
    return <AdminLoginGate onAuthenticated={handleAuthenticated} />;
  }

  // 3. Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-mustard selection:text-ink">
      {/* Top Header */}
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        authMethod={authMethod}
        authEmail={authEmail}
        desktopLayoutMode={desktopLayoutMode}
        onDesktopLayoutModeChange={setDesktopLayoutMode}
        onOpenMobilePreview={() => setIsMobilePreviewOpen(true)}
      />

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Tabbed Editor Panels */}
          <div
            className={cn(
              'w-full transition-all duration-200',
              desktopLayoutMode === 'split' && 'lg:w-7/12 xl:w-3/5',
              desktopLayoutMode === 'editor' && 'w-full max-w-5xl mx-auto',
              desktopLayoutMode === 'preview' && 'hidden'
            )}
          >
            {activeTab === 'profile' && (
              <div id="tab-profile-panel" role="tabpanel" aria-labelledby="tab-profile">
                {/* Milestone 4.2 slot: <ProfileHeroEditor /> */}
                <NeoCard className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
                    <div className="w-10 h-10 rounded-xl bg-mustard border-2 border-ink shadow-neo-sm flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink">Profile & Hero Editor</h2>
                      <p className="font-mono text-xs text-ink/60">
                        Atur bio kreator, avatar, status slot endorsement, dan stiker interaktif
                      </p>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-ink/40 rounded-xl text-center bg-paper/50">
                    <p className="font-mono text-sm font-bold text-ink">
                      Modul Profile & Hero Editor (Milestone 4.2)
                    </p>
                    <p className="font-mono text-xs text-ink/50 mt-1">
                      Komponen `ProfileHeroEditor.tsx` & `StickersManager.tsx` akan dihubungkan di sini.
                    </p>
                  </div>
                </NeoCard>
              </div>
            )}

            {activeTab === 'socials' && (
              <div id="tab-socials-panel" role="tabpanel" aria-labelledby="tab-socials">
                {/* Milestone 4.3 slot: <SocialMediaManager /> */}
                <NeoCard className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
                    <div className="w-10 h-10 rounded-xl bg-mint border-2 border-ink shadow-neo-sm flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink">Social Media & Metrics</h2>
                      <p className="font-mono text-xs text-ink/60">
                        Kelola metrik platform, sinkronisasi API, dan kalkulator engagement rate
                      </p>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-ink/40 rounded-xl text-center bg-paper/50">
                    <p className="font-mono text-sm font-bold text-ink">
                      Modul Social Media Manager & ER Calculator (Milestone 4.3)
                    </p>
                    <p className="font-mono text-xs text-ink/50 mt-1">
                      Komponen `SocialMediaManager.tsx` akan dihubungkan di sini.
                    </p>
                  </div>
                </NeoCard>
              </div>
            )}

            {activeTab === 'packages' && (
              <div id="tab-packages-panel" role="tabpanel" aria-labelledby="tab-packages">
                {/* Milestone 4.3 slot: <PackageBuilder /> */}
                <NeoCard className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
                    <div className="w-10 h-10 rounded-xl bg-coral border-2 border-ink shadow-neo-sm flex items-center justify-center">
                      <Package className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink">Packages & Rates</h2>
                      <p className="font-mono text-xs text-ink/60">
                        CRUD paket endorsement, diskon berjenjang, dan opsi negosiasi harga
                      </p>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-ink/40 rounded-xl text-center bg-paper/50">
                    <p className="font-mono text-sm font-bold text-ink">
                      Modul Rate Card & Package Builder (Milestone 4.3)
                    </p>
                    <p className="font-mono text-xs text-ink/50 mt-1">
                      Komponen `PackageBuilder.tsx` akan dihubungkan di sini.
                    </p>
                  </div>
                </NeoCard>
              </div>
            )}

            {activeTab === 'contact' && (
              <div id="tab-contact-panel" role="tabpanel" aria-labelledby="tab-contact">
                {/* Milestone 4.4 slot: <ContactSettingsEditor /> */}
                <NeoCard className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
                    <div className="w-10 h-10 rounded-xl bg-paper border-2 border-ink shadow-neo-sm flex items-center justify-center">
                      <Settings className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink">Contact & CTA Settings</h2>
                      <p className="font-mono text-xs text-ink/60">
                        Atur nomor WhatsApp resmi, template pesan checkout, dan file media kit PDF
                      </p>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-ink/40 rounded-xl text-center bg-paper/50">
                    <p className="font-mono text-sm font-bold text-ink">
                      Modul Contact & Media Kit Settings (Milestone 4.4)
                    </p>
                    <p className="font-mono text-xs text-ink/50 mt-1">
                      Komponen `ContactSettingsEditor.tsx` akan dihubungkan di sini.
                    </p>
                  </div>
                </NeoCard>
              </div>
            )}
          </div>

          {/* Right Column: Desktop Split-Screen Live Preview Frame */}
          <div
            className={cn(
              'hidden lg:block sticky top-[80px] h-[calc(100vh-100px)] transition-all duration-200',
              desktopLayoutMode === 'split' && 'w-5/12 xl:w-2/5',
              desktopLayoutMode === 'editor' && 'hidden',
              desktopLayoutMode === 'preview' && 'w-full'
            )}
          >
            <LivePreviewFrame className="h-full" />
          </div>
        </div>
      </main>

      {/* Mobile Live Preview Slide-Over Drawer / Overlay */}
      {isMobilePreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-sm flex flex-col p-2 sm:p-4 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Live Preview Drawer"
        >
          <div className="w-full h-full max-w-lg mx-auto">
            <LivePreviewFrame
              className="h-full"
              onClose={() => setIsMobilePreviewOpen(false)}
              initialDevice="mobile"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Verification Method

To independently verify this architectural plan before and after implementation:

1. **Static Analysis & TypeScript Type Check**:
   ```bash
   npm run typecheck
   ```
   *Expected outcome*: Exits with code 0 (`tsc --noEmit` passes with 0 errors).
2. **ESLint Code Quality**:
   ```bash
   npm run lint
   ```
   *Expected outcome*: Exits with code 0, 0 ESLint warnings or errors.
3. **Existing Regression Suite**:
   ```bash
   npm run test:unit
   ```
   *Expected outcome*: All existing unit tests in `adapters.test.ts` and `m3-components.test.ts` pass cleanly.
4. **Interactive Verification Criteria**:
   - Accessing `/admin` when unauthenticated displays `AdminLoginGate`.
   - Entering passcode `sumbar2026` (or `admin123` / `admin`) unlocks the dashboard and sets `sessionStorage` and cookie.
   - Refreshing or opening `/admin` in a new tab preserves the authenticated state.
   - Clicking tabs (`Profile & Hero`, `Social & Metrics`, `Packages & Rates`, `Contact & Settings`) renders the corresponding tab panel.
   - Toggling viewport switcher in `LivePreviewFrame` scales the preview correctly to 375px (mobile), 768px (tablet), and full width (desktop).
   - Calling `repository.updateSiteSettings` or modifying `localStorage` updates the preview frame instantly via `BroadcastChannel('sumbar_terkini_channel')`.
   - Clicking "Keluar" clears session and cookie, returning the UI to the locked `AdminLoginGate`.
