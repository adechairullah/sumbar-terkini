'use client';

import React, { useState } from 'react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import {
  ChevronDown,
  ShieldCheck,
  FileText,
  CreditCard,
  Clock,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export function TermsAccordionSection() {
  const { termsAndConditions } = MEDIA_KIT_DATA;
  const [openIds, setOpenIds] = useState<string[]>(['tc-produk']); // first one open by default

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-red-400 shrink-0" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'Clock':
      default:
        return <Clock className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  return (
    <section id="terms-accordion" className="py-14 sm:py-20 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Standar Operasional & Kebijakan Beriklan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            Syarat & Ketentuan (T&C) Iklan
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Harap baca dan pahami pedoman resmi penayangan iklan berbayar (Paid Promote) di jaringan media Sumbar Terkini demi kelancaran kampanye Anda.
          </p>
        </div>

        {/* Collapsible Accordion Container */}
        <div className="space-y-3.5">
          {termsAndConditions.map((term) => {
            const isOpen = openIds.includes(term.id);

            return (
              <div
                key={term.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-colors"
              >
                {/* Accordion Toggle Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(term.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(term.iconName)}
                    <span className="font-bold text-sm sm:text-base text-white">
                      {term.title}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-850 space-y-2.5">
                    {term.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                        <p className="leading-relaxed text-slate-200">{pt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

