'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  Mail,
  FileDown,
  Check,
  MessageCircle,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
  Gift,
} from 'lucide-react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { cn } from '@/lib/utils/cn';

export interface ContactHubProps {
  email?: string;
  whatsappNumber?: string;
  mediaKitPdfUrl?: string;
  className?: string;
}

export function ContactHub({
  email: _propEmail,
  whatsappNumber: _propWhatsapp,
  mediaKitPdfUrl = '/media-kit-sumbar-terkini.pdf',
  className,
}: ContactHubProps) {
  const { copyText } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Strictly enforced official contacts from single source of truth
  const officialEmail = MEDIA_KIT_DATA.brand.email; // mrrobot4444@gmail.com
  const officialPhoneRaw = MEDIA_KIT_DATA.brand.whatsappNumber; // 6289617662378
  const officialPhoneDisplay = MEDIA_KIT_DATA.brand.whatsappDisplay; // 0896-1766-2378

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyText(val, 'Tersalin ke clipboard!');
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <section id="contact-hub" className={cn('my-12 sm:my-16', className)} aria-labelledby="contact-heading">
      <div className="neo-card p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-ink shadow-neo-lg relative overflow-hidden">
        {/* Colorful Tri-Color Top Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-3 flex">
          <div className="flex-1 bg-coral" />
          <div className="flex-1 bg-mustard" />
          <div className="flex-1 bg-mint" />
        </div>

        {/* Section Title & Description */}
        <div className="max-w-2xl mb-8 pt-2">
          <div className="inline-flex items-center gap-1.5 neo-badge bg-mustard text-ink text-xs mb-2 border-2 border-ink shadow-neo-sm">
            <Sparkles className="w-3.5 h-3.5 text-ink shrink-0" />
            <span>Saluran Kontak Resmi & Layanan Kemitraan</span>
          </div>

          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-ink font-sans">
            Mulai Pasang Iklan & Kolaborasi
          </h2>

          <p className="text-sm sm:text-base text-ink/80 mt-1 font-normal leading-relaxed">
            Hubungi tim redaksi & bisnis Sumbar Terkini langsung via WhatsApp untuk konfirmasi slot kilat, kirimkan surat penawaran via email resmi, atau unduh Media Kit PDF lengkap.
          </p>

          {/* Trust Guarantee Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <span className="neo-badge bg-[#D1FAE5] text-ink text-[11px] font-mono font-bold flex items-center gap-1.5 border border-ink shadow-neo-sm">
              <Zap className="w-3.5 h-3.5 text-ink shrink-0" />
              <span>Respon Cepat &lt; 1 Jam</span>
            </span>

            <span className="neo-badge bg-[#FFE2E8] text-ink text-[11px] font-mono font-bold flex items-center gap-1.5 border border-ink shadow-neo-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-ink shrink-0" />
              <span>Konfirmasi Slot Terjamin</span>
            </span>

            <span className="neo-badge bg-[#FEF08A] text-ink text-[11px] font-mono font-bold flex items-center gap-1.5 border border-ink shadow-neo-sm">
              <Gift className="w-3.5 h-3.5 text-ink shrink-0" />
              <span>Free 1x Instagram Story</span>
            </span>
          </div>
        </div>

        {/* 3 Colorful Contact Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Email Card (Rich Coral / Rose Tint) */}
          <div className="p-6 rounded-2xl border-2 border-ink bg-[#FFE4EA] shadow-neo flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-coral" />

            <div className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-black tracking-wider text-ink/80">
                  Email Kerjasama
                </span>
                <div className="w-8 h-8 rounded-lg bg-coral border-2 border-ink shadow-neo-sm flex items-center justify-center text-ink shrink-0">
                  <Mail className="w-4 h-4 text-ink" />
                </div>
              </div>

              {/* Exact Email - Guaranteed Fully Visible without truncation */}
              <div className="font-mono font-black text-sm sm:text-base text-ink select-all break-all mb-4 bg-white/70 p-2.5 rounded-xl border border-ink/30">
                {officialEmail}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                role="button"
                tabIndex={0}
                aria-label="Salin email bisnis"
                onClick={() => handleCopy('email', officialEmail)}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-ink bg-white hover:bg-mustard font-mono text-xs font-bold text-ink flex items-center justify-center gap-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              >
                {copiedKey === 'email' ? (
                  <>
                    <Check className="w-4 h-4 text-ink stroke-[3]" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-ink" />
                    <span>Salin Email Resmi</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${officialEmail}?subject=Inquiry%20Kerjasama%20Iklan%20Sumbar%20Terkini`}
                className="w-full py-2 px-3 rounded-xl border border-ink/40 bg-white/50 hover:bg-white font-mono text-[11px] font-bold text-ink flex items-center justify-center gap-1.5 transition-colors min-h-[36px]"
              >
                <span>Kirim Surat via Email</span>
                <ExternalLink className="w-3 h-3 text-ink" />
              </a>
            </div>
          </div>

          {/* 2. WhatsApp Direct Card (Rich Mint / Emerald Tint) */}
          <div className="p-6 rounded-2xl border-2 border-ink bg-[#D1FAE5] shadow-neo flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-mint" />

            <div className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-black tracking-wider text-ink/80">
                  WhatsApp Pemesanan
                </span>
                <div className="w-8 h-8 rounded-lg bg-mint border-2 border-ink shadow-neo-sm flex items-center justify-center text-ink shrink-0">
                  <MessageCircle className="w-4 h-4 text-ink" />
                </div>
              </div>

              {/* Exact Phone - Fully Visible */}
              <div className="font-mono font-black text-base sm:text-lg text-ink select-all mb-4 bg-white/70 p-2.5 rounded-xl border border-ink/30">
                {officialPhoneDisplay}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://wa.me/${officialPhoneRaw}?text=Halo%20Admin%20Sumbar%20Terkini!%20Saya%20tertarik%20pasang%20iklan%20paid%20promote.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl border-2 border-ink bg-mint hover:bg-mint-hover font-mono text-xs font-black text-ink flex items-center justify-center gap-1.5 shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              >
                <span>Chat WA</span>
                <ExternalLink className="w-3.5 h-3.5 text-ink" />
              </a>

              <button
                type="button"
                role="button"
                tabIndex={0}
                aria-label="Salin nomor WhatsApp bisnis"
                onClick={() => handleCopy('phone', officialPhoneRaw)}
                className="w-12 py-2.5 rounded-xl border-2 border-ink bg-white hover:bg-mustard font-mono text-xs font-bold text-ink flex items-center justify-center shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
                title="Salin nomor WhatsApp"
              >
                {copiedKey === 'phone' ? (
                  <Check className="w-4 h-4 text-ink stroke-[3]" />
                ) : (
                  <Copy className="w-4 h-4 text-ink" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Media Kit PDF Document Card (Rich Mustard / Gold Tint) */}
          <div className="p-6 rounded-2xl border-2 border-ink bg-[#FEF08A] shadow-neo flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-mustard" />

            <div className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-black tracking-wider text-ink/80">
                  Dokumen Resmi 2026
                </span>
                <div className="w-8 h-8 rounded-lg bg-mustard border-2 border-ink shadow-neo-sm flex items-center justify-center text-ink shrink-0">
                  <FileDown className="w-4 h-4 text-ink" />
                </div>
              </div>

              <div className="font-mono font-black text-sm sm:text-base text-ink mb-4 bg-white/70 p-2.5 rounded-xl border border-ink/30">
                Media Kit 2026 (PDF 2 Halaman)
              </div>
            </div>

            <div className="pt-2">
              <a
                href={mediaKitPdfUrl}
                download="media-kit-sumbar-terkini-2026.pdf"
                className="w-full py-2.5 px-3 rounded-xl border-2 border-ink bg-mustard hover:bg-mustard-hover font-mono text-xs font-black text-ink flex items-center justify-center gap-2 shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              >
                <FileDown className="w-4 h-4 text-ink" />
                <span>Unduh Media Kit (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
