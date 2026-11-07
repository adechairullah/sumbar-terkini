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

