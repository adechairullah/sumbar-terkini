'use client';

import React from 'react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { MessageCircle, Calculator, Zap } from 'lucide-react';

export function MobileStickyCta() {
  const { brand } = MEDIA_KIT_DATA;

  const scrollToCalculator = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('pricing-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="Aksi Cepat Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
        {/* Quick Calculator Jump Button */}
        <button
          type="button"
          onClick={scrollToCalculator}
          className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-md active:scale-95 transition-all min-h-[44px]"
        >
          <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Kalkulator Tarif</span>
        </button>

        {/* WhatsApp Direct Floating Button */}
        <a
          href={brand.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider border border-emerald-500 shadow-md shadow-emerald-950/50 active:scale-95 transition-all min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 fill-white shrink-0" />
          <span>Chat WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}

