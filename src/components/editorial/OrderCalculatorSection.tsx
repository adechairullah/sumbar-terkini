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
  Sparkles,
  Gift,
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

  const isStandaloneStory = activePackage.id === 'ig-story';

  // Tomorrow calculation for H-1 rule
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const handleDateChange = (val: string) => {
    setScheduleDate(val);
    if (!val) {
      setDateError('Tanggal tayang wajib diisi (minimal H-1 sebelum tayang).');
      return;
    }
    const chosen = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = (chosen.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 1) {
      setDateError('Sesuai ketentuan resmi, materi wajib dikirim dan dijadwalkan minimal H-1 sebelum tayang.');
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
    return '65.000 - 350.000+ akun (Demografi Kuat 25-54 Th)';
  }, [activePackage, selectedSinglePlatform]);

  // Format WhatsApp Message
  const whatsappUrl = useMemo(() => {
    const bName = brandName.trim() || '[Nama Brand Belum Diisi]';
    const sDate = scheduleDate || '[Belum Ditentukan, Mohon Rekomendasi Slot]';
    const platformDisplay =
      activePackage.platformsSupported === 'all'
        ? 'Semua Platform (Instagram, TikTok, Facebook)'
        : selectedSinglePlatform;

    const bonusInfo = isStandaloneStory
      ? 'Paket Mandiri Story'
      : 'Include Free 1x Instagram Story 24 Jam (Bonus Otomatis)';

    const extraStoryInfo = extraStories > 0 ? `${extraStories}x Tambahan (+Rp${(extraStories * extraStoryPrice).toLocaleString('id-ID')})` : 'Tidak ada tambahan';

    const message = `Halo Admin Sumbar Terkini, saya ingin pasang iklan:

- Nama Brand: ${bName}
- Paket Dipilih: ${activePackage.name} (${activePackage.priceFormatted})
- Platform Target: ${platformDisplay}
- Bonus Story: ${bonusInfo}
- Extra Story Tambahan: ${extraStoryInfo}
- Rencana Tanggal Tayang: ${sDate}
- Estimasi Total Biaya: Rp${totalPrice.toLocaleString('id-ID')}
- Catatan Tambahan: ${notes.trim() || '-'}

Mohon konfirmasi ketersediaan slot tayang dan nomor rekening resmi. Terima kasih!`;

    return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [brandName, activePackage, selectedSinglePlatform, extraStories, scheduleDate, totalPrice, notes, brand.whatsappNumber, isStandaloneStory]);

  // Format Email mailto link
  const emailMailtoUrl = useMemo(() => {
    const bName = brandName.trim() || 'Brand Partner';
    const sDate = scheduleDate || 'Segera (H-1)';
    const platformDisplay =
      activePackage.platformsSupported === 'all'
        ? 'Mirroring 3 Platform (IG, TikTok, FB)'
        : selectedSinglePlatform;

    const subject = `[Order Iklan] ${bName} - ${activePackage.name}`;
    const body = `Halo Tim Kemitraan Sumbar Terkini,

Berikut adalah draf pemesanan iklan promosi kami:

Nama Brand / Instansi: ${bName}
Paket Pilihan: ${activePackage.name}
Platform: ${platformDisplay}
Bonus: Free 1x Instagram Story (Sudah Termasuk)
Tambahan Story Ekstra: ${extraStories} story
Rencana Tanggal Tayang: ${sDate}
Total Estimasi Biaya: Rp${totalPrice.toLocaleString('id-ID')}
Catatan: ${notes.trim() || '-'}

Mohon informasi ketersediaan slot dan invoice pembayaran.

Terima kasih.`;

    return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [brandName, activePackage, selectedSinglePlatform, extraStories, scheduleDate, totalPrice, notes, brand.email]);

  return (
    <section id="order-calculator-widget" className="my-12 sm:my-16" aria-labelledby="calc-widget-heading">
      <div className="neo-card bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-ink shadow-neo-lg p-6 sm:p-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mustard text-ink text-xs mb-2">
            <Calculator className="w-3.5 h-3.5 text-ink" />
            <span>Widget Interaktif Pemesanan</span>
          </div>
          <h2 id="calc-widget-heading" className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-sans">
            Kalkulator Order & Generator WhatsApp
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 leading-relaxed font-normal">
            Pilih paket promosi Anda. Setiap paket promo otomatis sudah gratis 1x Instagram Story! Klik tombol untuk mengirim format order otomatis langsung ke WhatsApp resmi Sumbar Terkini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Inputs & Configuration */}
          <div className="lg:col-span-7 bg-paper border-2 border-ink rounded-2xl p-6 sm:p-8 shadow-neo space-y-6">
            {/* Step 1: Select Package */}
            <div>
              <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-2.5">
                1. Pilih Paket Promosi:
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
                    className={`min-h-[48px] p-3.5 rounded-xl border-2 text-left transition-all ${
                      packageId === pkg.id
                        ? 'bg-mustard border-ink shadow-neo-sm font-bold'
                        : 'bg-white border-ink/40 hover:border-ink text-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-ink">{pkg.name}</span>
                      {pkg.badge && (
                        <span className="text-[10px] font-mono font-bold text-ink bg-white border border-ink px-1.5 py-0.5 rounded">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-mono font-black text-ink">
                      {pkg.priceFormatted}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Single Platform Selector (Conditional) */}
            {activePackage.platformsSupported === 'single' ? (
              <div className="p-4 rounded-xl bg-white border-2 border-ink">
                <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-2">
                  2. Pilih 1 Platform Penayangan Target:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Instagram', 'TikTok', 'Facebook'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedSinglePlatform(plat)}
                      className={`min-h-[44px] py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all border-2 ${
                        selectedSinglePlatform === plat
                          ? 'bg-mint text-ink border-ink shadow-neo-sm'
                          : 'bg-paper text-ink border-ink/30 hover:border-ink'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-mint/40 border-2 border-ink text-xs font-mono text-ink flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
                <span>Paket ini otomatis Mirroring tayang serentak di 3 platform sekaligus (IG, TikTok, FB).</span>
              </div>
            )}

            {/* Step 3: Free Story Confirmation + Optional Extra Story */}
            <div className="p-4 rounded-xl bg-white border-2 border-ink space-y-3">
              {!isStandaloneStory ? (
                <div className="p-3 rounded-lg bg-mint/30 border border-ink/30 flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-ink shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-ink block">
                      Sudah Termasuk 1x Free Instagram Story 24 Jam!
                    </span>
                    <span className="text-ink/70 text-[11px]">
                      Posting feed/reels otomatis kami repost ke Instagram Story gratis dengan stiker tautan aktif.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-ink/80 font-mono">
                  Paket Instagram Story Standalone (Rp50.000 / tayangan 24 jam).
                </div>
              )}

              {/* Optional Extra Story Counter */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="block text-xs font-mono font-bold text-ink uppercase tracking-wider">
                    {isStandaloneStory ? 'Jumlah Tayangan Story' : 'Tambah Story Ekstra (Opsional)'}
                  </span>
                  <span className="text-[11px] text-ink/70">
                    +Rp50.000 / story {isStandaloneStory ? '' : 'di luar 1x bonus gratis'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExtraStories((prev) => Math.max(0, prev - 1))}
                    disabled={extraStories === 0}
                    className="w-10 h-10 rounded-lg bg-paper border-2 border-ink flex items-center justify-center text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mustard shadow-neo-sm transition-colors"
                    aria-label="Kurangi Story"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono font-black text-base text-ink">
                    {extraStories}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraStories((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-paper border-2 border-ink flex items-center justify-center text-ink hover:bg-mustard shadow-neo-sm transition-colors"
                    aria-label="Tambah Story"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: Brand Name, Date & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-ink" />
                  <span>Nama Brand / Instansi / Toko:</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kopi Ranah Minang, Padang"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-ink text-ink text-sm font-sans placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink" />
                  <span>Rencana Tanggal Tayang (Aturan Minimal H-1):</span>
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={scheduleDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-ink text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink min-h-[44px]"
                />
                {dateError && (
                  <p className="mt-1.5 text-xs text-coral font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{dateError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-ink" />
                  <span>Catatan Khusus / Deskripsi Singkat:</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Lampiran link Google Drive materi video, mohon tayang jam 19.00 WIB."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-ink text-ink text-sm font-sans placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Order Summary & WhatsApp Action */}
          <div className="lg:col-span-5 bg-mustard rounded-2xl border-2 border-ink shadow-neo p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
            <div className="border-b-2 border-ink/20 pb-4">
              <span className="neo-badge bg-white text-ink text-[11px] font-mono mb-2 inline-block">
                Ringkasan Pemesanan
              </span>
              <h3 className="text-xl font-black text-ink font-sans">
                Estimasi Biaya & Jangkauan
              </h3>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-ink/80">Paket Utama:</span>
                <span className="font-bold text-ink text-right">{activePackage.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-ink/80">Harga Dasar:</span>
                <span className="font-bold text-ink">{activePackage.priceFormatted}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-ink/80">Platform:</span>
                <span className="font-bold text-ink text-right">
                  {activePackage.platformsSupported === 'all'
                    ? '3 Platform (IG, TikTok, FB)'
                    : selectedSinglePlatform}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-ink/80">Bonus Story:</span>
                <span className="font-bold text-ink text-right">
                  {isStandaloneStory ? 'Tidak Ada' : 'FREE 1x Story (24 Jam)'}
                </span>
              </div>
              {extraStories > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                  <span className="text-ink/80">Story Ekstra ({extraStories}x):</span>
                  <span className="font-bold text-ink">
                    +Rp{(extraStories * extraStoryPrice).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-ink/80">Rencana Tayang:</span>
                <span className="font-bold text-ink">{scheduleDate || 'Belum diisi'}</span>
              </div>
            </div>

            {/* Estimated Reach Card */}
            <div className="p-3.5 rounded-xl bg-white border-2 border-ink">
              <div className="text-[10px] font-mono font-bold uppercase text-ink/70 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-ink" />
                <span>Estimasi Potensi Jangkauan:</span>
              </div>
              <div className="text-sm font-bold text-ink leading-snug">
                {estimatedReach}
              </div>
            </div>

            {/* Total Price Display */}
            <div className="pt-2">
              <div className="text-xs font-mono font-bold text-ink/70 uppercase">
                Total Investasi Iklan:
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-ink mt-0.5">
                Rp{totalPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-ink/70 mt-1 font-mono">
                Bebas Collab Post & include Free Story tanpa biaya tambahan.
              </p>
            </div>

            {/* Primary Action Button: WhatsApp */}
            <div className="space-y-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-button w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-mint hover:bg-mint-hover text-ink text-sm font-mono font-black flex items-center justify-center gap-2 border-2 border-ink shadow-neo"
              >
                <MessageCircle className="w-5 h-5 text-ink" />
                <span>Pesan via WhatsApp Sekarang</span>
              </a>

              {/* Secondary Action: Email Draft */}
              <a
                href={emailMailtoUrl}
                className="neo-button w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white hover:bg-paper text-ink text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 border-ink shadow-neo-sm"
              >
                <Mail className="w-4 h-4 text-ink" />
                <span>Kirim Draft via Email Resmi</span>
              </a>
            </div>

            {/* Mini Notice */}
            <p className="text-[11px] text-center text-ink/70 font-mono">
              Konfirmasi slot resmi via WhatsApp 0896-1766-2378
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
