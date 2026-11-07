# Milestone 4 (M4: Full CMS Admin Panel at `/admin`) — Specification Mining & Requirement Analysis Report

**Date**: 2026-11-07  
**Author**: teamwork_spec_miner_survey_3 (Specification Miner)  
**Target Milestone**: Milestone 4 (M4: Full CMS Admin Panel at `/admin`)  
**Workspace**: `/Users/adechairullah/CODING/SUMBAR_TERKINI`  

---

## 1. Observation

A systematic forensic inspection of the existing codebase, repository DAL, security infrastructure, component catalog, and test suites revealed the following concrete implementation details:

1. **Existing Baseline Test Suite**:
   - Total test count: Exactly **281 automated E2E tests** passing in `tests/e2e/runner.ts` (125 Tier 1 category-partition tests, 125 Tier 2 boundary tests, 25 Tier 3 pairwise interaction tests, 6 Tier 4 realistic workload scenarios).
   - Unit tests: `tests/unit/adapters.test.ts` and `tests/unit/m3-components.test.ts` pass cleanly (24 assertions).
   - Adversarial stress tests: `tests/adversarial/tier5-adversarial.test.ts` (24 stress tests) and `tests/adversarial/m3-build-stress.test.ts` pass cleanly.
   - Typecheck (`npm run typecheck`) and Lint (`npm run lint`): 0 warnings, 0 errors.

2. **Existing Admin Infrastructure**:
   - Auth Library: `src/lib/admin/auth.ts` provides `checkAdminAuth()`, `loginWithPasscode(code: string)`, `loginWithSupabase(email, password)`, and `logoutAdmin()`.
   - Passcode validation currently checks `validPasscodes = [getPasscode(), 'admin123', 'sumbar2026', 'admin']` with `code.trim()`. Default environment variable: `NEXT_PUBLIC_ADMIN_PASSCODE` or `ADMIN_PASSCODE` with fallback to `sumbar2026`.
   - Existing Login Gate Component: `src/components/admin/AdminLoginGate.tsx` provides dual-mode passcode and Supabase email/password login with Neo-Brutalist cards and icons.
   - Missing Route: `/admin` does not yet exist in `src/app`. Visiting `/admin` currently results in a 404 in Next.js App Router.

3. **Data Access Layer & Realtime Architecture**:
   - Repository DAL: `src/lib/data/repository.ts` exports `repository: DataRepository`, implementing `ResilientRepository` with methods:
     - `getSiteSettings()`, `updateSiteSettings(data)`
     - `getSocialPlatforms()`, `updateSocialPlatform(id, data)`
     - `getEndorsePackages()`, `createEndorsePackage(pkg)`, `updateEndorsePackage(id, data)`, `deleteEndorsePackage(id)`
     - `getReactions()`, `incrementReaction(reactionType)`
     - `subscribeToChanges(table, callback)`
   - Fallback Storage: `src/lib/data/storage.ts` provides `LocalStorageManager` with atomic persistence in memory and `localStorage`, plus cross-tab synchronization via `BroadcastChannel('sumbar_terkini_channel')`.
   - Metrics Sync API: `src/app/api/sync-socials/route.ts` handles GET and POST requests, supports `platform_id` filtering, enforces `CRON_SECRET` authorization (when set) or allows open preview mode, and strictly preserves `MANUAL` platform metrics (`skipped_manual`).

4. **Anti-Slop & Quality Enforcement Invariants**:
   - `tests/adversarial/m3-build-stress.test.ts` actively enforces:
     - Zero em dashes (`\u2014` or `—`) across the entire `src/` directory.
     - Zero code stubs (`// TODO`, `// FIXME`, `// implement later`) across `src/`.
     - WCAG AA contrast ratio >= 4.5:1 (no `text-white` on `bg-mustard`, `bg-coral`, or `bg-mint`; dark ink `#1E1E1E` strictly required).
     - Minimum 44px tap targets on all interactive controls (`min-h-[44px]`).
     - Layout compliance: `.agents/teamwork/` must contain strictly `.md` files.

---

## 2. Logic Chain

1. **Gate Architecture (R1)**:
   - `tests/e2e/tier1-features.test.ts` (F18) and `tests/e2e/tier2-boundaries.test.ts` require that `/admin` be protected against unauthenticated access (T1.18.1, T2.18.5).
   - In offline/mock mode (when Supabase credentials are not configured), the gate must seamlessly fall back to passcode authentication (T1.18.5).
   - Passcodes accepted must include `ADMIN_PASSCODE` / `NEXT_PUBLIC_ADMIN_PASSCODE` with defaults `admin123` and `sumbar2026`.
   - Passcodes must be trimmed of whitespace (T2.18.2). Empty passcode must be rejected (T2.18.1).
   - Five consecutive invalid passcode attempts must trigger temporary rate-limit lockout (T2.18.3).
   - Sessions must be stored with a 24-hour expiration in `sessionStorage` and cookie `admin_session` with `SameSite=Lax` (T1.18.4, T2.18.4).
   - Logging out must clear session tokens and redirect or re-render `AdminLoginGate`.

2. **Profile & Hero Editor (R2)**:
   - Must allow editing `creator_name` (min 2, max 100 chars), `creator_handle`, `creator_avatar_url`, `creator_bio` (min 5, max 500 chars), `slot_available` (boolean toggle), `slot_status_text` (string), and `theme_preset` ('neo-warm' | 'neo-mint' | 'neo-mustard' | 'neo_brutalist') (T1.19.1 - T1.19.3, T2.19.1 - T2.19.3).
   - Must manage draggable hero stickers: add, edit, and delete sticker item with `text` (max 24 chars, non-empty per T2.19.4), `emoji`, `rotation` (clamped between -45 and +45 per T2.19.5), and `color`.
   - All mutations must persist via `repository.updateSiteSettings` and broadcast `site_settings` / `UPDATE` via `LocalStorageManager`.

3. **Social Media & Engagement Manager (R3)**:
   - Must manage platform cards across the 5 platforms (Instagram, TikTok, YouTube, Facebook, X) (T1.20.1 - T1.20.4).
   - Must support toggling sync mode between `MANUAL` and `AUTO_API`. In `MANUAL` mode, manual numbers must never be overwritten by sync (M2 test requirement).
   - Must support editing metrics (`followers_count`, `avg_views`, `avg_likes`, `avg_comments`). Follower count handles up to 1B+ without precision loss (T2.20.2).
   - Must support editing demographic distributions: gender male/female summing to 100% (T2.20.3) and top cities (percentages 0-100% per T2.20.4).
   - Must feature the Automatic ER Calculator Helper (`((likes + comments) / followers) * 100`) calculating live as admin inputs metrics, formatted to 2 decimals, handling 0 or negative followers safely (0.00% without NaN/Infinity per T1.21.1 - T1.21.5, T2.21.1 - T2.21.5), with a 1-click apply button to populate `engagement_rate`.
   - Must provide "Test & Sync Now" trigger button dispatching to `/api/sync-socials` and displaying returned status (`synced`, `cached_fallback`, `skipped_manual`).
   - Platform reordering (`sort_order`) and deletion safety guard (T2.20.5: delete confirmation warning).

4. **Rate Card & Package Builder (R4)**:
   - Full CRUD for endorsement packages via `repository.createEndorsePackage`, `updateEndorsePackage`, and `deleteEndorsePackage` (T1.22.1 - T1.22.5).
   - Package fields: `name` (non-whitespace per T2.22.3), `platform` (PackagePlatform), `price` (number >= 0 per T2.22.1, formatted to IDR up to 100B IDR per T2.22.4), `description`, `deliverables` (`string[]`, >= 1 deliverable required per T2.22.2), `tier` ('starter' | 'standard' | 'vip' | 'bundle'), `is_popular` toggle, `is_price_hidden` toggle (for private WhatsApp negotiation), `sort_order`, `is_active`.
   - Delete confirmation dialog to protect packages referenced in workflows (T2.22.5).

5. **Contact & CTA Settings (R5)**:
   - Fields: `whatsapp_number` (validated and normalized via `normalizePhoneNumber`, stripping symbols, converting 08xx to 628xx, length 8-15 digits per T1.23.5, T2.23.1, T2.23.2), `whatsapp_template` (template string with token placeholders, fallback to default greeting when empty per T2.23.5), `business_email` (validated via email regex per T2.23.3), `media_kit_pdf_url` (must end in `.pdf` per T1.23.4, T2.23.4).

6. **Live Preview & Real-Time Sync (R6)**:
   - Must offer split-screen side-by-side mode on desktop (`lg:grid lg:grid-cols-2`) and modal/drawer toggle on mobile/compact viewports (T1.24.3).
   - Synchronization operates instantaneously via `repository.subscribeToChanges` and `BroadcastChannel` with `localStorage` storage-event fallback (T1.24.1, T1.24.5, T2.24.1).
   - Updates must debounce high-frequency changes (T2.24.5) and ignore malformed broadcast payloads gracefully (T2.24.3).
   - Switching `theme_preset` must immediately recolor preview components (T1.24.4).
   - Public preview replica must include authentic representations of Hero, Bento Grid, Rate Card Calculator, and Contact Hub.

7. **Code Quality & Non-Regression (R7)**:
   - Production readiness: `tsc --noEmit`, `npm run lint`, and `npm run build` must exit 0.
   - Test suite non-regression: All 281 existing tests must pass with 100% success.
   - New Milestone 4 admin tests must be incorporated and pass 100%.
   - Strict Anti-Slop adherence: no em dashes, no code stubs, 44px min tap targets, WCAG AA compliance with dark ink text on color backgrounds, zero horizontal scroll.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1: Security | Protected Route Gate (`/admin`) | Gates `/admin` behind Supabase Auth and passcode fallback | URL request to `/admin`, session tokens | Admin Dashboard or AdminLoginGate view | Unauthenticated -> renders Login Gate | `src/components/admin/AdminLoginGate.tsx`, T1.18.1 |
| 2 | R1: Security | Passcode Validation Engine | Validates passcode with trimming against env vars & defaults | `passcode: string` (`admin123`, `sumbar2026`, etc.) | `{ authenticated: boolean }` | Empty -> 401; Wrong passcode -> error prompt | `src/lib/admin/auth.ts`, T1.18.2, T2.18.1, T2.18.2 |
| 3 | R1: Security | Rate Limit Lockout | Locks out login after 5 consecutive invalid passcode attempts | Consecutive invalid passcode submissions | Lockout state (HTTP 429 payload) | Rejects further attempts until cooldown expires | T2.18.3 |
| 4 | R1: Security | Session Lifecycle & Cookie Management | Stores admin session with 24h expiration in cookie & sessionStorage | Session token, timestamp | `admin_session` cookie (`SameSite=Lax`), sessionStorage | Expired session -> requires re-login | `src/lib/admin/auth.ts`, T1.18.4, T2.18.4 |
| 5 | R1: Security | Admin Logout Action | Terminates active session across sessionStorage, cookies, and Supabase | User click on "Logout" button | Cleared session, transition to Login Gate | Network failure gracefully caught | `src/lib/admin/auth.ts`, `AdminLoginGate.tsx` |
| 6 | R2: Profile | Creator Identity Editor | Edits creator name, handle, avatar URL, and bio | `name` (2-100 chars), `handle`, `avatar_url`, `bio` (5-500 chars) | Updated `SiteSettings` persisted via DAL | Name > 100 chars or Bio > 500 chars rejected | T1.19.1, T1.19.5, T2.19.1, T2.19.2 |
| 7 | R2: Profile | Slot Availability Toggle | Manages endorsement availability badge status & text | `slot_available: boolean`, `slot_status_text: string` | Updated `slot_available` & text on public Hero | Empty status text falls back to default | T1.19.2, `SlotBadge.tsx` |
| 8 | R2: Profile | Theme Preset Selector | Switches active Neo-Brutalist color theme preset | `preset`: `'neo-warm' \| 'neo-mint' \| 'neo-mustard' \| 'neo_brutalist'` | Updated theme tokens in preview & DAL | Invalid preset string rejected | T1.19.3, T2.19.3 |
| 9 | R2: Profile | Draggable Stickers Manager | CRUD for hero stickers (add, edit, delete, rotate, color) | Sticker `text` (<=24 chars), `emoji`, `rotation` (-45 to 45), `color` | Array of `StickerItem` (max 20) | Empty text rejected, rotation clamped | T1.19.4, T2.19.4, T2.19.5, `DraggableStickers.tsx` |
| 10 | R3: Socials | Sync Mode Switcher | Toggles platform sync between `MANUAL` and `AUTO_API` | `sync_mode`: `'MANUAL' \| 'AUTO_API'` | Updated platform configuration | None (state machine toggle) | T1.20.1, `src/app/api/sync-socials/route.ts` |
| 11 | R3: Socials | Social Metrics Manual Editor | Edits followers, avg views, likes, comments, and ER | Numeric metric counts (up to 1B+) | Updated `PlatformMetrics` in DAL | Negative numbers clamped to 0 | T1.20.2, T2.20.2 |
| 12 | R3: Socials | Demographics Manager | Edits gender percentages (must sum 100%) and top cities | Gender `male`/`female` %, cities `[{ city, percentage }]` | Normalized `PlatformDemographics` | Sum != 100 rejected, negative city % rejected | T1.20.3, T2.20.3, T2.20.4, `DemographicsBar.tsx` |
| 13 | R3: Socials | Real-time Automatic ER Calculator | Calculates `((likes + comments) / followers) * 100` live | `likes`, `comments`, `followers` inputs | Calculated ER with 2 decimals & status badge | Followers <= 0 -> 0.00% without NaN | T1.21.1 - T1.21.5, T2.21.1 - T2.21.5 |
| 14 | R3: Socials | 1-Click ER Apply Action | Copies calculated ER directly into engagement rate field | User click on "Terapkan ER" button | Updates platform's `engagement_rate` input | None (atomic state copy) | Dispatch prompt R3, T1.21.5 |
| 15 | R3: Socials | "Test & Sync Now" Trigger | Executes single or batch platform sync against `/api/sync-socials` | Platform ID or batch trigger | Status badge, refreshed metrics, last sync timestamp | Network timeout/error caught gracefully | T1.20.5, `src/app/api/sync-socials/route.ts` |
| 16 | R3: Socials | Platform Order & Deletion Guard | Reorders platforms (`sort_order`) and confirms deletion | Sort direction or delete platform ID | Reordered or filtered platforms array | Deleting all platforms requires confirmation | T1.20.4, T2.20.1, T2.20.5 |
| 17 | R4: Rate Card | Package Creation Engine | Adds new endorsement package to catalog | Name, platform, price, description, deliverables, tier | New `EndorsePackage` created with unique ID | Whitespace name or empty deliverables rejected | T1.22.1, T2.22.2, T2.22.3 |
| 18 | R4: Rate Card | Deliverables Dynamic List Editor | Adds, reorders, and removes deliverable bullet items | Deliverable text lines | `string[]` of deliverables (>= 1 required) | Empty array rejected upon submit | T1.22.2, T2.22.2 |
| 19 | R4: Rate Card | Pricing & Negosiasi Khusus Controls | Sets price (IDR) and toggles `is_price_hidden` for WhatsApp quote | `price: number`, `is_price_hidden: boolean` | Formatted IDR price or "Negosiasi Khusus" | Negative price rejected (< 0) | T1.22.3, T2.22.1, T2.22.4 |
| 20 | R4: Rate Card | Popular Highlight & Tier Selector | Sets `is_popular` highlight badge and package tier | `is_popular: boolean`, `tier`: starter/standard/vip/bundle | Tier discount category & visual styling | Invalid tier string rejected | T1.22.4, T1.22.5, `TierBadge.tsx` |
| 21 | R4: Rate Card | Package Deletion Safety Confirmation | Confirms package deletion with warning dialog | Package ID to delete | Removed package from catalog via DAL | Deletion of active package warns admin | T2.22.5, `LocalStorageManager.ts` |
| 22 | R5: Contact | WhatsApp Business Number Normalizer | Normalizes Indonesian/international phone numbers | Raw input (`0812-xxx`, `+62812-xxx`) | Cleaned digits starting with `628` (8-15 digits) | Non-digit characters cleaned, < 8 digits rejected | T1.23.1, T1.23.5, T2.23.1, T2.23.2 |
| 23 | R5: Contact | Order Message Template Editor | Configures default WhatsApp text with placeholders | Template string with `{{package_names}}` tokens | Persisted `whatsapp_template` | Empty template falls back to default greeting | T1.23.2, T2.23.5, `whatsapp.ts` |
| 24 | R5: Contact | Business Email Validator | Updates and validates corporate inquiry email | Email address string | Validated `business_email` | Missing `@` or domain rejected | T1.23.3, T2.23.3 |
| 25 | R5: Contact | Media Kit PDF URL Validator | Updates media kit download link with `.pdf` validation | URL or local static asset path | Validated `media_kit_pdf_url` | Non-pdf path (e.g. `.docx`) rejected | T1.23.4, T2.23.4 |
| 26 | R6: Sync | Split-Screen Admin Live Preview | Renders real-time public hub replica alongside CMS controls | View mode toggle (`split` vs `modal` vs `phone`) | Side-by-side or overlay live replica of public page | Desktop/mobile layout cleanly reflows | T1.24.3, T1.24.5 |
| 27 | R6: Sync | Cross-Tab & Realtime Synchronization | Broadcasts updates across tabs and windows via BroadcastChannel | `STATE_UPDATED` events on DAL mutations | Real-time preview update without page reload | BroadcastChannel fallback to localStorage events | T1.24.1, T1.24.2, T2.24.1 |
| 28 | R6: Sync | High-Frequency Mutation Debouncer | Debounces rapid input events (up to 100 updates/sec) | Rapid typing into form inputs | Coalesced single render update | Malformed payload safely ignored without crash | T2.24.3, T2.24.5 |
| 29 | R7: Quality | Anti-Slop Visual & Code Hygiene | Enforces Neo-Brutalism tokens, WCAG AA, and 44px tap targets | UI components, forms, buttons | 100% Anti-slop compliant admin interface | Em dashes or placeholder stubs trigger test failure | T1.25.1 - T1.25.5, `m3-build-stress.test.ts` |

---

## 4. Edge Cases & Boundary Behaviors

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Passcode Verification | Passcode with leading/trailing spaces (`  admin123  `) | String is trimmed (`passcode.trim()`) and accepted with HTTP 200 (T2.18.2). |
| 2 | Passcode Verification | Empty passcode string (`""`) | Rejected immediately with 401 Unauthorized; submit button remains disabled (T2.18.1). |
| 3 | Passcode Rate Limiting | 5 consecutive incorrect passcode attempts | Form enters lockout state returning HTTP 429 "Too many attempts" and disabling input for cooldown duration (T2.18.3). |
| 4 | Session Expiration | Session cookie/storage with timestamp > 24 hours old | Session is invalidated, cleared from storage, and user is redirected to login gate (T2.18.4). |
| 5 | Creator Name Validation | Creator name exceeding 100 characters (e.g. 101 'A's) | Form validation rejects submit, displays error message, and prevents DAL mutation (T2.19.1). |
| 6 | Creator Bio Validation | Creator bio exceeding 500 characters | Form validation rejects submit, displays character counter warning (T2.19.2). |
| 7 | Theme Preset Validation | Malformed or unsupported preset string (e.g. `neon-dark`) | Rejected by enum schema validator; falls back to `neo-warm` (T2.19.3). |
| 8 | Sticker Text Validation | Sticker text that is empty or whitespace-only | Rejected by validator; sticker cannot be saved without descriptive label (T2.19.4). |
| 9 | Sticker Rotation Bounds | Sticker rotation value of -90° or +80° | Clamped to safe visual range between -45° and +45° to prevent container overflow (T2.19.5). |
| 10 | Sticker Text Overflow | Sticker text length > 24 characters | Truncated cleanly with ellipsis (`text.slice(0, 21) + '...'`) in UI rendering (`truncateStickerText`). |
| 11 | Duplicate Platform Guard | Adding platform with already existing `platform_id` | Rejected by uniqueness validator throwing "Duplicate platform" (T2.20.1). |
| 12 | Metric Value Overflow | Follower count exceeding 1,000,000,000 | Stored and formatted as safe 64-bit integer without precision degradation (T2.20.2). |
| 13 | Demographics Gender Sum | Male and Female percentages summing to != 100 (e.g. 60% + 60%) | Rejected by validation; auto-balance helper adjusts female = 100 - male (T2.20.3, `normalizeGenderPercentages`). |
| 14 | Demographics City Percent | City demographic percentage < 0% (e.g. -5%) or > 100% | Clamped to [0, 100] range; negative values rejected (T2.20.4). |
| 15 | Platform Delete Starvation | Deleting the final active social platform card | Displays explicit warning confirmation dialog before permitting empty platforms catalog (T2.20.5). |
| 16 | ER Calculation Division by Zero | Follower count is 0 or negative (-500) | `calculateER` returns `0.00` immediately; prevents `NaN`, `Infinity`, or runtime exception (T1.21.4, T2.21.1). |
| 17 | ER Negative Metric Clamp | Average likes or comments entered as negative numbers (-500) | Clamped to 0 before calculating ER; returns `0.00` (T2.21.3). |
| 18 | ER Non-Numeric Inputs | Passing non-numeric string (e.g. `'invalid'`) to `calculateER` | Type coercion and NaN guard sanitize input to 0, returning safe numeric 0 (T2.21.4). |
| 19 | Extremely High ER | Likes 5,000, comments 0, followers 1,000 (500% ER) | Calculated accurately as 500.00% without artificial clamping ceiling (T2.21.5). |
| 20 | Package Price Bounds | Negative package price input (e.g. -Rp 50.000) | Form validation rejects value; price must be >= 0 (T2.22.1). |
| 21 | High Price IDR Formatting | Extremely large price (e.g. Rp 100.000.000.000) | Formatted cleanly with Indonesian locale separators: `Rp 100.000.000.000` (T2.22.4). |
| 22 | Package Deliverables Array | Empty deliverables array (`[]`) | Form validation rejects submit; minimum 1 deliverable required (T2.22.2). |
| 23 | Package Name Whitespace | Package name containing only spaces (`"   "`) | Rejected by non-empty trimmed string validator (T2.22.3). |
| 24 | Package In-Use Deletion | Deleting package referenced in active orders/calculator | Confirmation modal displays warning: "Paket ini aktif dalam konfigurasi kalkulator" (T2.22.5). |
| 25 | WhatsApp Phone Sanitization | Phone input containing punctuation/letters (`0812-ABC-7890`) | Stripped to pure digits and converted to Indonesian international format `628127890` (T2.23.1). |
| 26 | WhatsApp Phone Length | Cleaned phone number has fewer than 8 digits (`1234`) | Rejected as invalid length; phone must be between 8 and 15 digits (T2.23.2). |
| 27 | Business Email Validation | String without `@` or top-level domain (`invalid-email`) | Rejected by email regex validator `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (T2.23.3). |
| 28 | Media Kit URL File Type | URL path pointing to non-PDF asset (`mediakit.docx`) | Rejected by URL validator; string must end in `.pdf` (T2.23.4). |
| 29 | Empty WhatsApp Template | Admin clears WhatsApp template text to empty string | Falls back to standard greeting: `Halo Admin, booking endorsement.` (T2.23.5). |
| 30 | BroadcastChannel Unavailable | Browser environment where `window.BroadcastChannel` is undefined | Falls back cleanly to `localStorage` `storage` event synchronization (T2.24.1). |
| 31 | Malformed Broadcast Message | Cross-tab event receives `null`, string, or event without `type` | Discarded silently without crashing preview listener (T2.24.3). |
| 32 | High-Frequency Typing Burst | Admin types rapidly (100 keystrokes/sec) into bio or metrics | Debounced by preview renderer into a single consolidated render pass (T2.24.5). |
| 33 | Network Disconnect During Sync | Upstream API timeout or disconnect during "Test & Sync Now" | Route returns HTTP 200 with `cached_fallback_used: true`, UI displays friendly error toast without crashing (M2 Stress 6). |
| 34 | MANUAL Mode Sync Protection | Triggering sync on platform set to `sync_mode: 'MANUAL'` | Preserves admin custom numbers strictly; returns status `skipped_manual` (M2 Stress 7). |

---

## 5. Schema Definitions & Validation Rules (Zod / TypeScript)

### 5.1 Profile & Hero Schema (`profileHeroSchema`)
```typescript
import { z } from 'zod';

export const themePresetEnum = z.enum(['neo-warm', 'neo-mint', 'neo-mustard', 'neo_brutalist']);

export const stickerItemSchema = z.object({
  id: z.string().min(1, 'ID sticker harus diisi'),
  text: z.string().trim().min(1, 'Teks sticker tidak boleh kosong').max(24, 'Maksimal 24 karakter'),
  emoji: z.string().min(1, 'Emoji harus dipilih'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus hex (contoh: #FFD166)').optional(),
  rotation: z.number().min(-45, 'Rotasi minimal -45°').max(45, 'Rotasi maksimal +45°'),
});

export const profileHeroSchema = z.object({
  creator_name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  creator_handle: z.string().trim().min(2, 'Handle minimal 2 karakter').refine(
    (h) => h.startsWith('@'),
    'Handle harus diawali dengan @'
  ),
  creator_avatar_url: z.string().trim().min(1, 'URL avatar harus diisi'),
  creator_bio: z.string().trim().min(5, 'Bio minimal 5 karakter').max(500, 'Bio maksimal 500 karakter'),
  slot_available: z.boolean(),
  slot_status_text: z.string().trim().min(1, 'Status ketersediaan slot tidak boleh kosong'),
  theme_preset: themePresetEnum,
  stickers: z.array(stickerItemSchema).max(20, 'Maksimal 20 sticker'),
});

export type ProfileHeroFormData = z.infer<typeof profileHeroSchema>;
```

### 5.2 Social Platform & Demographics Schema (`socialPlatformSchema`)
```typescript
export const platformIdEnum = z.enum(['instagram', 'tiktok', 'youtube', 'facebook', 'x']);
export const syncModeEnum = z.enum(['MANUAL', 'AUTO_API']);

export const demographicCitySchema = z.object({
  city: z.string().trim().min(1, 'Nama kota tidak boleh kosong'),
  percentage: z.number().min(0, 'Persentase minimal 0%').max(100, 'Persentase maksimal 100%'),
});

export const platformDemographicsSchema = z.object({
  gender: z.object({
    male: z.number().min(0).max(100),
    female: z.number().min(0).max(100),
  }).refine((g) => g.male + g.female === 100, {
    message: 'Total persentase gender harus pas 100%',
    path: ['female'],
  }),
  top_cities: z.array(demographicCitySchema).max(10, 'Maksimal 10 kota'),
});

export const socialPlatformSchema = z.object({
  id: z.string().min(1),
  platform_id: platformIdEnum,
  platform_name: z.string().trim().min(1),
  handle: z.string().trim().min(1),
  profile_url: z.string().trim().url('URL profil tidak valid'),
  sync_mode: syncModeEnum,
  followers_count: z.number().int().min(0, 'Followers minimal 0'),
  engagement_rate: z.number().min(0, 'ER minimal 0%'),
  avg_views: z.number().int().min(0, 'Average views minimal 0'),
  avg_likes: z.number().int().min(0, 'Average likes minimal 0'),
  avg_comments: z.number().int().min(0, 'Average comments minimal 0'),
  demographics: platformDemographicsSchema,
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
});

export type SocialPlatformFormData = z.infer<typeof socialPlatformSchema>;
```

### 5.3 Endorse Package Schema (`endorsePackageSchema`)
```typescript
export const packagePlatformEnum = z.enum(['instagram', 'tiktok', 'youtube', 'cross-platform']);
export const packageTierEnum = z.enum(['starter', 'standard', 'vip', 'bundle']);

export const endorsePackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Nama paket tidak boleh kosong').max(100, 'Maksimal 100 karakter'),
  platform: packagePlatformEnum,
  price: z.number().min(0, 'Harga paket tidak boleh negatif'),
  description: z.string().trim().min(1, 'Deskripsi paket harus diisi').max(500, 'Maksimal 500 karakter'),
  deliverables: z.array(z.string().trim().min(1, 'Deliverable tidak boleh kosong')).min(1, 'Minimal sertakan 1 deliverable'),
  tier: packageTierEnum.default('standard'),
  discount_percentage: z.number().min(0).max(100).default(0),
  is_popular: z.boolean().default(false),
  is_price_hidden: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type EndorsePackageFormData = z.infer<typeof endorsePackageSchema>;
```

### 5.4 Contact & CTA Settings Schema (`contactSettingsSchema`)
```typescript
export const contactSettingsSchema = z.object({
  whatsapp_number: z.string().trim().transform((val) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    return cleaned;
  }).refine((val) => val.length >= 8 && val.length <= 15, {
    message: 'Nomor WhatsApp harus antara 8 hingga 15 digit angka',
  }),
  whatsapp_template: z.string().trim().transform((val) => {
    return val && val.trim().length > 0 ? val : 'Halo Admin, booking endorsement.';
  }),
  business_email: z.string().trim().regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'Format email tidak valid (contoh: sponsor@sumbarterkini.com)'
  ),
  media_kit_pdf_url: z.string().trim().refine(
    (url) => url.endsWith('.pdf'),
    'File media kit harus berekstensi .pdf'
  ),
});

export type ContactSettingsFormData = z.infer<typeof contactSettingsSchema>;
```

---

## 6. UI Interactions & State Transitions Matrix

```
       [Unauthenticated Request to /admin]
                        │
                        ▼
          ┌───────────────────────────┐
          │   <AdminLoginGate />      │
          │  (Passcode / Supabase)    │
          └─────────────┬─────────────┘
                        │ Valid Credentials
                        ▼
        ┌───────────────────────────────┐
        │     <AdminDashboard />        │
        │  • Top Navigation Bar         │
        │  • Split Preview Toggle       │
        │  • Tab Selector               │
        └───────────────┬───────────────┘
                        │
      ┌─────────────────┼──────────────────┬─────────────────┐
      ▼                 ▼                  ▼                 ▼
[Tab: Profil]    [Tab: Socials]     [Tab: Packages]   [Tab: Kontak]
 - Hero Name      - Mode Toggle      - Package List    - WhatsApp Normalizer
 - Bio Text       - Metrics Form     - Create Package  - Order Template
 - Slot Badge     - ER Live Calc     - Edit Deliverables- Email Field
 - Sticker CRUD   - "1-Click ER"     - Price / Hidden  - Media Kit PDF
 - Theme Selector - "Sync Now" API   - Delete Prompt   - "Test WA Link"
      │                 │                  │                 │
      └─────────────────┴────────┬─────────┴─────────────────┘
                                 │ Save Actions
                                 ▼
                     ┌────────────────────────┐
                     │ ResilientRepository    │
                     │  (DAL Update & Upsert) │
                     └───────────┬────────────┘
                                 │ BroadcastSyncEvent
                                 ▼
                     ┌────────────────────────┐
                     │ BroadcastChannel Sync  │
                     │  (Debounced Catch-up)  │
                     └───────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Live Split Preview]            [Open Public Hub Tabs]
     - Instant Hero re-render        - Real-time page update
     - Theme accent recolor          - No browser refresh needed
     - Bento Grid odometer sync      - Rate calculator recomputed
```

### Tab State Transitions:
1. **Profil & Hero Tab**:
   - `initial`: loads site settings via `repository.getSiteSettings()`.
   - `editing`: user alters avatar, name, bio, slot availability, or stickers.
   - `sticker_modal`: user clicks "Tambah Sticker" -> specifies text, emoji, tilt angle, color.
   - `saving`: invokes `repository.updateSiteSettings()`, displays saving indicator.
   - `success`: displays Toast "Pengaturan profil berhasil diperbarui!", pushes broadcast event.
2. **Social Media Tab**:
   - `initial`: loads platforms via `repository.getSocialPlatforms()`.
   - `metric_change`: typing in likes or comments immediately fires `calculateER(likes, comments, followers)`.
   - `apply_er`: user clicks "Terapkan ER" -> copies calculated percentage to `engagement_rate` field.
   - `sync_trigger`: user clicks "Test & Sync Now" -> dispatches POST `/api/sync-socials`.
   - `sync_success`: shows badge `synced` or `cached_fallback`, updates odometer metrics, shows Toast.
3. **Rate Card Builder Tab**:
   - `initial`: loads endorsement packages via `repository.getEndorsePackages()`.
   - `create_click`: opens package editor modal with blank fields.
   - `add_deliverable`: appends new text input line to deliverables list.
   - `toggle_hidden_price`: flips `is_price_hidden`, updating badge from IDR price to "Negosiasi Khusus".
   - `delete_confirm`: opens warning confirmation before atomic deletion.
4. **Contact Settings Tab**:
   - `phone_input`: user enters `0812-3456-7890` -> live normalizer previews `https://wa.me/6281234567890`.
   - `test_link`: opens WhatsApp web URL with pre-filled order template.
   - `save`: validates email regex and `.pdf` extension, saves to DAL.
5. **Live Preview System**:
   - `toggle_split`: expands split-screen container (`lg:grid lg:grid-cols-2`).
   - `viewport_mode`: toggles between Desktop view and Mobile (375px) frame simulation.
   - `listener`: receives `BroadcastSyncEvent`, debounces rapidly fired updates, and updates preview DOM without page refresh.

---

## 7. E2E Acceptance Criteria & Testability Matrix

| Test ID | Category | Scenario / Requirement | Verification Method | Expected Outcome |
|---------|----------|------------------------|---------------------|------------------|
| M4.R1.1 | Security | Access `/admin` when unauthenticated | Navigate to `/admin` in clean session | Gated by `AdminLoginGate`, dashboard hidden |
| M4.R1.2 | Security | Passcode submission with leading/trailing spaces | Submit `"  admin123  "` to passcode gate | Passes authentication, sets session cookie |
| M4.R1.3 | Security | Passcode rate limiting after 5 failures | Submit 5 bad passcodes consecutively | Triggers 429 lockout, disables submission |
| M4.R1.4 | Security | Logout action clears session | Click "Logout" in dashboard | Session cookie & storage cleared, gate shown |
| M4.R2.1 | Profile | Update creator name and Minang bio | Input valid name & bio, click Save | `repository.getSiteSettings()` returns new name & bio |
| M4.R2.2 | Profile | Boundary validation: name > 100 or bio > 500 | Input 101-char name or 501-char bio | Form validation error displayed, submit blocked |
| M4.R2.3 | Profile | Draggable stickers CRUD | Add sticker, edit rotation, delete sticker | Sticker list updated; rotation clamped to [-45, 45] |
| M4.R2.4 | Profile | Theme preset switching | Select `'neo-mint'` or `'neo-mustard'` | DAL persists preset, preview recolors immediately |
| M4.R3.1 | Socials | Toggle sync mode between MANUAL and AUTO_API | Toggle switch on platform card | DAL updates `sync_mode`; sync skips manual platforms |
| M4.R3.2 | Socials | Automatic ER calculation helper | Input 38.2K likes, 3.25K comments, 854.2K followers | ER calculates live to `4.85%` with 2 decimals |
| M4.R3.3 | Socials | ER helper division-by-zero protection | Input 0 followers with 100 likes | Returns `0.00%` without NaN or exception |
| M4.R3.4 | Socials | 1-Click ER Apply button | Click "Terapkan ER" | Sets platform `engagement_rate` input to calculated value |
| M4.R3.5 | Socials | "Test & Sync Now" button execution | Click sync trigger for Instagram | Dispatches `/api/sync-socials`, displays sync status |
| M4.R3.6 | Socials | Demographics gender sum validation | Input 60% male and 60% female | Validation error shown (sum must equal 100%) |
| M4.R4.1 | Rate Card | Create new endorsement package | Fill package form with deliverables, submit | `repository.getEndorsePackages()` contains new package |
| M4.R4.2 | Rate Card | Deliverables array validation | Attempt to save package with 0 deliverables | Validation error displayed; at least 1 item required |
| M4.R4.3 | Rate Card | Toggle `is_price_hidden` | Toggle hidden price switch | Rate card displays "Negosiasi Khusus" in preview |
| M4.R4.4 | Rate Card | Negative price validation | Input -Rp 10.000 | Validation error shown; price must be >= 0 |
| M4.R4.5 | Rate Card | Delete package confirmation guard | Click delete package | Shows confirmation warning before DAL delete |
| M4.R5.1 | Contact | WhatsApp phone normalizer | Input `'0812-3456-7890'` | Normalized to `'6281234567890'` |
| M4.R5.2 | Contact | WhatsApp phone length validation | Input `'1234'` | Validation error shown (must be 8-15 digits) |
| M4.R5.3 | Contact | Business email format validation | Input `'bad-email'` | Validation error shown (requires @ and domain) |
| M4.R5.4 | Contact | Media kit PDF extension validation | Input `'/downloads/kit.docx'` | Validation error shown (must end in `.pdf`) |
| M4.R5.5 | Contact | Empty WhatsApp template fallback | Submit empty template string | Defaults to `'Halo Admin, booking endorsement.'` |
| M4.R6.1 | Sync | Live split-screen preview | Toggle split view on desktop screen | Renders side-by-side CMS editor and public replica |
| M4.R6.2 | Sync | Cross-tab broadcast synchronization | Edit setting in Admin, inspect preview tab | Preview updates instantaneously without page reload |
| M4.R6.3 | Sync | Rapid mutation debouncing | Trigger 100 updates/second | Debounced in preview renderer into single update |
| M4.R7.1 | Quality | TypeScript type checking | Execute `npm run typecheck` (`tsc --noEmit`) | Exits with code 0 (zero errors) |
| M4.R7.2 | Quality | ESLint code hygiene | Execute `npm run lint` | Exits with code 0 (zero warnings, zero errors) |
| M4.R7.3 | Quality | Production build verification | Execute `npm run build` | Builds `.next` with static & dynamic routes |
| M4.R7.4 | Quality | Test regression non-regression | Execute `npm run test:all` | All 281 existing tests pass + new admin tests pass |
| M4.R7.5 | Quality | Anti-slop ergonomics & tokens | Verify contrast, tap targets, em dashes | Min 44px tap targets, zero em dashes, dark ink text |

---

## 8. Caveats

1. **Supabase Auth vs Passcode Fallback**: In production, Supabase Auth requires valid credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`). When unconfigured, the passcode fallback (`ADMIN_PASSCODE` / `admin123` / `sumbar2026`) acts as the authoritative gate. The admin panel must seamlessly support both authentication paths.
2. **File System Isolation**: Under the team rules, `.agents/teamwork/` must contain exclusively `.md` metadata. All source code must be placed in `src/app/admin/`, `src/components/admin/`, and `src/lib/admin/`.
3. **Anti-Slop Strictness**: In `tests/adversarial/m3-build-stress.test.ts`, there is an automated scanner that fails the test suite if an em dash (`\u2014` or `—`), a `// TODO` comment, or a `min-h` under 44px on primary controls is detected in `src/`. Any implementation of Milestone 4 must stringently obey these rules.

---

## 9. Conclusion

The specification mining for Milestone 4 (Full CMS Admin Panel at `/admin`) is complete and thoroughly documented. Every requirement (R1 through R7) has been mapped to:
- Precise schema contracts with Zod validation.
- Complete edge case catalogs with boundary conditions.
- UI component interaction states and transitions.
- Concrete testability matrices ensuring 100% test coverage with zero regressions on the existing 281 tests.

The architecture planner and implementer subagents can now proceed with implementation directly from this specification.

---

## 10. Verification Method

To verify the findings and baseline specifications:

1. **Verify Existing Tests**:
   ```bash
   npm test
   ```
   *Expected output*: 281/281 passed across Tier 1, Tier 2, Tier 3, and Tier 4.

2. **Verify Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Expected output*: Exits with code 0.

3. **Verify Lint**:
   ```bash
   npm run lint
   ```
   *Expected output*: 0 warnings, 0 errors.

4. **Verify Full Test Suite**:
   ```bash
   npm run test:all
   ```
   *Expected output*: All unit and adversarial stress suites pass cleanly.

5. **Inspect Specifications File**:
   Inspect `.agents/teamwork/teamwork_spec_miner_survey_3/handoff.md`.

