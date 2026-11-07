## 2026-11-07T05:16:04Z
You are the Milestone 2 Implementation Worker (teamwork_worker).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_worker/.

Authoritative inputs you MUST read:
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/PROJECT.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_1/analysis.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_2/analysis.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_3/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission for Milestone 2:
1. Implement the pluggable social media adapters & smart caching layer:
   - `src/lib/adapters/types.ts`: Platform adapter interfaces and contracts.
   - `src/lib/adapters/cache.ts`: `SmartCacheLayer<T>` with configurable TTL, stale fallback for rate limits/outages, and metric sanitization.
   - `src/lib/adapters/simulation.ts`: Realistic organic data simulation with positive follower drift and exact ER formula consistency.
   - `src/lib/adapters/instagram.ts`
   - `src/lib/adapters/tiktok.ts`
   - `src/lib/adapters/youtube.ts`
   - `src/lib/adapters/facebook.ts`
   - `src/lib/adapters/x.ts`
   - `src/lib/adapters/index.ts`: Adapter registry (`getAdapter`), batch synchronization (`syncAllPlatforms`), skipping `MANUAL` platforms with `status: 'skipped_manual'`.
2. Implement the Next.js 15 App Router API route handler:
   - `src/app/api/sync-socials/route.ts`:
     * Support `GET` and `POST` returning HTTP 200 and JSON matching Contract 2.
     * Export 405 Method Not Allowed handlers for `PUT`, `DELETE`, `PATCH`, `HEAD`.
     * Authorization: Optional `CRON_SECRET` check via `Authorization: Bearer <CRON_SECRET>` or `?secret=...`. If `CRON_SECRET` is unset, allow sync. If set and invalid, return HTTP 401 Unauthorized.
     * Single-flight request coalescing to prevent duplicate concurrent runs.
     * 9-second timeout guard with fallback.
     * Update `ResilientRepository` with synced metrics and `last_synced_at`.
3. Update `src/types/index.ts` to include `'skipped_manual'` in `SyncStatus` if not already present.
4. Run all verification commands:
   - `npx tsc --noEmit` (must pass with 0 errors)
   - `npm run lint` (must pass with 0 errors/warnings)
   - `npm run build` (must pass cleanly, building route `/api/sync-socials`)
   - `npx tsx tests/e2e/runner.ts` (must pass 281/281)
   - `npx tsx tests/adversarial/tier5-adversarial.test.ts` (must pass 12/12)
5. Document all files created, commands executed, and test outputs in `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_worker/handoff.md`.
6. Send a message to your orchestrator when done.

Write ownership:
- You exclusively own: `src/lib/adapters/**`, `src/app/api/sync-socials/**`, `src/types/index.ts`.
