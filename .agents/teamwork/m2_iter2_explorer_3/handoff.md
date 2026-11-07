# Milestone 2 Iteration 2 Explorer 3 Handoff: Layout Compliance & Verification

**Agent**: `m2_iter2_explorer_3` (`teamwork_explorer`)  
**Role**: Layout Compliance & Verification Specialist  
**Date**: 2026-11-07  
**Working Directory**: `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/m2_iter2_explorer_3/`  
**Milestone**: Milestone 2 Iteration 2 (Remediation)  
**Status**: COMPLETE (Hard Handoff)

---

## 1. Observation

1. **Direct File Observation of Layout Violation**:
   - File exists at `.agents/teamwork/m2_worker/adapters.test.ts` (220 lines).
   - A filesystem scan via `find .agents/teamwork -type f` revealed 67 files: 66 are Markdown (`.md`), and exactly 1 is TypeScript code (`.agents/teamwork/m2_worker/adapters.test.ts`).
   - System Instructions state:
     > "PROJECT.md layout: source in designated dirs, tests co-located, BUILD files per module. **`.agents/teamwork/` must contain only metadata — source, tests, or data there is a violation.**"

2. **Codebase Reference Check**:
   - `grep -rn --exclude-dir={.git,.next,node_modules} "adapters.test.ts" .`
   - Zero occurrences in `src/`, zero occurrences in `tests/`, and zero occurrences in `package.json`.
   - References exist only within historical agent briefings and handoffs (`m2_worker`, `m2_reviewer_1`, `m2_reviewer_2`, `m2_challenger_1`, `m2_challenger_2`).

3. **Current Directory Structure in `tests/`**:
   - `find tests -type f`:
     - `tests/adversarial/m2-stress.test.ts`
     - `tests/adversarial/tier5-m2-resilience.test.ts`
     - `tests/adversarial/tier5-adversarial.test.ts`
     - `tests/e2e/tier2-boundaries.test.ts`
     - `tests/e2e/tier1-features.test.ts`
     - `tests/e2e/tier4-workloads.test.ts`
     - `tests/e2e/contracts.ts`
     - `tests/e2e/tier3-combinations.test.ts`
     - `tests/e2e/runner.ts`
   - `tests/unit/` does not currently exist (`ls: tests/unit: No such file or directory`, exit code 1).

4. **Relative Path Import Inspection**:
   - In `.agents/teamwork/m2_worker/adapters.test.ts:17-20`:
     ```typescript
     import { ... } from '../../../src/lib/adapters';
     import { GET, POST, PUT, DELETE, PATCH, HEAD } from '../../../src/app/api/sync-socials/route';
     import { initialSocialPlatforms } from '../../../src/lib/data/mock-data';
     import type { SocialPlatform } from '../../../src/types';
     ```
   - From `tests/unit/adapters.test.ts`, the relative directory depth changes from 4 levels deep to 2 levels deep, requiring `../../src/...`.
   - Verified via `npx tsx -e "import { SmartCacheLayer, getAdapter } from './src/lib/adapters'; import { GET } from './src/app/api/sync-socials/route'; console.log('OK');"` (exit code 0).

5. **Empirical Verification of Current Test & Build Toolchain**:
   - `npm test`: Exited with code `0`. Passed 281/281 test assertions in 0.05s.
   - `npx tsx tests/e2e/runner.ts`: Exited with code `0`. Passed 281/281 test assertions.
   - `npx tsx tests/adversarial/tier5-adversarial.test.ts`: Exited with code `0`. Passed 24/24 stress tests in 0.3s.
   - `npx tsx .agents/teamwork/m2_worker/adapters.test.ts`: Exited with code `0`. All 5 test sections passed.
   - `npm run typecheck` (`tsc --noEmit`): Exited with code `0`. Zero type errors.
   - `npm run lint` (`next lint`): Exited with code `0`. Zero ESLint warnings or errors.
   - `npm run build` (`next build`): Exited with code `0`. Production build compiled cleanly in 887ms.

6. **Current `package.json` Scripts**:
   - `package.json:5-12`:
     ```json
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "typecheck": "tsc --noEmit",
       "test": "tsx tests/e2e/runner.ts"
     }
     ```

---

## 2. Logic Chain

1. **From Observation 1.1 & 1.2 to Relocation Requirement**:
   - `.agents/teamwork/m2_worker/adapters.test.ts` violates the architectural rule forbidding non-metadata files in `.agents/teamwork/`.
   - Because no production or test runtime code depends on that path, relocating the file to `tests/unit/adapters.test.ts` and deleting the original file eliminates the violation with zero risk of breaking dependent imports.

2. **From Observation 1.3 & 1.4 to Import Path Resolution**:
   - `tests/unit/` is two levels deep from project root (`tests/unit/file.ts` -> `../../`).
   - Changing `../../../src/...` to `../../src/...` correctly resolves `src/lib/adapters`, `src/app/api/sync-socials/route`, `src/lib/data/mock-data`, and `src/types`, matching the conventions of `tests/adversarial/tier5-adversarial.test.ts` and `tests/adversarial/m2-stress.test.ts`.

3. **From Observation 1.5 & 1.6 to `package.json` Script Ergonomics**:
   - `TEST_INFRA.md` specifies `npm test` as the 4-tier E2E runner (`tsx tests/e2e/runner.ts`). Preserving `"test": "tsx tests/e2e/runner.ts"` maintains contract compliance.
   - Adding `"test:unit": "tsx tests/unit/adapters.test.ts"`, `"test:adversarial": "tsx tests/adversarial/tier5-adversarial.test.ts"`, and `"test:all": "npm test && npm run test:unit && npm run test:adversarial"` exposes dedicated scripts for all test tiers without affecting the primary `npm test` command.

4. **From Reviewer 1 Findings to Unit Test Suite Expansion**:
   - Reviewer 1 identified division by zero (`Infinity -> null` ER serialization) and `||` clobbering falsy `0` values.
   - Expanding `tests/unit/adapters.test.ts` with assertions verifying `followers_count: 0` yields `engagement_rate: 0` (strictly finite) and that keyed single-flight requests do not cross-contaminate provides automated regression proof directly within the unit test suite.

---

## 3. Caveats

1. The directory `tests/unit` does not exist yet; the Worker must create it or rely on `write_file`'s automatic parent directory creation.
2. In `tsconfig.json`, `"exclude": ["node_modules", ".agents", "tests"]` intentionally excludes `tests/` from Next.js production builds. `tsx` handles TypeScript transpilation at test execution time without requiring `tsconfig.json` include updates.
3. Live external social network API calls are not executed because API secrets are unconfigured in development mode; organic simulation jitter is verified in accordance with R2 and R4 zero-credential fallback requirements.

---

## 4. Conclusion

1. **Layout Violation Remediation**: `.agents/teamwork/m2_worker/adapters.test.ts` must be moved to `tests/unit/adapters.test.ts`, and the file in `.agents/teamwork/m2_worker/` deleted.
2. **Import Paths**: Relative imports must be adjusted from `../../../src/` to `../../src/`.
3. **`package.json` Enhancement**: Add `"test:unit"`, `"test:adversarial"`, and `"test:all"` while retaining `"test": "tsx tests/e2e/runner.ts"`.
4. **Documentation Sync**: Update `PROJECT.md` Code Layout to document `tests/unit/adapters.test.ts`.
5. **Verification Baseline**: The workspace is in a fully passing state across static typecheck, linting, Next.js build, 281-test E2E runner, and 24-test adversarial stress harness.

---

## 5. Verification Method

To independently verify this plan and subsequent worker implementation:

1. **Verify Relocation & File Deletion**:
   ```bash
   # Confirm new file exists
   test -f tests/unit/adapters.test.ts && echo "tests/unit/adapters.test.ts exists"

   # Confirm original file was deleted
   test ! -f .agents/teamwork/m2_worker/adapters.test.ts && echo "original removed from .agents/teamwork"

   # Confirm ZERO code/test files exist in .agents/teamwork
   find .agents/teamwork -name "*.ts" -o -name "*.tsx" -o -name "*.js"
   ```
   *Expected: The find command outputs nothing.*

2. **Verify Relocated Unit Test Suite**:
   ```bash
   npx tsx tests/unit/adapters.test.ts
   # or via npm script
   npm run test:unit
   ```
   *Expected: Outputs `ALL UNIT & INTEGRATION TESTS PASSED PERFECTLY!` with exit code 0.*

3. **Verify Full Standard Test Suite**:
   ```bash
   # E2E 4-tier runner
   npm test
   npx tsx tests/e2e/runner.ts

   # Tier 5 Adversarial stress suite
   npx tsx tests/adversarial/tier5-adversarial.test.ts

   # Composite script
   npm run test:all
   ```
   *Expected: All test suites exit 0 with 100% assertions passing.*

4. **Verify Build & Quality Hygiene**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
   *Expected: All commands exit 0 with zero errors and zero warnings.*
