# Milestone 4 Explorer Investigation Report: Admin CMS Architecture, Design System, Authentication, and Public Component Contracts

**Working Directory**: `/Users/adechairullah/CODING/SUMBAR_TERKINI`  
**State Folder**: `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_survey_2/`  
**Investigation Target**: Milestone 4 (Full CMS Admin Panel at `/admin`)  
**Timestamp**: 2026-11-07T09:24:00Z  

---

## 1. Observation

Direct code and environment observations across the codebase:

### 1.1 Design System & Neo-Brutalism Tokens
- **`tailwind.config.ts` (lines 11-43)**:
  ```ts
  colors: {
    paper: '#FAF8F5',
    ink: '#1E1E1E',
    mustard: { DEFAULT: '#FFD166', hover: '#F4C44E' },
    coral: { DEFAULT: '#EF476F', hover: '#E03660' },
    mint: { DEFAULT: '#06D6A0', hover: '#05BF8E' },
    card: '#FFFFFF',
  },
  boxShadow: {
    'neo-sm': '2px 2px 0px #1E1E1E',
    'neo': '4px 4px 0px #1E1E1E',
    'neo-lg': '6px 6px 0px #1E1E1E',
    'neo-xl': '8px 8px 0px #1E1E1E',
    'neo-hover': '1px 1px 0px #1E1E1E',
  },
  borderWidth: { '2': '2px', '3': '3px' },
  fontFamily: {
    sans: ['var(--font-plus-jakarta)', 'sans-serif'],
    mono: ['var(--font-space-mono)', 'monospace'],
  }
  ```
- **`src/app/globals.css` (lines 6-86)**:
  - Base variables: `--bg-paper: #FAF8F5;`, `--color-ink: #1E1E1E;`, `--color-mustard: #FFD166;`, `--color-coral: #EF476F;`, `--color-mint: #06D6A0;`.
  - Utility component classes:
    - `.neo-card`: `background-color: #FFFFFF; border: 2px solid #1E1E1E; box-shadow: 4px 4px 0px #1E1E1E;`
    - `.neo-card-interactive`: `.neo-card` + `transition: transform 0.15s ease, box-shadow 0.15s ease;` and hover `transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #1E1E1E;`
    - `.neo-button`: border 2px, box-shadow 4px, hover translate(2px, 2px) box-shadow 2px, active translate(4px, 4px) box-shadow 0px.
    - `.neo-badge`: border 2px, box-shadow 2px 2px 0px #1E1E1E, uppercase, font-bold.
- **`src/app/layout.tsx` (lines 5-34)**:
  - Fonts: Google Fonts `Plus_Jakarta_Sans` (`--font-plus-jakarta`) and `Space_Mono` (`--font-space-mono`, weights 400 and 700).
  - Body: `font-sans antialiased bg-paper text-ink min-h-screen`.
- **Existing UI Primitives**:
  - `src/components/ui/NeoButton.tsx`: Variants `primary` (mustard), `mint`, `coral`, `paper`, `white`, `ink`. Sizes `sm`, `md` (min-h-[44px]), `lg` (min-h-[48px]). Fully supports keyboard focus ring and disabled states.
  - `src/components/ui/NeoCard.tsx`: Supports `interactive?: boolean`, standard rounded-2xl with 2px border and neo shadow.
  - `src/components/ui/NeoBadge.tsx`: Supports variants `mustard`, `mint`, `coral`, `paper`, `white`, `ink`; sizes `sm`, `md` with `font-mono font-bold`.
  - `src/components/ui/Toast.tsx`: `ToastProvider` and `useToast()` providing `showToast` and `copyText(text, successMessage)`. Floating neo-brutalist toast at bottom-right with role="status".
  - `src/components/ui/Icons.tsx`: Brand SVGs (`InstagramIcon`, `TikTokIcon`, `YouTubeIcon`, `FacebookIcon`, `XIcon`, `PlatformIcon`) and tactile utility icons (`ExternalLinkIcon`, `TrendingUpIcon`, `UsersIcon`, `EyeIcon`, `HeartIcon`, `MessageSquareIcon`, `MapPinIcon`, `RefreshCwIcon`).

---

### 1.2 Existing Public Components & State Contract (M1–M3)
- **`src/app/page.tsx`**:
  - Server Component consuming DAL via `repository`:
    - `settings = await repository.getSiteSettings()`
    - `platforms = await repository.getSocialPlatforms()`
    - `packages = await repository.getEndorsePackages()`
    - `reactions = await repository.getReactions()`
  - Mounts `<HeroSection settings={settings} reactions={reactions} />`, `<BentoGrid platforms={platforms} />`, `<RateCalculator packages={packages} whatsappNumber={settings.whatsapp_number} creatorName={settings.creator_name} />`, `<PortfolioSection items={portfolioItems} />`, `<ContactHub email={settings.business_email} whatsappNumber={settings.whatsapp_number} mediaKitPdfUrl={settings.media_kit_pdf_url} />`.
- **Hero Section (`src/components/hero/HeroSection.tsx`)**:
  - Consumes `SiteSettings`: `creator_name`, `creator_handle`, `creator_avatar_url`, `creator_bio`, `slot_available`, `slot_status_text`, `slots_remaining`, `stickers`, `location`, `whatsapp_number`.
  - Sub-component `SlotBadge` (`src/components/hero/SlotBadge.tsx`): Blinking green dot for available, status color mapping (Mint for available, Mustard for limited, Coral for unavailable).
  - Sub-component `DraggableStickers` (`src/components/hero/DraggableStickers.tsx`):
    - Sticker model: `{ id: string, text: string, emoji: string, color?: string, rotation: number }`.
    - Text clamped to 24 characters (`truncateStickerText`).
    - Clamped to max 20 stickers.
    - Draggable with Framer Motion `drag={!shouldReduceMotion}`, bounce damping, active rotation normalization (-15° to +15°).
  - Sub-component `ParticleMoodClicker` (`src/components/hero/ParticleMoodClicker.tsx`): Visitor reactions (`fire`, `rocket`, `heart`), optimistic counter update, calls `repository.incrementReaction(type)`.
- **Socials Bento Grid (`src/components/socials/BentoGrid.tsx` & `BentoCard.tsx`)**:
  - Consumes `SocialPlatform[]`: Instagram, TikTok, YouTube, Facebook, X.
  - Metric fields: `followers_count`, `engagement_rate`, `avg_views`, `avg_likes`, `avg_comments`, `sync_mode` (`MANUAL` vs `AUTO_API`), `demographics` (`gender: { male, female }`, `top_cities: [{ city, percentage }]`).
  - Odometer animation (`RollingOdometer.tsx`): Formats to Indonesian compact/standard numbering.
  - ER status logic (`getErStatus` in `BentoCard.tsx:72-97`):
    - `ER >= 4.0%` -> `Viral Maker` (`bg-mint text-ink`, emoji `🔥`)
    - `ER >= 2.0%` -> `Healthy` (`bg-mustard text-ink`, emoji `⚡`)
    - `ER < 2.0%` -> `Steady` (`bg-paper text-ink`, emoji `📊`)
  - Sync Mode display: `AUTO_API` has animated pulse dot + "API Sync", `MANUAL` shows solid dot + "Manual".
- **Rate Calculator (`src/components/calculator/RateCalculator.tsx`)**:
  - Consumes `EndorsePackage[]`: `id`, `name`, `platform`, `price`, `description`, `deliverables`, `is_popular`, `is_price_hidden`, `sort_order`, `is_active`, `tier`, `discount_percentage`.
  - Discounter logic: `calculateDiscountTier` in `src/lib/utils/formatters.ts`:
    - 1 package: 0% discount (Starter)
    - 2 packages: 5% discount (Growth Duo)
    - 3+ packages: 10% discount (VIP Viral Bundle)
  - Supports private negotiation masking (`is_price_hidden` or manual toggle) displaying "Negosiasi Khusus" / "Tanya via WhatsApp".
  - Integrated `WhatsAppCheckout`: Encodes ordered deliverables into formatted WhatsApp order URL.
- **Contact Hub (`src/components/contact/ContactHub.tsx`)**:
  - Consumes `email`, `whatsappNumber`, `mediaKitPdfUrl`.
  - 1-click clipboard copy with immediate visual feedback (`Tersalin!`) and toast notification.
  - PDF download card linking to `mediaKitPdfUrl`.
- **Theme Presets**:
  - Database schema (`supabase/schema.sql:24`): `CHECK (theme_preset IN ('neo-warm', 'neo-mint', 'neo-mustard'))`.
  - Contract & DAL: Default `'neo-warm'`. Test `T1.19.3` and `T1.24.4` explicitly validate switching to `'neo-mint'` and `'neo-mustard'`.

---

### 1.3 Authentication Mechanisms & Sessions
- **`src/lib/admin/auth.ts`**:
  - Gating function: `checkAdminAuth()`:
    1. Checks live Supabase Auth session via `client.auth.getSession()` if `isSupabaseConfigured()`.
    2. Checks stored session in `sessionStorage` (`sumbar_admin_auth`) with 24-hour expiration (`ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000`).
  - Passcode validation: `loginWithPasscode(code)`:
    - Valid codes array: `[getPasscode(), 'admin123', 'sumbar2026', 'admin']`.
    - `getPasscode()` reads `process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'sumbar2026'`.
    - Also supports `ADMIN_PASSCODE` in environment.
  - Supabase login: `loginWithSupabase(email, password)`:
    - Calls `client.auth.signInWithPassword({ email, password })`.
    - Sets session in storage upon success.
  - Session cookie specification:
    - E2E Test `T1.18.4` defines cookie contract:
      `cookieConfig = { name: 'admin_session', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }`.
    - Storing in both `sessionStorage` (for client React state) and setting/verifying the `admin_session` cookie provides robust client & server-side gating.
- **`src/components/admin/AdminLoginGate.tsx`**:
  - Already implemented interactive component!
  - Supports dual tabs: `Email Login` (when Supabase is configured) and `Passcode`.
  - Passcode input with reveal toggle (Eye / EyeOff), submit button with loading state, error display in neo-brutalist coral box.
  - Calls `onAuthenticated()` prop when authentication succeeds.

---

### 1.4 Social Sync API (`/api/sync-socials`)
- **File**: `src/app/api/sync-socials/route.ts`
- **Supported Methods**: `GET` and `POST`. `PUT`, `DELETE`, `PATCH`, `HEAD` return `405 Method Not Allowed` with `Allow: GET, POST` header.
- **Authentication**:
  - Controlled by `process.env.CRON_SECRET`.
  - If `CRON_SECRET` is unset/empty: allows requests (open mode for local dev/testing).
  - If `CRON_SECRET` is set: requires `Authorization: Bearer <token>` or URL query param `?secret=<token>`.
- **Concurrency & Reliability**:
  - Keyed single-flight coalescing map (`inFlightSyncs`) merges simultaneous requests into one execution.
  - 9000ms global timeout wrapper (`withTimeout`) preventing hanging serverless functions.
  - In case of timeout or upstream failures (e.g. HTTP 429 rate limit or HTTP 500), automatically serves cached metrics with `status: 'cached_fallback'` and `cached_fallback_used: true`.
- **Sync Behavior by Mode**:
  - `MANUAL`: Returns `status: 'skipped_manual'` and preserves admin-entered numbers.
  - `AUTO_API`: Calls `getAdapter(platform.platform_id).sync(platform)`, updates repository with fresh metrics, and sets `last_synced_at`.
- **Response Format (`SyncResponse`)**:
  ```json
  {
    "success": true,
    "timestamp": "2026-11-07T09:22:59.466Z",
    "platforms_processed": 5,
    "synced_platforms": [
      {
        "platform_id": "instagram",
        "platform_name": "Instagram",
        "status": "synced",
        "sync_mode": "AUTO_API",
        "metrics": {
          "followers_count": 854200,
          "engagement_rate": 4.85,
          "avg_views": 182400,
          "avg_likes": 38200,
          "avg_comments": 3250
        },
        "cached_fallback_used": false,
        "source": "live_api",
        "last_synced_at": "2026-11-07T09:22:59.466Z"
      }
    ]
  }
  ```
- **Trigger from Admin UI**:
  - Admin button "Test & Sync Now" can call `fetch('/api/sync-socials', { method: 'POST' })` or pass `{ platform_id }` in body to sync specific or all platforms.

---

### 1.5 Realtime Synchronization & DAL
- **`src/lib/data/repository.ts`**:
  - Implements `DataRepository`:
    - `getSiteSettings()`, `updateSiteSettings(data)`
    - `getSocialPlatforms()`, `updateSocialPlatform(id, data)`
    - `getEndorsePackages()`, `createEndorsePackage(pkg)`, `updateEndorsePackage(id, data)`, `deleteEndorsePackage(id)`
    - `getReactions()`, `incrementReaction(type)`
    - `subscribeToChanges(table, callback)`
- **`src/lib/data/storage.ts`**:
  - Implements offline-resilient local store `__SUMBAR_LOCAL_STORE__` and `localStorage` persistence.
  - Implements `BroadcastChannel('sumbar_terkini_channel')` publishing `BroadcastSyncEvent`:
    `{ type: 'STATE_UPDATED', table, action, payload, timestamp }`.
  - Cross-tab / split-screen preview can subscribe via `repository.subscribeToChanges(...)` or `LocalStorageManager.subscribe(...)`.

---

### 1.6 Current Test & Build Status
- **Test Suite**: `npm test` runs 281 tests across 4 tiers. Current status: **281 passed, 0 failed** in 0.02s.
- **Unit & Adversarial Tests**: `npm run test:all` executes all 281 E2E tests, unit adapter tests, and 24 adversarial resilience tests. Status: **All tests pass with 100% success**.
- **TypeScript & Lint**: `npx tsc --noEmit` exits code 0 (zero errors); `npm run lint` exits code 0 (zero warnings).
- **Production Build**: `npm run build` compiles successfully (`Compiled successfully in 2.6s`, static pages generated, dynamic routes mapped).

---

## 2. Logic Chain

### 2.1 Route & Entry Point for Milestone 4
1. **Observation**: Currently `src/app/admin/` does not exist; only `src/components/admin/AdminLoginGate.tsx` and `src/lib/admin/auth.ts` exist.
2. **Requirement R1**: "Implement a protected admin gate at `/admin` supporting Supabase Auth and a passcode fallback supporting the `ADMIN_PASSCODE` environment variable with fallback to `admin123` or `sumbar2026`."
3. **Inference**: Milestone 4 requires creating the `/admin` route (`src/app/admin/page.tsx` and supporting admin components). When unauthenticated, it renders `<AdminLoginGate onAuthenticated={...} />`; when authenticated, it renders the full CMS Admin Panel.

### 2.2 Tab Architecture for Admin CMS
1. **Requirements R2–R6**:
   - R2: Profile & Hero Editor (creator identity, avatar, handle, bio, slot availability & status, theme preset selector, draggable stickers CRUD).
   - R3: Social Media & Engagement Manager (toggle MANUAL vs AUTO_API, edit counts, edit demographics, real-time ER calculator helper with 1-click apply, "Test & Sync Now" trigger for `/api/sync-socials`).
   - R4: Rate Card & Package Builder (CRUD packages: name, platform, price, description, deliverables, discount percentage, tier, `is_popular` toggle, `is_price_hidden` toggle).
   - R5: Contact & CTA Settings (WhatsApp number with normalization validation, automated order template text, business email, media kit PDF URL).
   - R6: Live Preview & Real-time Synchronization (split-screen or instant modal preview using repository DAL and realtime broadcast).
2. **Inference**: The admin dashboard can be cleanly structured into 5 cohesive management modules:
   - Module 1: `Profil & Hero` (Hero settings, Theme preset, Draggable stickers manager)
   - Module 2: `Media Sosial & ER` (Platform list, sync mode toggle, manual metric editor, ER helper with 1-click apply, Sync Now button)
   - Module 3: `Rate Card & Paket` (Package builder CRUD, deliverables tags, pricing, popular & hidden toggles)
   - Module 4: `Kontak & CTA` (WhatsApp number formatting, template editor, email, PDF link)
   - Module 5: `Live Preview` (Split-screen toggle or live side-by-side / overlay preview with real-time sync)

### 2.3 Automatic ER Helper Contract (R3 & Feature 21)
1. **Observation**: `tests/e2e/tier1-features.test.ts:961-988` defines `calculateER(likes, comments, followers)`:
   - Formula: `((likes + comments) / followers) * 100`
   - Strict rounding: 2 decimal places (e.g. `(38200 + 3250) / 854200 * 100 = 4.85`)
   - Guard against division by zero: if `followers <= 0`, returns `0` (or `0.00`).
2. **Inference**: The admin UI should include an ER calculator helper widget inside the Social Media Manager where changing likes, comments, or followers recalculates the preview ER in real time, and provides a "Terapkan ER" (1-Click Apply) button that commits the calculated ER to the active platform's engagement rate field.

### 2.4 Stickers Manager Contract (R2 & Feature 19)
1. **Observation**: `StickerItem` is `{ id: string, text: string, emoji: string, color?: string, rotation: number }`.
2. **Contract**: Max 20 stickers, text up to 24 chars, rotation -15 to +15.
3. **Inference**: Admin stickers manager must allow:
   - Adding a new sticker (text, emoji picker/input, rotation slider -15° to 15°, color selector: Mustard `#FFD166`, Mint `#06D6A0`, Coral `#EF476F`, Paper `#FAF8F5`).
   - Editing existing stickers.
   - Deleting a sticker.
   - Changes immediately persist via `repository.updateSiteSettings({ stickers })` and broadcast to public hero.

### 2.5 Anti-Slop Strict Hygiene Enforcement
1. **Observation**: Feature 25 in `tests/e2e/tier1-features.test.ts` and `antislop-ui` skill prescribe:
   - Zero em dashes (`\u2014`) in UI strings, button texts, or seed data.
   - Minimum 44px tap targets (`min-h-[44px]`) on buttons and toggles.
   - `overflow-x-hidden` on mobile containers, no horizontal scrolling.
   - WCAG AA contrast ratio >= 4.5:1.
   - Zero placeholder stubs (`// TODO`, `// implement later`).
   - Purpose-driven layout: avoid generic dashboard shells with fake stat cards or fake trend charts; build directly around the decision-making workflows (editing hero, editing socials, editing packages, editing contacts).

---

## 3. Caveats

1. **Supabase Environment Variables in Local / Development Mode**:
   - In offline local environments, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not pointing to a live cloud project.
   - The application is specifically designed to fall back gracefully to `LocalStorageManager` and in-memory mock data. The admin implementation must continue to rely on `repository` and `LocalStorageManager` so that it operates with 100% fidelity both offline and online.
2. **`ADMIN_PASSCODE` vs `ADMIN_PASSWORD`**:
   - `.env.example` mentions `ADMIN_PASSWORD`, while the M4 requirements and `src/lib/admin/auth.ts` prioritize `ADMIN_PASSCODE` and `NEXT_PUBLIC_ADMIN_PASSCODE` with fallback to `admin123` or `sumbar2026`.
   - The implementation should defensively accept `process.env.ADMIN_PASSCODE || process.env.NEXT_PUBLIC_ADMIN_PASSCODE || process.env.ADMIN_PASSWORD || 'sumbar2026' || 'admin123'`.
3. **Server vs Client Admin Route Protection**:
   - Next.js 15 App Router supports Server Components and Client Components. If `/admin/page.tsx` is implemented as a client component (or client-hydrated container), it can check `checkAdminAuth()` on mount and toggle between `<AdminLoginGate />` and `<AdminDashboard />`. This aligns with the existing `src/components/admin/AdminLoginGate.tsx` and sessionStorage architecture without requiring server middleware rewrites that could interfere with static generation.
4. **Theme Presets Check Constraint**:
   - The database check constraint restricts `theme_preset` to `'neo-warm' | 'neo-mint' | 'neo-mustard'`. The theme selector must restrict options to these 3 valid presets.

---

## 4. Conclusion

All prerequisites, existing components, and data layer contracts for Milestone 4 (Full CMS Admin Panel at `/admin`) are thoroughly mapped and ready:

1. **Design System & Primitives**:
   - Neo-Brutalism Soft system is fully established in `tailwind.config.ts`, `globals.css`, and `src/components/ui/` (`NeoButton`, `NeoCard`, `NeoBadge`, `Toast`, `Icons`).
   - The admin panel should reuse these exact primitives to maintain unified aesthetic identity.
2. **Existing Public Components**:
   - `HeroSection`, `DraggableStickers`, `SlotBadge`, `ParticleMoodClicker`, `BentoGrid`, `BentoCard`, `RateCalculator`, `ContactHub` are well-structured and consume standard data contracts from `src/types/index.ts`.
   - Modifying fields via `repository` updates both persistent storage and broadcasts events via `BroadcastChannel('sumbar_terkini_channel')`.
3. **Authentication**:
   - `AdminLoginGate` and `auth.ts` already support Supabase Auth and Passcode (`ADMIN_PASSCODE` fallback `admin123` or `sumbar2026`).
   - Wiring `/admin` to use `AdminLoginGate` when `!session.authenticated` provides the required protected gate.
4. **Social Sync (`/api/sync-socials`)**:
   - Route handler is already implemented with GET/POST, single-flight coalescing, and cached fallback.
   - The admin UI only needs a button calling `fetch('/api/sync-socials', { method: 'POST' })` to trigger and display sync status.
5. **Anti-Slop Compliance**:
   - Must adhere to: No em dashes, minimum 44px tap targets, WCAG AA >= 4.5:1 contrast, no fake charts, real actionable form controls, and zero `// TODO` stubs.

---

## 5. Verification Method

To independently verify all findings and validate future implementation of Milestone 4:

1. **TypeScript Verification**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected result*: Exit code 0, 0 type errors.

2. **ESLint Code Quality**:
   ```bash
   npm run lint
   ```
   *Expected result*: Exit code 0, 0 warnings or errors.

3. **Automated Test Suite (281 Existing Tests)**:
   ```bash
   npm test
   ```
   *Expected result*: All 281 tests pass (Tier 1: 125, Tier 2: 125, Tier 3: 25, Tier 4: 6).

4. **Unit & Adversarial Stress Tests**:
   ```bash
   npm run test:all
   ```
   *Expected result*: All unit tests, API route stress tests, and adversarial tests pass.

5. **Production Build Compilation**:
   ```bash
   npm run build
   ```
   *Expected result*: Exit code 0, optimized production build successfully generated.

6. **Invalidation Conditions**:
   - If `theme_preset` is set to an arbitrary string not in `['neo-warm', 'neo-mint', 'neo-mustard']`, tests or database constraints will fail.
   - If UI buttons have touch targets smaller than 44px (`min-h-[44px]`), test T1.25.2 will invalidate.
   - If any em dash (`\u2014`) appears in strings, test T1.25.1 will invalidate.
   - If `/api/sync-socials` exposes 405 methods without the `Allow: GET, POST` header, adversarial tests will fail.
