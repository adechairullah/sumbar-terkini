## Dispatch for M2 Iteration 2 Explorer 2
Analyze adapter remediation across src/lib/adapters/{instagram,tiktok,youtube,facebook,x}.ts:
1. Guard division by zero: ensure rawEr evaluates to 0 when followers_count === 0, preventing Infinity -> null JSON serialization.
2. Replace || with ?? for metric fallbacks, ensuring legitimate 0 counts are preserved.
Review Reviewer 1 report at /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_reviewer_1/handoff.md.


## 2026-11-07T05:31:50Z
You are M2 Iteration 2 Explorer 2 (Adapter Arithmetic & Nullish Coalescing Specialist).
Your working directory is /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_2/.

Authoritative inputs you MUST read:
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/PROJECT.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_reviewer_1/handoff.md
- /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/DEAD_ENDS.md

Your mission:
Reviewer 1 requested changes because:
1. Adapters calculate ER without `followers_count > 0` guard, producing `Infinity` which serializes to `null` in JSON when followers is 0.
2. Fallback metric getters use `||` instead of `??`, clobbering intentional `0` metric counts into seed counts.
Investigate and design:
1. In `src/lib/adapters/{instagram,tiktok,youtube,facebook,x}.ts`: add `const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;`.
2. Replace `||` with `??` across all metric fallback definitions.
3. Formulate the exact drop-in implementation guide for the Worker.
4. Record analysis in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_2/analysis.md and handoff in /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_2/handoff.md.
5. Send a message to your orchestrator when done.
