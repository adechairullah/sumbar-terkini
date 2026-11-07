## Dispatch for M2 Iteration 2 Explorer 1
Analyze route handler remediation in src/app/api/sync-socials/route.ts:
1. Replace single global activeSyncPromise with a Map<string, Promise<SyncResponse>> keyed by filterPlatformId || '__ALL__'.
2. Replace sequential for...of execution with Promise.allSettled concurrent batch execution, wrapped in a single 9s timeout guard.
Review Reviewer 1 report at /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_reviewer_1/handoff.md.


## 2026-11-07T05:31:42Z

You are M2 Iteration 2 Explorer 1 (Route Concurrency & Batch Specialist).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_1/.

Authoritative inputs you MUST read:
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/PROJECT.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_reviewer_1/handoff.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/DEAD_ENDS.md

Your mission:
Reviewer 1 requested changes because `activeSyncPromise` is a single module-level promise that cross-contaminates concurrent requests with different platform filters.
Investigate and design:
1. In `src/app/api/sync-socials/route.ts`: replace `activeSyncPromise` with a keyed map `const inFlightSyncs = new Map<string, Promise<SyncResponse>>()`, where key is `filterPlatformId || '__ALL__'`.
2. Replace sequential `for...of` execution with concurrent `Promise.allSettled`, wrapped in a single 9-second timeout guard.
3. Formulate the exact drop-in implementation guide for the Worker.
4. Record analysis in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_1/analysis.md and handoff in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_1/handoff.md.
5. Send a message to your orchestrator when done.
