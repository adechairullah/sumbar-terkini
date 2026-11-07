'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionType, VisitorReaction } from '@/types';
import { repository } from '@/lib/data/repository';
import { Flame, Sparkles, Zap, Radio } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ParticleMoodClickerProps {
  initialReactions?: VisitorReaction[];
  title?: string;
  liveBadge?: string;
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
  fire: { emoji: '🔥', label: 'Hype Minang', activeColor: '#FFD166' },
  rocket: { emoji: '🚀', label: 'FYP Viral', activeColor: '#06D6A0' },
  heart: { emoji: '❤️', label: 'Brand Love', activeColor: '#EF476F' },
};

export function ParticleMoodClicker({
  initialReactions = [],
  title = 'Live Audience Pulse & Community Energy',
  liveBadge = '2.8k Audiens Aktif',
  className,
}: ParticleMoodClickerProps) {
  // Initialize local reactive state
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
  const [lastCheerText, setLastCheerText] = React.useState<string>('Komunitas sedang aktif memberikan dukungan!');

  // Hydrate from repository and subscribe to Realtime / Cross-Tab updates
  React.useEffect(() => {
    let isMounted = true;

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

  // Click handler with optimistic increment, particle burst, and auto-cleanup
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

    // Update live banner text
    if (type === 'fire') setLastCheerText('🔥 Hype Minang baru saja dikirimkan!');
    if (type === 'rocket') setLastCheerText('🚀 FYP Boost meluncur!');
    if (type === 'heart') setLastCheerText('❤️ Brand Love bertambah!');

    // Spawn 5 ascending burst particles
    const timestamp = Date.now();
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${type}-${timestamp}-${Math.random().toString(36).slice(2, 7)}-${i}`,
      emoji: config.emoji,
      x: (Math.random() - 0.5) * 50,
      y: -65 - Math.random() * 45,
      rotation: (Math.random() - 0.5) * 35,
      scale: 1.1 + Math.random() * 0.35,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      const idsToRemove = new Set(newParticles.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, 800);

    repository.incrementReaction(type).catch((err) => {
      console.error('Reaction increment sync error:', err);
    });
  };

  const reactionKeys: ReactionType[] = ['fire', 'rocket', 'heart'];
  const totalReactions = (counts.fire ?? 0) + (counts.rocket ?? 0) + (counts.heart ?? 0);
  const hypeScore = Math.min(99.4, Math.max(76.5, Number((((counts.fire ?? 0) + (counts.rocket ?? 0)) % 25 + 75).toFixed(1))));

  return (
    <div
      className={cn(
        'neo-card p-3.5 sm:p-4 bg-paper rounded-2xl flex flex-col justify-between relative select-none border-2 border-ink shadow-neo-sm overflow-hidden gap-3',
        className
      )}
    >
      {/* Top Bar: Pulsing Live Indicator & Total Counter */}
      <div className="flex items-center justify-between w-full pb-2 border-b border-ink/10 gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-ink uppercase tracking-wider truncate">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-ink/30 text-ink/80 shadow-neo-xs shrink-0">
          {liveBadge}
        </span>
      </div>

      {/* Speedometer Gauge & Live Energy Level */}
      <div className="bg-white p-2.5 rounded-xl border border-ink/30 shadow-neo-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-ink/70 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-coral fill-coral" />
            <span>Community Vibe Meter:</span>
          </span>
          <span className="font-black text-ink">{hypeScore}% HYPER ACTIVE</span>
        </div>

        {/* Visual Progress Meter */}
        <div className="w-full h-2.5 bg-paper border border-ink/40 rounded-full overflow-hidden p-0.5">
          <motion.div
            className="h-full bg-mustard rounded-full border border-ink/20"
            initial={{ width: 0 }}
            animate={{ width: `${hypeScore}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-ink/60 pt-0.5">
          <span>{totalReactions.toLocaleString('id-ID')} Total Respon</span>
          <span>Interaksi Warga Minang Terverifikasi</span>
        </div>
      </div>

      {/* 3 Primary Reaction Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {reactionKeys.map((type) => {
          const config = REACTION_CONFIG[type];
          const count = counts[type] ?? 0;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleClick(type)}
              aria-label={`Beri reaksi ${config.emoji} (${count.toLocaleString('id-ID')} reaksi)`}
              className={cn(
                'min-w-[56px] min-h-[56px] p-2 rounded-xl',
                'bg-white border-2 border-ink shadow-neo-xs',
                'hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]',
                'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
                'transition-all duration-75 flex flex-col items-center justify-center gap-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
              )}
            >
              <span className="text-xl sm:text-2xl leading-none" aria-hidden="true">
                {config.emoji}
              </span>
              <span className="font-mono font-black text-xs text-ink leading-tight">
                {count.toLocaleString('id-ID')}
              </span>
              <span className="text-[9px] uppercase font-mono font-bold text-ink/70 leading-none">
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Activity Ticker */}
      <div className="px-2.5 py-1.5 rounded-lg bg-mustard/30 border border-ink/20 flex items-center justify-between text-[10px] font-mono text-ink/80">
        <span className="truncate">{lastCheerText}</span>
        <Zap className="w-3 h-3 text-ink shrink-0 ml-1" />
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
