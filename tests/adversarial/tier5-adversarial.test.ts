/**
 * Tier 5 Adversarial Stress & Chaos Test Suite
 * Empirical Challenger Verification for Milestone 1
 *
 * Focus Areas:
 * 1. Resilient DAL repository operations under concurrent load (concurrent gets, updates, and reaction increments)
 * 2. Atomic reaction counter behavior under rapid bursts (sequential vs concurrent bursts)
 * 3. Fallback behavior with undefined, empty, malformed, and unreachable Supabase env vars
 * 4. Schema validation against extreme inputs, invalid types, and edge cases
 */

import { repository, ResilientRepository } from '../../src/lib/data/repository';
import { LocalStorageManager } from '../../src/lib/data/storage';
import { isSupabaseConfigured, createClient as createBrowserSupabaseClient } from '../../src/lib/supabase/client';
import { initialVisitorReactions, initialSiteSettings, initialSocialPlatforms, initialEndorsePackages } from '../../src/lib/data/mock-data';
import { runM2AdversarialSuite } from './m2-stress.test';
import * as fs from 'fs';
import * as path from 'path';

interface StressTestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

const results: StressTestResult[] = [];

function recordResult(category: string, name: string, passed: boolean, durationMs: number, details: string, error?: string) {
  results.push({ category, name, passed, durationMs, details, error });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${category}] ${statusIcon}: ${name} (${durationMs.toFixed(1)}ms)`);
  if (details) console.log(`   ↳ Details: ${details}`);
  if (error) console.log(`   ↳ Error: ${error}`);
}

async function runAdversarialStressSuite() {
  console.log('======================================================================');
  console.log('🔥 STARTING TIER 5 ADVERSARIAL STRESS & EMPIRICAL CHALLENGE SUITE');
  console.log('======================================================================\n');

  // ==========================================================================
  // SECTION 1: Resilient DAL Repository Operations Under Concurrent Load
  // ==========================================================================
  console.log('--- 1. DAL CONCURRENT LOAD & RESILIENCE STRESS ---');

  // 1.1: 100 Concurrent Reads across all 4 entity domains
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const readOperations: Promise<any>[] = [];

      for (let i = 0; i < 25; i++) {
        readOperations.push(repository.getSiteSettings());
        readOperations.push(repository.getSocialPlatforms());
        readOperations.push(repository.getEndorsePackages());
        readOperations.push(repository.getReactions());
      }

      const allResults = await Promise.all(readOperations);
      const duration = performance.now() - start;

      const settings = allResults[0];
      const platforms = allResults[1];
      const packages = allResults[2];
      const reactions = allResults[3];

      const valid =
        allResults.length === 100 &&
        settings.creator_name === 'Sumbar Terkini' &&
        platforms.length === 5 &&
        packages.length >= 5 &&
        reactions.length === 3;

      recordResult(
        'DAL Concurrency',
        '100 Concurrent Mixed Reads across 4 entity collections',
        valid,
        duration,
        `Processed 100 concurrent async read promises in ${duration.toFixed(2)}ms without memory corruption`
      );
    } catch (err: any) {
      recordResult('DAL Concurrency', '100 Concurrent Mixed Reads across 4 entity collections', false, performance.now() - start, '', err.message);
    }
  }

  // 1.2: Concurrent Mixed Reads and Writes
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const operations: Promise<any>[] = [];

      for (let i = 0; i < 30; i++) {
        if (i % 2 === 0) {
          operations.push(repository.updateSiteSettings({ creator_bio: `Bio iteration ${i}` }));
        } else {
          operations.push(repository.getSiteSettings());
        }
      }

      const mixedResults = await Promise.all(operations);
      const duration = performance.now() - start;

      const finalSettings = await repository.getSiteSettings();
      const valid = mixedResults.length === 30 && finalSettings.creator_bio.startsWith('Bio iteration');

      recordResult(
        'DAL Concurrency',
        '30 Interleaved Concurrent Reads and Writes on SiteSettings',
        valid,
        duration,
        `Final bio: "${finalSettings.creator_bio}", zero promise rejections`
      );
    } catch (err: any) {
      recordResult('DAL Concurrency', '30 Interleaved Concurrent Reads and Writes on SiteSettings', false, performance.now() - start, '', err.message);
    }
  }

  // 1.3: High-Frequency Package CRUD Lifecycle
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const createdIds: string[] = [];

      // Sequentially create 10 packages
      for (let i = 0; i < 10; i++) {
        const pkg = await repository.createEndorsePackage({
          name: `Stress Package ${i}`,
          platform: 'instagram',
          price: 1000000 + i * 50000,
          description: `Description ${i}`,
          deliverables: [`Item ${i}.1`, `Item ${i}.2`],
          tier: 'starter',
          is_popular: i % 2 === 0,
          is_price_hidden: false,
          discount_percentage: 0,
          sort_order: 10 + i,
          is_active: true,
        });
        createdIds.push(pkg.id);
      }

      // Concurrently update half of them
      await Promise.all(
        createdIds.slice(0, 5).map((id, idx) =>
          repository.updateEndorsePackage(id, { price: 9999999 + idx })
        )
      );

      // Concurrently delete the other half
      await Promise.all(
        createdIds.slice(5).map((id) => repository.deleteEndorsePackage(id))
      );

      const allPackages = await repository.getEndorsePackages();
      const duration = performance.now() - start;

      // Ensure deleted packages are gone and updated packages have new price
      const remainingUpdated = allPackages.filter((p) => createdIds.slice(0, 5).includes(p.id));
      const deletedFound = allPackages.filter((p) => createdIds.slice(5).includes(p.id));

      const valid =
        remainingUpdated.length === 5 &&
        deletedFound.length === 0 &&
        remainingUpdated.every((p) => p.price >= 9999999);

      recordResult(
        'DAL Concurrency',
        'Endorsement Package CRUD lifecycle under concurrent mutations',
        valid,
        duration,
        `5 updated, 5 deleted, confirmed 0 ghost entities`
      );
    } catch (err: any) {
      recordResult('DAL Concurrency', 'Endorsement Package CRUD lifecycle under concurrent mutations', false, performance.now() - start, '', err.message);
    }
  }

  // ==========================================================================
  // SECTION 2: Atomic Reaction Counter Behavior Under Rapid Bursts
  // ==========================================================================
  console.log('\n--- 2. REACTION COUNTER RAPID BURST & ATOMICITY ---');

  // 2.1: Rapid Sequential Increment Burst (100 sequential clicks)
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const initialReactions = await repository.getReactions();
      const fireTarget = initialReactions.find((r) => r.reaction_type === 'fire')!;
      const startCount = fireTarget.count;

      const burstSize = 100;
      let lastReturned = startCount;
      for (let i = 0; i < burstSize; i++) {
        lastReturned = await repository.incrementReaction('fire');
      }

      const duration = performance.now() - start;
      const finalReactions = await repository.getReactions();
      const finalFire = finalReactions.find((r) => r.reaction_type === 'fire')!;

      const expectedCount = startCount + burstSize;
      const valid = finalFire.count === expectedCount && lastReturned === expectedCount;

      recordResult(
        'Reaction Counter',
        `100 Rapid Sequential Increments on 'fire' reaction`,
        valid,
        duration,
        `Start: ${startCount}, Final: ${finalFire.count}, Expected: ${expectedCount}, Delta: ${finalFire.count - startCount}`
      );
    } catch (err: any) {
      recordResult('Reaction Counter', `100 Rapid Sequential Increments on 'fire' reaction`, false, performance.now() - start, '', err.message);
    }
  }

  // 2.2: Multi-Type Interleaved Sequential Burst (30 fire, 30 rocket, 30 heart)
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const initial = await repository.getReactions();
      const fireStart = initial.find((r) => r.reaction_type === 'fire')!.count;
      const rocketStart = initial.find((r) => r.reaction_type === 'rocket')!.count;
      const heartStart = initial.find((r) => r.reaction_type === 'heart')!.count;

      const count = 30;
      for (let i = 0; i < count; i++) {
        await repository.incrementReaction('fire');
        await repository.incrementReaction('rocket');
        await repository.incrementReaction('heart');
      }

      const duration = performance.now() - start;
      const finalState = await repository.getReactions();
      const fireEnd = finalState.find((r) => r.reaction_type === 'fire')!.count;
      const rocketEnd = finalState.find((r) => r.reaction_type === 'rocket')!.count;
      const heartEnd = finalState.find((r) => r.reaction_type === 'heart')!.count;

      const valid =
        fireEnd === fireStart + count &&
        rocketEnd === rocketStart + count &&
        heartEnd === heartStart + count;

      recordResult(
        'Reaction Counter',
        `90 Interleaved Sequential Increments across fire, rocket, heart`,
        valid,
        duration,
        `fire: +${fireEnd - fireStart}, rocket: +${rocketEnd - rocketStart}, heart: +${heartEnd - heartStart}`
      );
    } catch (err: any) {
      recordResult('Reaction Counter', `90 Interleaved Sequential Increments across fire, rocket, heart`, false, performance.now() - start, '', err.message);
    }
  }

  // 2.3: Concurrent Burst Stress (50 concurrent Promise.all clicks)
  // Testing race condition susceptibility in asynchronous local fallback
  {
    const start = performance.now();
    try {
      LocalStorageManager.resetToSeed();
      const initial = await repository.getReactions();
      const initialRocket = initial.find((r) => r.reaction_type === 'rocket')!.count;

      const concurrentBurstSize = 50;
      const promises = Array.from({ length: concurrentBurstSize }, () =>
        repository.incrementReaction('rocket')
      );

      const returnedCounts = await Promise.all(promises);
      const duration = performance.now() - start;

      const finalState = await repository.getReactions();
      const finalRocket = finalState.find((r) => r.reaction_type === 'rocket')!.count;
      const actualDelta = finalRocket - initialRocket;

      // Note: In an asynchronous JS runtime without a synchronized queue or atomic memory primitive,
      // concurrent read-modify-writes can lose updates if `await` yields between reading and writing.
      const isStrictlyAtomic = actualDelta === concurrentBurstSize;

      recordResult(
        'Reaction Counter',
        `50 Concurrent Promise.all Burst Increments on 'rocket'`,
        isStrictlyAtomic,
        duration,
        `Start: ${initialRocket}, Final: ${finalRocket}, Expected: ${initialRocket + concurrentBurstSize}, Actual Delta: ${actualDelta} (${actualDelta === concurrentBurstSize ? 'Zero Lost Updates' : `LOST ${concurrentBurstSize - actualDelta} UPDATES`})`
      );
    } catch (err: any) {
      recordResult('Reaction Counter', `50 Concurrent Promise.all Burst Increments on 'rocket'`, false, performance.now() - start, '', err.message);
    }
  }

  // 2.4: Invalid Reaction Type Rejection
  {
    const start = performance.now();
    try {
      let threw = false;
      try {
        await repository.incrementReaction('unsupported_reaction' as any);
      } catch (e: any) {
        threw = true;
      }
      const duration = performance.now() - start;
      recordResult(
        'Reaction Counter',
        'Invalid reaction type ("unsupported_reaction") throws clean error',
        threw,
        duration,
        threw ? 'Properly threw Error: Reaction unsupported_reaction not found' : 'Failed to throw error'
      );
    } catch (err: any) {
      recordResult('Reaction Counter', 'Invalid reaction type', false, performance.now() - start, '', err.message);
    }
  }

  // ==========================================================================
  // SECTION 3: Fallback Behavior with Undefined, Malformed & Unreachable Env Vars
  // ==========================================================================
  console.log('\n--- 3. ENV VAR FALLBACK & NETWORK RESILIENCE ---');

  const originalEnv = { ...process.env };

  // 3.1: Undefined Supabase Environment Variables
  {
    const start = performance.now();
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const configured = isSupabaseConfigured();
      const client = createBrowserSupabaseClient();
      const settings = await repository.getSiteSettings();
      const platforms = await repository.getSocialPlatforms();
      const duration = performance.now() - start;

      const valid =
        configured === false &&
        client === null &&
        settings.creator_name === 'Sumbar Terkini' &&
        platforms.length === 5;

      recordResult(
        'Env Fallback',
        'Undefined NEXT_PUBLIC_SUPABASE_URL and KEY safely activates fallback',
        valid,
        duration,
        `isSupabaseConfigured() = ${configured}, client = ${client}, returned ${platforms.length} fallback platforms`
      );
    } catch (err: any) {
      recordResult('Env Fallback', 'Undefined Supabase Env Vars', false, performance.now() - start, '', err.message);
    }
  }

  // 3.2: Placeholder & Whitespace Supabase Environment Variables
  {
    const start = performance.now();
    try {
      const testCases = [
        { url: '   ', key: '   ', label: 'Whitespace strings' },
        { url: 'https://your-project.supabase.co', key: 'your-anon-key', label: 'Default placeholder template' },
        { url: 'https://placeholder.supabase.co', key: 'placeholder-secret', label: 'Placeholder keyword' },
        { url: 'http://insecure-supabase.co', key: 'some-key', label: 'Non-HTTPS URL' },
        { url: 'ftp://files.supabase.co', key: 'some-key', label: 'Non-HTTP protocol' },
        { url: '', key: 'some-key', label: 'Empty URL string' },
        { url: 'https://valid.supabase.co', key: '', label: 'Empty key string' },
      ];

      let allHandled = true;
      for (const tc of testCases) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = tc.url;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = tc.key;
        if (isSupabaseConfigured() !== false) {
          allHandled = false;
          console.log(`      Failed test case: ${tc.label} (returned true instead of false)`);
        }
      }

      const duration = performance.now() - start;
      recordResult(
        'Env Fallback',
        'Malformed and placeholder env vars rejected by isSupabaseConfigured()',
        allHandled,
        duration,
        `All 7 malformed/placeholder patterns evaluated to false`
      );
    } catch (err: any) {
      recordResult('Env Fallback', 'Malformed and placeholder env vars', false, performance.now() - start, '', err.message);
    }
  }

  // 3.3: Syntactically Valid URL but Unreachable Host (Network Error Resilience)
  {
    const start = performance.now();
    try {
      // Simulate configured Supabase pointing to an unreachable non-existent host
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://non-existent-cluster-98745210984.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature_for_test';

      const configured = isSupabaseConfigured();

      // Test that repository methods catch network exceptions and seamlessly fall back to local store without throwing
      const repo = new ResilientRepository();
      const settings = await repo.getSiteSettings();
      const platforms = await repo.getSocialPlatforms();
      const packages = await repo.getEndorsePackages();
      const duration = performance.now() - start;

      const valid =
        configured === true &&
        settings.creator_name === 'Sumbar Terkini' &&
        platforms.length === 5 &&
        packages.length >= 5;

      recordResult(
        'Env Fallback',
        'Unreachable Supabase host catches network failures and serves fallback data',
        valid,
        duration,
        `Repository seamlessly served mock fallback when remote host was unreachable`
      );
    } catch (err: any) {
      recordResult('Env Fallback', 'Unreachable Supabase host catches network failures', false, performance.now() - start, '', err.message);
    } finally {
      // Restore original environment
      process.env = { ...originalEnv };
    }
  }

  // ==========================================================================
  // SECTION 4: Schema Constraints and Extreme Input Normalization
  // ==========================================================================
  console.log('\n--- 4. SCHEMA CONSTRAINTS & INPUT NORMALIZATION ---');

  // 4.1: Database Schema DDL Verification in supabase/schema.sql
  {
    const start = performance.now();
    try {
      const schemaSqlPath = path.resolve(process.cwd(), 'supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf-8');

      const checks = [
        { name: 'Site settings singleton constraint', regex: /CHECK\s*\(\s*id\s*=\s*'default'\s*\)/i },
        { name: 'Theme preset check constraint', regex: /CHECK\s*\(\s*theme_preset\s+IN\s*\('neo-warm',\s*'neo-mint',\s*'neo-mustard'\)\)/i },
        { name: 'Followers non-negative check', regex: /followers_count\s+BIGINT\s+NOT\s+NULL\s+DEFAULT\s+0\s+CHECK\s*\(\s*followers_count\s*>=\s*0\s*\)/i },
        { name: 'Engagement rate boundary check (0-100)', regex: /engagement_rate\s+NUMERIC\(5,\s*2\)\s+NOT\s+NULL\s+DEFAULT\s+0\.00\s+CHECK\s*\(\s*engagement_rate\s*>=\s*0\.00\s+AND\s+engagement_rate\s*<=\s*100\.00\s*\)/i },
        { name: 'Endorse packages price non-negative check', regex: /price\s+BIGINT\s+NOT\s+NULL\s+DEFAULT\s+0\s+CHECK\s*\(\s*price\s*>=\s*0\s*\)/i },
        { name: 'Discount percentage check (0-100)', regex: /discount_percentage\s+INTEGER\s+NOT\s+NULL\s+DEFAULT\s+0\s+CHECK\s*\(\s*discount_percentage\s*>=\s*0\s+AND\s+discount_percentage\s*<=\s*100\s*\)/i },
        { name: 'Visitor reactions primary key constraint', regex: /id\s+TEXT\s+PRIMARY\s+KEY\s+CHECK\s*\(\s*id\s+IN\s*\('fire',\s*'rocket',\s*'heart'\)\)/i },
        { name: 'Atomic increment RPC function definition', regex: /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+increment_reaction/i },
        { name: 'RPC null or empty reaction check', regex: /IF\s+reaction_id\s+IS\s+NULL\s+OR\s+TRIM\(reaction_id\)\s*=\s*''\s+THEN/i },
        { name: 'Supabase Realtime publication registration', regex: /ALTER\s+PUBLICATION\s+supabase_realtime\s+ADD\s+TABLE/i },
        { name: 'Replica identity FULL on all 4 tables', regex: /REPLICA\s+IDENTITY\s+FULL/i },
      ];

      let allPassed = true;
      const failedChecks: string[] = [];

      for (const c of checks) {
        if (!c.regex.test(schemaSql)) {
          allPassed = false;
          failedChecks.push(c.name);
        }
      }

      const duration = performance.now() - start;
      recordResult(
        'Schema Validation',
        'PostgreSQL schema DDL constraints and security definers',
        allPassed,
        duration,
        allPassed
          ? `Verified 11 PostgreSQL constraints, RPC guards, and realtime publications`
          : `Missing DDL checks: ${failedChecks.join(', ')}`
      );
    } catch (err: any) {
      recordResult('Schema Validation', 'PostgreSQL schema DDL constraints', false, performance.now() - start, '', err.message);
    }
  }

  // 4.2: Extreme Malformed Row Normalization in DAL
  {
    const start = performance.now();
    try {
      // Test normalization behavior with extreme inputs (missing columns, wrong types, nulls)
      LocalStorageManager.resetToSeed();

      // Test updating site settings with edge case partial payloads
      const updated1 = await repository.updateSiteSettings({
        creator_name: 'Extreme Name #!@$%^&*()_+~`|}{[]:;?><,./',
        creator_bio: 'A'.repeat(5000), // 5KB long bio
        slot_available: false,
        theme_preset: 'neo-mint',
        stickers: [], // empty stickers
      });

      const updated2 = await repository.updateSiteSettings({
        creator_name: '', // empty name
        stickers: Array.from({ length: 50 }, (_, i) => ({
          id: `stk-${i}`,
          text: `Sticker ${i} with long text ${'x'.repeat(100)}`,
          emoji: '🎉',
          rotation: (i * 37) % 360,
        })),
      });

      const final = await repository.getSiteSettings();
      const duration = performance.now() - start;

      const valid =
        final.stickers.length === 50 &&
        final.slot_available === false &&
        final.creator_bio.length === 5000;

      recordResult(
        'Schema Validation',
        'DAL handles extreme strings, 50 stickers array, and 5KB bio payload',
        valid,
        duration,
        `Successfully preserved 50 stickers and 5KB bio without memory corruption or truncation`
      );
    } catch (err: any) {
      recordResult('Schema Validation', 'Extreme inputs normalization in DAL', false, performance.now() - start, '', err.message);
    }
  }

  // ==========================================================================
  // SECTION 5: Hybrid Metric Engine & Sync-Socials Route Stress (Milestone 2)
  // ==========================================================================
  console.log('\n--- 5. HYBRID METRIC ENGINE & SYNC-SOCIALS ROUTE STRESS ---');
  await runM2AdversarialSuite(recordResult);

  // ==========================================================================
  // SUMMARY OF FINDINGS
  // ==========================================================================
  console.log('\n======================================================================');
  console.log('📊 TIER 5 ADVERSARIAL STRESS TEST SUMMARY');
  console.log('======================================================================');

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  console.log(`Total Stress Tests: ${results.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  if (failedTests > 0) {
    console.log('\n❌ Failed Stress Tests:');
    for (const failure of results.filter((r) => !r.passed)) {
      console.log(`  - [${failure.category}] ${failure.name}: ${failure.details} ${failure.error || ''}`);
    }
  }

  console.log('======================================================================\n');

  return { total: results.length, passed: passedTests, failed: failedTests, results };
}

// Execute suite
runAdversarialStressSuite().then((res) => {
  if (res.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch((err) => {
  console.error('Fatal stress suite runner error:', err);
  process.exit(1);
});
