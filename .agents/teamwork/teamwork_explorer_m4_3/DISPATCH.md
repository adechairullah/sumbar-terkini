## 2026-11-07T09:35:45Z
You are an Explorer agent for Milestone 4 (M4: Full CMS Admin Panel at `/admin`).
Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI
Your state folder: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_3/
Scope document: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/orchestrator_1/PROJECT.md
Original request file: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md

Task: Testing, Verification & Anti-Slop Compliance Planner
1. Read PROJECT.md and ORIGINAL_REQUEST.md.
2. Plan the test suite for Milestone 4:
   - Identify existing tests in `tests/e2e/runner.ts` that cover features F18 to F24 (Admin Gate, Profile Editor, Social Manager, ER Calculator, Package Builder, Contact Settings, Live Preview).
   - Design a dedicated unit & integration test suite in `tests/unit/admin-panel.test.ts` to test:
     * Admin login gate authentication and passcode fallback logic
     * Profile & hero updates via repository DAL
     * Sticker addition, editing, rotation clamping, deletion
     * Social media sync mode toggle, manual metric updates, ER calculation helper formula with division-by-zero protection
     * Endorsement package CRUD operations and validation
     * Contact settings validation (WhatsApp phone normalization, business email regex, media kit PDF URL `.pdf` check)
     * Realtime broadcast and event handling
   - Ensure execution compatibility with `npm test`, `npm run test:unit`, `npm run test:adversarial`, `npm run test:all`.
3. Audit and plan Anti-Slop & Neo-Brutalism constraints:
   - Neo-brutalism design tokens: `#FAF8F5` paper, `#1E1E1E` ink, `#FFD166` mustard, `#EF476F` coral, `#06D6A0` mint, 2px solid border, 4px hard shadow.
   - Zero em dashes (`\u2014`) in UI text or strings.
   - Zero `// TODO` or unfinished placeholder stubs.
   - Minimum 44px tap targets for buttons and interactive controls (`min-h-[44px]`).
   - Dark ink text on light/accent backgrounds for WCAG AA contrast (>= 4.5:1).
4. Provide the test file skeleton and exact test cases.

Subagent output requirements:
Write a detailed testing & anti-slop verification plan to `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_3/handoff.md`.
Send a message when you complete with a concise summary and pointing to handoff.md.
