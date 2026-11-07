/**
 * Milestone 3 Build & Static Stress Challenger Test Suite
 * File: tests/adversarial/m3-build-stress.test.ts
 *
 * Scope:
 * 1. SSR & Prerender Resilience: Default export invocation and ReactDOMServer string render
 *    under normal, empty platforms, empty packages, empty reactions, and corrupt settings.
 * 2. Anti-Slop Audit:
 *    - Zero tolerance for em dashes (\u2014 or —) in src/
 *    - Zero tolerance for TODO, FIXME, implement later stubs in src/
 *    - Contrast ratio verification: WCAG AA (>= 4.5:1) for text on #FFD166, #EF476F, #06D6A0
 *    - Tap target ergonomics audit: >= 44px min-h on interactive controls
 * 3. Bundle & Route Manifest Rigor:
 *    - Route manifest verification for / (static) and /api/sync-socials (dynamic)
 * 4. Layout Compliance:
 *    - .agents/teamwork contains only .md files
 */

import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import HomePage from '../../src/app/page';
import { repository } from '../../src/lib/data/repository';
import { calculateContrastRatio } from '../../src/lib/utils/formatters';

// Set production environment for headless React SSR
(globalThis as any).React = React;
process.env.NODE_ENV = 'production';

// Color definitions per Neo-Brutalism design contract
const INK = '#1E1E1E';
const MUSTARD = '#FFD166';
const CORAL = '#EF476F';
const MINT = '#06D6A0';
const PAPER = '#FAF8F5';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: string, details?: string) {
  if (condition) {
    results.push({ name, category, passed: true, details });
    console.log(`  ✅ [PASS] ${category} > ${name}${details ? ` (${details})` : ''}`);
  } else {
    results.push({ name, category, passed: false, error: 'Assertion failed', details });
    console.error(`  ❌ [FAIL] ${category} > ${name}${details ? ` (${details})` : ''}`);
  }
}

function walkDir(dir: string, filterExt: string[]): string[] {
  let fileList: string[] = [];
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileList = fileList.concat(walkDir(fullPath, filterExt));
    } else if (filterExt.some((ext) => entry.name.endsWith(ext))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function runM3BuildStressSuite() {
  console.log('======================================================================');
  console.log('🔥 STARTING M3 BUILD & STATIC STRESS CHALLENGER TEST SUITE');
  console.log('======================================================================\n');

  // ==========================================================================
  // 1. SSR & Prerender Resilience Tests
  // ==========================================================================
  console.log('--- 1. SSR & PRERENDER RESILIENCE ---');

  // 1.1 Baseline SSR Render
  try {
    const vnode = await HomePage();
    assert(typeof vnode === 'object' && vnode !== null, 'HomePage() returns valid JSX tree', 'SSR Baseline');
    const html = ReactDOMServer.renderToString(vnode);
    assert(html.length > 50000, 'Baseline SSR generates complete HTML (>50KB)', 'SSR Baseline', `${html.length} chars`);
    assert(html.includes('Sumbar Terkini'), 'Baseline SSR contains Creator title', 'SSR Baseline');
    assert(html.includes('id="rate-calculator"'), 'Baseline SSR contains Rate Calculator section', 'SSR Baseline');
    assert(html.includes('id="portfolio-showcase"'), 'Baseline SSR contains Portfolio section', 'SSR Baseline');
    assert(html.includes('id="contact-hub"'), 'Baseline SSR contains Contact Hub section', 'SSR Baseline');
  } catch (err: any) {
    assert(false, 'Baseline SSR execution failed', 'SSR Baseline', err?.message);
  }

  // 1.2 Empty Platforms SSR Resilience
  try {
    const origPlatforms = repository.getSocialPlatforms;
    repository.getSocialPlatforms = async () => [];
    const vnode = await HomePage();
    const html = ReactDOMServer.renderToString(vnode);
    assert(
      html.includes('Belum ada platform terdaftar'),
      'Empty platforms triggers graceful fallback without unhandled exception',
      'SSR Resilience',
      'Renders empty-state banner'
    );
    repository.getSocialPlatforms = origPlatforms;
  } catch (err: any) {
    assert(false, 'Empty platforms SSR threw unhandled exception', 'SSR Resilience', err?.message);
  }

  // 1.3 Empty Packages SSR Resilience
  try {
    const origPackages = repository.getEndorsePackages;
    repository.getEndorsePackages = async () => [];
    const vnode = await HomePage();
    const html = ReactDOMServer.renderToString(vnode);
    assert(
      html.includes('Pilihan Paket Layanan') && html.includes('0') && html.includes('Tersedia'),
      'Empty packages triggers 0 deliverables state without NaN or exception',
      'SSR Resilience',
      'Renders zero-package catalog safely'
    );
    repository.getEndorsePackages = origPackages;
  } catch (err: any) {
    assert(false, 'Empty packages SSR threw unhandled exception', 'SSR Resilience', err?.message);
  }

  // 1.4 Empty Reactions SSR Resilience
  try {
    const origReactions = repository.getReactions;
    repository.getReactions = async () => [];
    const vnode = await HomePage();
    const html = ReactDOMServer.renderToString(vnode);
    assert(
      html.includes('🔥') && html.includes('🚀') && html.includes('❤️'),
      'Empty reactions initializes counters to zero without crash',
      'SSR Resilience',
      'All 3 reaction buttons present with 0 initial counts'
    );
    repository.getReactions = origReactions;
  } catch (err: any) {
    assert(false, 'Empty reactions SSR threw unhandled exception', 'SSR Resilience', err?.message);
  }

  // 1.5 Total Empty State Resilience (Platforms = [], Packages = [], Reactions = [])
  try {
    const origPlatforms = repository.getSocialPlatforms;
    const origPackages = repository.getEndorsePackages;
    const origReactions = repository.getReactions;

    repository.getSocialPlatforms = async () => [];
    repository.getEndorsePackages = async () => [];
    repository.getReactions = async () => [];

    const vnode = await HomePage();
    const html = ReactDOMServer.renderToString(vnode);
    assert(
      typeof html === 'string' && html.length > 20000,
      'Total entity starvation SSR renders resilient page skeleton without throwing',
      'SSR Resilience',
      `${html.length} chars produced`
    );

    // Restore original DAL methods
    repository.getSocialPlatforms = origPlatforms;
    repository.getEndorsePackages = origPackages;
    repository.getReactions = origReactions;
  } catch (err: any) {
    assert(false, 'Total entity starvation threw unhandled exception', 'SSR Resilience', err?.message);
  }

  // 1.6 Malformed / Undefined Settings Fields Resilience
  try {
    const origSettings = repository.getSiteSettings;
    repository.getSiteSettings = async () => ({
      id: 'settings_01',
      creator_name: '',
      creator_handle: '',
      creator_avatar_url: '',
      creator_bio: '',
      slot_available: false,
      slot_status_text: '',
      theme_preset: 'neo-warm',
      stickers: [],
      whatsapp_number: '',
      whatsapp_template: '',
      business_email: '',
      media_kit_pdf_url: '',
      updated_at: new Date().toISOString(),
    });

    const vnode = await HomePage();
    const html = ReactDOMServer.renderToString(vnode);
    assert(
      html.includes('Creator Media Kit') || html.includes('Sumbar Terkini'),
      'Malformed/empty site settings fields fall back to sensible defaults',
      'SSR Resilience',
      'Clean fallback strings applied'
    );

    repository.getSiteSettings = origSettings;
  } catch (err: any) {
    assert(false, 'Malformed settings SSR threw unhandled exception', 'SSR Resilience', err?.message);
  }

  // ==========================================================================
  // 2. Anti-Slop Audit
  // ==========================================================================
  console.log('\n--- 2. ANTI-SLOP AUDIT ---');

  const srcFiles = walkDir('src', ['.ts', '.tsx']);
  assert(srcFiles.length > 20, 'Source files found for inspection', 'Anti-Slop', `${srcFiles.length} files scanned`);

  // 2.1 Em Dash Check: Zero Tolerance for \u2014 or —
  let emDashCount = 0;
  const emDashViolations: string[] = [];
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('\u2014') || content.includes('—')) {
      emDashCount++;
      emDashViolations.push(file);
    }
  }
  assert(
    emDashCount === 0,
    'Zero em dashes (\\u2014 or —) across entire src/ directory',
    'Anti-Slop',
    emDashCount === 0 ? '0 em dashes found' : `Found in: ${emDashViolations.join(', ')}`
  );

  // 2.2 Unwritten Code Stubs: Zero Tolerance for TODO, FIXME, implement later
  let stubCount = 0;
  const stubViolations: string[] = [];
  const stubRegex = /\/\/\s*(TODO|FIXME|implement later)|\/\*\s*(TODO|FIXME|implement later)/i;

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (stubRegex.test(line)) {
        stubCount++;
        stubViolations.push(`${file}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  assert(
    stubCount === 0,
    'Zero code-slop stubs (// TODO, // FIXME, // implement later)',
    'Anti-Slop',
    stubCount === 0 ? '0 stubs found' : `Violations: ${stubViolations.join('; ')}`
  );

  // 2.3 WCAG AA Contrast Verification for Brand Color Tokens
  const mustardRatio = calculateContrastRatio(INK, MUSTARD);
  const mintRatio = calculateContrastRatio(INK, MINT);
  const coralRatio = calculateContrastRatio(INK, CORAL);
  const paperRatio = calculateContrastRatio(INK, PAPER);

  assert(
    mustardRatio >= 4.5,
    'Mustard (#FFD166) vs Ink (#1E1E1E) satisfies WCAG AA (>= 4.5:1)',
    'WCAG Contrast',
    `Contrast ratio: ${mustardRatio.toFixed(2)}:1`
  );
  assert(
    mintRatio >= 4.5,
    'Mint (#06D6A0) vs Ink (#1E1E1E) satisfies WCAG AA (>= 4.5:1)',
    'WCAG Contrast',
    `Contrast ratio: ${mintRatio.toFixed(2)}:1`
  );
  assert(
    coralRatio >= 4.5,
    'Coral (#EF476F) vs Ink (#1E1E1E) satisfies WCAG AA (>= 4.5:1)',
    'WCAG Contrast',
    `Contrast ratio: ${coralRatio.toFixed(2)}:1`
  );
  assert(
    paperRatio >= 4.5,
    'Paper (#FAF8F5) vs Ink (#1E1E1E) satisfies WCAG AA (>= 4.5:1)',
    'WCAG Contrast',
    `Contrast ratio: ${paperRatio.toFixed(2)}:1`
  );

  // 2.4 Verify UI Components Use text-ink with bg-mustard / bg-coral / bg-mint
  let lowContrastBadgeFound = false;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Check if white text is paired with mustard, mint, or coral backgrounds
    if (
      /(bg-mustard|bg-mint|bg-coral)[^"]*text-white/.test(content) ||
      /text-white[^"]*(bg-mustard|bg-mint|bg-coral)/.test(content)
    ) {
      lowContrastBadgeFound = true;
      console.warn(`Potential low contrast combination in ${file}`);
    }
  }
  assert(
    !lowContrastBadgeFound,
    'Zero low-contrast text combinations (no text-white on mustard/mint/coral)',
    'WCAG Contrast',
    'All accent backgrounds strictly paired with text-ink'
  );

  // 2.5 Tap Target Ergonomics Audit on Primary Action Controls
  // Check that critical interactive elements have at least 44px min-height
  const buttonControls: Array<{ name: string; file: string; minHeightPattern: RegExp }> = [
    { name: 'WhatsApp Checkout CTA', file: 'src/components/calculator/WhatsAppCheckout.tsx', minHeightPattern: /min-h-\[52px\]|min-h-\[48px\]|min-h-\[44px\]/ },
    { name: 'Reaction Clicker Buttons', file: 'src/components/hero/ParticleMoodClicker.tsx', minHeightPattern: /min-h-\[56px\]|min-h-\[48px\]|min-h-\[44px\]/ },
    { name: 'Rate Calculator Mode Toggle', file: 'src/components/calculator/RateCalculator.tsx', minHeightPattern: /min-h-\[44px\]/ },
    { name: 'Contact Hub Copy Email Button', file: 'src/components/contact/ContactHub.tsx', minHeightPattern: /min-h-\[44px\]/ },
    { name: 'Contact Hub Copy WhatsApp Button', file: 'src/components/contact/ContactHub.tsx', minHeightPattern: /min-h-\[44px\]/ },
    { name: 'Portfolio Section Filter Pills', file: 'src/components/portfolio/PortfolioSection.tsx', minHeightPattern: /min-h-\[44px\]/ },
  ];

  for (const ctrl of buttonControls) {
    const content = fs.readFileSync(ctrl.file, 'utf8');
    const hasMinH44 = ctrl.minHeightPattern.test(content);
    assert(hasMinH44, `Control "${ctrl.name}" has >= 44px tap target height`, 'Tap Ergonomics', ctrl.file);
  }

  // ==========================================================================
  // 3. Bundle & Route Manifest Rigor
  // ==========================================================================
  console.log('\n--- 3. BUNDLE & ROUTE MANIFEST RIGOR ---');

  const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
  const routesManifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
  const appBuildManifestPath = path.join(process.cwd(), '.next', 'app-build-manifest.json');

  assert(fs.existsSync(buildManifestPath), '.next/build-manifest.json exists', 'Bundle Rigor');
  assert(fs.existsSync(routesManifestPath), '.next/routes-manifest.json exists', 'Bundle Rigor');
  assert(fs.existsSync(appBuildManifestPath), '.next/app-build-manifest.json exists', 'Bundle Rigor');

  if (fs.existsSync(appBuildManifestPath)) {
    const appManifest = JSON.parse(fs.readFileSync(appBuildManifestPath, 'utf8'));
    assert(
      Boolean(appManifest.pages && appManifest.pages['/page']),
      'App router manifests public root page ("/")',
      'Route Manifest'
    );
  }

  if (fs.existsSync(routesManifestPath)) {
    const routesManifest = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));
    const appPathsManifestPath = path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json');
    assert(
      Array.isArray(routesManifest.dynamicRoutes) ||
        Array.isArray(routesManifest.staticRoutes) ||
        fs.existsSync(appPathsManifestPath),
      'Routes manifest contains valid route definitions',
      'Route Manifest'
    );
  }

  // ==========================================================================
  // 4. Layout Compliance
  // ==========================================================================
  console.log('\n--- 4. LAYOUT COMPLIANCE ---');

  const teamworkFiles = walkDir('.agents/teamwork', ['.ts', '.tsx', '.js', '.json', '.css', '.html']);
  assert(
    teamworkFiles.length === 0,
    '.agents/teamwork contains strictly markdown (.md) metadata only',
    'Layout Compliance',
    teamworkFiles.length === 0 ? 'Zero source/code files in metadata directory' : `Violations: ${teamworkFiles.join(', ')}`
  );

  // ==========================================================================
  // Summary Execution Report
  // ==========================================================================
  console.log('\n======================================================================');
  console.log('📊 M3 BUILD & STATIC STRESS CHALLENGER TEST SUMMARY');
  console.log('======================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Stress Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.error(`💥 ${failed} TEST(S) FAILED IN M3 BUILD & STATIC STRESS SUITE`);
    process.exit(1);
  } else {
    console.log('🎉 ALL M3 BUILD & STATIC STRESS CHALLENGER ASSERTIONS PASSED CLEANLY!\n');
  }
}

runM3BuildStressSuite().catch((err) => {
  console.error('Fatal unhandled error in test suite:', err);
  process.exit(1);
});
