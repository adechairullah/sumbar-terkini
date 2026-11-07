# Handoff Report: Data Engine, Schema Architecture & Admin CMS
**Agent**: Explorer Survey 3 (Data Engine & API Explorer)  
**Date**: 2026-11-07T04:25:00Z  
**Type**: Hard Handoff (Investigation & Architecture Specification Complete)

---

## 1. Observation

1. **User Request & Requirements**:
   - Source: `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md`
   - Line 22–25 (R2): "Hybrid Social Media Metric Engine (`/api/sync-socials`): dual-mode metric synchronization supporting Manual mode (`MANUAL`) ... and Automatic API mode (`AUTO_API`) ... callable via Vercel Cron Jobs (`vercel.json`) or webhooks, using pluggable adapters with realistic fallback data and smart caching fallback to serve last valid cached metrics if external APIs encounter rate limits or errors."
   - Line 27–34 (R3): "Full CMS Admin Panel (`/admin`): Provide an authenticated CMS admin dashboard (Supabase Auth / password gate) allowing configuration of: Profile & Hero Editor ... Social Media & Engagement Manager (with automatic ER calculator formula `Likes + Comments / Followers * 100`) ... Rate Card & Package Builder ... Contact & CTA Settings ... Live preview capability."
   - Line 35–43 (R4): "Database Schema & Fallback Mock Data: complete Supabase PostgreSQL schema migration script (`supabase/schema.sql`) covering `site_settings`, `social_platforms`, `endorse_packages`, `visitor_reactions` ... Supabase Realtime publication configuration (`ALTER PUBLICATION supabase_realtime ADD TABLE site_settings, social_platforms, endorse_packages, visitor_reactions;`) ... robust seed/mock fallback data loaded automatically when Supabase environment variables are unset."
   - Line 44–51 (R5): "Code Quality, Tech Stack & Anti-Slop Constraints: Next.js App Router, TypeScript strict mode, Tailwind CSS, Framer Motion, canvas-confetti, Lucide React + Simple Icons, React Hook Form + Zod, `@supabase/supabase-js` and `@supabase/ssr`."

2. **Workspace Environment**:
   - `node -v` output: `v25.5.0`
   - `npm -v` output: `11.8.0`
   - Root `/Users/adechairullah/CODING/SUMBAR_TERKINI` is currently an uninitialized clean repository containing only `.agents/`.
   - Explorer Survey 1 is auditing workspace dependencies and package setup.
   - Explorer Survey 2 is analyzing frontend design tokens, Neo-Brutalism aesthetics, and component physics.

3. **Database & API Specification**:
   - Database schema requires 4 tables: `site_settings` (singleton row), `social_platforms`, `endorse_packages`, `visitor_reactions`.
   - Realtime publication `supabase_realtime` must replicate all 4 tables with `REPLICA IDENTITY FULL`.
   - Visitor mood reaction button requires atomic concurrency handling via PostgreSQL RPC function `increment_reaction(reaction_id TEXT) RETURNS BIGINT`.
   - ER formula: $\left(\frac{\text{Average Likes} + \text{Average Comments}}{\text{Followers}}\right) \times 100$.

---

## 2. Logic Chain

1. **Observation 1 & 3 $\rightarrow$ Database Normalization & Security**:
   - Since public visitors interact with the media kit while only authenticated administrators should modify rates, hero copy, and platform credentials, Row Level Security (RLS) is essential.
   - For `visitor_reactions`, allowing direct arbitrary `UPDATE` via client anon key would allow malicious visitors to set any arbitrary count. Therefore, a PostgreSQL `SECURITY DEFINER` function (`increment_reaction`) grants safe atomic increments (`count = count + 1`) to anon callers while keeping raw table updates restricted to authenticated admins.

2. **Observation 1 & 2 $\rightarrow$ Zero-Crash Offline / Local Development Guarantee**:
   - Third-party evaluators and developers running `npm run dev` after a fresh clone will not have configured Supabase cloud credentials.
   - A direct call to `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, ...)` with undefined or placeholder strings would crash the server or throw runtime 500 errors.
   - Therefore, a Data Access Layer (DAL) repository pattern with an `isSupabaseConfigured()` guard is required. When false or unreachable, the DAL transparently reads from typed Indonesian seed data (`initialSiteSettings`, `initialSocialPlatforms`, etc.) and persists client mutations in `localStorage` with `BroadcastChannel` event syncing across browser tabs.

3. **Observation 1 $\rightarrow$ Hybrid Social Media Engine & Anti-Slop Resilience**:
   - External social APIs (Meta Graph API, TikTok API, Twitter/X API) frequently hit rate limits (HTTP 429) or require complex rotating OAuth tokens.
   - If an external API fails, overwriting data with `0` or `null` creates a broken user experience ("AI slop" failure).
   - Hence, the pluggable adapter system must implement a "smart caching fallback" layer: if an API call fails or rate limits, the engine returns the last known cached metrics and logs a warning, maintaining 100% uptime for public bento cards.
   - When external tokens are absent, realistic organic micro-jitter ensures live preview and cron demonstrations showcase believable engagement dynamics.

4. **Observation 1 $\rightarrow$ Dual-Mode Admin Authentication Gate**:
   - In production, `@supabase/ssr` handles Supabase Auth email/password cookies.
   - To enable seamless local testing without mandatory Supabase Auth user provisioning, the admin gate supports a secondary passcode gate (e.g. `admin123` via `ADMIN_PASSWORD`), establishing a cryptographically signed HTTP-only cookie.

---

## 3. Caveats

1. **External Social Media API Credentials**:
   - Real Meta (Instagram/Facebook) and Twitter/X APIs require developer apps with app review and active OAuth tokens. The engine is architected with realistic simulation adapters that produce authentic organic metrics when real API credentials are not provided in `.env.local`.
2. **Vercel Cron Free Tier Constraints**:
   - Vercel's free hobby plan allows cron jobs scheduled once per day or at spaced intervals. The proposed cron schedule in `vercel.json` (`0 */6 * * *`) conforms to Vercel standards.
3. **Database Host Compatibility**:
   - The SQL schema uses standard PostgreSQL 15+ syntax supported natively by Supabase Cloud and local Supabase CLI (`supabase start`).

---

## 4. Conclusion

1. The data layer architecture, complete PostgreSQL DDL migration script (`supabase/schema.sql`), seed dataset (`supabase/seed.sql`), and DAL fallback engine are fully defined and documented in `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/explorer_survey_3/analysis.md`.
2. The Hybrid Metric Engine (`/api/sync-socials`) has been specified with pluggable adapters, smart caching fallback, Vercel cron integration (`vercel.json`), and dual `MANUAL` / `AUTO_API` routing.
3. The Admin CMS (`/admin`) specifications include a dual authentication gate (Supabase Auth + Local Passcode Gate), Live Preview synchronization, and the exact ER calculation helper formula:
   $$\text{ER } (\%) = \left(\frac{\text{Average Likes} + \text{Average Comments}}{\text{Followers}}\right) \times 100$$
4. The system guarantees 100% offline and local development operability with zero crashes when Supabase credentials are missing or unconfigured.

---

## 5. Verification Method

Once implemented in subsequent milestones (M1, M2, M4), independent verification can be performed with the following commands and checks:

1. **SQL Schema Verification**:
   - Check `supabase/schema.sql` syntax and tables:
     ```bash
     grep -E "CREATE TABLE IF NOT EXISTS (site_settings|social_platforms|endorse_packages|visitor_reactions)" supabase/schema.sql
     grep "ALTER PUBLICATION supabase_realtime ADD TABLE" supabase/schema.sql
     grep "CREATE OR REPLACE FUNCTION increment_reaction" supabase/schema.sql
     ```
2. **Offline Fallback Resilience Verification**:
   - Remove or unset `.env.local`:
     ```bash
     npm run build
     ```
   - Verify that build completes cleanly with zero errors and no crashes due to missing Supabase credentials.
3. **API Route Verification**:
   - Test `/api/sync-socials`:
     ```bash
     curl -i http://localhost:3000/api/sync-socials
     ```
   - Expect HTTP status 200 with JSON payload containing `success: true` and platform results.
4. **ER Formula Accuracy Test**:
   - For Instagram (854,200 followers, 38,200 likes, 3,250 comments):
     $$\frac{38200 + 3250}{854200} \times 100 = 4.85249\% \rightarrow 4.85\%$$
   - Confirm CMS ER helper output matches `4.85%`.
5. **Vercel Cron Configuration Verification**:
   - Inspect `vercel.json`:
     ```bash
     cat vercel.json | grep -A 5 '"crons"'
     ```
