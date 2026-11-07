# BRIEFING — 2026-11-07T05:37:00Z

## Mission
Investigate and design route concurrency and batch execution remediation in `src/app/api/sync-socials/route.ts`:
1. Keyed in-flight syncs map `Map<string, Promise<SyncResponse>>` by `filterPlatformId || '__ALL__'`.
2. Replace sequential `for...of` execution with concurrent `Promise.allSettled`, wrapped in a single 9-second timeout guard.
3. Provide exact drop-in implementation guide for Worker.

## 🔒 My Identity
- Archetype: explorer
- Roles: Teamwork explorer (Route Concurrency & Batch Specialist)
- Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_1
- Original parent: 3971a1e9-5d6d-4475-ae7b-b68b02ff32ab
- Milestone: M2 Iteration 2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly into source files.
- Must provide exact drop-in code snippet / diff for Worker.
- Reviewer 1 findings must be addressed: single activeSyncPromise cross-contamination and sequential execution timeout risk.

## Current Parent
- Conversation ID: 3971a1e9-5d6d-4475-ae7b-b68b02ff32ab
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/app/api/sync-socials/route.ts`: lines 1-205 inspected.
  - `src/lib/adapters/index.ts`: inspected `syncSinglePlatform` and `syncAllPlatforms`.
  - `src/lib/data/repository.ts` and `src/lib/data/storage.ts`: concurrency analysis.
  - `tests/adversarial/m2-stress.test.ts` & `tests/adversarial/tier5-m2-resilience.test.ts`: verified existing test coverage.
- **Key findings**:
  - Confirmed empirical cross-talk: concurrent `?platform=instagram` and `?platform=tiktok` both returned `instagram` due to global `activeSyncPromise`.
  - Confirmed dropped platform defect: concurrent `?platform=instagram` and unconstrained cron sync reduced cron sync to 1 platform instead of 5.
  - Confirmed sequential execution timeout risk: 5 platforms * 9000ms loop can accumulate to 45s, violating Vercel's 10s serverless limit.
  - Designed keyed `inFlightSyncs = new Map<string, Promise<SyncResponse>>()` with `filterPlatformId || '__ALL__'` key and tested in node sandbox (100% pass across 4 concurrency scenarios).
  - Designed concurrent batch `Promise.allSettled` wrapped in single 9s timeout guard, verified with simulation script.
- **Unexplored areas**:
  - Adapter division by zero / falsy coalescing fixes (handled by peer explorer).
  - Relocation of `.agents/teamwork/m2_worker/adapters.test.ts` (handled by peer explorer/worker).

## Key Decisions Made
- Confirmed Pattern A for `runSingleFlightSync`: `try { return await syncPromise; } finally { inFlightSyncs.delete(flightKey); }`.
- Designed `syncSinglePlatformTask` with per-platform error isolation returning fallback metrics instead of rejecting the batch.
- Designed `executeMetricSync` with single batch `Promise.allSettled` wrapped in `withTimeout(batchPromise, 9000)`, with fallback return if timeout triggers.

## Artifact Index
- DISPATCH.md — record of incoming dispatch messages
- BRIEFING.md — persistent situational awareness
- progress.md — liveness heartbeat
- analysis.md — deep investigation findings
- handoff.md — 5-component handoff report
