'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { MessageCircle, Calculator } from 'lucide-react';

export function MobileStickyCta() {
  const { brand } = MEDIA_KIT_DATA;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-ink p-3 sm:hidden shadow-[0_-4px_16px_rgba(30,30,30,0.1)]">
      <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
        {/* Brand Icon & Quick Price */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg border-2 border-ink overflow-hidden bg-white shrink-0 relative p-0.5">
            <Image
              src="/logo-sumbar-terkini.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-[11px] font-mono font-black text-ink leading-tight">
              Sumbar Terkini
            </div>
            <div className="text-[10px] font-mono text-ink/70">
              Mulai Rp150.000
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="#order-calculator-widget"
            className="neo-button min-h-[44px] py-2 px-3 rounded-xl bg-paper hover:bg-mustard text-ink text-xs font-mono font-bold flex items-center gap-1 border-2 border-ink shadow-neo-sm"
          >
            <Calculator className="w-3.5 h-3.5 text-ink" />
            <span>Hitung</span>
          </a>

          <a
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-button min-h-[44px] py-2 px-3.5 rounded-xl bg-mint hover:bg-mint-hover text-ink text-xs font-mono font-black flex items-center gap-1.5 border-2 border-ink shadow-neo-sm"
          >
            <MessageCircle className="w-4 h-4 text-ink" />
            <span>Pesan WA</span>
          </a>
        </div>
      </div>
    </div>
  );
}
