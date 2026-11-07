'use client';

import React from 'react';
import { Sparkles, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TierBadgeProps {
  tierName: string;
  discountPercent: number;
  className?: string;
}

export function TierBadge({ tierName, discountPercent, className }: TierBadgeProps) {
  const getBadgeConfig = () => {
    if (discountPercent >= 10) {
      return {
        bg: 'bg-mint text-ink',
        icon: <Award className="w-3.5 h-3.5 text-ink shrink-0" />,
        label: `${tierName} (Diskon ${discountPercent}%)`,
      };
    }
    if (discountPercent === 5) {
      return {
        bg: 'bg-mustard text-ink',
        icon: <Zap className="w-3.5 h-3.5 text-ink shrink-0" />,
        label: `${tierName} (Diskon ${discountPercent}%)`,
      };
    }
    return {
      bg: 'bg-paper text-ink',
      icon: <Sparkles className="w-3.5 h-3.5 text-ink shrink-0" />,
      label: tierName,
    };
  };

  const config = getBadgeConfig();

  return (
    <span
      className={cn(
        'neo-badge text-xs py-1 px-2.5 border-2 border-ink shadow-neo-sm inline-flex items-center gap-1.5 font-mono font-bold select-none',
        config.bg,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

