# Dead Ends

| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
| M1 Iteration 1 | Asynchronous read-modify-write pattern (`await getReactions() -> map -> saveState()`) in fallback `ResilientRepository` | Concurrent `Promise.all` calls read the same initial count simultaneously, leading to 98% lost updates under burst traffic (50 concurrent clicks resulted in +1 instead of +50). | `src/lib/data/repository.ts` |
| M2 Iteration 1 | Single global module-level `activeSyncPromise` in `src/app/api/sync-socials/route.ts` | Ignored request parameters (`filterPlatformId`), causing concurrent single-platform syncs to cross-contaminate and concurrent full cron syncs to drop 4 out of 5 platforms. | `src/app/api/sync-socials/route.ts` |
