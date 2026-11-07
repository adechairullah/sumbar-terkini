# Master Orchestration Plan: Creator Media Kit & Endorsement Hub

## 1. Objectives & Scope
Deliver a production-ready interactive single-page Creator Media Kit & Endorsement Hub with:
- Neo-Brutalism Soft / Tactile Bento Grid UI adhering to anti-slop guidelines.
- Live hero with interactive draggable stickers (Framer Motion spring physics) and floating quick-reaction mood clicker particles.
- Social media bento cards (Instagram, TikTok, YouTube, Facebook, X) with rolling odometer number animations and demographic distributions.
- Endorsement rate card calculator with tiered dynamic calculation, confetti checkout, and automated WhatsApp order generation.
- Hybrid Social Media Metric Engine (`/api/sync-socials`) with manual & auto API modes, resilient mock fallback.
- Full Authenticated CMS Admin Panel (`/admin`) for Profile, Social Platforms, Rate Cards, and Settings.
- Supabase SQL schema (`supabase/schema.sql`) with realtime publication and seed data.
- 100% strict TypeScript, ESLint, Next.js build clean, comprehensive 5-Tier E2E tests passing.

## 2. Phased Execution
- **Step 0: Survey Phase**:
  Spawn 3 Explorers in parallel to investigate current workspace structure, existing files (if any), dependencies, Next.js/Tailwind config, and anti-slop references.
- **Step 1: Synthesis & Project Specification**:
  Create `PROJECT.md` and `TEST_INFRA.md` based on merged survey findings.
- **Step 2: Milestone Iterations**:
  - E2E Test Track: Design opaque-box test runner and Tiers 1-4 test cases -> generate `TEST_READY.md`.
  - M1: Core Foundation, Supabase Schema, Mock Data Fallback Layer & Types.
  - M2: Hybrid Metric Engine (`/api/sync-socials`) & Adapters.
  - M3: Public Media Kit Page (`/`) with Tactile Bento Grid & Interactive Animations.
  - M4: CMS Admin Panel (`/admin`) with Auth gate and all manager tabs.
  - Final Milestone: Pass 100% E2E tests & Tier 5 adversarial testing.
- **Step 3: Verification & Sign-off**:
  Run full static and dynamic checks across all gates.
