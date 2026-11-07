## 2026-11-07T09:19:36Z
You are a Spec Miner agent for Milestone 4 (M4: Full CMS Admin Panel at `/admin`).
Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI
Your state folder: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_spec_miner_survey_3/
Original request file: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md

Investigate and document all requirements, boundary conditions, edge cases, and feature specifications for Milestone 4 (R1 through R7):
1. R1: Protected Admin Gate (`/admin`) - auth session checking, login forms, passcode validation logic (`ADMIN_PASSCODE` / `admin123` / `sumbar2026`), cookie/token storage, logout action, redirection.
2. R2: Profile & Hero Editor - fields (avatar, creator name, handle, bio, slot availability toggle and status, theme preset selector, draggable stickers manager: add, edit, delete sticker text, emoji, rotation).
3. R3: Social Media & Engagement Manager - platform cards management (toggle MANUAL / AUTO_API sync), metrics (followers, avg views, likes, comments), demographic distributions (gender %, top cities), ER helper calculation (`(likes + comments) / followers * 100`) with 1-click apply, "Test & Sync Now" trigger for `/api/sync-socials`.
4. R4: Rate Card & Package Builder - CRUD for endorsement packages (package name, platform, price, description, deliverables list, discount percentage, tier, is_popular toggle, is_price_hidden toggle).
5. R5: Contact & CTA Settings - WhatsApp business number with formatting validation, automated WhatsApp order template text, business email, media kit PDF URL.
6. R6: Live Preview & Real-time Synchronization - split-screen or instant sync using repository DAL and realtime broadcast.
7. R7: Quality & Verification - zero TS errors, zero ESLint errors, clean build, automated test coverage without regressions on 281 tests.

Map each requirement to:
- Expected schema fields & validation rules (Zod / TypeScript types)
- UI interactions & state transitions
- Error cases and edge cases (e.g. division by zero in ER helper when followers is 0, empty deliverables, invalid WhatsApp phone format, invalid passcode, expired session)
- E2E acceptance criteria and testability matrix

Subagent output requirements:
Write a comprehensive specification document to `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_spec_miner_survey_3/handoff.md`.
Send a message when you complete with a concise summary and pointing to handoff.md.

