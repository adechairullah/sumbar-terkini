'use client';

import React, { useState } from 'react';
import { MEDIA_KIT_DATA, TermSection } from '@/data/mediaKitData';
import {
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  FileCheck2,
  CalendarCheck,
  Scale,
  Sparkles,
} from 'lucide-react';

export function TermsAccordionSection() {
  const terms: TermSection[] = MEDIA_KIT_DATA.termsAndConditions;
  const [openIds, setOpenIds] = useState<string[]>(['tc-produk', 'tc-materi']);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getIconBg = (id: string) => {
    switch (id) {
      case 'tc-produk':
        return 'bg-[#FFE4EA]';
      case 'tc-materi':
        return 'bg-[#D1FAE5]';
      case 'tc-pembayaran':
        return 'bg-[#FEF08A]';
      default:
        return 'bg-[#E0F2FE]';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
      case 'ShieldCheck':
        return <ShieldAlert className="w-5 h-5 text-ink shrink-0" />;
      case 'FileCheck2':
      case 'FileText':
        return <FileCheck2 className="w-5 h-5 text-ink shrink-0" />;
      case 'CalendarCheck':
      case 'CreditCard':
        return <CalendarCheck className="w-5 h-5 text-ink shrink-0" />;
      case 'Scale':
      case 'Clock':
        return <Scale className="w-5 h-5 text-ink shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-ink shrink-0" />;
    }
  };

  return (
    <section id="terms-section" className="my-12 sm:my-16" aria-labelledby="terms-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mustard text-ink text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Standar Operasional & Kemitraan</span>
          </div>
          <h2 id="terms-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Syarat & Ketentuan (T&C) Iklan
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Pedoman resmi penayangan iklan dan endorsement untuk menjaga kualitas ruang digital serta melindungi reputasi brand mitra.
          </p>
        </div>

        <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70">
          4 Ketentuan Resmi Terverifikasi
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {terms.map((item: TermSection) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="neo-card bg-white rounded-2xl border-2 border-ink shadow-neo overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full min-h-[52px] p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-white hover:bg-paper transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border-2 border-ink shadow-neo-sm flex items-center justify-center shrink-0 ${getIconBg(item.id)}`}>
                    {getIcon(item.iconName)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-ink font-sans">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-lg bg-paper border-2 border-ink flex items-center justify-center shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-mustard' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4 text-ink" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 pt-2 border-t-2 border-ink/10 bg-paper/50">
                  <ul className="space-y-3 text-xs sm:text-sm text-ink/90 font-sans">
                    {item.points.map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
