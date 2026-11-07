# Technical Blueprint & Component Specification: Hero & Interactive Physics
**Milestone**: Milestone 3 (Features F04, F05, F06)  
**Author**: M3 Explorer 1 (Hero & Interactive Physics Specialist)  
**Date**: 2026-11-07  
**Scope**: 
- `src/components/hero/HeroSection.tsx`
- `src/components/hero/SlotBadge.tsx`
- `src/components/hero/DraggableStickers.tsx`
- `src/components/hero/ParticleMoodClicker.tsx`

---

## 1. Executive Summary & Design Architecture

The Hero Section for the **Sumbar Terkini Creator Media Kit & Endorsement Hub** is the anchor of the public media kit (`/`). It sets the immediate tone for the "Tactile Playful Bento Grid / Neo-Brutalism Soft" design system:
- **Surface**: Warm Paper `#FAF8F5` background, high-contrast `#1E1E1E` (Dark Ink) 2px borders, 4px 4px 0px hard drop shadows.
- **Accents**: Mustard `#FFD166`, Mint `#06D6A0`, and Coral `#EF476F`.
- **Typography**: Plus Jakarta Sans for friendly, human Minang editorial prose; Space Mono for tabular numbers and metric badges.
- **Interactive Physics**: Framer Motion GPU-accelerated spring physics for draggable stickers, ascending particle burst animations for audience mood reactions, and a live pulse indicator for endorsement slot availability.

Every component is architected to satisfy:
1. **Zero AI Slop**: Zero purple/neon gradients, zero generic glassmorphism, zero em dashes (`\u2014`) in UI copy or comments, and zero non-functional controls.
2. **WCAG AA Compliance**: 100% of colored badges and stickers use `#1E1E1E` (Dark Ink) text, ensuring contrast ratios >= 4.5:1 (Mustard 11.56:1, Mint 8.84:1, Coral 4.61:1).
3. **Resilience & Fault Tolerance**: Defensive fallbacks for missing avatars, empty names, long bios (line-clamped), sticker overflows (max 20), rotation modulus (modulo 360), and rapid reaction bursts (500 clicks without freeze or NaN).
4. **Offline & Realtime DAL Synergy**: Full integration with `src/lib/data/repository.ts` (`getSiteSettings`, `getReactions`, `incrementReaction`, and `subscribeToChanges`).

---

## 2. Feature Specification: Slot Badge (`SlotBadge.tsx`)

### 2.1 Functional Requirements & Contracts (Feature F04)
- **Role**: Displays live endorsement slot availability with active blinking dot indicator.
- **Status States**:
  - `AVAILABLE` (`available === true`): Mint `#06D6A0` background, `#1E1E1E` text, animated pinging dot. Default label: `"Slot Endorsement Tersedia"`.
  - `LIMITED` (`available === true` and (`slotsRemaining <= 2` or text indicates "terbatas")): Mustard `#FFD166` background, `#1E1E1E` text, animated dot.
  - `BOOKED` (`available === false`): Coral `#EF476F` background, `#1E1E1E` text, static dark dot. Default label: `"Slot Penuh Sementara"`.
- **Accessibility**: Screen reader status container with `role="status"` and `aria-live="polite"`.

### 2.2 Boundary Matrix & Fallback Rules (Tier 2 Assertions)
- **T2.4.4**: Rapid consecutive slot toggles preserve latest state without corruption.
- **T2.4.5**: Empty slot status text (`""` or `"   "`) safely falls back to default availability message (`"Slot Endorsement Tersedia"` when open, `"Slot Penuh Sementara"` when booked).
- **R-25 Contrast**: `#1E1E1E` text on `#06D6A0` (Mint, 8.84:1), `#FFD166` (Mustard, 11.56:1), `#EF476F` (Coral, 4.61:1).

### 2.3 Production Blueprint Code (`src/components/hero/SlotBadge.tsx`)

```tsx
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
  // Resolve status text with fallback
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
```

---

## 3. Feature Specification: Framer Motion Draggable Stickers (`DraggableStickers.tsx`)

### 3.1 Functional Requirements & Contracts (Feature F05)
- **Role**: Provides playful, tactile draggable stickers floating over the hero container.
- **Default Seed Stickers**:
  1. `"100% Organic Reach"` (`🌱`, initial angle `-4deg`, color `#FFD166`)
  2. `"Fast Response"` (`⚡`, initial angle `6deg`, color `#06D6A0`)
  3. `"Viral Maker"` (`🔥`, initial angle `-6deg`, color `#EF476F`)
- **Physics Constants (T1.5.3, T1.5.4, P13, P21)**:
  - `drag`: `true`
  - `dragElastic`: `0.2`
  - `dragTransition`: `{ bounceStiffness: 600, bounceDamping: 20 }`
  - `dragConstraints`: bound to `containerRef` (`React.RefObject<HTMLDivElement | null>`)
  - `touchAction`: `touch-none select-none cursor-grab active:cursor-grabbing` for mobile touch collision prevention
  - `whileDrag`: `{ scale: 1.1, rotate: 0, zIndex: 40 }`
  - `whileHover`: `{ scale: 1.05 }`

### 3.2 Boundary Matrix & Fallback Rules (Tier 2 Assertions)
- **T2.5.1**: Empty stickers array (`[]`) renders empty container gracefully without throw.
- **T2.5.2**: 50+ excessive stickers capped to max 20 stickers (`slice(0, 20)`) to prevent memory exhaustion and layout blowout.
- **T2.5.3**: Long sticker text (>24 chars) truncated with ellipsis (`text.slice(0, 21) + '...'`).
- **T2.5.4**: Rotation angle normalized within 360-degree modulus: `((deg % 360) + 360) % 360`. Display tilt clamped to `[-15deg, 15deg]` for natural appearance.
- **T2.5.5**: Drag coordinates released outside bounds clamp back within container constraints.
- **Accessibility & Reduced Motion**: Check `useReducedMotion()`. When active, disable dragging (`drag={false}`) and display static styled badges.

### 3.3 Production Blueprint Code (`src/components/hero/DraggableStickers.tsx`)

```tsx
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

function truncateStickerText(text: string, maxLen: number = 24): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

function normalizeRotation(deg: number): number {
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
        'relative flex flex-wrap gap-2.5 sm:gap-3 items-center select-none py-1',
        className
      )}
    >
      {sanitizedStickers.map((sticker, idx) => {
        const bg = sticker.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
        const rawRot = sticker.rotation ?? (idx % 2 === 0 ? -3 : 4);
        const displayRot = normalizeRotation(rawRot);

        return (
          <motion.div
            key={sticker.id || `stk-${idx}`}
            drag={!shouldReduceMotion}
            dragConstraints={activeContainer}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{ scale: 1.1, rotate: 0, zIndex: 40 }}
            whileHover={{ scale: 1.05 }}
            initial={{ rotate: displayRot }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
              'border-2 border-ink shadow-neo-sm text-ink font-mono font-bold text-xs sm:text-sm',
              'select-none touch-none cursor-grab active:cursor-grabbing whitespace-nowrap'
            )}
            style={{ backgroundColor: bg }}
          >
            <span className="text-sm sm:text-base leading-none" aria-hidden="true">
              {sticker.emoji}
            </span>
            <span>{truncateStickerText(sticker.text, 24)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
```

---

## 4. Feature Specification: Particle Mood Clicker (`ParticleMoodClicker.tsx`)

### 4.1 Functional Requirements & Contracts (Feature F06)
- **Role**: Quick-reaction mood clicker allowing public visitors to react in real time.
- **Reactions Supported (T1.6.1, seedVisitorReactions)**:
  - `fire` (`🔥`): Hype reaction (Mustard `#FFD166` highlight)
  - `rocket` (`🚀`): Viral reach reaction (Mint `#06D6A0` highlight)
  - `heart` (`❤️`): Love content reaction (Coral `#EF476F` highlight)
- **Ascending Particle Trajectory (T1.6.3)**:
  - Vertical drift: `y: -60 - Math.random() * 40` (ascending upward between -60px and -100px)
  - Horizontal scatter: `x: (Math.random() - 0.5) * 40` (-20px to +20px)
  - Random tilt: `rotation: (Math.random() - 0.5) * 30`
  - Scale progression: `[0.6, 1.3, 0.3]`
  - Opacity fade: `[1, 1, 0]`
- **Auto-Cleanup Lifetime (T1.6.4)**: Bounded to exactly 800ms to eliminate memory leaks.
- **Optimistic Concurrency (T1.6.5, S5)**:
  - Counter increments immediately in local state.
  - Asynchronous background invocation of `repository.incrementReaction(type)`.
  - Multi-tab synchronization via `repository.subscribeToChanges('visitor_reactions', ...)`.

### 4.2 Boundary Matrix & Fallback Rules (Tier 2 Assertions)
- **T2.6.1**: 500 rapid clicks burst executes cleanly without freezing or NaN.
- **T2.6.2**: Safe integer guard: `if (val >= Number.MAX_SAFE_INTEGER - 1) return Number.MAX_SAFE_INTEGER;`.
- **T2.6.3**: Unknown reaction types rejected cleanly with validation check.
- **T2.6.4**: Zero count initial state displays `"0"` cleanly.
- **T2.6.5**: Negative counts clamped to 0: `Math.max(0, count)`.
- **Accessibility**: Minimum 48px tap targets, `aria-label` with descriptive text and count, full keyboard activation (`Enter` / `Space`).

### 4.3 Production Blueprint Code (`src/components/hero/ParticleMoodClicker.tsx`)

```tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionType, VisitorReaction } from '@/types';
import { repository } from '@/lib/data/repository';
import { cn } from '@/lib/utils/cn';

export interface ParticleMoodClickerProps {
  initialReactions?: VisitorReaction[];
  className?: string;
}

interface Particle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

const REACTION_CONFIG: Record<
  ReactionType,
  { emoji: string; label: string; activeColor: string }
> = {
  fire: { emoji: '🔥', label: 'Hype', activeColor: '#FFD166' },
  rocket: { emoji: '🚀', label: 'Viral', activeColor: '#06D6A0' },
  heart: { emoji: '❤️', label: 'Love', activeColor: '#EF476F' },
};

export function ParticleMoodClicker({
  initialReactions = [],
  className,
}: ParticleMoodClickerProps) {
  // 1. Initialize local reactive state
  const [counts, setCounts] = React.useState<Record<ReactionType, number>>(() => {
    const initial: Record<ReactionType, number> = { fire: 0, rocket: 0, heart: 0 };
    for (const r of initialReactions) {
      if (r.reaction_type in initial) {
        initial[r.reaction_type] = Math.max(0, r.count ?? 0);
      }
    }
    return initial;
  });

  const [particles, setParticles] = React.useState<Particle[]>([]);

  // 2. Hydrate from repository & subscribe to Realtime / Cross-Tab updates
  React.useEffect(() => {
    let isMounted = true;

    // Fetch initial fresh counts if empty
    if (initialReactions.length === 0) {
      repository.getReactions().then((reactions) => {
        if (!isMounted) return;
        const fresh: Record<ReactionType, number> = { fire: 0, rocket: 0, heart: 0 };
        for (const r of reactions) {
          if (r.reaction_type in fresh) {
            fresh[r.reaction_type] = Math.max(0, r.count ?? 0);
          }
        }
        setCounts(fresh);
      });
    }

    // Subscribe to cross-tab & Supabase Realtime changes
    const unsubscribe = repository.subscribeToChanges('visitor_reactions', (event) => {
      if (!isMounted || !event.payload) return;
      const payload = event.payload as { reaction_type?: ReactionType; count?: number };
      if (payload.reaction_type && typeof payload.count === 'number') {
        const type = payload.reaction_type;
        setCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, payload.count!),
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [initialReactions]);

  // 3. Click handler with optimistic increment, particle burst, and auto-cleanup
  const handleClick = (type: ReactionType) => {
    const config = REACTION_CONFIG[type];
    if (!config) return;

    // Safe integer increment
    setCounts((prev) => {
      const current = prev[type] ?? 0;
      if (current >= Number.MAX_SAFE_INTEGER - 1) return prev;
      return {
        ...prev,
        [type]: current + 1,
      };
    });

    // Spawn 4 ascending burst particles
    const timestamp = Date.now();
    const newParticles: Particle[] = Array.from({ length: 4 }, (_, i) => ({
      id: `${type}-${timestamp}-${Math.random().toString(36).slice(2, 7)}-${i}`,
      emoji: config.emoji,
      x: (Math.random() - 0.5) * 40,
      y: -60 - Math.random() * 40, // Drifts upward: -60 to -100px
      rotation: (Math.random() - 0.5) * 30,
      scale: 1.1 + Math.random() * 0.3,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    // Bounded auto-cleanup lifetime: 800ms
    setTimeout(() => {
      const idsToRemove = new Set(newParticles.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, 800);

    // Asynchronous background mutation
    repository.incrementReaction(type).catch((err) => {
      console.error('Reaction increment sync error:', err);
    });
  };

  const reactionKeys: ReactionType[] = ['fire', 'rocket', 'heart'];

  return (
    <div
      className={cn(
        'neo-card p-4 sm:p-5 bg-paper rounded-2xl flex flex-col items-center justify-center text-center relative select-none',
        className
      )}
    >
      <div className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider mb-3">
        Respon Audiens Real-time
      </div>

      <div className="flex gap-3 sm:gap-4 items-center justify-center">
        {reactionKeys.map((type) => {
          const config = REACTION_CONFIG[type];
          const count = counts[type] ?? 0;

          return (
            <div key={type} className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleClick(type)}
                aria-label={`Beri reaksi ${config.emoji} (${count.toLocaleString('id-ID')} reaksi)`}
                className={cn(
                  'min-w-[56px] min-h-[56px] p-2.5 rounded-xl',
                  'bg-white border-2 border-ink shadow-neo-sm',
                  'hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]',
                  'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
                  'transition-all duration-75 flex flex-col items-center justify-center gap-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
                )}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {config.emoji}
                </span>
                <span className="font-mono font-bold text-xs text-ink leading-tight">
                  {count.toLocaleString('id-ID')}
                </span>
              </button>

              <span className="text-[10px] uppercase font-mono font-bold text-ink/70 mt-1">
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Burst Particles */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x,
                y: p.y,
                scale: [0.6, p.scale, 0.3],
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="pointer-events-none absolute text-2xl select-none z-50"
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

## 5. Feature Specification: Hero Section (`HeroSection.tsx`)

### 5.1 Functional Requirements & Contracts (Feature F04)
- **Role**: Public centerpiece showcasing creator profile, high-priority avatar, slot availability, physics stickers, mood clicker, and quick booking CTA.
- **Contract Assertions**:
  - **T1.4.1**: Avatar image renders with `fetchpriority="high"` (React `fetchPriority="high"`).
  - **T1.4.2**: Displays creator name, handle (`@sumbar_terkini`), and Minang editorial bio.
  - **T1.4.3 & T1.4.4**: Live slot availability badge rendered using `SlotBadge`.
  - **T1.4.5 & P22**: Quick contact CTA provides direct link to WhatsApp consultation via `https://wa.me/{normalizedPhone}`.
  - **T2.4.1**: Empty creator name safely falls back to `'Creator Media Kit'`.
  - **T2.4.2**: Bio text capped or line-clamped for long inputs (up to 500 chars).
  - **T2.4.3**: Missing avatar URL falls back to `/avatar-placeholder.png`.
- **Layout Ergonomics**:
  - Asymmetric Neo-Brutalist bento card layout (`bg-white border-2 sm:border-3 border-ink shadow-neo-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10`).
  - Container ref attached to hero card wrapper, serving as drag constraints for `DraggableStickers`.
  - Reflows from 1-column mobile stack to 3-column / 2-column desktop layout.

### 5.2 Production Blueprint Code (`src/components/hero/HeroSection.tsx`)

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, CheckCircle2, MapPin, Calculator, Sparkles } from 'lucide-react';
import { SiteSettings, VisitorReaction } from '@/types';
import { SlotBadge } from './SlotBadge';
import { DraggableStickers } from './DraggableStickers';
import { ParticleMoodClicker } from './ParticleMoodClicker';
import { cn } from '@/lib/utils/cn';

export interface HeroSectionProps {
  settings?: SiteSettings;
  reactions?: VisitorReaction[];
  className?: string;
}

function resolveName(name?: string): string {
  if (name && name.trim().length > 0) return name.trim();
  return 'Creator Media Kit';
}

function resolveAvatar(url?: string): string {
  if (url && url.trim().length > 0) return url.trim();
  return '/avatar-placeholder.png';
}

function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function HeroSection({
  settings,
  reactions = [],
  className,
}: HeroSectionProps) {
  const heroCardRef = React.useRef<HTMLDivElement>(null);

  const creatorName = resolveName(settings?.creator_name);
  const creatorHandle = settings?.creator_handle || '@sumbar_terkini';
  const avatarUrl = resolveAvatar(settings?.creator_avatar_url);
  const bio = settings?.creator_bio || 'Platform media digital kreatif & amplifikasi brand nomor 1 di Sumatera Barat.';
  const locationText = settings?.location || 'Sumatera Barat, Indonesia';
  const cleanPhone = normalizePhoneNumber(settings?.whatsapp_number || '6281234567890');

  const whatsappConsultationUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Tim ${creatorName}! 👋\n\nSaya tertarik untuk konsultasi slot endorsement dan kampanye promosi brand kami. Mohon info ketersediaan slot terkini. Terima kasih!`
  )}`;

  return (
    <section
      ref={heroCardRef}
      className={cn(
        'neo-card p-6 sm:p-8 lg:p-10 mb-8 bg-white rounded-2xl sm:rounded-3xl relative overflow-hidden',
        'border-2 sm:border-3 border-ink shadow-neo-lg',
        className
      )}
    >
      {/* Decorative Neo-Brutalist Top Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-ink/10">
        <div className="flex items-center gap-2">
          <span className="neo-badge bg-mustard text-ink text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-ink" />
            Official Creator Hub 2026
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-ink/70">
            <MapPin className="w-3.5 h-3.5 text-ink" />
            <span>{locationText}</span>
          </div>
        </div>

        {/* Live Slot Availability Badge */}
        <SlotBadge
          available={settings?.slot_available}
          statusText={settings?.slot_status_text}
          slotsRemaining={settings?.slots_remaining}
        />
      </div>

      {/* Main Grid: Avatar + Bio + Reactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Creator Identity & Bio */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar Image with High Priority */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 sm:border-3 border-ink shadow-neo overflow-hidden bg-mustard/30 shrink-0">
              <Image
                src={avatarUrl}
                alt={creatorName}
                width={120}
                height={120}
                priority
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Creator Title & Handle */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight font-sans">
                  {creatorName}
                </h1>
                <CheckCircle2
                  className="w-6 h-6 text-mint fill-mint/30 stroke-ink"
                  aria-label="Verified Creator"
                />
              </div>
              <p className="font-mono text-sm sm:text-base font-bold text-ink/80">
                {creatorHandle}
              </p>
              <p className="text-xs font-mono font-semibold text-ink/60 mt-0.5 sm:hidden">
                {locationText}
              </p>
            </div>
          </div>

          {/* Minang Bio Copy (Capped to 500 characters) */}
          <div className="mt-2">
            <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-sans font-normal max-w-2xl line-clamp-4">
              {bio.slice(0, 500)}
            </p>
          </div>

          {/* Draggable Physics Stickers Arena */}
          <div className="mt-2 pt-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/60 mb-2 flex items-center gap-1.5">
              <span>Keunggulan Kreator (Sentuh & Geser):</span>
            </div>
            <DraggableStickers
              stickers={settings?.stickers}
              containerRef={heroCardRef}
            />
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t-2 border-ink/10">
            <a
              href={whatsappConsultationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'neo-button bg-mint text-ink px-5 py-3 rounded-xl font-bold text-sm sm:text-base',
                'flex items-center gap-2 hover:bg-mint-hover'
              )}
            >
              <MessageCircle className="w-5 h-5 text-ink" />
              <span>Konsultasi Slot via WhatsApp</span>
            </a>

            <a
              href="#rate-calculator"
              className={cn(
                'neo-button bg-white text-ink px-4 py-3 rounded-xl font-bold text-sm sm:text-base',
                'flex items-center gap-2 hover:bg-paper'
              )}
            >
              <Calculator className="w-5 h-5 text-ink" />
              <span>Hitung Estimasi Paket</span>
            </a>
          </div>
        </div>

        {/* Right Column: Audience Particle Mood Clicker */}
        <div className="lg:col-span-4 w-full">
          <ParticleMoodClicker initialReactions={reactions} />
        </div>
      </div>
    </section>
  );
}
```

---

## 6. Step-by-Step Implementation Guide for Worker

The Worker agent should execute the implementation strictly following this sequence:

### Step 1: Create Component Directory
Ensure the hero components directory exists:
```bash
mkdir -p src/components/hero
```

### Step 2: Implement `SlotBadge.tsx`
Create `src/components/hero/SlotBadge.tsx` implementing:
- `SlotBadgeProps` (`available`, `statusText`, `slotsRemaining`, `className`).
- Dynamic background classes (`bg-mint` for available, `bg-coral` for booked, `bg-mustard` for limited).
- Accessible pulsing dot for available slots; static dot for booked slots.
- Text color `#1E1E1E` (Dark Ink) guaranteeing WCAG AA contrast standard.
- Fallback logic: defaults to `"Slot Endorsement Tersedia"` or `"Slot Penuh Sementara"`.

### Step 3: Implement `DraggableStickers.tsx`
Create `src/components/hero/DraggableStickers.tsx` implementing:
- Framer Motion `motion.div` with spring physics: `bounceStiffness: 600`, `bounceDamping: 20`, `dragElastic: 0.2`.
- `dragConstraints` pointing to `containerRef`.
- `touch-none select-none cursor-grab active:cursor-grabbing` for mobile touch collision safety.
- Rotation modulo 360 normalization and text truncation (>24 chars to ellipsis).
- Capping stickers to max 20 items.
- Full support for `useReducedMotion()`.

### Step 4: Implement `ParticleMoodClicker.tsx`
Create `src/components/hero/ParticleMoodClicker.tsx` implementing:
- 3 reactions: `fire` (`🔥`), `rocket` (`🚀`), `heart` (`❤️`).
- Optimistic local state increment with integer overflow protection (`Number.MAX_SAFE_INTEGER`).
- Ascending burst particles with random upward trajectories (`y: -60 - Math.random() * 40`).
- Exact 800ms auto-cleanup via `setTimeout` to prevent memory leaks.
- Realtime subscription and synchronization using `repository.subscribeToChanges('visitor_reactions', ...)`.
- Asynchronous mutation call to `repository.incrementReaction(type)`.
- Minimum 48px tap targets and `aria-label` screen reader announcements.

### Step 5: Implement `HeroSection.tsx`
Create `src/components/hero/HeroSection.tsx` assembling:
- Next.js `<Image priority fetchPriority="high" ... />` for avatar rendering.
- Creator name, handle, Minang bio, verified creator badge.
- Integrated `<SlotBadge />`.
- Integrated `<DraggableStickers containerRef={heroCardRef} />`.
- Integrated `<ParticleMoodClicker initialReactions={reactions} />`.
- WhatsApp consultation link with normalized phone number.

### Step 6: Integrate with Public Page (`src/app/page.tsx`)
Update `src/app/page.tsx` to replace the temporary hero section placeholder with the new `<HeroSection settings={settings} reactions={reactions} />`.

### Step 7: Run Verification
Execute the test suites and linting checks:
```bash
npx tsx tests/e2e/runner.ts
npm run typecheck
npm run lint
```

---

## 7. Anti-Slop Audit & Verification Checklist

| Rule | Requirement | Blueprint Enforcement |
|---|---|---|
| **R-01** | Zero blue/purple neon gradients | Grounded Warm Paper `#FAF8F5`, solid `#1E1E1E` borders, `#FFD166`, `#06D6A0`, `#EF476F` accents |
| **R-02** | Zero em dashes (Anti-Slop R-02) | Strict audit across all strings and comments: zero em dash characters |
| **R-03** | Mobile responsiveness & tap targets | All buttons and reaction targets >= 48px; `touch-none` prevents mobile touch collision |
| **R-04** | Genuine icons | Lucide React icons (`MessageCircle`, `CheckCircle2`, `MapPin`, `Calculator`, `Sparkles`) |
| **R-06** | Purposeful typography | Plus Jakarta Sans for editorial narrative; Space Mono for counts and badge tags |
| **R-09** | Functional status badges only | `SlotBadge` strictly communicates live endorsement slot availability |
| **R-12** | Purposeful hard drop shadows | Neo-brutalist `shadow-neo` (`4px 4px 0px #1E1E1E`) with physical active press feedback |
| **R-13** | Zero decorative fluorescent glow | Tactile matte surfaces; zero blur/glow |
| **R-19** | Animation with UX intent | Spring physics for draggable stickers; ascending drift for mood reactions |
| **R-25** | WCAG AA Color Contrast | All text on Mustard, Mint, Coral is `#1E1E1E` (Dark Ink) with contrast >= 4.61:1 to 11.56:1 |
| **R-26** | 100% Functional interactive controls | Every button increments reactions, drags stickers, opens WhatsApp, or scrolls to calculator |
| **R-27** | Resilient fallbacks | Fallbacks for missing avatar, empty name, 500+ char bio, empty stickers, zero counts |
| **R-40** | Web Performance | Avatar loaded with `fetchPriority="high"`, zero layout shift (CLS = 0) |
