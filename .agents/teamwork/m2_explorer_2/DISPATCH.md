## 2026-11-07T05:09:05Z
You are M2 Explorer 2 (Adapters & Smart Cache Specialist).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_2/.

Authoritative inputs you MUST read:
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md (Requirement R2)
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/PROJECT.md (Milestone 2)
- /Users/adechairullah/CODING/SUMBAR_TERKINI/TEST_READY.md (F15, F16)
- /Users/adechairullah/CODING/SUMBAR_TERKINI/tests/e2e/tier1-features.test.ts (Lines 310-345)

Your mission:
Investigate and design the pluggable social media adapter system and smart caching layer:
1. Files to design:
   - `src/lib/adapters/index.ts`: Unified adapter registry (`getAdapter(platformId)`), batch sync dispatcher.
   - `src/lib/adapters/cache.ts`: In-memory / storage metric cache with TTL and fallback capability.
   - `src/lib/adapters/instagram.ts`
   - `src/lib/adapters/tiktok.ts`
   - `src/lib/adapters/youtube.ts`
   - `src/lib/adapters/facebook.ts`
   - `src/lib/adapters/x.ts`
2. Rate-limit and error fallback:
   - If an external API returns HTTP 429 (rate limited) or network error, adapter catches it and retrieves last known cached metrics from `cache.ts`.
   - Result includes `cached_fallback_used: true`, preventing page failures or zeroed-out numbers.
3. Realistic organic data simulation when third-party API credentials are not provided.
4. Record analysis in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_2/analysis.md and handoff in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_explorer_2/handoff.md.
5. Send a message to your orchestrator when done.
