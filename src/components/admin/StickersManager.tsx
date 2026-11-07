'use client';

import React, { useState } from 'react';
import { StickerItem } from '@/types';
import { Plus, Trash2, Smile, Sparkles } from 'lucide-react';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { cn } from '@/lib/utils/cn';

export interface StickersManagerProps {
  stickers: StickerItem[];
  onChange: (stickers: StickerItem[]) => void;
}

export function clampStickerRotation(deg: number): number {
  if (typeof deg !== 'number' || isNaN(deg)) return 0;
  return Math.min(Math.max(deg, -45), 45);
}

export function truncateStickerText(text: string): string {
  if (!text) return '';
  return text.trim().slice(0, 24);
}

const PRESET_EMOJIS = ['🔥', '⚡', '🌱', '👑', '🚀', '🎯', '💡', '✨', '⭐', '💎'];
const PRESET_COLORS = ['#FFD166', '#06D6A0', '#EF476F', '#FAF8F5', '#E0E7FF'];

export function StickersManager({ stickers, onChange }: StickersManagerProps) {
  const [newText, setNewText] = useState('');
  const [newEmoji, setNewEmoji] = useState('🔥');
  const [newRotation, setNewRotation] = useState(-3);
  const [newColor, setNewColor] = useState('#FFD166');
  const [error, setError] = useState<string | null>(null);

  const handleAddSticker = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanText = truncateStickerText(newText);
    if (!cleanText) {
      setError('Teks stiker tidak boleh kosong.');
      return;
    }

    if (stickers.length >= 10) {
      setError('Maksimal 10 stiker. Hapus salah satu untuk menambah.');
      return;
    }

    const newSticker: StickerItem = {
      id: `stk-${Date.now()}`,
      text: cleanText,
      emoji: newEmoji || '✨',
      color: newColor,
      rotation: clampStickerRotation(newRotation),
    };

    onChange([...stickers, newSticker]);
    setNewText('');
    setNewRotation(-3);
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    const updated = stickers.map((stk) => {
      if (stk.id !== id) return stk;
      return {
        ...stk,
        ...updates,
        text: updates.text !== undefined ? truncateStickerText(updates.text) : stk.text,
        rotation:
          updates.rotation !== undefined
            ? clampStickerRotation(updates.rotation)
            : stk.rotation,
      };
    });
    onChange(updated);
  };

  const handleDeleteSticker = (id: string) => {
    onChange(stickers.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mustard" />
            <span>Stiker Hero Interaktif</span>
          </h3>
          <p className="text-xs text-ink/70 mt-0.5">
            Kelola stiker neo-brutalis melayang di atas avatar hero. Maksimal 10 stiker.
          </p>
        </div>
        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border-2 border-ink rounded-lg shadow-neo-sm">
          {stickers.length} / 10
        </span>
      </div>

      {/* Add New Sticker Form */}
      {stickers.length < 10 && (
        <NeoCard className="p-4 bg-paper/50">
          <form onSubmit={handleAddSticker} className="space-y-4">
            <div className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wide">
              Tambah Stiker Baru
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Teks Stiker (Maks. 24 Karakter)
                </label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value.slice(0, 24))}
                  placeholder="Contoh: Viral Rank #1"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={24}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Emoji Pilihan
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_EMOJIS.slice(0, 6).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEmoji(em)}
                      className={cn(
                        'w-10 h-10 rounded-xl border-2 border-ink text-base flex items-center justify-center transition-transform min-h-[44px] min-w-[44px]',
                        newEmoji === em
                          ? 'bg-mustard scale-105 shadow-neo-sm'
                          : 'bg-white hover:bg-paper'
                      )}
                      aria-label={`Pilih emoji ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value.slice(0, 2))}
                    className="w-11 px-2 py-2 bg-white border-2 border-ink rounded-xl text-center font-mono text-sm min-h-[44px]"
                    placeholder="✨"
                  />
                </div>
              </div>
            </div>

            {/* Rotation and Color Swatches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-ink/70">
                    Rotasi Kemiringan: {newRotation}°
                  </label>
                  <span className="text-[10px] font-mono text-ink/50">[-45° s/d +45°]</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={newRotation}
                  onChange={(e) => setNewRotation(Number(e.target.value))}
                  className="w-full accent-ink cursor-pointer min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Warna Latar Stiker
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      style={{ backgroundColor: col }}
                      className={cn(
                        'w-9 h-9 rounded-xl border-2 border-ink transition-transform min-h-[44px] min-w-[44px]',
                        newColor === col ? 'scale-110 shadow-neo-sm ring-2 ring-ink' : ''
                      )}
                      aria-label={`Pilih warna ${col}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-mono font-bold text-coral bg-coral/10 border-2 border-coral/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={!newText.trim()}
                className="gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan Stiker</span>
              </NeoButton>
            </div>
          </form>
        </NeoCard>
      )}

      {/* Active Stickers List */}
      <div className="space-y-3">
        {stickers.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-ink/30 rounded-xl bg-white/40">
            <Smile className="w-8 h-8 mx-auto text-ink/40 mb-2" />
            <p className="text-xs font-mono font-bold text-ink/60">
              Belum ada stiker hero aktif. Buat stiker pertama di atas.
            </p>
          </div>
        ) : (
          stickers.map((stk) => (
            <div
              key={stk.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border-2 border-ink rounded-xl shadow-neo-sm"
            >
              {/* Visual preview pill */}
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: stk.color || '#FFD166',
                    transform: `rotate(${stk.rotation}deg)`,
                  }}
                  className="px-3 py-1 rounded-lg border-2 border-ink font-mono text-xs font-bold text-ink shadow-neo-sm whitespace-nowrap transition-transform"
                >
                  <span className="mr-1">{stk.emoji}</span>
                  <span>{stk.text}</span>
                </div>

                <span className="text-[11px] font-mono font-bold text-ink/50">
                  {stk.rotation}°
                </span>
              </div>

              {/* Edit Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={stk.text}
                  onChange={(e) => handleUpdateSticker(stk.id, { text: e.target.value })}
                  className="px-2.5 py-1.5 bg-paper border-2 border-ink rounded-lg font-mono text-xs text-ink w-36 min-h-[44px]"
                  maxLength={24}
                  placeholder="Teks stiker"
                />

                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={stk.rotation}
                    onChange={(e) =>
                      handleUpdateSticker(stk.id, { rotation: Number(e.target.value) })
                    }
                    className="w-20 accent-ink cursor-pointer min-h-[44px]"
                    title="Atur sudut kemiringan"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSticker(stk.id)}
                  className="p-2.5 rounded-lg border-2 border-ink bg-white text-ink hover:bg-coral/20 hover:text-coral transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Hapus stiker"
                  title="Hapus stiker"
                >
                  <Trash2 className="w-4 h-4 text-coral" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

