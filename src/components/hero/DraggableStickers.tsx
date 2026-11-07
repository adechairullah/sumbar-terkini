'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StickerItem } from '@/types';
import { cn } from '@/lib/utils/cn';

export interface DraggableStickersProps {
  stickers?: StickerItem[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const DEFAULT_COLORS = ['#FFD166', '#06D6A0', '#EF476F', '#FAF8F5'];

export function truncateStickerText(text: string, maxLen: number = 24): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

export function normalizeRotation(deg: number): number {
  if (typeof deg !== 'number' || isNaN(deg)) return 0;
  const mod = ((deg % 360) + 360) % 360;
  return mod > 180 ? mod - 360 : mod;
}

export function DraggableStickers({
  stickers = [],
  containerRef,
  className,
}: DraggableStickersProps) {
  const shouldReduceMotion = useReducedMotion();
  const localRef = React.useRef<HTMLDivElement>(null);
  const activeContainer = containerRef || localRef;

  // Boundary clamp: max 20 stickers
  const sanitizedStickers = React.useMemo(() => {
    return stickers.slice(0, 20);
  }, [stickers]);

  if (sanitizedStickers.length === 0) {
    return <div ref={localRef} className="empty-stickers-container" />;
  }

  return (
    <div
      ref={localRef}
      className={cn(
        'relative grid grid-cols-2 gap-2 items-center select-none w-full py-0.5',
        className
      )}
    >
      {sanitizedStickers.map((sticker, idx) => {
        const bg = sticker.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
        const rawRot = sticker.rotation ?? 0;
        const displayRot = normalizeRotation(rawRot);

        return (
          <motion.div
            key={sticker.id || `stk-${idx}`}
            drag={!shouldReduceMotion}
            dragSnapToOrigin={true}
            dragConstraints={activeContainer}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{ scale: 1.05, rotate: 0, zIndex: 40 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ rotate: displayRot === 0 ? 0 : displayRot }}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl',
              'border-2 border-ink shadow-neo-xs text-ink font-mono font-bold text-xs',
              'select-none touch-none cursor-grab active:cursor-grabbing truncate',
              'min-h-[44px] w-full transition-shadow'
            )}
            style={{ backgroundColor: bg }}
            title={sticker.text}
          >
            <span className="text-base leading-none shrink-0" aria-hidden="true">
              {sticker.emoji}
            </span>
            <span className="truncate font-sans font-black text-[11px] sm:text-xs text-ink">
              {truncateStickerText(sticker.text, 20)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
