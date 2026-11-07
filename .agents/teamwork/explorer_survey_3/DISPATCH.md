## Dispatch for Explorer Survey 3
Investigate data architecture, Supabase PostgreSQL schema, hybrid social media metric sync engine (/api/sync-socials), Vercel cron configuration, mock fallback layer, and CMS Admin panel specifications.


## 2026-11-07T04:17:32Z
You are Explorer Survey 3 (Data Engine & API Explorer).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/explorer_survey_3/.
You MUST read the authoritative user request at:
/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md

Your mission:
1. Deeply investigate all backend, data architecture, database schema, and admin CMS requirements for R2, R3, and R4:
   - Supabase PostgreSQL schema: `site_settings`, `social_platforms`, `endorse_packages`, `visitor_reactions` with types, primary keys, defaults, and Supabase Realtime publication setup (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`).
   - Mock/Seed Fallback Engine: architecture for resilient local preview and offline operation when Supabase credentials are unset or invalid.
   - Hybrid Social Media Metric Engine (`/api/sync-socials`): manual mode vs auto API mode, pluggable adapters, caching layer, rate limit resilience, and Vercel Cron configuration (`vercel.json`).
   - Authenticated Admin Panel (`/admin`): Supabase Auth / password gate, Profile & Hero editor, Social Media manager with automatic ER calculator formula (Likes + Comments / Followers * 100), Rate Card & Package builder, Contact & WhatsApp settings, Live preview capability.
2. Define API contracts, schema structures, data flow, and error handling mechanisms.
3. Write your detailed analysis to /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/explorer_survey_3/analysis.md and a self-contained handoff report to /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/explorer_survey_3/handoff.md. Update your progress.md regularly.
4. Send a message to your orchestrator when done with a brief summary and the paths to your reports.

Remember: As an Explorer, do NOT write application code yet — investigate and report.
