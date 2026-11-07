'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Volume2,
  VolumeX,
  Flame,
  ArrowRight,
  Hand,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ==============================================================================
// 1. Lightweight Browser-Native Web Audio Synthesizer (0 External MP3 Files)
// ==============================================================================
class TactileSound {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sumbar_sound_fx');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggle(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sumbar_sound_fx', String(this.soundEnabled));
    }
    return this.soundEnabled;
  }

  public playPop() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio not permitted; silent fallback
    }
  }
}

const soundManager = new TactileSound();

// ==============================================================================
// 2. Props Interface
// ==============================================================================
export type InteractiveTab = 'predictor' | 'highfive' | 'stats';

export interface InteractiveBrandPlaygroundProps {
  whatsappNumber?: string;
  creatorName?: string;
  defaultTab?: InteractiveTab;
  title?: string;
  className?: string;
}

export function InteractiveBrandPlayground({
  whatsappNumber = '6281234567890',
  creatorName = 'Sumbar Terkini',
  defaultTab = 'predictor',
  title = 'Kalkulator Potensi Viral FYP & Apresiasi',
  className,
}: InteractiveBrandPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<InteractiveTab>(defaultTab);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tab 1: FYP Predictor State
  const [selectedFormatType, setSelectedFormatType] = useState<'reels' | 'carousel' | 'story'>('reels');
  const [selectedPostingTime, setSelectedPostingTime] = useState<'pagi' | 'siang' | 'malam'>('malam');
  const [selectedHookType, setSelectedHookType] = useState<'komedi' | 'promo' | 'review'>('komedi');

  // Tab 2: High-Five State
  const [highFiveCount, setHighFiveCount] = useState<number>(1842);
  const [hasHighFived, setHasHighFived] = useState<boolean>(false);
  const [highFiveParticles, setHighFiveParticles] = useState<Array<{ id: string; x: number; y: number }>>([]);

  // Audio and storage hydration
  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sumbar_highfive_count');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setHighFiveCount(parsed);
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleToggleSound = () => {
    const next = soundManager.toggle();
    setSoundEnabled(next);
    if (next) soundManager.playPop();
  };

  // ----------------------------------------------------------------------------
  // FYP Predictor Calculations
  // ----------------------------------------------------------------------------
  const calculateViralScore = () => {
    let base = 85.0;
    if (selectedFormatType === 'reels') base += 8.5;
    if (selectedFormatType === 'carousel') base += 5.2;
    if (selectedFormatType === 'story') base += 3.0;

    if (selectedPostingTime === 'malam') base += 5.0;
    if (selectedPostingTime === 'siang') base += 3.2;
    if (selectedPostingTime === 'pagi') base += 2.0;

    if (selectedHookType === 'komedi') base += 4.5;
    if (selectedHookType === 'promo') base += 3.8;
    if (selectedHookType === 'review') base += 4.0;

    return Math.min(99.4, Number(base.toFixed(1)));
  };

  const viralScore = calculateViralScore();

  // ----------------------------------------------------------------------------
  // High-Five Clicker Handler
  // ----------------------------------------------------------------------------
  const handleHighFive = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.playPop();
    const next = highFiveCount + 1;
    setHighFiveCount(next);
    setHasHighFived(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sumbar_highfive_count', String(next));
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const id = `hf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newP = {
      id,
      x: (Math.random() - 0.5) * 40,
      y: -50 - Math.random() * 30,
    };
    setHighFiveParticles((prev) => [...prev, newP]);
    setTimeout(() => {
      setHighFiveParticles((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  };

  return (
    <div
      className={cn(
        'neo-card p-4 sm:p-5 bg-white rounded-2xl relative overflow-hidden',
        'border-2 border-ink shadow-neo transition-all duration-150',
        className
      )}
    >
      {/* Header Bar with Tabs and Sound Toggle */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-ink/10 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('predictor');
              soundManager.playPop();
            }}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1 shrink-0 min-h-[38px]',
              activeTab === 'predictor'
                ? 'bg-mint text-ink border-ink shadow-neo-sm translate-y-[-1px]'
                : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5 text-ink" />
            <span>Prediktor FYP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('highfive');
              soundManager.playPop();
            }}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1 shrink-0 min-h-[38px]',
              activeTab === 'highfive'
                ? 'bg-coral text-ink border-ink shadow-neo-sm translate-y-[-1px]'
                : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
            )}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>High-Five</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('stats');
              soundManager.playPop();
            }}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1 shrink-0 min-h-[38px]',
              activeTab === 'stats'
                ? 'bg-mustard text-ink border-ink shadow-neo-sm translate-y-[-1px]'
                : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
            )}
          >
            <Zap className="w-3.5 h-3.5 text-ink" />
            <span>Kesiapan Slot</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          title={soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
          aria-label={soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
          className={cn(
            'p-1.5 rounded-lg border border-ink/30 text-ink/70 hover:text-ink shrink-0 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center',
            soundEnabled ? 'bg-mustard/40' : 'bg-paper'
          )}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-ink" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-ink/50" />
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PREDIKTOR SKOR FYP & AUDIENS VIRAL
          ========================================================================= */}
      {activeTab === 'predictor' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-ink/70 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-coral fill-coral" />
              <span>{title || 'Kalkulasi Potensi Viral Konten'}</span>
            </span>
            <span className="text-[10px] font-mono text-ink/50">Simulasi Interaktif</span>
          </div>

          {/* Interactive Parameters */}
          <div className="flex flex-col gap-2 text-xs">
            {/* Format Selector */}
            <div>
              <span className="text-[10px] font-mono font-bold text-ink/60 uppercase block mb-1">
                Tipe Format:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'reels', label: '🎬 Reels/TikTok' },
                    { id: 'carousel', label: '📸 Carousel' },
                    { id: 'story', label: '📱 Story Link' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormatType(opt.id);
                      soundManager.playPop();
                    }}
                    className={cn(
                      'py-1.5 px-2 rounded-lg font-bold text-[11px] border text-center transition-all min-h-[38px]',
                      selectedFormatType === opt.id
                        ? 'bg-mustard text-ink border-ink shadow-neo-sm font-black'
                        : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jam Tayang */}
            <div>
              <span className="text-[10px] font-mono font-bold text-ink/60 uppercase block mb-1">
                Jam Posting:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'pagi', label: '🌅 07:00 Pagi' },
                    { id: 'siang', label: '☀️ 12:30 Siang' },
                    { id: 'malam', label: '🌙 19:30 Malam' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedPostingTime(opt.id);
                      soundManager.playPop();
                    }}
                    className={cn(
                      'py-1.5 px-2 rounded-lg font-bold text-[11px] border text-center transition-all min-h-[38px]',
                      selectedPostingTime === opt.id
                        ? 'bg-mint text-ink border-ink shadow-neo-sm font-black'
                        : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hook / Sudut Pandang */}
            <div>
              <span className="text-[10px] font-mono font-bold text-ink/60 uppercase block mb-1">
                Gaya Hook Utama:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'komedi', label: '😂 Komedi' },
                    { id: 'promo', label: '🔥 Promo' },
                    { id: 'review', label: '💡 Review' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedHookType(opt.id);
                      soundManager.playPop();
                    }}
                    className={cn(
                      'py-1.5 px-2 rounded-lg font-bold text-[11px] border text-center transition-all min-h-[38px]',
                      selectedHookType === opt.id
                        ? 'bg-coral text-ink border-ink shadow-neo-sm font-black'
                        : 'bg-paper text-ink/70 border-ink/20 hover:text-ink'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-paper p-3 rounded-xl border-2 border-ink shadow-neo-sm mt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-ink/70 uppercase">
                Skor Potensi FYP:
              </span>
              <span className="text-base font-mono font-black text-ink">{viralScore}%</span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full h-3 bg-white border border-ink rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-mint rounded-full border border-ink/30"
                initial={{ width: 0 }}
                animate={{ width: `${viralScore}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10 text-[11px] font-mono">
              <span className="text-ink/70">Est. Reach Organik:</span>
              <span className="font-bold text-ink">
                {selectedFormatType === 'reels'
                  ? '180K - 450K+ Akun'
                  : selectedFormatType === 'carousel'
                  ? '90K - 220K+ Akun'
                  : '40K - 80K+ Akun'}
              </span>
            </div>
          </div>

          <a
            href="#rate-calculator"
            onClick={() => soundManager.playPop()}
            className={cn(
              'min-h-[44px] px-3 py-2 rounded-xl font-bold font-sans text-xs',
              'bg-white text-ink border-2 border-ink shadow-neo-sm',
              'hover:bg-mustard hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]',
              'transition-all flex items-center justify-center gap-1.5 mt-1'
            )}
          >
            <span>Pilih Paket di Kalkulator Tarif</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HIGH-FIVE REALTIME KE TIM KREATOR
          ========================================================================= */}
      {activeTab === 'highfive' && (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-1">
          <div className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider">
            Apresiasi Tim Kreator
          </div>

          {/* High-Five Big Tactile Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleHighFive}
              aria-label={`Beri High-Five ke Tim Kreator (${highFiveCount} kali)`}
              className={cn(
                'w-20 h-20 rounded-2xl bg-coral text-ink border-3 border-ink shadow-neo',
                'hover:shadow-neo-lg hover:scale-105 active:scale-95 active:shadow-none',
                'transition-all flex flex-col items-center justify-center cursor-pointer select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
              )}
            >
              <Hand className="w-8 h-8 fill-ink/20 stroke-ink" />
              <span className="text-[10px] font-mono font-black mt-0.5 uppercase tracking-wide">
                High-Five!
              </span>
            </button>

            {/* Flying Particle Bursts */}
            <AnimatePresence>
              {highFiveParticles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl select-none z-50"
                >
                  ✋✨
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Odometer-Style Counter */}
          <div className="bg-paper px-4 py-1.5 rounded-xl border border-ink/30 shadow-neo-sm">
            <span className="font-mono text-base font-black text-ink">
              {highFiveCount.toLocaleString('id-ID')}
            </span>
            <span className="font-mono text-xs text-ink/70 ml-1.5">High-Fives Terkumpul</span>
          </div>

          <p className="text-[11px] font-sans text-ink/80 max-w-xs leading-relaxed">
            {hasHighFived
              ? 'Terima kasih atas energinya! Setiap tepukan membuat tim kami makin bersemangat memproduksi karya berkualitas. 🚀'
              : 'Sentuh telapak tangan di atas untuk mengirimkan salam dan semangat positif ke tim kreator!'}
          </p>
        </div>
      )}

      {/* =========================================================================
          TAB 3: KESIAPAN & PERFORMA KREATOR
          ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-mustard fill-mustard" />
            <span>Kesiapan & Kualitas Kolaborasi</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-paper border border-ink/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-ink/70 text-[10px] font-mono font-bold uppercase">
                <Clock className="w-3 h-3 text-ink" />
                <span>Respon Chat</span>
              </div>
              <span className="font-mono font-black text-sm text-ink">&lt; 15 Menit</span>
              <span className="text-[10px] text-ink/60">Jam kerja 08:00 - 22:00</span>
            </div>

            <div className="p-2.5 rounded-xl bg-paper border border-ink/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-ink/70 text-[10px] font-mono font-bold uppercase">
                <ShieldCheck className="w-3 h-3 text-mint" />
                <span>Kepuasan Brand</span>
              </div>
              <span className="font-mono font-black text-sm text-ink">99.4%</span>
              <span className="text-[10px] text-ink/60">50+ Kolaborasi Sukses</span>
            </div>

            <div className="p-2.5 rounded-xl bg-paper border border-ink/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-ink/70 text-[10px] font-mono font-bold uppercase">
                <MapPin className="w-3 h-3 text-coral" />
                <span>Top Wilayah</span>
              </div>
              <span className="font-sans font-bold text-xs text-ink truncate">Padang & Bukittinggi</span>
              <span className="text-[10px] text-ink/60">85% Warga Sumbar</span>
            </div>

            <div className="p-2.5 rounded-xl bg-paper border border-ink/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-ink/70 text-[10px] font-mono font-bold uppercase">
                <Sparkles className="w-3 h-3 text-mustard" />
                <span>Jadwal Tayang</span>
              </div>
              <span className="font-sans font-bold text-xs text-ink truncate">Tersedia Minggu Ini</span>
              <span className="text-[10px] text-ink/60">Slot terbatas</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Halo Tim ${creatorName}! 👋 Saya ingin konfirmasi slot endorse yang tersedia minggu ini.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playPop()}
            className={cn(
              'min-h-[44px] px-3 py-2 rounded-xl font-bold font-sans text-xs',
              'bg-mint text-ink border-2 border-ink shadow-neo-sm',
              'hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px]',
              'transition-all flex items-center justify-center gap-1.5 mt-1'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Klaim Slot Sekarang via WhatsApp</span>
          </a>
        </div>
      )}
    </div>
  );
}
