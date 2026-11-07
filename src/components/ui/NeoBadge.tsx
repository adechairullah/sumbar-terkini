import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mustard' | 'mint' | 'coral' | 'paper' | 'white' | 'ink';
  size?: 'sm' | 'md';
}

export function NeoBadge({
  className,
  variant = 'mustard',
  size = 'md',
  children,
  ...props
}: NeoBadgeProps) {
  const variantStyles = {
    mustard: 'bg-mustard text-ink',
    mint: 'bg-mint text-ink',
    coral: 'bg-coral text-ink',
    paper: 'bg-paper text-ink',
    white: 'bg-white text-ink',
    ink: 'bg-ink text-paper',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-mono font-bold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-mono font-bold',
  };

  return (
    <span
      className={cn(
        'neo-badge inline-flex items-center select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

