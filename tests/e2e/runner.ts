/**
 * Sumbar Terkini E2E Test Suite Runner
 * 4-Tier Opaque-Box Methodology Runner
 * Executable directly via `npx tsx tests/e2e/runner.ts`
 */

export interface TestCase {
  name: string;
  suiteName: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  fn: () => void | Promise<void>;
  status?: 'passed' | 'failed' | 'skipped';
  error?: Error;
  durationMs?: number;
}

export interface TestSuite {
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  tests: TestCase[];
}

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;
let currentTier: 'tier1' | 'tier2' | 'tier3' | 'tier4' = 'tier1';

export function setTier(tier: 'tier1' | 'tier2' | 'tier3' | 'tier4') {
  currentTier = tier;
}

export function describe(name: string, fn: () => void) {
  const previousSuite = currentSuite;
  const suite: TestSuite = {
    name,
    tier: currentTier,
    tests: []
  };
  suites.push(suite);
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = previousSuite;
  }
}

export function test(name: string, fn: () => void | Promise<void>) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      currentSuite!.tests.push({
        name,
        suiteName: currentSuite!.name,
        tier: currentTier,
        fn
      });
    });
    return;
  }
  currentSuite.tests.push({
    name,
    suiteName: currentSuite.name,
    tier: currentTier,
    fn
  });
}

export const it = test;

/**
 * Deep equality helper
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Rich Assertion Matcher Library
 */
export function expect(actual: any) {
  const matchers = (isNot: boolean) => ({
    toBe(expected: any) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`
            : `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`
        );
      }
    },
    toEqual(expected: any) {
      const pass = deepEqual(actual, expected);
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected deep equal NOT matching ${JSON.stringify(expected)}`
            : `Expected deep equal: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
        );
      }
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected ${actual} to be falsy` : `Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      const pass = !Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected ${actual} to be truthy` : `Expected ${actual} to be falsy`);
      }
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected NOT null` : `Expected null, got ${actual}`);
      }
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected NOT undefined` : `Expected undefined, got ${actual}`);
      }
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected undefined` : `Expected defined, got undefined`);
      }
    },
    toBeGreaterThan(expected: number) {
      const pass = typeof actual === 'number' && actual > expected;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected <= ${expected}, got ${actual}` : `Expected > ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      const pass = typeof actual === 'number' && actual >= expected;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected < ${expected}, got ${actual}` : `Expected >= ${expected}, got ${actual}`);
      }
    },
    toBeLessThan(expected: number) {
      const pass = typeof actual === 'number' && actual < expected;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected >= ${expected}, got ${actual}` : `Expected < ${expected}, got ${actual}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      const pass = typeof actual === 'number' && actual <= expected;
      if (isNot ? pass : !pass) {
        throw new Error(isNot ? `Expected > ${expected}, got ${actual}` : `Expected <= ${expected}, got ${actual}`);
      }
    },
    toBeCloseTo(expected: number, numDigits: number = 2) {
      const pass = Math.abs(actual - expected) < Math.pow(10, -numDigits) / 2;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected NOT close to ${expected} with precision ${numDigits}`
            : `Expected ${actual} to be close to ${expected} (precision ${numDigits})`
        );
      }
    },
    toContain(item: any) {
      let pass = false;
      if (typeof actual === 'string' && typeof item === 'string') {
        pass = actual.includes(item);
      } else if (Array.isArray(actual)) {
        pass = actual.some(elem => deepEqual(elem, item));
      }
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(item)}`
            : `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`
        );
      }
    },
    toMatch(regex: RegExp) {
      const pass = typeof actual === 'string' && regex.test(actual);
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected string NOT to match regex ${regex}`
            : `Expected "${actual}" to match regex ${regex}`
        );
      }
    },
    toHaveLength(len: number) {
      const actualLen = actual?.length ?? (typeof actual === 'object' && actual !== null ? Object.keys(actual).length : undefined);
      const pass = actualLen === len;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected length NOT to be ${len}`
            : `Expected length ${len}, got ${actualLen}`
        );
      }
    },
    toHaveProperty(prop: string, value?: any) {
      const hasProp = actual !== null && typeof actual === 'object' && prop in actual;
      let pass = hasProp;
      if (hasProp && value !== undefined) {
        pass = deepEqual(actual[prop], value);
      }
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected object NOT to have property "${prop}"`
            : `Expected property "${prop}"${value !== undefined ? ` with value ${JSON.stringify(value)}` : ''}`
        );
      }
    },
    toThrow(expectedError?: string | RegExp) {
      if (typeof actual !== 'function') {
        throw new Error(`Expected a function to test toThrow, got ${typeof actual}`);
      }
      let threw = false;
      let caughtError: any = null;
      try {
        actual();
      } catch (err: any) {
        threw = true;
        caughtError = err;
      }
      if (!isNot && !threw) {
        throw new Error('Expected function to throw an error, but it returned without throwing.');
      }
      if (isNot && threw) {
        throw new Error(`Expected function NOT to throw, but it threw: ${caughtError?.message || caughtError}`);
      }
      if (!isNot && expectedError) {
        const message = caughtError?.message || String(caughtError);
        if (typeof expectedError === 'string' && !message.includes(expectedError)) {
          throw new Error(`Expected error message to include "${expectedError}", but got "${message}"`);
        } else if (expectedError instanceof RegExp && !expectedError.test(message)) {
          throw new Error(`Expected error message to match ${expectedError}, but got "${message}"`);
        }
      }
    }
  });

  return {
    ...matchers(false),
    not: matchers(true)
  };
}

/**
 * Runner Execution Engine
 */
export async function runAllSuites(): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  tierCounts: Record<string, { total: number; passed: number; failed: number }>;
}> {
  const allTests: TestCase[] = [];
  for (const suite of suites) {
    for (const testCase of suite.tests) {
      allTests.push(testCase);
    }
  }

  const startTime = Date.now();
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const tierCounts: Record<string, { total: number; passed: number; failed: number }> = {
    tier1: { total: 0, passed: 0, failed: 0 },
    tier2: { total: 0, passed: 0, failed: 0 },
    tier3: { total: 0, passed: 0, failed: 0 },
    tier4: { total: 0, passed: 0, failed: 0 }
  };

  console.log('TAP version 13');
  console.log(`1..${allTests.length}`);

  let testIndex = 1;
  for (const testCase of allTests) {
    tierCounts[testCase.tier].total++;
    const testStart = Date.now();
    try {
      await testCase.fn();
      testCase.status = 'passed';
      testCase.durationMs = Date.now() - testStart;
      passed++;
      tierCounts[testCase.tier].passed++;
      console.log(`ok ${testIndex} - [${testCase.tier.toUpperCase()}] ${testCase.suiteName} > ${testCase.name}`);
    } catch (err: any) {
      testCase.status = 'failed';
      testCase.error = err;
      testCase.durationMs = Date.now() - testStart;
      failed++;
      tierCounts[testCase.tier].failed++;
      console.log(`not ok ${testIndex} - [${testCase.tier.toUpperCase()}] ${testCase.suiteName} > ${testCase.name}`);
      console.log(`  ---`);
      console.log(`  message: ${JSON.stringify(err?.message || String(err))}`);
      if (err?.stack) {
        const stackLines = err.stack.split('\n').slice(1, 4).map((l: string) => `    ${l.trim()}`).join('\n');
        console.log(`  stack: |\n${stackLines}`);
      }
      console.log(`  ...`);
    }
    testIndex++;
  }

  const durationMs = Date.now() - startTime;

  console.log('\n======================================================================');
  console.log('📊 E2E TEST EXECUTION SUMMARY: SUMBAR TERKINI MEDIA KIT');
  console.log('======================================================================');
  console.log(`Tier 1 (Category-Partition Features): ${tierCounts.tier1.passed}/${tierCounts.tier1.total} passed`);
  console.log(`Tier 2 (Boundaries & Error Injection): ${tierCounts.tier2.passed}/${tierCounts.tier2.total} passed`);
  console.log(`Tier 3 (Pairwise Combinations)      : ${tierCounts.tier3.passed}/${tierCounts.tier3.total} passed`);
  console.log(`Tier 4 (Real-World Workload Scenarios): ${tierCounts.tier4.passed}/${tierCounts.tier4.total} passed`);
  console.log('----------------------------------------------------------------------');
  console.log(`Total Tests Run: ${allTests.length}`);
  console.log(`Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log(`Total Time: ${(durationMs / 1000).toFixed(2)}s`);
  console.log('======================================================================\n');

  return {
    totalTests: allTests.length,
    passed,
    failed,
    skipped,
    durationMs,
    tierCounts
  };
}

/**
 * Entry point when invoked directly via CLI (`npx tsx tests/e2e/runner.ts`)
 */
async function main() {
  console.log('🚀 Initializing Sumbar Terkini 4-Tier E2E Test Suite...');

  // Dynamically load all 4 tiers
  try {
    await import('./tier1-features.test.ts');
    await import('./tier2-boundaries.test.ts');
    await import('./tier3-combinations.test.ts');
    await import('./tier4-workloads.test.ts');
  } catch (err) {
    console.error('Failed to import test tiers:', err);
    process.exit(1);
  }

  const results = await runAllSuites();
  if (results.failed > 0) {
    console.error(`❌ Suite completed with ${results.failed} failures.`);
    process.exit(1);
  } else {
    console.log('✅ All test assertions passed successfully!');
    process.exit(0);
  }
}

// Auto-run if executed as main script
const isMainModule = typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('runner.ts');
if (isMainModule) {
  main().catch(err => {
    console.error('Unexpected runner error:', err);
    process.exit(1);
  });
}
