# Handoff Report: CMS Editors & State Management Implementation Plan

**Explorer**: `teamwork_explorer_m4_2`  
**Milestone**: M4 (Full CMS Admin Panel at `/admin`)  
**Scope**: F19 (Profile & Hero Editor), F20 (Social Media & Engagement Manager), F21 (Automatic ER Calculator Helper), F22 (Rate Card & Package Builder), F23 (Contact & CTA Settings)  
**Date**: 2026-11-07  

---

## 1. Observation

### 1.1 Existing Codebase & Contracts
1. **Data Types (`src/types/index.ts`)**:
   - `SiteSettings` (lines 20-42):
     * `creator_name`: string
     * `creator_handle`: string
     * `creator_avatar_url`: string
     * `creator_bio`: string
     * `slot_available`: boolean
     * `slot_status_text`: string
     * `theme_preset`: `'neo-warm' | 'neo-mint' | 'neo-mustard'`
     * `stickers`: `StickerItem[]` (`id`, `text`, `emoji`, `color?`, `rotation`)
     * `whatsapp_number`: string
     * `whatsapp_template`: string
     * `business_email`: string
     * `media_kit_pdf_url`: string
   - `SocialPlatform` (lines 68-86):
     * `id`: string (`instagram`, `tiktok`, `youtube`, `facebook`, `x`)
     * `platform_id`: `PlatformId`
     * `platform_name`: string
     * `handle`: string
     * `profile_url`: string
     * `sync_mode`: `'MANUAL' | 'AUTO_API'`
     * `followers_count`: number
     * `engagement_rate`: number (2 decimal precision)
     * `avg_views`, `avg_likes`, `avg_comments`: number
     * `demographics`: `{ gender: { male: number; female: number }; top_cities: DemographicCity[] }`
     * `sort_order`: number, `is_active`: boolean
   - `EndorsePackage` (lines 91-106):
     * `id`: string
     * `name`: string
     * `platform`: `'instagram' | 'tiktok' | 'youtube' | 'cross-platform'`
     * `price`: number (IDR numeric)
     * `description`: string
     * `deliverables`: `string[]`
     * `is_popular`: boolean
     * `is_price_hidden`: boolean
     * `tier`: `'starter' | 'standard' | 'vip' | 'bundle'`
     * `discount_percentage`: number
     * `sort_order`: number, `is_active`: boolean
   - `DataRepository` (lines 238-254):
     * `getSiteSettings()`: `Promise<SiteSettings>`
     * `updateSiteSettings(data: Partial<SiteSettings>)`: `Promise<SiteSettings>`
     * `getSocialPlatforms()`: `Promise<SocialPlatform[]>`
     * `updateSocialPlatform(id: string, data: Partial<SocialPlatform>)`: `Promise<SocialPlatform>`
     * `getEndorsePackages()`: `Promise<EndorsePackage[]>`
     * `createEndorsePackage(pkg)`: `Promise<EndorsePackage>`
     * `updateEndorsePackage(id, data)`: `Promise<EndorsePackage>`
     * `deleteEndorsePackage(id)`: `Promise<boolean>`

2. **Persistence & Broadcast Pipeline (`src/lib/data/repository.ts` & `src/lib/data/storage.ts`)**:
   - `ResilientRepository` implements `updateSiteSettings`, `updateSocialPlatform`, `createEndorsePackage`, `updateEndorsePackage`, `deleteEndorsePackage`.
   - Each mutation automatically writes to `LocalStorageManager.saveState(...)` and dispatches `BroadcastChannel('sumbar_terkini_channel')` message `{ type: 'STATE_UPDATED', table, action, payload, timestamp }`.

3. **Metrics Sync API Route (`src/app/api/sync-socials/route.ts`)**:
   - Accepts `POST` with optional body `{ platform_id?: PlatformId }`.
   - Returns `SyncResponse` containing `synced_platforms: SyncPlatformResult[]`.
   - Concurrency controlled via keyed single-flight promise coalesce.

4. **Existing Test Suite Baseline**:
   - Executing `npm test` runs 281 tests (T1 Category Partition, T2 Boundary/Error Injection, T3 Pairwise, T4 Workloads).
   - Current status: `281/281 passed in 0.02s`.
   - TypeScript check (`npm run typecheck`): 0 errors.
   - Linter (`npm run lint`): 0 errors / 0 warnings.

5. **Test Assertions for Editor Features (`tests/e2e/tier1-features.test.ts` & `tier2-boundaries.test.ts`)**:
   - Profile & Hero Editor (T1.19 & T2.19):
     * Name: min 2, max 100 chars. Empty/whitespace rejected.
     * Bio: min 5, max 500 chars.
     * Theme presets: strictly `'neo-warm' | 'neo-mint' | 'neo-mustard'`.
     * Sticker text: non-empty, max 24 chars (`truncateStickerText`).
     * Sticker rotation: clamped between `-45` and `+45` deg (`Math.min(Math.max(rot, -45), 45)`).
   - Social Media Manager & ER Helper (T1.20, T1.21, T2.20, T2.21):
     * Sync mode toggle: `MANUAL` vs `AUTO_API`.
     * Metric counts: `followers_count` safely handles up to 1B+ safe integers.
     * Gender percentage sum: `male + female === 100`.
     * Top city percentage: `p >= 0 && p <= 100`.
     * ER formula: `((likes + comments) / followers) * 100`. Returns `0` when followers <= 0. Clamped for negative likes/comments. Strictly 2 decimal places (`toFixed(2)`).
     * 1-click apply writes into `engagement_rate`.
     * Test & Sync trigger button posts to `/api/sync-socials`.
   - Package Builder (T1.22 & T2.22):
     * Price: non-negative (`p >= 0`). Supports up to 100B IDR.
     * Deliverables: array of strings, at least 1 required (`deliverables.length > 0`).
     * Package name: non-whitespace trimmed string.
     * Toggles: `is_popular`, `is_price_hidden`.
     * CRUD: create, edit, delete with confirmation.
   - Contact Settings (T1.23 & T2.23):
     * Phone: `normalizePhoneNumber(raw)` normalizes `08xxx` to `628xxx` and international `+628xxx`, length 8-15 digits.
     * Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
     * Media kit PDF URL: must end with `.pdf`.
     * WhatsApp template: fallback to default greeting if empty.

---

## 2. Logic Chain

1. **State Isolation & Modularity**:
   - Instead of placing all forms into one massive component, splitting into 4 dedicated editors (`ProfileHeroEditor`, `SocialMediaManager`, `PackageBuilder`, `ContactSettingsEditor`) with a sub-component (`StickersManager`) ensures clean separation of concerns, testability, and zero risk of cross-component re-rendering bottlenecks.
2. **Repository Consistency**:
   - Every editor consumes the shared `repository` singleton (`import { repository } from '@/lib/data/repository'`). All update operations automatically write to Supabase (if connected) or LocalStorage, and broadcast update events to `BroadcastChannel`. Therefore, any open preview tab or frame synchronizes without manual polling.
3. **Feedback & Interaction Ergonomics (Anti-Slop Compliance)**:
   - Editors utilize `useToast()` for instant positive feedback on save/create/delete actions.
   - All interactive controls (buttons, inputs, select triggers) strictly adhere to `min-h-[44px]` touch targets.
   - Inputs use dark ink border `2px solid #1E1E1E` and clear focus rings.
   - Destructive operations (package deletion, sticker removal) require explicit confirmation or prompt to avoid accidental loss of creator data.
4. **Validation-First Data Flow**:
   - Each editor maintains local dirty state and performs instant synchronous validation before calling repository methods, presenting clear inline error hints next to offending fields.

---

## 3. Caveats

1. **Storage Concurrency**:
   - If multiple tabs have the admin open and submit edits simultaneously, `LocalStorageManager` last-write-wins. This is expected for single-creator media hub workflows.
2. **Social API Tokens in Environment**:
   - In offline/mock mode (or when third-party social API credentials are not set), clicking "Test & Sync Now" will utilize the fallback jitter simulation or cached response in `/api/sync-socials`, which gracefully returns `SyncResponse` without breaking.
3. **No Em Dashes (`\u2014`)**:
   - Anti-slop rules strictly prohibit em dashes (`—`) in user-facing copy and placeholders. All labels and badges must use hyphens (`-`), colons (`:`), or parentheses.

---

## 4. Conclusion: Detailed Component Specifications

### 4.1 Component 1: `ProfileHeroEditor.tsx` & Sub-Editor `StickersManager.tsx`

#### File: `src/components/admin/ProfileHeroEditor.tsx`
- **Purpose**: Manage creator profile identity, hero content, theme preset, slot availability, and draggable stickers.
- **Props**:
  ```typescript
  export interface ProfileHeroEditorProps {
    initialSettings: SiteSettings;
    onSaveSuccess?: (updated: SiteSettings) => void;
  }
  ```
- **State Model**:
  ```typescript
  interface ProfileFormState {
    creator_name: string;
    creator_handle: string;
    creator_avatar_url: string;
    creator_bio: string;
    slot_available: boolean;
    slot_status_text: string;
    theme_preset: ThemePreset;
    stickers: StickerItem[];
  }
  ```
- **Validation Rules**:
  - `creator_name`: `trimmed.length >= 2 && trimmed.length <= 100` (Error: "Nama kreator harus 2 - 100 karakter")
  - `creator_handle`: `trimmed.length >= 2 && trimmed.length <= 50` (Ensure starts with `@`)
  - `creator_avatar_url`: Non-empty string
  - `creator_bio`: `trimmed.length >= 5 && trimmed.length <= 500` (Error: "Bio harus 5 - 500 karakter")
  - `theme_preset`: Must be one of `'neo-warm' | 'neo-mint' | 'neo-mustard'`
  - `slot_status_text`: `trimmed.length >= 2 && trimmed.length <= 100`
- **Draggable Stickers Sub-Editor (`StickersManager.tsx`)**:
  - Can be co-located or extracted to `src/components/admin/StickersManager.tsx`.
  - Props:
    ```typescript
    export interface StickersManagerProps {
      stickers: StickerItem[];
      onChange: (stickers: StickerItem[]) => void;
    }
    ```
  - Sticker Operations:
    * **List Active Stickers**: Renders list of stickers with preview chip, text input, emoji badge, color swatch selector, rotation slider (`-45` to `+45`), and delete button.
    * **Add Sticker**:
      - Default template: `{ id: 'stk-' + Date.now(), text: 'Sticker Baru', emoji: '✨', color: '#FFD166', rotation: -3 }`.
      - Guard: Max 10 stickers total.
    * **Edit Sticker Text**: Enforce max 24 chars (`truncateStickerText`).
    * **Edit Emoji**: Quick-pick chips (`🔥`, `⚡`, `🌱`, `👑`, `🚀`, `🎯`, `💡`, `✨`, `⭐`, `💎`) + custom single character text input.
    * **Rotation Slider**: Native `<input type="range" min="-45" max="45" step="1" />` with visual angle indicator (`-45°` to `+45°`). Clamp with `Math.min(Math.max(deg, -45), 45)`.
    * **Delete Sticker**: Remove from array by `id`.
- **Theme Preset Selector**:
  - 3 Neo-Brutalist cards:
    1. **Neo-Warm** (Mustard `#FFD166` + Warm Paper `#FAF8F5`) - Default Minang vibe
    2. **Neo-Mint** (Mint `#06D6A0` + Warm Paper `#FAF8F5`) - Energetic & fresh
    3. **Neo-Mustard** (Deep Mustard `#FFD166` + Dark Ink `#1E1E1E`) - Bold high-contrast
- **Save Action**:
  ```typescript
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await repository.updateSiteSettings(formState);
      showToast({ message: 'Profil dan Hero berhasil diperbarui!', type: 'success' });
      onSaveSuccess?.(updated);
    } catch (err) {
      showToast({ message: 'Gagal menyimpan profil: ' + (err as Error).message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  ```

---

### 4.2 Component 2: `SocialMediaManager.tsx`

#### File: `src/components/admin/SocialMediaManager.tsx`
- **Purpose**: Manage 5 social media platforms (Instagram, TikTok, YouTube, Facebook, X), toggle sync modes (MANUAL vs AUTO_API), update metrics and demographics, calculate engagement rate, and trigger manual synchronization.
- **Props**:
  ```typescript
  export interface SocialMediaManagerProps {
    initialPlatforms: SocialPlatform[];
    onSaveSuccess?: (updated: SocialPlatform) => void;
  }
  ```
- **Platform List Layout**:
  - Horizontal tab bar or card list showing 5 platforms with platform icon, handle, follower count, and sync status badge (`MANUAL` badge in Mustard, `AUTO_API` badge in Mint).
- **Sync Mode Toggle**:
  - Two-state pill switch:
    * `MANUAL`: Disables automatic API overwrite. Displays note: "Mode Manual: Metrik diedit manual dan tidak akan ditimpa sync otomatis."
    * `AUTO_API`: Enables background API syncing.
- **Manual Metrics Fields**:
  - `followers_count`: Number input (support up to 1,500,000,000).
  - `avg_views`: Number input.
  - `avg_likes`: Number input.
  - `avg_comments`: Number input.
  - `engagement_rate`: Number input with 2-decimal formatting (e.g. `4.85%`).
- **Demographic Distribution Editor**:
  - **Gender Breakdown**:
    * Male % input and Female % input.
    * Live validation helper:
      ```typescript
      const isGenderValid = Number(genderMale) + Number(genderFemale) === 100;
      ```
    * Warning banner if `isGenderValid === false`: `"Total persentase gender harus pas 100% (saat ini: ${sum}%)"`.
    * One-click "Reset 50:50" quick balance button.
  - **Top Cities List**:
    * List of `{ city: string, percentage: number }`.
    * Add City button + Remove City button.
    * Validation: Percentage must be `p >= 0 && p <= 100`.
- **Real-Time Automatic ER Calculation Helper**:
  - Contract specification:
    ```typescript
    export function calculateEngagementRate(likes: number, comments: number, followers: number): number {
      const cleanLikes = Math.max(0, Number(likes) || 0);
      const cleanComments = Math.max(0, Number(comments) || 0);
      const cleanFollowers = Number(followers) || 0;
      if (cleanFollowers <= 0) return 0;
      const er = ((cleanLikes + cleanComments) / cleanFollowers) * 100;
      return Number(er.toFixed(2));
    }
    ```
  - Real-time display updates automatically as `avg_likes`, `avg_comments`, or `followers_count` change.
  - Live ER Status Badge:
    * `>= 5.0%`: `Viral / Excellent` (Mint `#06D6A0`)
    * `3.0% - 4.99%`: `Good / Healthy` (Mustard `#FFD166`)
    * `1.0% - 2.99%`: `Average / Normal` (Paper `#FAF8F5`)
    * `< 1.0%`: `Low / Cek Ulang` (Coral `#EF476F`)
  - **1-Click Apply Button**:
    - Label: "Terapkan ke ER Platform"
    - On click: sets platform form `engagement_rate = calculatedER`.
- **"Test & Sync Now" Button**:
  - Sends POST request to `/api/sync-socials`:
    ```typescript
    const handleTriggerSync = async (platformId: PlatformId) => {
      setSyncing(true);
      try {
        const res = await fetch('/api/sync-socials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform_id: platformId }),
        });
        const data = await res.json();
        // Update local state with returned metrics if available
        showToast({ message: `Sync ${platformId} selesai: status ${data.synced_platforms?.[0]?.status ?? 'ok'}`, type: 'success' });
      } catch (err) {
        showToast({ message: 'Sync gagal: ' + (err as Error).message, type: 'error' });
      } finally {
        setSyncing(false);
      }
    };
    ```
- **Persistence**:
  - `await repository.updateSocialPlatform(platform.id, updatedData)`.

---

### 4.3 Component 3: `PackageBuilder.tsx`

#### File: `src/components/admin/PackageBuilder.tsx`
- **Purpose**: CRUD management for endorsement rate card packages, deliverables tagging, tier assignment, discount settings, popular flag, and private WhatsApp pricing toggles.
- **Props**:
  ```typescript
  export interface PackageBuilderProps {
    initialPackages: EndorsePackage[];
    onPackagesChange?: (packages: EndorsePackage[]) => void;
  }
  ```
- **State Model**:
  ```typescript
  interface PackageBuilderState {
    packages: EndorsePackage[];
    isModalOpen: boolean;
    editingPackage: EndorsePackage | null; // null = create mode
    isDeletingId: string | null; // id for confirmation dialog
    formData: {
      name: string;
      platform: PackagePlatform;
      price: number;
      description: string;
      deliverables: string[];
      tier: PackageTier;
      discount_percentage: number;
      is_popular: boolean;
      is_price_hidden: boolean;
      is_active: boolean;
      sort_order: number;
    };
    newDeliverableTag: string;
    errors: Record<string, string>;
  }
  ```
- **Package List Grid**:
  - Neo-Brutalist cards displaying:
    * Platform Badge (`Instagram`, `TikTok`, `YouTube`, `Cross-Platform`) with brand colors.
    * Tier Badge (`Starter`, `Standard`, `VIP`, `Bundle`).
    * Package Name and Description.
    * Formatted Price: `formatIDR(price)` or "Harga Negosiasi (WhatsApp)" badge when `is_price_hidden`.
    * Deliverables count pill (e.g. `3 Deliverables`).
    * "Populer ⭐" badge if `is_popular`.
    * Active toggle indicator (`Aktif` vs `Nonaktif`).
    * Actions: Edit button (pencil), Delete button (trash with confirmation), Reorder buttons (up/down).
- **Create / Edit Modal Form**:
  - Header: "Tambah Paket Endorsement" or "Edit Paket: [Name]"
  - Fields:
    1. **Package Name**: Text input (`name.trim().length > 0`).
    2. **Platform**: Radio/Button cards for `Instagram`, `TikTok`, `YouTube`, `Cross-Platform`.
    3. **Price (IDR)**: Number input (`price >= 0`), live Indonesian rupiah formatted text below (`Rp 2.500.000`). Supports high amounts up to 100B IDR.
    4. **Tier**: Dropdown or buttons (`Starter`, `Standard`, `VIP`, `Bundle`).
    5. **Discount Percentage**: Number input (`0 - 100%`).
    6. **Description**: Textarea.
    7. **Deliverables List Manager**:
       - Render deliverables as removable tags (`tag text` + `x` button).
       - Add deliverable field: text input + "Tambah Item" button. Supports Enter key.
       - Enforce at least 1 deliverable (`deliverables.length > 0`).
    8. **Toggles**:
       - `is_popular`: Toggle switch ("Tandai sebagai Paket Terpopuler").
       - `is_price_hidden`: Toggle switch ("Sembunyikan Harga / Khusus Negosiasi WhatsApp").
       - `is_active`: Toggle switch ("Status Aktif di Halaman Publik").
- **Delete Confirmation Modal**:
  - Appears when user clicks trash icon.
  - Clear prompt: "Hapus paket endorsement '[Nama]'? Paket yang dihapus tidak akan ditampilkan lagi di kalkulator publik."
  - "Batal" (paper button) and "Ya, Hapus Paket" (coral button).
- **Persistence**:
  - Create: `await repository.createEndorsePackage(formData)`.
  - Edit: `await repository.updateEndorsePackage(editingPackage.id, formData)`.
  - Delete: `await repository.deleteEndorsePackage(id)`.

---

### 4.4 Component 4: `ContactSettingsEditor.tsx`

#### File: `src/components/admin/ContactSettingsEditor.tsx`
- **Purpose**: Manage creator business contact channels, WhatsApp automated order template, business email, and media kit PDF download URL.
- **Props**:
  ```typescript
  export interface ContactSettingsEditorProps {
    initialSettings: SiteSettings;
    onSaveSuccess?: (updated: SiteSettings) => void;
  }
  ```
- **State Model**:
  ```typescript
  interface ContactSettingsForm {
    whatsapp_number: string;
    whatsapp_template: string;
    business_email: string;
    media_kit_pdf_url: string;
  }
  ```
- **Fields & Validation Specifications**:
  1. **WhatsApp Business Number**:
     - Raw input (e.g. `0812-6789-0123`, `+62 812 6789 0123`).
     - Live normalization via `normalizePhoneNumber(raw)`:
       * `08xxx` -> `628xxx`
       * `+628xxx` -> `628xxx`
       * Strips all non-digit characters.
     - Validation: `normalized.length >= 8 && normalized.length <= 15 && normalized.startsWith('62')`.
     - Live preview box:
       * Displays active normalized number: `6281267890123`
       * Direct test link: `wa.me/6281267890123` with "Buka WhatsApp Test" button.
  2. **Automated WhatsApp Order Template Text**:
     - Textarea editor.
     - Fallback greeting if left empty: `'Halo Admin, booking endorsement.'`.
     - Template Variable Chips (clickable insertion):
       * `{{creator_name}}`, `{{package_names}}`, `{{total_price}}`, `{{tier_name}}`.
  3. **Business Inquiry Email**:
     - Email text input.
     - Regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
     - Displays error if email format is invalid.
  4. **Media Kit PDF Download URL**:
     - Text input.
     - Validation rule: `url.trim().toLowerCase().endsWith('.pdf')`.
     - Supports both relative path (`/media-kit-sumbar-terkini.pdf`) and HTTPS URLs (`https://.../kit.pdf`).
     - "Test Unduh PDF" button to preview file in new tab.
- **Persistence**:
  ```typescript
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await repository.updateSiteSettings({
        whatsapp_number: normalizePhoneNumber(form.whatsapp_number),
        whatsapp_template: form.whatsapp_template.trim() || 'Halo Admin, booking endorsement.',
        business_email: form.business_email.trim(),
        media_kit_pdf_url: form.media_kit_pdf_url.trim(),
      });
      showToast({ message: 'Pengaturan Kontak berhasil disimpan!', type: 'success' });
      onSaveSuccess?.(updated);
    } catch (err) {
      showToast({ message: 'Gagal menyimpan: ' + (err as Error).message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  ```

---

## 5. Verification Method

### 5.1 Verification Commands
1. **TypeScript Type Safety**:
   ```bash
   npm run typecheck
   # Expectation: 0 errors
   ```
2. **ESLint Code Quality**:
   ```bash
   npm run lint
   # Expectation: 0 errors, 0 warnings
   ```
3. **Existing E2E & Boundary Test Suite**:
   ```bash
   npm test
   # Expectation: 281/281 passed
   ```
4. **Dedicated Unit & Admin Test Suite**:
   ```bash
   npx tsx tests/unit/admin-panel.test.ts
   # Expectation: 100% pass across F18-F24 editor assertions
   ```
5. **Next.js Production Build**:
   ```bash
   npm run build
   # Expectation: Successful compilation of /admin and public routes
   ```

### 5.2 Anti-Slop Audit Checklist for Implementer
- [ ] Base background uses `#FAF8F5` (warm paper).
- [ ] Accent colors adhere to Mustard `#FFD166`, Mint `#06D6A0`, Coral `#EF476F`.
- [ ] All borders are `2px solid #1E1E1E` or `3px solid #1E1E1E`.
- [ ] Hard shadows use `shadow-neo` (`4px 4px 0px #1E1E1E`).
- [ ] All interactive buttons and inputs have `min-h-[44px]`.
- [ ] Text contrast meets WCAG AA (>= 4.5:1) with dark ink text.
- [ ] Zero em dashes (`\u2014`) in any string or label.
- [ ] Zero `// TODO` or placeholder comments in code.
