import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function NeoCard({
  className,
  interactive = false,
  children,
  ...props
}: NeoCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-ink shadow-neo',
        interactive ? 'neo-card-interactive' : 'neo-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

