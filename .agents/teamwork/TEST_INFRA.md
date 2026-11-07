# E2E Test Infra: Sumbar Terkini Media Kit & Endorsement Hub

## Test Philosophy
- **Opaque-box & Requirement-driven**: Derived directly from `ORIGINAL_REQUEST.md` and public contracts.
- **Methodology**: 4-Tier Opaque-Box Suite + Tier 5 Adversarial Coverage Hardening.
  1. Tier 1: Category-Partition Feature Coverage (>=5 test cases per feature).
  2. Tier 2: Boundary Value Analysis & Error Injection (>=5 boundary cases per feature).
  3. Tier 3: Pairwise Combinatorial Interaction Coverage.
  4. Tier 4: End-to-End Real-World Sponsor & Admin Workload Scenarios.
  5. Tier 5 (Final Milestone): White-box Adversarial Coverage Hardening.

## Test Runner Architecture
- **Location**: `tests/e2e/runner.ts`
- **Execution Command**: `npm test` or `npx tsx tests/e2e/runner.ts`
- **Pass/Fail Semantics**: All test assertions execute synchronously or via clean async promises, reporting structured TAP / JSON outputs and exiting with status code 0 on complete pass, non-zero on failure.
- **Independence**: Tests can execute against local mock DAL with zero network dependencies or live Supabase credentials required.

## Feature Inventory & Test Matrix
| # | Feature | Requirement | Tier 1 (Min 5) | Tier 2 (Min 5) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------|:--------------:|:--------------:|:-----------------:|:-----------------:|
| 1 | Neo-Brutalism Palette & CSS Tokens | R1, R5 | 5 | 5 | ✓ | ✓ |
| 2 | Supabase DDL Migration (`supabase/schema.sql`) | R4 | 5 | 5 | ✓ | ✓ |
| 3 | Seed Data & Fallback DAL Engine | R4 | 5 | 5 | ✓ | ✓ |
| 4 | Hero Section & Slot Availability Badge | R1 | 5 | 5 | ✓ | ✓ |
| 5 | Draggable Physics Stickers | R1 | 5 | 5 | ✓ | ✓ |
| 6 | Particle Mood Clicker Counter | R1 | 5 | 5 | ✓ | ✓ |
| 7 | Bento Grid Social Cards (5 Platforms) | R1 | 5 | 5 | ✓ | ✓ |
| 8 | Rolling Odometer Animation | R1 | 5 | 5 | ✓ | ✓ |
| 9 | ER % Badges & Demographics Bars | R1 | 5 | 5 | ✓ | ✓ |
| 10 | Interactive Rate Card Calculator | R1 | 5 | 5 | ✓ | ✓ |
| 11 | Dynamic Rate Tier Discounts & Private Pricing | R1 | 5 | 5 | ✓ | ✓ |
| 12 | Confetti Checkout & WhatsApp Order Generator | R1 | 5 | 5 | ✓ | ✓ |
| 13 | Portfolio Collaboration Showcase | R1 | 5 | 5 | ✓ | ✓ |
| 14 | Contact Copy with Interactive Toast | R1 | 5 | 5 | ✓ | ✓ |
| 15 | Hybrid Metric Engine API (`/api/sync-socials`) | R2 | 5 | 5 | ✓ | ✓ |
| 16 | Pluggable Platform Adapters & Smart Cache | R2 | 5 | 5 | ✓ | ✓ |
| 17 | Vercel Cron Configuration (`vercel.json`) | R2 | 5 | 5 | ✓ | ✓ |
| 18 | Admin CMS Auth Gate (`/admin`) | R3 | 5 | 5 | ✓ | ✓ |
| 19 | Admin Profile & Hero Editor | R3 | 5 | 5 | ✓ | ✓ |
| 20 | Admin Social Media Manager | R3 | 5 | 5 | ✓ | ✓ |
| 21 | Automatic ER Calculator Helper | R3 | 5 | 5 | ✓ | ✓ |
| 22 | Admin Rate Card Builder | R3 | 5 | 5 | ✓ | ✓ |
| 23 | Admin Contact & CTA Settings | R3 | 5 | 5 | ✓ | ✓ |
| 24 | Admin Live Preview Sync | R3 | 5 | 5 | ✓ | ✓ |
| 25 | Anti-Slop Code & Quality Hygiene | R5 | 5 | 5 | ✓ | ✓ |

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| S1 | Local Merchant Endorsement Booking | F04, F07, F09, F10, F11, F12, F14 | Sponsor toggles Instagram Story + Feed Post, views Growth Duo 5% discount, hits checkout, triggers confetti and gets accurate WhatsApp message with total IDR. |
| S2 | National Agency Multi-Platform Campaign | F07, F08, F10, F11, F12 | Sponsor selects Instagram, TikTok, and YouTube packages, qualifies for VIP Viral Bundle (10% discount), verifies total calculation with rolling numbers. |
| S3 | Scheduled Cron Background Metric Sync | F15, F16, F17, F07, F08 | Vercel cron calls `/api/sync-socials`, AUTO_API platforms sync metrics, simulated 429 rate limit triggers smart cache fallback without failing. |
| S4 | Admin Live Profile & Availability Management | F18, F19, F24, F04, F05 | Creator logs into `/admin`, changes availability to "Fully Booked until Dec 2026", updates stickers, verifies immediate change in public preview. |
| S5 | Viral Surge Realtime Visitor Mood Storm | F06, F03, F02 | Concurrent visitor reaction clicks fire on 🔥 and 🚀, optimistic counters update instantly without race condition or UI freezing. |
| S6 | Complete Offline Clone Fresh Developer Boot | F01, F02, F03, F25 | Repo built with zero `.env` file, passes TypeScript strict compilation, ESLint, and Next.js build without fatal crashes. |

## Coverage Thresholds
- **Tier 1**: >= 125 test cases (5 per feature x 25 features)
- **Tier 2**: >= 125 test cases (5 per feature x 25 features)
- **Tier 3**: >= 25 pairwise combination test cases
- **Tier 4**: >= 6 realistic end-to-end scenarios
- **Total Minimum Target**: >= 281 automated test cases
