# Technical Analysis & Component Blueprint: Bento Grid & Rolling Odometer
**Milestone**: Milestone 3 (Features F07, F08, F09)  
**Author**: M3 Explorer 2 (Bento Grid & Odometer Specialist)  
**Target Path**: `.agents/teamwork/m3_explorer_2/analysis.md`  
**Dependencies**: `PROJECT.md`, `ORIGINAL_REQUEST.md`, `TEST_READY.md`, `explorer_survey_2/analysis.md`

---

## 1. Executive Summary

This document establishes the production-grade engineering blueprint for the Social Media Bento Grid, Mechanical Rolling Odometer, Demographics Visualizer, and Brand Vector System for **Sumbar Terkini Creator Media Kit & Endorsement Hub**.

### Key Deliverables Designed:
1. `src/components/ui/Icons.tsx`: Production-grade inline SVG components for official Simple Icons brand vectors (Instagram, TikTok, YouTube, Facebook, X) and Neo-Brutalist UI icons.
2. `src/components/socials/RollingOdometer.tsx`: Zero-CLS mechanical vertical digit-reel animation leveraging `Space Mono` tabular figures, vertical translation by `-digit * 10%`, cubic-bezier `[0.16, 1, 0.3, 1]` neo-easing, and `prefers-reduced-motion` compliance.
3. `src/components/socials/DemographicsBar.tsx`: Dual-colored interactive gender breakdown bar (Coral `#EF476F` Female / Mint `#06D6A0` Male) with proportional 100% normalization and West Sumatra regional city distribution progress bars.
4. `src/components/socials/BentoCard.tsx`: Individual platform card with authentic brand palettes, live sync status badges (`AUTO_API` pulsing vs `MANUAL` verified), ER status categorization (Viral Maker >= 4%, Healthy 2-4%, Steady < 2%), sanitized authentic external profile links, and micro-press tactile feedback.
5. `src/components/socials/BentoGrid.tsx`: Asymmetric 12-column responsive layout (Instagram 7-col flagship, TikTok 5-col video powerhouse, YouTube/Facebook/X 4-col balance) collapsing gracefully to single-column on mobile viewports (< 768px), complete with aggregated reach summary and empty-state resilience.
6. **Worker Implementation Guide**: Step-by-step phased instructions for immediate, non-breaking execution.

---

## 2. Requirements & Test Contract Mapping

| Feature ID | Feature Name | Test References | Key Assertions & Constraints |
|---|---|---|---|
| **F07** | Bento Grid Social Cards | `T1.7.1` - `T1.7.5`<br>`T2.7.1` - `T2.7.5`<br>`T3.7`, `T4.S1`, `T4.S2` | • 5 platforms: Instagram, TikTok, YouTube, Facebook, X<br>• Official brand colors: IG `#E4405F`, TikTok `#000000`, YouTube `#FF0000`, FB `#1877F2`, X `#000000`<br>• Asymmetric 12-col layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4`<br>• Metrics: followers, ER %, avg views, likes, comments<br>• Empty state guidance when list is empty (`T2.7.1`)<br>• Zero division guard when followers = 0 (`T2.7.2`)<br>• Clamping negative values to 0 (`T2.7.3`)<br>• Handle normalization (`@` prefix) (`T2.7.4`)<br>• Profile URL sanitization via `encodeURI` (`T2.7.5`) |
| **F08** | Rolling Odometer Animation | `T1.8.1` - `T1.8.5`<br>`T2.8.1` - `T2.8.5`<br>`T4.S3` | • Indonesian thousand separators (`.` / `toLocaleString('id-ID')`)<br>• `Space Mono, monospace` with `font-variant-numeric: tabular-nums`<br>• Exact digit reel translation: `translateY(-digit * 10%)`<br>• Duration: `0.8s`, Ease: `cubic-bezier(0.16, 1, 0.3, 1)`<br>• Compact formatting (`1.2M`, `854K`)<br>• Steady 0 position on 0 value (`T2.8.1`)<br>• Minus sign formatting for negative numbers (`T2.8.2`)<br>• Decimal rounding for floating points (`T2.8.3`)<br>• Large values (>100M) without breaking layout (`T2.8.4`) |
| **F09** | ER % Badges & Demographics | `T1.9.1` - `T1.9.5`<br>`T2.9.1` - `T2.9.5`<br>`T3.9`, `T4.S1` | • ER >= 4.0% -> `Viral Maker` (Mint `#06D6A0` + Ink `#1E1E1E`)<br>• ER 2.0% - 3.99% -> `Healthy` (Mustard `#FFD166` + Ink `#1E1E1E`)<br>• ER < 2.0% -> `Steady` (Paper `#FAF8F5` / Card White)<br>• Gender percentages normalized to exactly 100% (`T2.9.3`)<br>• West Sumatra regional cities (Padang, Bukittinggi, Payakumbuh)<br>• Empty top cities placeholder: `"Data Belum Tersedia"` (`T2.9.4`)<br>• Percentage clamped [0, 100] (`T2.9.5`) |

---

## 3. Detailed Component Architecture & Technical Blueprints

```
src/components/
├── ui/
│   └── Icons.tsx                 # Official brand SVGs & Neo-Brutalist icons
└── socials/
    ├── BentoGrid.tsx             # 12-col asymmetric responsive container & summary bar
    ├── BentoCard.tsx             # Individual platform bento card & micro-interactions
    ├── RollingOdometer.tsx       # Mechanical digit reel translation engine (Zero CLS)
    └── DemographicsBar.tsx       # Gender balance dual-bar & West Sumatra city distribution
```

---

### 3.1 Component 1: `src/components/ui/Icons.tsx`

This file provides lightweight, clean inline SVG vectors without external runtime fetch delays, fully compatible with React 19 and Next.js 15 SSR.

```tsx
import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Official Simple Icons Brand SVGs (Instagram, TikTok, YouTube, Facebook, X)
 * Standard 24x24 viewBox with fill="currentColor".
 */

export function InstagramIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Instagram"
      {...props}
    >
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.42 1.347 20.751.935 19.96.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="TikTok"
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function YouTubeIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="YouTube"
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Facebook"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function XIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="X (Twitter)"
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/**
 * Universal Platform Icon Resolver
 */
export function PlatformIcon({
  platform,
  size = 20,
  className = '',
}: {
  platform: string;
  size?: number | string;
  className?: string;
}) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <InstagramIcon size={size} className={className} />;
    case 'tiktok':
      return <TikTokIcon size={size} className={className} />;
    case 'youtube':
      return <YouTubeIcon size={size} className={className} />;
    case 'facebook':
      return <FacebookIcon size={size} className={className} />;
    case 'x':
    case 'twitter':
      return <XIcon size={size} className={className} />;
    default:
      return null;
  }
}

/**
 * General Neo-Brutalist UI Icons (Stroke-based, 24x24)
 */
export function ExternalLinkIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function TrendingUpIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function UsersIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function EyeIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function HeartIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function MessageSquareIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function MapPinIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
```

---

### 3.2 Component 2: `src/components/socials/RollingOdometer.tsx`

#### Architectural Principles:
1. **Zero CLS Guarantee**: Container is locked to `h-[1.2em]` with `overflow-hidden`. Space Mono provides strict `1ch` fixed width per digit with `font-variant-numeric: tabular-nums`.
2. **GPU Translation Reel**: Digits 0 through 9 are stacked vertically in a column and shifted via `translateY(-digit * 10%)`.
3. **Neo-Spring Easing**: Smooth physical movement using `cubic-bezier(0.16, 1, 0.3, 1)` and default duration `0.8s`.
4. **Resilience & Fallbacks**:
   - Handles negative numbers by prepending `-` (`T2.8.2`).
   - Steady `translateY(-0%)` at 0 (`T2.8.1`).
   - Supports compact notation (`1.2M`, `854K`) (`T1.8.5`, `T2.8.4`).
   - Supports floating point precision rounding (`T2.8.3`).
   - Detects `prefers-reduced-motion` and snaps directly to position without transition.

```tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

export interface RollingOdometerProps {
  value: number;
  format?: 'standard' | 'compact' | 'raw';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // In seconds, default 0.8
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Format helper for numbers conforming to Indonesian locale and compact contracts
 */
export function formatOdometerValue(
  val: number,
  format: 'standard' | 'compact' | 'raw' = 'standard',
  decimals = 0
): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (format === 'compact') {
    if (absVal >= 1_000_000) {
      const formatted = (absVal / 1_000_000).toFixed(1).replace(/\.0$/, '');
      return `${isNegative ? '-' : ''}${formatted}M`;
    }
    if (absVal >= 1_000) {
      const formatted = (absVal / 1_000).toFixed(0);
      return `${isNegative ? '-' : ''}${formatted}K`;
    }
    return `${isNegative ? '-' : ''}${Math.round(absVal)}`;
  }

  if (format === 'raw') {
    return `${isNegative ? '-' : ''}${absVal.toFixed(decimals)}`;
  }

  // Standard Indonesian locale formatting
  if (decimals > 0) {
    const rounded = Math.round(absVal * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return `${isNegative ? '-' : ''}${rounded.toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  return `${isNegative ? '-' : ''}${Math.round(absVal).toLocaleString('id-ID')}`;
}

/**
 * Individual Digit Reel (0 to 9) shifted by -digit * 10%
 */
interface DigitReelProps {
  digit: number;
  duration: number;
  reducedMotion: boolean;
}

function DigitReel({ digit, duration, reducedMotion }: DigitReelProps) {
  // Clamped between 0 and 9
  const safeDigit = Math.min(Math.max(digit, 0), 9);

  return (
    <span
      className="inline-block relative overflow-hidden select-none"
      style={{
        height: '1.2em',
        width: '1ch',
        verticalAlign: 'bottom',
      }}
      aria-hidden="true"
    >
      <span
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${safeDigit * 10}%)`,
          transitionProperty: reducedMotion ? 'none' : 'transform',
          transitionDuration: reducedMotion ? '0s' : `${duration}s`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {DIGITS.map((num) => (
          <span
            key={num}
            className="flex items-center justify-center font-mono leading-none"
            style={{ height: '1.2em' }}
          >
            {num}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Production Rolling Odometer Component
 */
export function RollingOdometer({
  value,
  format = 'standard',
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 0.8,
  className = '',
}: RollingOdometerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const displayString = useMemo(
    () => formatOdometerValue(value, format, decimals),
    [value, format, decimals]
  );

  const characters = useMemo(() => displayString.split(''), [displayString]);

  return (
    <span
      className={cn(
        'inline-flex items-baseline font-mono font-bold tracking-tight text-ink',
        className
      )}
      style={{
        fontFamily: 'var(--font-space-mono), Space Mono, monospace',
        fontVariantNumeric: 'tabular-nums',
      }}
      role="text"
      aria-label={`${prefix}${displayString}${suffix}`}
    >
      {prefix && (
        <span className="select-none mr-0.5" aria-hidden="true">
          {prefix}
        </span>
      )}

      {characters.map((char, index) => {
        const isDigit = /^[0-9]$/.test(char);

        if (isDigit) {
          const digit = parseInt(char, 10);
          return (
            <DigitReel
              key={`digit-${index}-${characters.length}`}
              digit={digit}
              duration={duration}
              reducedMotion={reducedMotion}
            />
          );
        }

        return (
          <span
            key={`char-${index}-${char}`}
            className="inline-flex items-center justify-center select-none"
            style={{
              height: '1.2em',
              verticalAlign: 'bottom',
              minWidth: char === '.' || char === ',' ? '0.4ch' : '0.8ch',
            }}
            aria-hidden="true"
          >
            {char}
          </span>
        );
      })}

      {suffix && (
        <span className="select-none ml-0.5" aria-hidden="true">
          {suffix}
        </span>
      )}
    </span>
  );
}
```

---

### 3.3 Component 3: `src/components/socials/DemographicsBar.tsx`

#### Architectural Principles:
1. **Gender Normalization**: Proportionally normalizes male and female percentages to sum to exactly 100% (`T2.9.3`). When both are 0, defaults to 50/50.
2. **Dual-Colored Bar**: Coral (`#EF476F`) for Female, Mint (`#06D6A0`) for Male, separated by bold Dark Ink borders.
3. **West Sumatra Cities List**: Clamps percentages between 0 and 100% (`T2.9.5`). If empty, displays `"Data Belum Tersedia"` fallback (`T2.9.4`).
4. **High Readability**: High-contrast labels conforming to anti-slop guidelines (Dark Ink text on Mint, Coral, Mustard).

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { MapPinIcon } from '@/components/ui/Icons';

export interface DemographicCity {
  city: string;
  percentage: number;
}

export interface DemographicsBarProps {
  gender: {
    male: number;
    female: number;
  };
  topCities: DemographicCity[];
  title?: string;
  showCities?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Normalizes male and female percentages to sum strictly to 100%
 */
export function normalizeGenderPercentages(
  male: number,
  female: number
): { male: number; female: number } {
  const safeMale = Math.max(0, typeof male === 'number' && !isNaN(male) ? male : 0);
  const safeFemale = Math.max(0, typeof female === 'number' && !isNaN(female) ? female : 0);
  const total = safeMale + safeFemale;

  if (total === 0) {
    return { male: 50, female: 50 };
  }

  const normMale = Math.round((safeMale / total) * 100);
  const normFemale = 100 - normMale;

  return { male: normMale, female: normFemale };
}

export function DemographicsBar({
  gender,
  topCities,
  title = 'Demografi Audiens',
  showCities = true,
  compact = false,
  className = '',
}: DemographicsBarProps) {
  const { male, female } = normalizeGenderPercentages(gender.male, gender.female);

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-ink/80 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 bg-mustard border border-ink inline-block" />
            {title}
          </h4>
          <span className="text-[11px] font-mono font-bold text-ink/60">
            Terverifikasi Internal
          </span>
        </div>
      )}

      {/* Gender Distribution Dual-Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono font-bold text-ink mb-1.5">
          <span className="flex items-center gap-1 text-coral-hover">
            <span className="w-2 h-2 rounded-full bg-coral border border-ink" />
            ♀ Perempuan {female}%
          </span>
          <span className="flex items-center gap-1 text-mint-hover">
            ♂ Laki-laki {male}%
            <span className="w-2 h-2 rounded-full bg-mint border border-ink" />
          </span>
        </div>

        <div
          className="h-6 w-full bg-paper border-2 border-ink rounded-lg shadow-neo-sm overflow-hidden flex"
          role="progressbar"
          aria-label={`Distribusi Gender: ${female}% Perempuan, ${male}% Laki-laki`}
          aria-valuenow={female}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{ width: `${female}%` }}
            className="h-full bg-coral border-r-2 border-ink flex items-center justify-start pl-2 transition-all duration-500 ease-out"
          >
            {female >= 20 && (
              <span className="text-[10px] font-mono font-black text-ink select-none">
                {female}%
              </span>
            )}
          </div>
          <div
            style={{ width: `${male}%` }}
            className="h-full bg-mint flex items-center justify-end pr-2 transition-all duration-500 ease-out"
          >
            {male >= 20 && (
              <span className="text-[10px] font-mono font-black text-ink select-none">
                {male}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Cities Distribution (West Sumatra Core) */}
      {showCities && (
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/70 mb-2 flex items-center gap-1">
            <MapPinIcon size={12} className="text-ink" />
            Sebaran Kota Terbesar
          </div>

          {!topCities || topCities.length === 0 ? (
            <div className="text-xs font-mono font-bold text-ink/60 bg-paper/60 p-2.5 rounded-lg border border-ink/30 text-center">
              Data Belum Tersedia
            </div>
          ) : (
            <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {topCities.slice(0, 4).map((item, idx) => {
                const clampedPercent = Math.min(Math.max(item.percentage, 0), 100);
                return (
                  <div
                    key={`${item.city}-${idx}`}
                    className="p-2 bg-paper/50 rounded-lg border border-ink/40 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="truncate text-ink flex items-center gap-1">
                        <span className="font-mono text-[10px] text-ink/60">#{idx + 1}</span>
                        {item.city}
                      </span>
                      <span className="font-mono font-black text-ink text-xs ml-1">
                        {clampedPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full border border-ink/40 overflow-hidden">
                      <div
                        className="bg-mustard h-full border-r border-ink/30 transition-all duration-500"
                        style={{ width: `${clampedPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 3.4 Component 4: `src/components/socials/BentoCard.tsx`

#### Architectural Principles:
1. **Platform Styling Matrix**: Tailored official brand colors (`#E4405F`, `#000000`, `#FF0000`, `#1877F2`) combined with Neo-Brutalist soft surfaces.
2. **ER Status Category Engine**:
   - `ER >= 4.0%`: "Viral Maker" -> Mint `#06D6A0` badge with 🔥 icon.
   - `2.0% <= ER < 4.0%`: "Healthy" -> Mustard `#FFD166` badge with ⚡ icon.
   - `ER < 2.0%`: "Steady" -> Warm Paper `#FAF8F5` badge with 📊 icon.
3. **Live Sync Badge**:
   - `AUTO_API`: Pulsing green dot with `animate-pulse` and Mint badge.
   - `MANUAL`: Steady dot and Warm Paper badge.
4. **Zero-Division & Negative Metric Clamping**: Negative counts clamped to 0 (`T2.7.3`), zero followers safely handled without dividing by zero (`T2.7.2`).
5. **Sanitization**: Profile URL cleaned with `encodeURI(url.trim())` (`T2.7.5`), handle ensured with `@` (`T2.7.4`).
6. **Micro-Press Tactile Hover**: `hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150`.

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { SocialPlatform, PlatformId } from '@/types';
import { RollingOdometer } from './RollingOdometer';
import { DemographicsBar } from './DemographicsBar';
import {
  PlatformIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
  EyeIcon,
  HeartIcon,
  MessageSquareIcon,
} from '@/components/ui/Icons';

export interface BentoCardProps {
  platform: SocialPlatform;
  className?: string;
  isFlagship?: boolean;
}

/**
 * Official Brand Configuration Dictionary
 */
export const PLATFORM_BRAND_CONFIG: Record<
  PlatformId,
  {
    name: string;
    brandColor: string;
    badgeBg: string;
    accentBg: string;
    metricLabel: string;
  }
> = {
  instagram: {
    name: 'Instagram',
    brandColor: '#E4405F',
    badgeBg: 'bg-[#E4405F]',
    accentBg: 'bg-[#FFF0F3]',
    metricLabel: 'Followers Aktif',
  },
  tiktok: {
    name: 'TikTok',
    brandColor: '#000000',
    badgeBg: 'bg-black',
    accentBg: 'bg-[#F4F4F6]',
    metricLabel: 'Followers / Audiens',
  },
  youtube: {
    name: 'YouTube',
    brandColor: '#FF0000',
    badgeBg: 'bg-[#FF0000]',
    accentBg: 'bg-[#FFF2F2]',
    metricLabel: 'Subscribers Resmi',
  },
  facebook: {
    name: 'Facebook',
    brandColor: '#1877F2',
    badgeBg: 'bg-[#1877F2]',
    accentBg: 'bg-[#F0F6FF]',
    metricLabel: 'Pengikut Komunitas',
  },
  x: {
    name: 'X (Twitter)',
    brandColor: '#000000',
    badgeBg: 'bg-black',
    accentBg: 'bg-[#F5F5F5]',
    metricLabel: 'Pengikut Linimasa',
  },
};

/**
 * ER % Status Badge Determination (F09 contract)
 */
export function getErStatus(er: number): {
  status: 'Viral Maker' | 'Healthy' | 'Steady';
  badgeClass: string;
  emoji: string;
} {
  const safeER = typeof er === 'number' && !isNaN(er) ? er : 0;
  if (safeER >= 4.0) {
    return {
      status: 'Viral Maker',
      badgeClass: 'bg-mint text-ink',
      emoji: '🔥',
    };
  }
  if (safeER >= 2.0) {
    return {
      status: 'Healthy',
      badgeClass: 'bg-mustard text-ink',
      emoji: '⚡',
    };
  }
  return {
    status: 'Steady',
    badgeClass: 'bg-paper text-ink',
    emoji: '📊',
  };
}

export function BentoCard({ platform, className = '', isFlagship = false }: BentoCardProps) {
  const brand = PLATFORM_BRAND_CONFIG[platform.platform_id] || {
    name: platform.platform_name,
    brandColor: '#1E1E1E',
    badgeBg: 'bg-ink',
    accentBg: 'bg-paper',
    metricLabel: 'Followers',
  };

  // Metric sanitization
  const safeFollowers = Math.max(0, platform.followers_count || 0);
  const safeAvgViews = Math.max(0, platform.avg_views || 0);
  const safeAvgLikes = Math.max(0, platform.avg_likes || 0);
  const safeAvgComments = Math.max(0, platform.avg_comments || 0);
  const safeER = Math.max(0, platform.engagement_rate || 0);

  // Sanitized profile URL & normalized handle
  const rawUrl = platform.profile_url || `https://${platform.platform_id}.com`;
  const sanitizedUrl = encodeURI(rawUrl.trim());
  const rawHandle = platform.handle || 'sumbar_terkini';
  const normalizedHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;

  const erBadge = getErStatus(safeER);

  return (
    <div
      className={cn(
        'neo-card bg-white rounded-neo border-2 border-ink shadow-neo p-5 sm:p-6',
        'flex flex-col justify-between transition-all duration-200',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg',
        className
      )}
    >
      <div>
        {/* Top Bar: Platform Identity + Live Sync Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl border-2 border-ink shadow-neo-sm flex items-center justify-center text-white',
                brand.badgeBg
              )}
            >
              <PlatformIcon platform={platform.platform_id} size={22} className="text-white" />
            </div>

            <div className="min-w-0">
              <h3 className="font-black text-lg text-ink leading-tight truncate">
                {brand.name}
              </h3>
              <a
                href={sanitizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink/70 hover:text-ink hover:underline flex items-center gap-1 group"
                title={`Kunjungi profil ${normalizedHandle}`}
              >
                <span className="truncate">{normalizedHandle}</span>
                <ExternalLinkIcon
                  size={12}
                  className="opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </a>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex-shrink-0">
            {platform.sync_mode === 'AUTO_API' ? (
              <span className="neo-badge text-[10px] bg-mint text-ink py-1 px-2 border border-ink shadow-neo-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                API Sync
              </span>
            ) : (
              <span className="neo-badge text-[10px] bg-paper text-ink py-1 px-2 border border-ink shadow-neo-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink/60" />
                Manual
              </span>
            )}
          </div>
        </div>

        {/* Primary Metric: Follower/Subscriber Count with Rolling Odometer */}
        <div className="p-4 bg-paper/60 rounded-xl border-2 border-ink mb-4 shadow-neo-sm">
          <div className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-1">
            {brand.metricLabel}
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-3xl sm:text-4xl font-black text-ink">
              <RollingOdometer value={safeFollowers} format="standard" />
            </div>

            {/* Engagement Rate Badge */}
            <div
              className={cn(
                'neo-badge text-xs py-1 px-2.5 border-2 border-ink shadow-neo-sm',
                erBadge.badgeClass
              )}
              title={`Tingkat Interaksi: ${safeER.toFixed(2)}%`}
            >
              <span className="mr-1">{erBadge.emoji}</span>
              <span className="font-mono font-bold mr-1">{safeER.toFixed(2)}% ER</span>
              <span className="hidden sm:inline">({erBadge.status})</span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Grid: Views, Likes, Comments */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <EyeIcon size={11} className="text-ink" />
              Avg Views
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgViews} format="compact" />
            </div>
          </div>

          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <HeartIcon size={11} className="text-ink" />
              Avg Likes
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgLikes} format="compact" />
            </div>
          </div>

          <div className="p-2.5 bg-paper/40 rounded-lg border border-ink/40">
            <div className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <MessageSquareIcon size={11} className="text-ink" />
              Comments
            </div>
            <div className="text-sm font-mono font-black text-ink truncate">
              <RollingOdometer value={safeAvgComments} format="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Demographics Display (Active for IG & TikTok) */}
      {isFlagship && platform.demographics && (
        <div className="pt-3 border-t-2 border-ink/20 mt-2">
          <DemographicsBar
            gender={platform.demographics.gender}
            topCities={platform.demographics.top_cities}
            compact={false}
          />
        </div>
      )}
    </div>
  );
}
```

---

### 3.5 Component 5: `src/components/socials/BentoGrid.tsx`

#### Architectural Principles:
1. **Asymmetric 12-Column Responsive Layout**:
   - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6` (conforming to `T1.7.4`).
   - Desktop mapping:
     - Instagram (`lg:col-span-7`): Flagship card with full demographics.
     - TikTok (`lg:col-span-5`): High-engagement video flagship card with demographics.
     - YouTube (`lg:col-span-4`): Channel video reach card.
     - Facebook (`lg:col-span-4`): Community outreach card.
     - X (`lg:col-span-4`): Viral conversation velocity card.
2. **Mobile Ergonomics**:
   - Reflows smoothly to single-column (`grid-cols-1`) on mobile viewports (< 768px).
   - Generous touch targets for profile links (min 44px equivalent).
   - Zero horizontal overflow (`max-w-full`).
3. **Aggregated Audience Summary Bar**:
   - Shows dynamic network-wide total followers, aggregate average ER, and count of live active channels.
4. **Empty State Guidance**:
   - If platforms array is empty, renders `"Belum ada platform terdaftar"` (`T2.7.1`).

```tsx
'use client';

import React, { useMemo } from 'react';
import { SocialPlatform, PlatformId } from '@/types';
import { BentoCard } from './BentoCard';
import { RollingOdometer } from './RollingOdometer';
import { UsersIcon, TrendingUpIcon, RefreshCwIcon } from '@/components/ui/Icons';

export interface BentoGridProps {
  platforms: SocialPlatform[];
  className?: string;
}

/**
 * Determines responsive column span classes for each platform card
 */
export function getBentoGridSpan(platformId: PlatformId): string {
  switch (platformId) {
    case 'instagram':
      return 'lg:col-span-7 md:col-span-2 col-span-1';
    case 'tiktok':
      return 'lg:col-span-5 md:col-span-2 col-span-1';
    case 'youtube':
      return 'lg:col-span-4 md:col-span-1 col-span-1';
    case 'facebook':
      return 'lg:col-span-4 md:col-span-1 col-span-1';
    case 'x':
      return 'lg:col-span-4 md:col-span-2 col-span-1';
    default:
      return 'lg:col-span-4 md:col-span-1 col-span-1';
  }
}

export function BentoGrid({ platforms, className = '' }: BentoGridProps) {
  // Empty state handling conforming to test T2.7.1
  if (!platforms || platforms.length === 0) {
    return (
      <div className="neo-card p-8 sm:p-12 text-center bg-white rounded-neo border-2 border-ink shadow-neo my-6">
        <div className="w-16 h-16 rounded-2xl bg-mustard border-2 border-ink shadow-neo flex items-center justify-center mx-auto mb-4 text-2xl">
          📡
        </div>
        <h3 className="text-xl font-black text-ink mb-2">
          Belum ada platform terdaftar
        </h3>
        <p className="text-sm font-medium text-ink/70 max-w-md mx-auto">
          Silakan aktifkan atau tambahkan platform media sosial melalui CMS Admin Dashboard.
        </p>
      </div>
    );
  }

  // Sort platforms by sort_order
  const sortedPlatforms = useMemo(() => {
    return [...platforms].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [platforms]);

  // Aggregated network metrics
  const { totalFollowers, avgNetworkER } = useMemo(() => {
    const total = sortedPlatforms.reduce((sum, p) => sum + (p.followers_count || 0), 0);
    const validErCount = sortedPlatforms.filter((p) => p.engagement_rate > 0).length;
    const erSum = sortedPlatforms.reduce((sum, p) => sum + (p.engagement_rate || 0), 0);
    const avgEr = validErCount > 0 ? Math.round((erSum / validErCount) * 100) / 100 : 0;
    return { totalFollowers: total, avgNetworkER: avgEr };
  }, [sortedPlatforms]);

  return (
    <section className={`my-8 sm:my-12 ${className}`} aria-labelledby="socials-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="neo-badge bg-mint text-ink text-xs mb-2">
            Live Verified Social Metrics
          </div>
          <h2
            id="socials-heading"
            className="text-2xl sm:text-4xl font-black text-ink tracking-tight flex items-center gap-2"
          >
            Multi-Platform Bento Grid
          </h2>
          <p className="text-sm sm:text-base text-ink/80 font-medium mt-1">
            Jangkauan organik lintas platform media sosial terverifikasi Sumbar Terkini.
          </p>
        </div>

        {/* Tactile Summary Banner */}
        <div className="neo-card p-3 sm:p-4 bg-paper rounded-xl border-2 border-ink shadow-neo-sm flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <UsersIcon size={18} className="text-ink" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-ink/60">
                Total Jangkauan
              </div>
              <div className="text-lg font-mono font-black text-ink">
                <RollingOdometer value={totalFollowers} format="compact" />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-ink/20" />

          <div className="flex items-center gap-2">
            <TrendingUpIcon size={18} className="text-ink" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-ink/60">
                Rata-rata ER
              </div>
              <div className="text-lg font-mono font-black text-ink">
                <RollingOdometer value={avgNetworkER} decimals={2} suffix="%" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric 12-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {sortedPlatforms.map((platform) => {
          const spanClass = getBentoGridSpan(platform.platform_id);
          const isFlagship =
            platform.platform_id === 'instagram' || platform.platform_id === 'tiktok';

          return (
            <div key={platform.id || platform.platform_id} className={spanClass}>
              <BentoCard
                platform={platform}
                isFlagship={isFlagship}
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

## 4. Edge Cases & Boundary Handling Matrix

| Boundary Condition | Edge Scenario | Handling Strategy | Verified Test |
|---|---|---|---|
| **Zero Platforms** | `platforms = []` | Render Neo-Brutalist empty state with `"Belum ada platform terdaftar"` message | `T2.7.1` |
| **Zero Followers** | `followers_count = 0` | Odometer renders steady `0`, ER calculation returns `0` without division by zero | `T2.7.2`, `T2.8.1` |
| **Negative Metrics** | `followers_count = -500` | Normalized via `Math.max(0, val)` before display and formatting | `T2.7.3` |
| **Malformed Handle** | `handle = "sumbar_terkini"` | Normalized with leading `@` -> `"@sumbar_terkini"` | `T2.7.4` |
| **Unsafe Profile URL** | Contains spaces or raw characters | Sanitized with `encodeURI(url.trim())` | `T2.7.5` |
| **Gender Imbalance** | `male: 30, female: 60` (sum 90) | Proportionally normalized to 100% (`normMale + normFemale === 100`) | `T2.9.3` |
| **Empty Top Cities** | `top_cities = []` | Displays `"Data Belum Tersedia"` fallback placeholder | `T2.9.4` |
| **Single City 100%** | `percentage = 100` or `150` | Progress bar clamped cleanly between 0% and 100% (`Math.min(Math.max(p, 0), 100)`) | `T2.9.5` |
| **Reduced Motion** | User has `prefers-reduced-motion` | Odometer skips CSS transition and sets `transitionDuration: 0s` | A11y Standards |
| **Rapid Oscillation** | Value changes repeatedly | Target translateY translates directly to final resting state | `T2.8.5` |

---

## 5. Step-by-Step Implementation Guide for Worker

The worker agent should execute the following steps in sequence:

### Step 1: Create `src/components/ui/Icons.tsx`
- Implement official Simple Icons inline SVGs: `InstagramIcon`, `TikTokIcon`, `YouTubeIcon`, `FacebookIcon`, `XIcon`.
- Implement `PlatformIcon` resolver.
- Implement stroke-based Neo-Brutalist UI icons: `ExternalLinkIcon`, `TrendingUpIcon`, `UsersIcon`, `EyeIcon`, `HeartIcon`, `MessageSquareIcon`, `MapPinIcon`.
- Verify no TypeScript or ESLint errors.

### Step 2: Create `src/components/socials/RollingOdometer.tsx`
- Implement `formatOdometerValue` helper supporting standard localized numbers, compact notation (`1.2M`, `854K`), and negative values.
- Implement `DigitReel` with vertical translation `translateY(-digit * 10%)`, duration 0.8s, cubic-bezier neo-spring ease, and Space Mono font.
- Implement `prefers-reduced-motion` listener.
- Add ARIA accessibility labels (`role="text"`, `aria-label`).

### Step 3: Create `src/components/socials/DemographicsBar.tsx`
- Implement `normalizeGenderPercentages` ensuring strict 100% sum.
- Implement dual-colored gender progress bar (Coral `#EF476F` Female, Mint `#06D6A0` Male).
- Implement West Sumatra top cities distribution with clamped percentage bars and `"Data Belum Tersedia"` empty state fallback.

### Step 4: Create `src/components/socials/BentoCard.tsx`
- Implement brand configuration dictionary mapping official colors and badge styles.
- Implement `getErStatus` helper (Viral Maker >= 4%, Healthy 2-4%, Steady < 2%).
- Integrate `RollingOdometer` for followers, views, likes, comments.
- Integrate `DemographicsBar` for flagship platforms (Instagram, TikTok).
- Integrate sanitized external profile links (`encodeURI`) and normalized handles.

### Step 5: Create `src/components/socials/BentoGrid.tsx`
- Implement asymmetric 12-column responsive layout (`lg:col-span-7` Instagram, `lg:col-span-5` TikTok, `lg:col-span-4` YouTube, Facebook, X).
- Implement responsive collapse: `grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6`.
- Implement aggregated network summary bar (Total Followers, Average ER).
- Implement empty state fallback for zero platforms.

### Step 6: Integrate with `src/app/page.tsx`
- Import `BentoGrid` into `src/app/page.tsx` replacing the temporary placeholder.
- Pass `platforms` fetched from `repository.getSocialPlatforms()`.

### Step 7: Static & Dynamic Verification
- Run `npm run typecheck` (`tsc --noEmit`).
- Run `npm run lint`.
- Run full test suite: `npm test` (`npx tsx tests/e2e/runner.ts`).
- Run unit and adversarial suites: `npm run test:unit && npm run test:adversarial`.
- Run `npm run build` to verify production Next.js build.

---

## 6. Anti-Slop & Design System Audit

1. **Colors**: Strict usage of Warm Paper `#FAF8F5`, Dark Ink `#1E1E1E`, Mustard `#FFD166`, Coral `#EF476F`, Mint `#06D6A0`. Zero generic purple/neon gradients.
2. **Typography**: Space Mono exclusively for tabular numeric figures and odometer reels, Plus Jakarta Sans for UI copy. Zero generic Inter defaults.
3. **Neo-Brutalism Tactility**: `2px solid #1E1E1E` borders, `4px 4px 0px #1E1E1E` hard drop shadows, physical micro-press offsets.
4. **Layout**: True asymmetric hierarchy based on real reach, collapsing to mobile-first vertical stack without horizontal clipping.
5. **Code Quality**: Zero `// TODO`, zero `any`, strict TypeScript types, 100% test contract compliance.
