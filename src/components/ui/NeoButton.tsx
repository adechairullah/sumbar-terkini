'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'mint' | 'coral' | 'paper' | 'white' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-mustard text-ink hover:bg-mustard-hover',
      mint: 'bg-mint text-ink hover:bg-mint-hover',
      coral: 'bg-coral text-ink hover:bg-coral-hover',
      paper: 'bg-paper text-ink hover:bg-paper/80',
      white: 'bg-white text-ink hover:bg-paper',
      ink: 'bg-ink text-paper hover:bg-ink/90',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[36px]',
      md: 'px-4 py-2.5 text-sm sm:text-base rounded-xl min-h-[44px]',
      lg: 'px-6 py-3.5 text-base sm:text-lg rounded-xl min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'neo-button font-bold text-center select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeoButton.displayName = 'NeoButton';

