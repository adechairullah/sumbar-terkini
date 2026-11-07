# Project: Sumbar Terkini Creator Media Kit & Endorsement Hub

## Architecture
- **Framework**: Next.js 15 App Router (`src/app/`) with TypeScript in strict mode.
- **Styling**: Tailwind CSS 3.4 with Neo-Brutalism Soft design tokens:
  - Warm Paper background: `#FAF8F5`
  - Dark Ink borders and text: `#1E1E1E` (2px solid borders, 4px 4px 0px hard shadows)
  - Contrast Accents: Mustard `#FFD166`, Coral `#EF476F`, Mint `#06D6A0`
  - Typography: Plus Jakarta Sans (body, headings) & Space Mono (numbers, metrics, odometer)
- **Data Access Layer (DAL)**:
  - Supabase client integration (`@supabase/supabase-js`, `@supabase/ssr`) with automatic fallback to typed local mock store when Supabase environment variables are unset.
  - Multi-tab synchronization via `BroadcastChannel` and `localStorage` in mock mode; Supabase Realtime in production.
  - Concurrency-safe atomic mutation operations in memory/localStorage.
- **Hybrid Metric Engine**:
  - API endpoint at `/api/sync-socials`, scheduled via `vercel.json` cron (`0 */6 * * *`).
  - Keyed single-flight request coalescing (`Map<string, Promise<SyncResponse>>`), concurrent batch sync (`Promise.allSettled`), and 9-second timeout fail-fast guard.
  - Pluggable platform adapters (Instagram, TikTok, YouTube, Facebook, X) with smart caching fallback against HTTP 429 rate limits and division-by-zero guards.
- **Admin CMS**:
  - Secure path at `/admin` protected by Supabase Auth and Passcode Session Gate (`ADMIN_PASSWORD`).
  - Management tabs for Profile/Hero, Social Platforms (with ER calculator helper), Rate Cards, and Contact CTA.
  - Live split-screen preview capability.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Neo-Brutalism Design Tokens & Theme | Warm paper `#FAF8F5`, `#FFD166`, `#EF476F`, `#06D6A0`, `2px #1E1E1E` borders, `4px` hard shadows, Plus Jakarta Sans & Space Mono | M1 | R1, R5, Survey 2 |
| 2 | Supabase PostgreSQL Schema | DDL script (`supabase/schema.sql`) for `site_settings`, `social_platforms`, `endorse_packages`, `visitor_reactions` with realtime publication and RPC | M1 | R4, Survey 3 |
| 3 | Resilient Seed / Mock Fallback DAL | Typed Indonesian seed dataset and client/server repository layer with auto-fallback when Supabase credentials are missing | M1 | R4, Survey 1, Survey 3 |
| 4 | Interactive Hero Section | Avatar, live slot availability indicator with blinking badge, creator bio, quick contact CTA | M3 | R1, Survey 2 |
| 5 | Framer Motion Draggable Stickers | "100% Organic Reach", "Fast Response", "Viral Maker" stickers with spring physics, drag constraints, and touch support | M3 | R1, Survey 2 |
| 6 | Particle Mood Clicker | Floating quick-reaction buttons (🔥, 🚀, ❤️) with ascending particle burst animation and real-time counter increment | M3 | R1, Survey 2 |
| 7 | Bento Grid Social Cards | Asymmetric responsive cards for Instagram, TikTok, YouTube, Facebook, X with official brand icons | M3 | R1, Survey 2 |
| 8 | Rolling Odometer Number Animation | Mechanical vertical digit reel animation on metric updates with zero layout shift | M3 | R1, Survey 2 |
| 9 | ER % Badges & Demographics Bars | Visual status badges for engagement rate and interactive demographic distribution bars (gender + top cities) | M3 | R1, Survey 2 |
| 10 | Interactive Rate Card Calculator | Dynamic deliverable selection toggles updating total price in real time with rolling number animation | M3 | R1, Survey 2 |
| 11 | Dynamic Rate Tier Discount Engine | Tier progression (Starter, Growth Duo -5%, VIP Viral Bundle -10%) and private negotiation hide toggle | M3 | R1, Survey 2 |
| 12 | Confetti Checkout & WhatsApp Generator | `canvas-confetti` explosion and automated pre-formatted WhatsApp order message generation | M3 | R1, Survey 2 |
| 13 | Portfolio Collaboration Showcase | Highlights of past viral brand collaborations, view counts, and engagement achievements | M3 | R1, Survey 2 |
| 14 | One-Click Contact Copy & Toast | Clipboard copy for email and phone numbers with neo-brutalism styled toast feedback | M3 | R1, Survey 2 |
| 15 | Hybrid Metric Engine API | Dedicated Next.js App Router route `/api/sync-socials` supporting `MANUAL` and `AUTO_API` sync modes | M2 | R2, Survey 3 |
| 16 | Pluggable Platform Adapters & Smart Cache | Resilient adapters for IG, TikTok, YouTube, FB, X with smart caching fallback against rate limits and failures | M2 | R2, Survey 3 |
| 17 | Vercel Cron Job Configuration | `vercel.json` crons pointing to `/api/sync-socials` for automated background metrics polling | M2 | R2, Survey 1, Survey 3 |
| 18 | Protected Admin CMS Gate | Authenticated `/admin` dashboard with Supabase Auth and Passcode Session Gate fallback | M4 | R3, Survey 3 |
| 19 | Admin Profile & Hero Editor | Form to update creator avatar, name, bio, slot availability toggle, theme presets, and sticker list | M4 | R3, Survey 3 |
| 20 | Admin Social Media Manager | Add, edit, remove, reorder platforms, toggle MANUAL/AUTO_API, edit metrics & demographics, manual sync test | M4 | R3, Survey 3 |
| 21 | Automatic ER Calculator Helper | Real-time calculation helper in CMS computing `((Likes + Comments) / Followers) * 100` | M4 | R3, Survey 3 |
| 22 | Admin Rate Card & Package Builder | Manage services, prices, platforms, descriptions, bundle discounts, and toggle private WhatsApp pricing | M4 | R3, Survey 3 |
| 23 | Admin Contact & CTA Settings | Manage WhatsApp business number, order message templates, business email, and media kit PDF URL | M4 | R3, Survey 3 |
| 24 | Admin Live Preview Pane | Split-screen or live synchronized preview reflecting CMS modifications without full page reload | M4 | R3, Survey 3 |
| 25 | Anti-Slop Code & Quality Hygiene | Zero TODOs, zero em dashes in UI, strict TypeScript, zero ESLint errors/warnings, clean Next.js build | M1, M2, M3, M4, Final | R5, Survey 1, Survey 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Foundation, Data Architecture & Fallback DAL | Package setup, TypeScript config, Tailwind Neo-Brutalism theme, Google fonts, Supabase DDL migration (`supabase/schema.sql`), Seed data (`supabase/seed.sql`), Types (`src/types/index.ts`), and Data Access Layer (`src/lib/data/*`) | none | DONE |
| M2 | Hybrid Social Media Metric Engine & API Route | `/api/sync-socials` route, platform adapters (IG, TikTok, YouTube, FB, X), caching layer, error fallback, `vercel.json` cron configuration | M1 | DONE |
| M3 | Public Single-Page Media Kit & Interactive Bento Grid | Hero section with blinking slot badge, Framer Motion draggable stickers, particle mood clicker, social bento cards with rolling odometer, ER badges, demographics, rate calculator, confetti, WhatsApp order generator, portfolio cards, and contact toast copy | M1, M2 | IN_PROGRESS |
| M4 | Full Authenticated CMS Admin Panel | `/admin` route, Auth/Passcode gate, Profile editor, Social media manager with ER calculator helper, Rate card builder, Contact settings, and live preview sync | M1, M2, M3 | PLANNED |
| Final | E2E Test Pass (Tiers 1-4) & Adversarial Coverage Hardening (Tier 5) | Run full test runner verifying 100% test pass across all tiers, audit coverage gaps, perform adversarial edge case hardening, run `tsc`, `lint`, and `build` | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### 1. Data Models (`src/types/index.ts`)
```typescript
export interface SiteSettings {
  id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar_url: string;
  creator_bio: string;
  slot_available: boolean;
  slot_status_text: string;
  theme_preset: 'neo-warm' | 'neo-mint' | 'neo-mustard';
  stickers: Array<{ id: string; text: string; emoji: string; rotation: number }>;
  whatsapp_number: string;
  whatsapp_template: string;
  business_email: string;
  media_kit_pdf_url: string;
  updated_at: string;
}

export interface SocialPlatform {
  id: string;
  platform_id: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x';
  platform_name: string;
  handle: string;
  profile_url: string;
  sync_mode: 'MANUAL' | 'AUTO_API';
  followers_count: number;
  engagement_rate: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  demographics: {
    gender: { male: number; female: number };
    top_cities: Array<{ city: string; percentage: number }>;
  };
  api_config?: {
    endpoint?: string;
    account_id?: string;
  };
  sort_order: number;
  is_active: boolean;
  last_synced_at: string;
  updated_at: string;
}

export interface EndorsePackage {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'cross-platform';
  price: number;
  description: string;
  deliverables: string[];
  is_popular: boolean;
  is_price_hidden: boolean;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface VisitorReaction {
  reaction_type: 'fire' | 'rocket' | 'heart';
  count: number;
  updated_at: string;
}
```

### 2. Metric Engine API Contract (`/api/sync-socials`)
- **Method**: `GET` / `POST`
- **Request Headers**: Optional `Authorization: Bearer <CRON_SECRET>`
- **Response Format (JSON)**:
```json
{
  "success": true,
  "timestamp": "2026-11-07T04:30:00Z",
  "synced_platforms": [
    {
      "platform_id": "instagram",
      "status": "synced",
      "sync_mode": "AUTO_API",
      "metrics": {
        "followers_count": 854200,
        "engagement_rate": 4.85,
        "avg_views": 182000,
        "avg_likes": 38200,
        "avg_comments": 3250
      },
      "cached_fallback_used": false
    }
  ]
}
```

### 3. Rate Calculator & WhatsApp Message Contract
- **Inputs**: Array of selected `package_ids`
- **Calculations**:
  - `subtotal = sum(package.price)`
  - `discount_percentage`: 0% for 1 item, 5% for 2 items ("Growth Duo"), 10% for 3+ items ("VIP Viral Bundle")
  - `total = subtotal * (1 - discount_percentage / 100)`
- **WhatsApp Output**:
  - Clean URL-encoded text to `https://wa.me/{whatsapp_number}?text={encodedText}`
  - Format includes Brand Name placeholder, selected deliverables list, package tier, total IDR, and media kit reference.

## Code Layout
```
/Users/adechairullah/CODING/SUMBAR_TERKINI/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── vercel.json
├── .env.example
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── sync-socials/
│   │       │   └── route.ts
│   │       ├── reactions/
│   │       │   └── route.ts
│   │       └── auth/
│   │           └── route.ts
│   ├── components/
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── DraggableStickers.tsx
│   │   │   ├── ParticleMoodClicker.tsx
│   │   │   └── SlotBadge.tsx
│   │   ├── socials/
│   │   │   ├── BentoGrid.tsx
│   │   │   ├── BentoCard.tsx
│   │   │   ├── RollingOdometer.tsx
│   │   │   └── DemographicsBar.tsx
│   │   ├── calculator/
│   │   │   ├── RateCalculator.tsx
│   │   │   ├── WhatsAppCheckout.tsx
│   │   │   └── TierBadge.tsx
│   │   ├── portfolio/
│   │   │   ├── PortfolioSection.tsx
│   │   │   └── PortfolioCard.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── SocialManager.tsx
│   │   │   ├── ERCalculatorHelper.tsx
│   │   │   ├── RateCardBuilder.tsx
│   │   │   ├── ContactSettings.tsx
│   │   │   └── LivePreviewModal.tsx
│   │   └── ui/
│   │       ├── NeoButton.tsx
│   │       ├── NeoBadge.tsx
│   │       ├── NeoCard.tsx
│   │       ├── Toast.tsx
│   │       └── Icons.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── data/
│   │   │   ├── repository.ts
│   │   │   ├── mock-data.ts
│   │   │   └── storage.ts
│   │   ├── adapters/
│   │   │   ├── index.ts
│   │   │   ├── cache.ts
│   │   │   ├── simulation.ts
│   │   │   ├── instagram.ts
│   │   │   ├── tiktok.ts
│   │   │   ├── youtube.ts
│   │   │   ├── facebook.ts
│   │   │   └── x.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── formatters.ts
│   │       ├── whatsapp.ts
│   │       └── er-calc.ts
│   └── types/
│       └── index.ts
└── tests/
    ├── unit/
    │   └── adapters.test.ts
    ├── e2e/
    │   ├── runner.ts
    │   ├── contracts.ts
    │   ├── tier1-features.test.ts
    │   ├── tier2-boundaries.test.ts
    │   ├── tier3-combinations.test.ts
    │   └── tier4-workloads.test.ts
    └── adversarial/
        ├── tier5-adversarial.test.ts
        └── m2-stress.test.ts
```
