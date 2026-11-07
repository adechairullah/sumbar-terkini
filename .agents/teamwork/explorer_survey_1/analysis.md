# Workspace Setup & Infrastructure Analysis: SUMBAR_TERKINI

**Survey Date**: 2026-11-07  
**Author**: Explorer Survey 1 (Workspace Setup Explorer)  
**Target Repository**: `/Users/adechairullah/CODING/SUMBAR_TERKINI`  
**Integrity Mode**: Development / Strict Anti-Slop  

---

## 1. Executive Summary

A comprehensive, read-only filesystem and runtime audit of `/Users/adechairullah/CODING/SUMBAR_TERKINI` was conducted to establish the baseline workspace architecture for the Creator Media Kit & Endorsement Hub.

### Key Audit Findings:
1. **Clean-Slate Greenfield State**: The repository root contains **zero source code, configuration files, or package manifests**. The only existing folder is `.agents/`, which stores orchestration metadata. There are no legacy dependencies, conflicting lockfiles, or misconfigured setups.
2. **Runtime Availability**:
   - **Node.js**: `v25.5.0` (`/opt/homebrew/bin/node`)
   - **npm**: `11.8.0` (`/opt/homebrew/bin/npm`)
   - **bun**: `1.4.4` (`/opt/homebrew/bin/bun`)
   - **pnpm / yarn**: Not installed in the system `PATH`.
   - **Git**: Not yet initialized (`fatal: not a git repository`).
3. **Package Manager Standardization**: `npm` should be the primary package manager to align strictly with the Acceptance Criteria commands (`npm run lint`, `npm run build`, `npx tsc --noEmit`), with `bun` available for accelerated local execution.
4. **All Dependencies Missing**: Every required package across R1 through R5 (Next.js, React, Tailwind CSS, Framer Motion, canvas-confetti, Lucide React, Simple Icons, Supabase packages, React Hook Form, Zod) is currently uninstalled and must be scaffolded during Milestone 1.

---

## 2. Workspace & Filesystem Inventory

A physical directory scan confirmed the following status:

| File / Directory | Status | Path Checked | Action Required in M1 |
| :--- | :--- | :--- | :--- |
| `package.json` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/package.json` | Create with production scripts & dependencies |
| `package-lock.json` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/package-lock.json` | Generated upon initial `npm install` |
| `tsconfig.json` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/tsconfig.json` | Configure strict TypeScript + path alias `@/*` |
| `next.config.mjs` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/next.config.mjs` | Create standard Next.js config |
| `tailwind.config.ts` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/tailwind.config.ts` | Create Neo-Brutalism theme tokens & fonts |
| `postcss.config.mjs` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/postcss.config.mjs` | Tailwind & Autoprefixer plugin config |
| `vercel.json` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/vercel.json` | Cron configuration for `/api/sync-socials` |
| `.eslintrc.json` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/.eslintrc.json` | Next.js core web vitals lint setup |
| `.env.example` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/.env.example` | Supabase & Admin env template |
| `src/app/` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/src/app` | App Router directory structure |
| `supabase/schema.sql`| ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/supabase/schema.sql`| SQL migration script for R4 |
| `.git/` | ❌ Missing | `/Users/adechairullah/CODING/SUMBAR_TERKINI/.git` | Run `git init` |

---

## 3. Dependency & Ecosystem Audit (Required vs Installed)

None of the required packages are currently installed in the workspace. Below is the full requirement specification based on requirements R1 to R5:

### 3.1 Production Dependencies (`dependencies`)

| Package Name | Recommended Version | Target Requirement | Purpose & Integration Notes |
| :--- | :--- | :--- | :--- |
| `next` | `^15.1.7` / `^15.2.0` | R1, R2, R3, R5 | Next.js App Router framework. Server components, API routes, Google Fonts integration. |
| `react` | `^19.0.0` | R1, R3, R5 | React core library. |
| `react-dom` | `^19.0.0` | R1, R3, R5 | React DOM renderer. |
| `framer-motion` | `^12.4.0` | R1, R5 | Spring physics draggable stickers, rolling odometer animations, mood particle motions. Compatible with React 19. |
| `canvas-confetti` | `^1.9.4` | R1, R5 | Endorsement calculator checkout celebration animation. |
| `lucide-react` | `^1.70.0` | R1, R3, R5 | UI icons (verification badges, arrows, copy buttons, controls, stars, stats). |
| `@icons-pack/react-simple-icons` | `^13.15.1` | R1, R5 | Official brand icons for Instagram, TikTok, YouTube, Facebook, and X (`SiInstagram`, `SiTiktok`, `SiYoutube`, `SiFacebook`, `SiX`). |
| `simple-icons` | `^16.36.0` | R1, R5 | Brand icon metadata, hex brand colors, and raw SVG paths for social bento cards. |
| `@supabase/supabase-js` | `^2.119.0` | R2, R3, R4, R5 | Supabase database client and Realtime subscription manager. |
| `@supabase/ssr` | `^0.12.7` | R3, R5 | Server-side Supabase client for Next.js App Router cookies and auth state. |
| `react-hook-form` | `^7.91.0` | R3, R5 | CMS Admin forms management (Hero, Socials, Rate Card, Contacts). |
| `zod` | `^3.25.0` or `^4.0.0` | R3, R5 | Form and API request schema validation. |
| `@hookform/resolvers` | `^7.0.3` | R3, R5 | Zod resolver adapter for React Hook Form. |
| `clsx` | `^2.1.1` | R1, R5 | Conditional CSS class merging helper. |
| `tailwind-merge` | `^3.0.0` | R1, R5 | Conflict-free Tailwind CSS class utility (`cn()`). |

### 3.2 Developer Dependencies (`devDependencies`)

| Package Name | Recommended Version | Target Requirement | Purpose |
| :--- | :--- | :--- | :--- |
| `typescript` | `^5.7.0` | R5, Criteria | Strict mode static type checking (`npx tsc --noEmit`). |
| `@types/node` | `^20.0.0` or `^22.0.0` | R5 | Node.js typings for API routes and scripts. |
| `@types/react` | `^19.0.0` | R5 | React 19 type definitions. |
| `@types/react-dom` | `^19.0.0` | R5 | React DOM 19 type definitions. |
| `@types/canvas-confetti` | `^1.9.0` | R1, R5 | TypeScript definitions for canvas-confetti. |
| `tailwindcss` | `^3.4.17` | R1, R5 | Utility-first CSS framework with Neo-Brutalism theme tokens. |
| `postcss` | `^8.5.0` | R1, R5 | CSS pre-processor for Tailwind CSS. |
| `autoprefixer` | `^10.4.20` | R1, R5 | CSS vendor prefixer. |
| `eslint` | `^9.0.0` or `^8.57.0` | R5, Criteria | Code quality linter (`npm run lint`). |
| `eslint-config-next` | `^15.1.7` | R5, Criteria | Official Next.js ESLint ruleset. |

---

## 4. Recommended Project Architecture & Directory Layout

Adhering to anti-slop guidelines and strict separation of concerns, the project should use the `/src` convention. Notice that `.agents/teamwork/` is kept strictly isolated for agent coordination only.

```
/Users/adechairullah/CODING/SUMBAR_TERKINI/
├── .agents/                      # Teamwork metadata ONLY (no source/tests here!)
│   └── teamwork/
├── public/                       # Static public assets
│   ├── favicon.ico
│   └── placeholder-avatar.png
├── supabase/
│   └── schema.sql                # R4: PostgreSQL schema, tables, realtime, RLS
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with Plus Jakarta Sans & Space Mono fonts
│   │   ├── page.tsx              # R1: Public Single-Page Media Kit
│   │   ├── globals.css           # Neo-Brutalism global styles & CSS reset
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin auth shell
│   │   │   └── page.tsx          # R3: CMS Admin Panel (Profile, Socials, Rates, Settings)
│   │   └── api/
│   │       ├── sync-socials/
│   │       │   └── route.ts      # R2: Hybrid Metric Engine (Manual & Auto API mode)
│   │       └── reactions/
│   │           └── route.ts      # R1: Real-time visitor mood reactions endpoint
│   ├── components/
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── DraggableStickers.tsx # Spring physics Framer Motion stickers
│   │   │   └── MoodClicker.tsx       # Quick-reaction buttons with floating particles
│   │   ├── bento/
│   │   │   ├── BentoGrid.tsx
│   │   │   ├── SocialPlatformCard.tsx # Bento card with rolling odometer & ER badges
│   │   │   ├── DemographicBar.tsx     # Audience breakdown bars (gender & top cities)
│   │   │   └── OdometerCounter.tsx    # Rolling numeric transition component
│   │   ├── rate-card/
│   │   │   ├── RateCardCalculator.tsx # Interactive package toggle & dynamic pricing
│   │   │   ├── PackageSelector.tsx
│   │   │   └── CheckoutAction.tsx     # Confetti trigger & formatted WhatsApp generator
│   │   ├── portfolio/
│   │   │   ├── PortfolioShowcase.tsx  # Collaboration cards & engagement stats
│   │   │   └── ContactCopyButton.tsx  # One-click copy with toast feedback
│   │   ├── admin/
│   │   │   ├── AdminAuthGate.tsx      # Supabase Auth / password gate
│   │   │   ├── ProfileEditor.tsx      # Avatar, bio, slot availability, stickers
│   │   │   ├── SocialsManager.tsx     # Add/edit/reorder cards, mode toggle, ER helper
│   │   │   ├── RateCardBuilder.tsx    # Manage services, pricing, hide toggles
│   │   │   └── ContactSettings.tsx    # WhatsApp number, templates, email, PDF link
│   │   └── ui/
│   │       ├── NeoButton.tsx          # Tactile 2px border, 4px hard shadow button
│   │       ├── NeoBadge.tsx           # Status badge (live sync, ER %, tiers)
│   │       ├── NeoCard.tsx            # Base Neo-Brutalism container
│   │       ├── NeoInput.tsx           # Form inputs with tactile borders
│   │       └── Toast.tsx              # Interactive copy feedback
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts          # Client-side Supabase browser client
│       │   ├── server.ts          # Server-side Supabase client (cookies)
│       │   └── realtime.ts        # Realtime channels subscription manager
│       ├── fallback/
│       │   ├── mock-data.ts       # R4: Rich mock seed data for offline / no-creds mode
│       │   └── mock-storage.ts    # In-memory / localStorage fallback repository
│       ├── social-engine/
│       │   ├── adapters.ts        # Pluggable social API adapters (IG, TikTok, YT, X)
│       │   ├── er-calculator.ts   # Automatic ER % formula helper
│       │   └── cache.ts           # Smart metric caching & rate-limit fallback
│       ├── utils.ts               # cn() classnames helper, formatters, WhatsApp link
│       └── types.ts               # Shared TypeScript schemas and database types
├── .env.example                  # Environment variable blueprint
├── .eslintrc.json                # Next.js ESLint configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Manifest with build/lint/dev scripts
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS Neo-Brutalism theme config
├── tsconfig.json                 # TypeScript strict mode configuration
└── vercel.json                   # Vercel Cron configuration
```

---

## 5. Configuration Blueprints

### 5.1 `package.json`

```json
{
  "name": "sumbar-terkini-media-kit",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^7.0.3",
    "@icons-pack/react-simple-icons": "^13.15.1",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.119.0",
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "framer-motion": "^12.4.0",
    "lucide-react": "^1.70.0",
    "next": "^15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.91.0",
    "simple-icons": "^16.36.0",
    "tailwind-merge": "^3.0.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.7",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0"
  }
}
```

### 5.2 `tailwind.config.ts` (Tactile Neo-Brutalism Palette & Design System)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F5',
        ink: '#1E1E1E',
        mustard: {
          DEFAULT: '#FFD166',
          hover: '#F4C44E',
        },
        coral: {
          DEFAULT: '#EF476F',
          hover: '#E03660',
        },
        mint: {
          DEFAULT: '#06D6A0',
          hover: '#05BF8E',
        },
        card: '#FFFFFF',
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #1E1E1E',
        'neo': '4px 4px 0px #1E1E1E',
        'neo-lg': '6px 6px 0px #1E1E1E',
        'neo-xl': '8px 8px 0px #1E1E1E',
        'neo-hover': '1px 1px 0px #1E1E1E',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.3 `tsconfig.json` (Strict Mode & Aliases)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".agents"]
}
```

### 5.4 `vercel.json` (Vercel Cron Spec for R2)

```json
{
  "crons": [
    {
      "path": "/api/sync-socials",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### 5.5 `.env.example`

```env
# Supabase Configuration (Optional for local preview; fallback mock mode active when unset)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Admin Authentication (Fallback password gate)
ADMIN_PASSWORD=admin-secret-preview-2026

# Cron Secret for /api/sync-socials endpoint protection
CRON_SECRET=vercelsyncsecrettoken
```

---

## 6. Build, Lint & Static Verification Verification Plan

The workspace setup must pass the following verification checks cleanly:

1. **TypeScript Strict Type Check**:
   ```bash
   npx tsc --noEmit
   ```
   *Criteria*: 0 errors under `strict: true`.

2. **ESLint Linting**:
   ```bash
   npm run lint
   ```
   *Criteria*: 0 errors and 0 warnings under Next.js core web vitals.

3. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Criteria*: Build finishes with exit code 0, all static pages generated, API routes validated.

---

## 7. Scaffold Roadmap for Implementation (Milestone 1)

When the Implementer starts Milestone 1:
1. Initialize git repository: `git init`.
2. Write initial config files (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`, `.eslintrc.json`, `vercel.json`, `.env.example`).
3. Run `npm install` (clean, non-interactive, resolving lockfile).
4. Create the `src/` directory structure with font definitions (`Plus_Jakarta_Sans` & `Space_Mono` via `next/font/google`).
5. Run `npx tsc --noEmit` and `npm run build` to confirm clean skeleton before feature implementation.
