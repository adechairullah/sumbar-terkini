'use client';

import React from 'react';
import { MEDIA_KIT_DATA, PricingPackage } from '@/data/mediaKitData';
import {
  Check,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface RateCardPricingSectionProps {
  onSelectPackage?: (packageId: string) => void;
}

export function RateCardPricingSection({ onSelectPackage }: RateCardPricingSectionProps) {
  const { packages } = MEDIA_KIT_DATA;

  const handleChoosePackage = (pkgId: string) => {
    onSelectPackage?.(pkgId);
    const calculatorElement = document.getElementById('pricing-calculator');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing-packages" className="py-14 sm:py-20 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block mb-2">
            Transparan, Terjangkau & Efektif
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
            Daftar Paket & Tarif Promosi
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
            Pilihan paket paid promote fleksibel dengan jangkauan maksimal, bebas biaya tambahan fitur Collab Post resmi, dan pelaporan metrik terpercaya.
          </p>
        </div>

        {/* 5 Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {packages.map((pkg) => {
            const isFeatured = pkg.isPopular || pkg.isBestValue;

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-500 shadow-2xl shadow-red-950/40 ring-1 ring-red-500/50 scale-[1.02] z-10'
                    : pkg.isBestValue
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 shadow-2xl shadow-amber-950/30 ring-1 ring-amber-500/50'
                    : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Floating Top Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                        pkg.isPopular
                          ? 'bg-red-600 text-white border border-red-400'
                          : 'bg-amber-500 text-slate-950 border border-amber-300'
                      }`}
                    >
                      {pkg.isPopular && <Flame className="w-3.5 h-3.5 fill-white" />}
                      {pkg.isBestValue && <Award className="w-3.5 h-3.5 fill-slate-950" />}
                      <span>{pkg.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* Title & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-black text-xl text-white tracking-tight">
                      {pkg.name}
                    </h3>
                    {pkg.duration && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                        {pkg.duration}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4 mb-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                        {pkg.priceFormatted}
                      </span>
                      <span className="text-xs font-mono text-slate-400">/ tayang</span>
                    </div>
                    {pkg.note && (
                      <p className="text-xs text-slate-300 mt-2 italic leading-relaxed">
                        {pkg.note}
                      </p>
                    )}
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Benefit & Keunggulan:
                    </span>
                    {pkg.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-600/70 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleChoosePackage(pkg.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      pkg.isPopular
                        ? 'bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-950/50 border border-red-500'
                        : pkg.isBestValue
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>Pilih Paket & Hitung Total</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Corporate & Agency Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-white text-base">
              Butuh Penawaran Khusus Kampanye Pilkada, Pemda, atau Brand Nasional?
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Kami melayani proposal invoice resmi, penyesuaian durasi liputan langsung (live on-the-spot), serta kontrak tahunan.
            </p>
          </div>
          <a
            href="https://wa.me/6289617662378?text=Halo%20Sumbar%20Terkini%2C%20kami%20ingin%20konsultasi%20paket%20iklan%20khusus%20instansi%2Fbrand%20skala%20besar."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            Konsultasi Khusus via WA
          </a>
        </div>
      </div>
    </section>
  );
}

