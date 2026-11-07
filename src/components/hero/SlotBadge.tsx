'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SlotBadgeProps {
  available?: boolean;
  statusText?: string;
  slotsRemaining?: number;
  className?: string;
}

export function SlotBadge({
  available = true,
  statusText,
  slotsRemaining,
  className,
}: SlotBadgeProps) {
  // Resolve status text with defensive fallback
  const resolvedText = React.useMemo(() => {
    if (statusText && statusText.trim().length > 0) {
      return statusText.trim();
    }
    return available ? 'Slot Endorsement Tersedia' : 'Slot Penuh Sementara';
  }, [statusText, available]);

  // Determine state colors
  const isLimited =
    available &&
    ((slotsRemaining !== undefined && slotsRemaining <= 2) ||
      /terbatas|sisa/i.test(resolvedText));

  const bgClass = !available
    ? 'bg-coral'
    : isLimited
      ? 'bg-mustard'
      : 'bg-mint';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full',
        'border-2 border-ink shadow-neo-sm font-bold text-xs sm:text-sm text-ink select-none',
        bgClass,
        className
      )}
    >
      {available ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ink" />
        </span>
      ) : (
        <span className="h-2.5 w-2.5 rounded-full bg-ink/50 inline-block" />
      )}
      <span>{resolvedText}</span>
    </div>
  );
}

