'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { EndorsePackage } from '@/types';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { MessageSquare, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface WhatsAppCheckoutProps {
  phone: string;
  creatorName?: string;
  selectedPackages: EndorsePackage[];
  isPrivateQuote?: boolean;
  className?: string;
}

export function WhatsAppCheckout({
  phone,
  creatorName = 'Sumbar Terkini',
  selectedPackages,
  isPrivateQuote = false,
  className,
}: WhatsAppCheckoutProps) {
  const [hasCopiedBackup, setHasCopiedBackup] = useState<boolean>(false);

  const handleCheckout = () => {
    // 1. Trigger Confetti Explosion adhering to Neo-Brutalism theme palette
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        confetti({
          particleCount: selectedPackages.length >= 3 ? 120 : 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#FFD166', '#EF476F', '#06D6A0', '#1E1E1E'],
          disableForReducedMotion: true,
        });
      }
    }

    // 2. Generate WhatsApp Link
    const waUrl = generateWhatsAppUrl({
      phone,
      creatorName,
      selectedPackages,
      isPrivateQuote,
    });

    // 3. Open WhatsApp link safely in a new tab
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 4. Fallback copy to clipboard in case popup is blocked
      try {
        const decoded = decodeURIComponent(waUrl.split('?text=')[1] || '');
        if (navigator.clipboard && decoded) {
          navigator.clipboard.writeText(decoded).then(() => {
            setHasCopiedBackup(true);
            setTimeout(() => setHasCopiedBackup(false), 3000);
          });
        }
      } catch {
        // Silent catch for headless or unsupported environments
      }
    }
  };

  const isDisabled = selectedPackages.length === 0;

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isDisabled}
        className={cn(
          'w-full py-4 px-6 rounded-xl font-black text-base sm:text-lg border-2 sm:border-3 border-ink flex items-center justify-center gap-3 transition-all select-none min-h-[52px]',
          isDisabled
            ? 'bg-paper text-ink/40 border-ink/40 cursor-not-allowed shadow-none'
            : 'bg-mint text-ink shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none'
        )}
        aria-label="Pesan paket endorsement via WhatsApp"
      >
        <MessageSquare className="w-5 h-5 shrink-0 fill-ink/10" />
        <span>
          {isDisabled
            ? 'Pilih Minimal 1 Layanan'
            : 'Pesan Paket via WhatsApp'}
        </span>
        {!isDisabled && <ArrowRight className="w-5 h-5 shrink-0" />}
      </button>

      {hasCopiedBackup && (
        <div className="mt-2 text-center text-xs font-mono font-bold text-mint flex items-center justify-center gap-1">
          <Check className="w-3.5 h-3.5" />
          <span>Draft pesanan otomatis tersalin ke clipboard!</span>
        </div>
      )}
    </div>
  );
}

