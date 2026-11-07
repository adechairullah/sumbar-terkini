# BRIEFING — 2026-11-07T05:14:00Z

## Mission
Investigate and design the pluggable social media adapter system (Instagram, TikTok, YouTube, Facebook, X) and smart caching layer with 429/network error fallback and realistic organic simulation.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_2
- Original parent: 3971a1e9-5d6d-4475-ae7b-b68b02ff32ab
- Milestone: Milestone 2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement in src/ directly
- Comprehensive design for `src/lib/adapters/{index,cache,instagram,tiktok,youtube,facebook,x}.ts`
- Error & rate-limit fallback (HTTP 429, network failure -> cached metrics with `cached_fallback_used: true`)
- Realistic organic data simulation if API credentials missing
- Deliver analysis.md and handoff.md

## Current Parent
- Conversation ID: 3971a1e9-5d6d-4475-ae7b-b68b02ff32ab
- Updated: 2026-11-07T05:09:05Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md` (R2 requirement)
  - `PROJECT.md` (Milestone 2, Interface Contract 2)
  - `TEST_READY.md` (Features F15, F16)
  - `tests/e2e/tier1-features.test.ts` (Lines 675-785)
  - `tests/e2e/contracts.ts` (Lines 65-85, 490-521: `SyncSocialsResponse`, `SmartCacheLayer`)
  - `tests/e2e/tier2-boundaries.test.ts` (Lines 660-715: F16 boundaries, HTTP 500, HTTP 429, corrupted entry sanitization)
  - `tests/e2e/tier3-combinations.test.ts` (P07, P14)
  - `tests/e2e/tier4-workloads.test.ts` (S3 scheduled cron workload)
  - `src/types/index.ts` (PlatformId, PlatformMetrics, SocialPlatform, SyncPlatformResult, SyncResponse)
  - `src/lib/data/repository.ts` and `src/lib/data/mock-data.ts`
  - `.agents/teamwork/m2_explorer_1/analysis.md` (route handler expectations: `getAdapter().sync(platform)`)
- **Key findings**:
  - `SmartCacheLayer` must support: `set(key, data, customTtl?)`, `get(key)`, `getValid(key)`, `isValid(key)`, `clear()`, `sanitizeMetrics(entry, fallback)`. `get(key)` returns stale data even if expired so adapters can fallback on upstream failures.
  - Route handler (`m2_explorer_1`) calls `getAdapter(platform.platform_id).sync(platform)` or `fetchMetrics(platform)`. Both methods should be provided on all adapters.
  - Pluggable adapters required for all 5 platforms: Instagram, TikTok, YouTube, Facebook, X.
  - Rate-limit fallback: Catch HTTP 429, HTTP 5xx, or network aborts; retrieve last known metrics from `smartCache`; return with `cached_fallback_used: true`, `status: 'cached_fallback'`, `source: 'last_cache'`.
  - Realistic simulation: When third-party API credentials are missing, generate organic metrics using platform-specific jitter profiles (steady positive follower drift +10 to +300, view variance ±1.5% - 3.5%, proportional likes and comments, mathematically consistent ER formula: `((likes + comments) / followers) * 100`).
  - Batch sync dispatcher in `src/lib/adapters/index.ts` processes platforms with `Promise.allSettled`, preserving `MANUAL` platforms with `status: 'skipped_manual'` and updating `AUTO_API` platforms.
- **Unexplored areas**: None. All authoritative files and dependencies mapped.

## Key Decisions Made
- Export `SmartCacheLayer` class and `smartCache` singleton from `src/lib/adapters/cache.ts`.
- Modularize organic simulation logic into `src/lib/adapters/simulation.ts` with platform-specific parameter matrices.
- Align adapter interface with both `sync(platform)` and `fetchMetrics(platform)`.
- Author complete code drop-ins in `analysis.md` and complete 5-component handoff in `handoff.md`.

## Artifact Index
- DISPATCH.md — Incoming parent instructions
- BRIEFING.md — Situational awareness and working memory
- progress.md — Heartbeat and status
- analysis.md — Full design and investigation
- handoff.md — 5-component handoff report
