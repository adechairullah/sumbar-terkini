'use client';

import React, { useState, useMemo } from 'react';
import { MEDIA_KIT_DATA, PricingPackage } from '@/data/mediaKitData';
import {
  Calculator,
  MessageCircle,
  Mail,
  Plus,
  Minus,
  Calendar,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

interface OrderCalculatorSectionProps {
  selectedPackageId?: string;
  onSelectPackage?: (id: string) => void;
}

export function OrderCalculatorSection({
  selectedPackageId: propPackageId,
  onSelectPackage,
}: OrderCalculatorSectionProps) {
  const { packages, brand } = MEDIA_KIT_DATA;

  // State
  const [packageId, setPackageId] = useState<string>(propPackageId || 'combo-reels');
  const [selectedSinglePlatform, setSelectedSinglePlatform] = useState<'Instagram' | 'TikTok' | 'Facebook'>('Instagram');
  const [extraStories, setExtraStories] = useState<number>(0);
  const [brandName, setBrandName] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Sync if prop changes
  React.useEffect(() => {
    if (propPackageId) {
      setPackageId(propPackageId);
    }
  }, [propPackageId]);

  const activePackage: PricingPackage = useMemo(() => {
    const found = packages.find((p) => p.id === packageId);
    if (found) return found;
    return packages[0]!;
  }, [packages, packageId]);

  // Tomorrow calculation for H-1 rule
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const handleDateChange = (val: string) => {
    setScheduleDate(val);
    if (!val) {
      setDateError('Tanggal tayang wajib diisi (H-1 sebelum penayangan).');
      return;
    }
    const chosen = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = (chosen.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 1) {
      setDateError('Sesuai ketentuan, materi wajib dikirim dan dijadwalkan minimal H-1 sebelum tayang.');
    } else {
      setDateError('');
    }
  };

  // Calculation logic
  const extraStoryPrice = 50000;
  const totalPrice = useMemo(() => {
    const base = activePackage ? activePackage.price : 0;
    const addOn = extraStories * extraStoryPrice;
    return base + addOn;
  }, [activePackage, extraStories]);

  const estimatedReach = useMemo(() => {
    if (!activePackage) return '25.000 - 120.000+ akun';
    if (activePackage.platformsSupported === 'all') {
      return activePackage.id === 'langganan-bulanan'
        ? '500.000 - 1.200.000+ total akumulasi jangkauan'
        : '150.000 - 550.000+ akun (Lintas 3 Platform)';
    }
    if (selectedSinglePlatform === 'Instagram') {
      return activePackage.id === 'ig-story'
        ? '3.500 - 6.200 tayangan aktif / 24 jam'
        : '25.000 - 120.000+ akun';
    }
    if (selectedSinglePlatform === 'TikTok') {
      return '45.000 - 500.000+ views (Algoritma FYP)';
    }
    return '65.000 - 350.000+ akun Facebook';
  }, [activePackage, selectedSinglePlatform]);

  // WhatsApp formatted string
  const whatsappUrl = useMemo(() => {
    const bName = brandName.trim() || '[Nama Brand/Instansi]';
    const sDate = scheduleDate || '[Belum ditentukan]';
    const platformDisplay =
      activePackage.platformsSupported === 'all'
        ? 'Mirroring 3 Platform (Instagram + TikTok + Facebook)'
        : selectedSinglePlatform;

    const extraText =
      extraStories > 0
        ? `${extraStories}x Extra Story (+Rp${(extraStories * extraStoryPrice).toLocaleString('id-ID')})`
        : 'Tidak ada';

    const message = `Halo Tim Redaksi & Iklan Sumbar Terkini! 👋
Saya ingin memesan slot promosi berbayar (Paid Promote) dengan rincian berikut:

• Brand / Instansi: ${bName}
• Paket Pilihan: ${activePackage.name} (Rp${activePackage.price.toLocaleString('id-ID')})
• Platform Target: ${platformDisplay}
• Tambahan Story: ${extraText}
• Tanggal Rencana Tayang: ${sDate}
• Estimasi Total Biaya: Rp${totalPrice.toLocaleString('id-ID')}
• Catatan Tambahan: ${notes.trim() || '-'}

Mohon konfirmasi ketersediaan slot jadwal penayangan dan rekening pembayaran resmi. Terima kasih!`;

    return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [brandName, scheduleDate, activePackage, selectedSinglePlatform, extraStories, totalPrice, notes, brand.whatsappNumber]);

  // Email draft URL
  const emailDraftUrl = useMemo(() => {
    const bName = brandName.trim() || 'Klien Promosi';
    const sDate = scheduleDate || '[Tanggal Belum Dipilih]';
    const platformDisplay =
      activePackage.platformsSupported === 'all'
        ? 'Mirroring 3 Platform (Instagram + TikTok + Facebook)'
        : selectedSinglePlatform;

    const subject = `[Order Paid Promote] ${activePackage.name} - ${bName}`;
    const body = `Halo Tim Sumbar Terkini,

Berikut draft pesanan paid promote kami:

Nama Brand / Instansi: ${bName}
Paket: ${activePackage.name}
Platform: ${platformDisplay}
Tambahan Story: ${extraStories} story
Rencana Tanggal Tayang: ${sDate}
Total Estimasi Biaya: Rp${totalPrice.toLocaleString('id-ID')}
Catatan: ${notes.trim() || '-'}

Mohon informasi ketersediaan slot dan invoice pembayaran.

Terima kasih.`;

    return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [brandName, activePackage, selectedSinglePlatform, extraStories, scheduleDate, totalPrice, notes, brand.email]);

  return (
    <section id="pricing-calculator" className="py-14 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator Estimasi & Pemesanan Instan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
            Hitung Biaya & Pesan Slot Iklan
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Pilih paket, sesuaikan platform, tambahkan opsi story, dan kirimkan pesanan Anda secara otomatis langsung ke WhatsApp resmi Sumbar Terkini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Inputs & Configuration */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Step 1: Select Package */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                1. Pilih Paket Promosi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      setPackageId(pkg.id);
                      onSelectPackage?.(pkg.id);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      packageId === pkg.id
                        ? 'bg-red-950/70 border-red-500 shadow-md ring-1 ring-red-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{pkg.name}</span>
                      {pkg.badge && (
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-mono font-black text-amber-400">
                      {pkg.priceFormatted}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Single Platform Selector (Conditional) */}
            {activePackage.platformsSupported === 'single' ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Pilih 1 Platform Penayangan Target:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Instagram', 'TikTok', 'Facebook'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedSinglePlatform(plat)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                        selectedSinglePlatform === plat
                          ? 'bg-red-700 text-white border-red-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Paket ini otomatis Mirroring tayang di 3 platform sekaligus (IG + TikTok + FB).</span>
              </div>
            )}

            {/* Step 3: Add-on Counter */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="text-sm font-bold text-white">Tambahan Instagram Story</div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  +Rp50.000 per 1 tayangan story aktif 24 jam dengan link sticker
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExtraStories(Math.max(0, extraStories - 1))}
                  disabled={extraStories === 0}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
                  aria-label="Kurangi Story"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono font-black text-base text-amber-300">
                  {extraStories}
                </span>
                <button
                  type="button"
                  onClick={() => setExtraStories(extraStories + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700"
                  aria-label="Tambah Story"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step 4: Brand Name, Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-red-400" />
                  <span>Nama Brand / Instansi</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Kopi Janji Minang"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rencana Tanggal Tayang (Min. H-1) *</span>
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={scheduleDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-white font-mono text-xs focus:outline-none ${
                    dateError ? 'border-red-500' : 'border-slate-800 focus:border-red-500'
                  }`}
                />
                {dateError && (
                  <p className="text-[11px] font-mono text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{dateError}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan Singkat / Pesan Tambahan</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan materi promosi, link akun, atau jam tayang prioritas..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          </div>

          {/* Right Summary: Live Total & Instant Order Buttons */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                Ringkasan Order Iklan
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Live Calculator
              </span>
            </div>

            {/* Selected Package Breakdown */}
            <div className="space-y-3 py-4 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Paket:</span>
                <span className="font-bold text-white">{activePackage.name}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Platform:</span>
                <span className="font-bold text-white">
                  {activePackage.platformsSupported === 'all'
                    ? '3 Platform (IG + TikTok + FB)'
                    : selectedSinglePlatform}
                </span>
              </div>

              {extraStories > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span>Extra Story ({extraStories}x):</span>
                  <span className="font-bold text-amber-300">
                    +Rp{(extraStories * extraStoryPrice).toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-300">
                <span>Jadwal Tayang:</span>
                <span className="font-bold text-emerald-400">
                  {scheduleDate || 'Belum diisi'}
                </span>
              </div>
            </div>

            {/* Estimated Reach Output */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Estimasi Jangkauan Audiens:</span>
              </div>
              <div className="text-sm font-mono font-black text-amber-300 mt-1">
                {estimatedReach}
              </div>
            </div>

            {/* Total Price Display */}
            <div className="pt-2 mb-6">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Biaya Penayangan:
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                Rp{totalPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                *Sudah termasuk Collab Post & tag akun resmi tanpa biaya tersembunyi.
              </p>
            </div>

            {/* Action Buttons: WhatsApp & Email */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-500"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pesan via WhatsApp Sekarang</span>
              </a>

              <a
                href={emailDraftUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Kirim Draft via Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
