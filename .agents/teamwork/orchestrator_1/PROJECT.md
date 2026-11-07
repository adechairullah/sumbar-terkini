# Project: Creator Media Kit & Endorsement Hub — Milestone 4 (Full CMS Admin Panel)

## Architecture
- **Framework**: Next.js 14 App Router, TypeScript (strict), Tailwind CSS (Neo-Brutalism Soft design system), Lucide React / Custom Neo-Brutalism Icons.
- **Data Access Layer**: `ResilientRepository` (`src/lib/data/repository.ts`) singleton `repository` implementing `DataRepository` (`src/types/index.ts`). Supports dual-write to Supabase PostgreSQL (if configured) with transparent in-memory and `localStorage` fallback via `LocalStorageManager` (`src/lib/data/storage.ts`).
- **Realtime Synchronization**: PostgreSQL `supabase_realtime` publication + browser `BroadcastChannel('sumbar_terkini_channel')` + `window.addEventListener('storage')` fallback.
- **Authentication**: Dual-mode auth (`src/lib/admin/auth.ts`, `src/components/admin/AdminLoginGate.tsx`) supporting Supabase Auth and Passcode fallback (`ADMIN_PASSCODE` / `NEXT_PUBLIC_ADMIN_PASSCODE` / `admin123` / `sumbar2026` / `admin`), 24h session duration.
- **Admin UI Layout**: Route `/admin` (`src/app/admin/page.tsx`), tabbed/sectioned modular editor (`ProfileHeroEditor`, `SocialMediaManager`, `PackageBuilder`, `ContactSettingsEditor`), and responsive split-screen live preview frame (`LivePreviewFrame.tsx`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F18 | Protected Admin Gate | Supabase Auth + Passcode gate (`ADMIN_PASSCODE` / `admin123` / `sumbar2026`), 24h session persistence, logout | M4.1 | Survey & R1 |
| F19 | Profile & Hero Editor | Edit name, handle, bio, avatar URL, slot toggle & status text, theme preset, draggable stickers CRUD | M4.2 | Survey & R2 |
| F20 | Social Media & Engagement Manager | Toggle MANUAL vs AUTO_API, edit metrics (followers, views, likes, comments), demographics (gender %, cities) | M4.3 | Survey & R3 |
| F21 | Automatic ER Calculator Helper | Formula `(likes + comments) / followers * 100`, 2-decimal format, div-by-zero safe, 1-click apply | M4.3 | Survey & R3 |
| F22 | Rate Card & Package Builder | CRUD endorse packages: name, platform, price, description, deliverables, tier, discount %, popular/hidden toggles | M4.3 | Survey & R4 |
| F23 | Contact & CTA Settings | WhatsApp number formatting/normalization (`628xxx`), template text, business email regex, PDF download URL (`.pdf`) | M4.4 | Survey & R5 |
| F24 | Live Preview & Real-time Synchronization | Split-screen preview, instant update via DAL & BroadcastChannel, theme switching, storage events | M4.4 | Survey & R6 |
| F25 | Quality, Build & Verification Suite | 0 tsc errors, 0 lint errors, clean build, 100% test pass on existing 281 tests + new admin component tests | M4.4 | Survey & R7 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M4.1 | Admin Shell & Authentication Gate | `/admin` entry page, `AdminLoginGate` integration, session validation, logout, shell header/tabs navigation | none | DONE |
| M4.2 | Profile, Hero & Stickers Editor | `ProfileHeroEditor.tsx`, `StickersManager.tsx`, theme preset selector (`neo-warm`, `neo-mint`, `neo-mustard`), slot availability controls | M4.1 | DONE |
| M4.3 | Social Media Manager, ER Helper & Package Builder | `SocialMediaManager.tsx`, ER calculation helper, `/api/sync-socials` trigger, `PackageBuilder.tsx` CRUD with deliverables & flags | M4.1 | DONE |
| M4.4 | Contact Settings, Live Preview Sync & Verification Suite | `ContactSettingsEditor.tsx`, split-screen live preview, broadcast sync integration, admin test suite, verification gate (tsc, lint, build, all tests) | M4.2, M4.3 | DONE |

## Interface Contracts

### Admin State & Subsystem Communication
- **Data Repository**:
  ```typescript
  import { repository } from '@/lib/data/repository';
  // All reads and writes must pass through repository to ensure dual-write and broadcast dispatch
  const settings = await repository.getSiteSettings();
  await repository.updateSiteSettings(partialSettings);
  const platforms = await repository.getSocialPlatforms();
  await repository.updateSocialPlatform(platformId, partialPlatform);
  const packages = await repository.getEndorsePackages();
  await repository.createEndorsePackage(packageData);
  await repository.updateEndorsePackage(packageId, partialPackage);
  await repository.deleteEndorsePackage(packageId);
  ```
- **Realtime Broadcast Event**:
  ```typescript
  // BroadcastChannel name: 'sumbar_terkini_channel'
  // Dispatched on repository mutations; listened by preview frame and public page
  interface BroadcastSyncEvent<T = unknown> {
    type: 'STATE_UPDATED';
    table: 'site_settings' | 'social_platforms' | 'endorse_packages' | 'visitor_reactions';
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: T;
    timestamp: string;
  }
  ```
- **ER Calculation Helper Contract**:
  ```typescript
  function calculateEngagementRate(likes: number, comments: number, followers: number): number {
    if (!followers || followers <= 0) return 0;
    const er = ((likes + comments) / followers) * 100;
    return Number(er.toFixed(2));
  }
  ```
- **WhatsApp Phone Normalizer Contract**:
  ```typescript
  function normalizeWhatsAppNumber(raw: string): string {
    const cleaned = raw.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('08')) return '628' + cleaned.slice(2);
    if (cleaned.startsWith('+62')) return cleaned.slice(1);
    return cleaned;
  }
  ```

## Code Layout
- `src/app/admin/page.tsx` — Main Admin Page with Gate & Tabs / Split-screen
- `src/components/admin/AdminLoginGate.tsx` — Protected Gate (Auth & Passcode)
- `src/components/admin/AdminHeader.tsx` — Admin top navigation, status indicator, logout
- `src/components/admin/ProfileHeroEditor.tsx` — Creator profile, hero settings, theme preset
- `src/components/admin/StickersManager.tsx` — Sticker CRUD & rotation manager
- `src/components/admin/SocialMediaManager.tsx` — Social platform sync mode, metrics, demographics, ER helper, trigger sync
- `src/components/admin/PackageBuilder.tsx` — Endorsement rate card package CRUD
- `src/components/admin/ContactSettingsEditor.tsx` — Contact, WhatsApp, email, media kit URL
- `src/components/admin/LivePreviewFrame.tsx` — Real-time interactive preview of public page
- `tests/unit/admin-panel.test.ts` — Comprehensive unit and integration test suite for Admin components and helper logic
