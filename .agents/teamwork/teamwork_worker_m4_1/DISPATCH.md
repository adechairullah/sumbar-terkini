## 2026-11-07T09:43:24Z
You are a Worker agent for Milestone 4 (M4: Full CMS Admin Panel at `/admin`).
Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI
Your state folder: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_worker_m4_1/
Scope document: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/orchestrator_1/PROJECT.md
Original request file: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Skills to adhere to:
- Core Anti-Slop: /Users/adechairullah/.gemini/config/plugins/antislop/skills/antislop/SKILL.md
- UI & Visual: /Users/adechairullah/.gemini/config/plugins/antislop/skills/antislop-ui/SKILL.md
- Mobile Layout: /Users/adechairullah/.gemini/config/plugins/antislop/skills/antislop-layoutmobile/SKILL.md
- Human Accessibility: /Users/adechairullah/.gemini/config/plugins/antislop/skills/antislop-human/SKILL.md
- Code Hygiene: /Users/adechairullah/.gemini/config/plugins/antislop/skills/antislop-code/SKILL.md

Input reports:
Read the 3 detailed Explorer implementation plans:
1. Shell & Preview: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_1/handoff.md
2. Editors & State Management: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_2/handoff.md
3. Tests & Anti-Slop Compliance: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_3/handoff.md

Your exclusive write ownership:
- `src/app/admin/page.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/LivePreviewFrame.tsx`
- `src/components/admin/ProfileHeroEditor.tsx`
- `src/components/admin/StickersManager.tsx`
- `src/components/admin/SocialMediaManager.tsx`
- `src/components/admin/PackageBuilder.tsx`
- `src/components/admin/ContactSettingsEditor.tsx`
- `src/components/admin/AdminLoginGate.tsx` (ensure min-h-[44px] on interactive elements)
- `tests/unit/admin-panel.test.ts`
- `package.json` (if adding unit test script for admin-panel)

Implementation Requirements:
1. Implement the full `/admin` route (`src/app/admin/page.tsx`) with:
   - Gated access via `AdminLoginGate` with Supabase Auth and Passcode (`ADMIN_PASSCODE` / `sumbar2026` / `admin123` / `admin`), 24h session persistence (sessionStorage + cookie `sumbar_admin_auth`).
   - Neo-Brutalist Soft shell header with session indicator, logout, and direct link to public hub.
   - 4-tab navigation: Profile & Hero, Social & Metrics, Packages & Rates, Contact & Settings.
   - Responsive split-screen preview mode (58/42 side-by-side on desktop, preview drawer on mobile) using `LivePreviewFrame.tsx`.
   - Real-time reactivity via `repository.subscribeToChanges` and `BroadcastChannel('sumbar_terkini_channel')`.
2. Implement `ProfileHeroEditor.tsx` & `StickersManager.tsx`:
   - Avatar image URL, creator name, handle, bio, slot availability toggle and status text, theme preset selector (`neo-warm`, `neo-mint`, `neo-mustard`).
   - Draggable stickers CRUD: add sticker (text <= 24 chars, emoji picker/input, rotation slider [-45 to 45 deg]), edit, delete.
   - Persists to repository DAL via `repository.updateSiteSettings()`.
3. Implement `SocialMediaManager.tsx`:
   - 5 platform cards (Instagram, TikTok, YouTube, Facebook, X).
   - Toggle `sync_mode`: MANUAL vs AUTO_API.
   - Manual metrics editing: followers, avg views, likes, comments.
   - Demographics: gender (male % + female % = 100%), top cities.
   - Real-time automatic ER helper: `((likes + comments) / followers) * 100` with 2-decimal formatting, division-by-zero protection, and 1-click apply.
   - "Test & Sync Now" button calling POST `/api/sync-socials` and rendering sync status.
   - Persists to repository DAL via `repository.updateSocialPlatform()`.
4. Implement `PackageBuilder.tsx`:
   - Rate card package CRUD using `repository.getEndorsePackages()`, `createEndorsePackage()`, `updateEndorsePackage()`, `deleteEndorsePackage()`.
   - Fields: package name, platform, price (IDR), description, deliverables list (add/remove tags), discount percentage, tier (`starter`, `standard`, `vip`, `bundle`), `is_popular` toggle, `is_price_hidden` toggle.
   - Delete package with confirmation dialog.
5. Implement `ContactSettingsEditor.tsx`:
   - WhatsApp business number with Indonesian format normalization (`08xxx` -> `628xxx`).
   - Automated WhatsApp order template text editor.
   - Business email with regex validation.
   - Media kit PDF download URL with `.pdf` validation.
   - Persists via `repository.updateSiteSettings()`.
6. Implement `LivePreviewFrame.tsx`:
   - Real-time split screen rendering public hub preview with instant sync.
   - Device selector (mobile 375px, tablet 768px, desktop 100%).
7. Implement `tests/unit/admin-panel.test.ts`:
   - Comprehensive test suite covering all 8 areas specified in explorer 3 report.
   - Add/update package.json script so `npm run test:unit` or `npm test` runs these tests.
8. Verification Requirements:
   - Run `npm test` (verify all 281 existing tests pass).
   - Run the new unit test suite (verify 100% pass).
   - Run `tsc --noEmit` (0 errors).
   - Run `npm run lint` (0 errors).
   - Run `npm run build` (clean production build).
   - Ensure ZERO em dashes (`\u2014`), ZERO `// TODO` stubs, min 44px tap targets, WCAG AA contrast.

