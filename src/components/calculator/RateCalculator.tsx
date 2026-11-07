'use client';

import React, { useState, useMemo } from 'react';
import { EndorsePackage } from '@/types';
import { calculateDiscountTier, formatIDR } from '@/lib/utils/formatters';
import { WhatsAppCheckout } from './WhatsAppCheckout';
import { TierBadge } from './TierBadge';
import { Check, Sparkles, Tag, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface RateCalculatorProps {
  packages: EndorsePackage[];
  whatsappNumber: string;
  creatorName?: string;
  className?: string;
}

export function RateCalculator({
  packages,
  whatsappNumber,
  creatorName = 'Sumbar Terkini',
  className,
}: RateCalculatorProps) {
  // Pre-select popular packages by default for quick discovery
  const initialSelected = useMemo(() => {
    const populars = packages.filter((p) => p.is_popular && !p.is_price_hidden);
    return populars.length > 0 ? populars.map((p) => p.id) : [];
  }, [packages]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
  const [isPrivateNegotiation, setIsPrivateNegotiation] = useState<boolean>(false);

  // Toggle deliverable selection
  const togglePackage = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(packages.map((p) => p.id));
  };

  const resetSelection = () => {
    setSelectedIds([]);
  };

  const selectedPackages = useMemo(() => {
    const map = new Map(packages.map((p) => [p.id, p]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as EndorsePackage[];
  }, [packages, selectedIds]);

  const calc = useMemo(() => {
    return calculateDiscountTier(selectedPackages);
  }, [selectedPackages]);

  // Determine tier progress pill message
  const nextTierHint = useMemo(() => {
    const count = selectedPackages.length;
    if (count === 0) return 'Pilih paket di bawah untuk mengaktifkan diskon otomatis';
    if (count === 1) return 'Tambah 1 layanan lagi untuk membuka Diskon 5% (Growth Duo)!';
    if (count === 2) return 'Tambah 1 layanan lagi untuk VIP Viral Bundle (Diskon 10% + Prioritas)!';
    return 'Selamat! Anda menikmati diskon maksimal 10% VIP Viral Bundle';
  }, [selectedPackages.length]);

  return (
    <section id="rate-calculator" className={cn('my-12', className)} aria-labelledby="calculator-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge bg-mustard text-ink mb-2">
            <Tag className="w-3.5 h-3.5" />
            Kalkulator Rate Card Interaktif
          </div>
          <h2 id="calculator-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Hitung Investasi Kampanye Anda
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 max-w-2xl font-normal">
            Pilih satu atau gabungkan beberapa paket endorsement. Dapatkan potongan harga otomatis bertingkat hingga 10% untuk pemesanan multi-layanan.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPrivateNegotiation(!isPrivateNegotiation)}
            className="neo-button text-xs font-mono py-2 px-3 bg-white text-ink rounded-lg flex items-center gap-1.5 min-h-[44px]"
            aria-pressed={isPrivateNegotiation}
          >
            {isPrivateNegotiation ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Tampilkan Angka</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Mode Negosiasi Khusus</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetSelection}
            className="text-xs font-mono text-ink/60 hover:text-ink underline py-1 px-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deliverables Selection List (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-ink/10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70">
              Pilihan Paket Layanan ({packages.length} Tersedia)
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-mono font-bold text-ink hover:underline"
            >
              Pilih Semua
            </button>
          </div>

          <div className="space-y-3">
            {packages.map((pkg) => {
              const isSelected = selectedIds.includes(pkg.id);

              return (
                <div
                  key={pkg.id}
                  onClick={() => togglePackage(pkg.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      togglePackage(pkg.id);
                    }
                  }}
                  className={cn(
                    'neo-card p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border-2 border-ink',
                    isSelected
                      ? 'bg-mustard/15 shadow-neo-lg -translate-y-0.5 border-ink'
                      : 'bg-white shadow-neo hover:bg-paper/60'
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Custom Neo Checkbox */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg border-2 border-ink flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                        isSelected ? 'bg-mint' : 'bg-white'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-ink stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-ink">
                            {pkg.name}
                          </h3>
                          {pkg.is_popular && (
                            <span className="neo-badge text-[10px] bg-coral text-ink py-0.5 px-2">
                              Populer
                            </span>
                          )}
                        </div>

                        {/* Price Tag */}
                        <div className="font-mono font-black text-base sm:text-lg text-ink">
                          {isPrivateNegotiation || pkg.is_price_hidden ? (
                            <span className="text-sm font-sans font-bold text-ink/70 bg-paper px-2 py-0.5 rounded border border-ink/30">
                              Negosiasi Khusus
                            </span>
                          ) : (
                            formatIDR(pkg.price)
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-ink/80 mb-3 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Deliverables Tags */}
                      {pkg.deliverables && pkg.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.deliverables.map((deliv, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-paper border border-ink/20 text-ink/80"
                            >
                              ✓ {deliv}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Calculation Invoice Sticky Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="neo-card p-6 sm:p-7 rounded-2xl bg-white border-2 sm:border-3 border-ink shadow-neo-lg">
            <div className="flex items-center justify-between pb-4 border-b-2 border-ink/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink/60">
                Ringkasan Investasi
              </span>
              <TierBadge tierName={calc.tierName} discountPercent={calc.discountPercent} />
            </div>

            {/* Tier Progression Hint */}
            <div className="my-4 p-3 bg-paper rounded-xl border border-ink/30 text-xs font-mono">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-ink">Progres Tier Diskon:</span>
                <span className="font-bold text-coral">
                  {selectedPackages.length} Layanan Terpilih
                </span>
              </div>
              <p className="text-[11px] text-ink/80 leading-relaxed font-sans">
                {nextTierHint}
              </p>
            </div>

            {/* Selected Items Breakdown */}
            <div className="space-y-2 py-3 border-b-2 border-ink/10 max-h-48 overflow-y-auto pr-1">
              {selectedPackages.length === 0 ? (
                <p className="text-xs font-mono text-ink/60 italic text-center py-4">
                  Belum ada paket yang dipilih. Klik layanan di sebelah kiri untuk mulai menghitung.
                </p>
              ) : (
                selectedPackages.map((pkg) => (
                  <div key={pkg.id} className="flex justify-between items-center text-xs">
                    <span className="font-medium text-ink truncate pr-2">
                      {pkg.name}
                    </span>
                    <span className="font-mono font-bold shrink-0 text-ink">
                      {isPrivateNegotiation || pkg.is_price_hidden
                        ? 'Negosiasi'
                        : formatIDR(pkg.price)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Calculation Lines */}
            <div className="space-y-2.5 pt-4 font-mono text-sm">
              <div className="flex justify-between text-ink/80">
                <span>Subtotal:</span>
                <span className="font-bold text-ink">
                  {isPrivateNegotiation
                    ? 'Negosiasi Khusus'
                    : formatIDR(calc.subtotal)}
                </span>
              </div>

              {!isPrivateNegotiation && calc.discountPercent > 0 && (
                <div className="flex justify-between text-coral font-bold">
                  <span>Diskon Paket ({calc.discountPercent}%):</span>
                  <span>-{formatIDR(calc.discountAmount)}</span>
                </div>
              )}

              {calc.hasHiddenPrice && (
                <div className="text-[11px] font-sans text-ink/70 bg-mustard/20 p-2 rounded border border-mustard">
                  * Termasuk paket retainer khusus yang memerlukan penyesuaian jadwal dan kuota.
                </div>
              )}

              {/* Total Row with Space Mono */}
              <div className="pt-3 border-t-2 border-ink flex justify-between items-baseline">
                <div>
                  <span className="block text-xs uppercase font-sans font-bold text-ink/60">
                    Total Investasi:
                  </span>
                  <span className="text-[10px] text-ink/50 font-sans">
                    *Invoice resmi & PPh tersedia
                  </span>
                </div>
                <div className="text-right">
                  {isPrivateNegotiation ? (
                    <div className="text-xl font-bold font-sans text-ink">
                      Tanya via WhatsApp
                    </div>
                  ) : (
                    <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight tabular-nums font-mono">
                      {formatIDR(calc.total)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Action Button with Confetti */}
            <div className="mt-6">
              <WhatsAppCheckout
                phone={whatsappNumber}
                creatorName={creatorName}
                selectedPackages={selectedPackages}
                isPrivateQuote={isPrivateNegotiation}
              />
            </div>

            {/* Trust Assurance Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-ink/70 text-center">
              <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
              <span>Garansi tayang tepat waktu & laporan analytics resmi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

