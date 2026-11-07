## 2026-11-07T05:38:34Z
You are the Milestone 2 Iteration 2 Remediation Worker (teamwork_worker).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_worker/.

Authoritative inputs you MUST read:
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/PROJECT.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_1/analysis.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_2/analysis.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_3/analysis.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_reviewer_1/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Apply the exact drop-in blueprints designed by the 3 Iteration 2 Explorers:
1. In `src/app/api/sync-socials/route.ts`:
   - Replace the single `activeSyncPromise` with `const inFlightSyncs = new Map<string, Promise<SyncResponse>>()`, keyed by `filterPlatformId || '__ALL__'`.
   - Replace sequential `for...of` execution with `Promise.allSettled` concurrent batch execution with a global 9s timeout guard.
2. In `src/lib/adapters/{instagram,tiktok,youtube,facebook,x}.ts`, `src/lib/adapters/index.ts`, and `src/lib/adapters/cache.ts`:
   - Guard division by zero in rawEr calculation: `const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;`.
   - Replace all `||` with `??` for metric fallbacks so legitimate 0 counts are not clobbered into seed counts.
   - Use `Number.isFinite` in `SmartCacheLayer.sanitizeMetrics`.
3. Layout compliance cleanup:
   - Move `.agents/teamwork/m2_worker/adapters.test.ts` to `tests/unit/adapters.test.ts`, updating relative imports (`../../../src/...` -> `../../src/...`).
   - Remove/delete `.agents/teamwork/m2_worker/adapters.test.ts` completely so `.agents/teamwork/` holds only markdown metadata.
   - Add `"test:unit": "tsx tests/unit/adapters.test.ts"` to `package.json` scripts.
4. Run all verification commands:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   - `npx tsx tests/e2e/runner.ts` (281/281 passed)
   - `npx tsx tests/adversarial/tier5-adversarial.test.ts` (24/24 passed)
   - `npx tsx tests/unit/adapters.test.ts` (all passed)
5. Document all changes in `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_worker/handoff.md` and message orchestrator.

Write ownership:
- You exclusively own: `src/app/api/sync-socials/route.ts`, `src/lib/adapters/**`, `tests/unit/**`, `package.json`, and cleaning up `.agents/teamwork/m2_worker/adapters.test.ts`.
