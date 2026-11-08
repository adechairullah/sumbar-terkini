'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Mail, FileDown, Check, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { cn } from '@/lib/utils/cn';

export interface ContactHubProps {
  email?: string;
  whatsappNumber?: string;
  mediaKitPdfUrl?: string;
  className?: string;
}

export function ContactHub({
  email: propEmail,
  whatsappNumber: propWhatsapp,
  mediaKitPdfUrl = '/media-kit-sumbar-terkini.pdf',
  className,
}: ContactHubProps) {
  const { copyText } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const officialEmail = propEmail || MEDIA_KIT_DATA.brand.email;
  const officialPhoneRaw = propWhatsapp || MEDIA_KIT_DATA.brand.whatsappNumber;
  const officialPhoneDisplay = MEDIA_KIT_DATA.brand.whatsappDisplay;

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyText(val, 'Tersalin ke clipboard!');
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <section id="contact-hub" className={cn('my-12 sm:my-16', className)} aria-labelledby="contact-heading">
      <div className="neo-card p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-ink shadow-neo-lg">
        <div className="max-w-2xl mb-8">
          <span className="neo-badge bg-mustard text-ink text-xs mb-2 inline-block">
            Saluran Kontak Resmi
          </span>
          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-ink font-sans">
            Mulai Pasang Iklan & Kolaborasi
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 font-normal leading-relaxed">
            Hubungi kami langsung via WhatsApp untuk konfirmasi slot kilat, kirimkan surat penawaran via email, atau unduh Media Kit PDF resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Email Card (Coral Tint) */}
          <div className="p-5 rounded-2xl border-2 border-ink bg-[#FFF5F7] shadow-neo-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/70">
                  Email Kerjasama
                </span>
                <Mail className="w-5 h-5 text-coral" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4 select-all">
                {officialEmail}
              </div>
            </div>

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
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-ink" />
                  <span>Salin Email Resmi</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Direct Card (Mint Tint) */}
          <div className="p-5 rounded-2xl border-2 border-ink bg-[#E8FAF4] shadow-neo-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/70">
                  WhatsApp Pemesanan
                </span>
                <MessageCircle className="w-5 h-5 text-mint" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4 select-all">
                {officialPhoneDisplay}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${officialPhoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl border-2 border-ink bg-mint hover:bg-mint-hover font-mono text-xs font-bold text-ink flex items-center justify-center gap-1.5 shadow-neo-sm min-h-[44px]"
              >
                <span>Chat WA</span>
                <ExternalLink className="w-3.5 h-3.5 text-ink" />
              </a>

              <button
                type="button"
                role="button"
                tabIndex={0}
                aria-label="Salin nomor WhatsApp"
                onClick={() => handleCopy('phone', officialPhoneRaw)}
                className="py-2.5 px-3 rounded-xl border-2 border-ink bg-white hover:bg-mustard font-mono text-xs font-bold text-ink flex items-center justify-center gap-1 shadow-neo-sm min-h-[44px]"
                title="Salin Nomor"
              >
                {copiedKey === 'phone' ? (
                  <Check className="w-4 h-4 text-ink stroke-[3]" />
                ) : (
                  <Copy className="w-4 h-4 text-ink" />
                )}
              </button>
            </div>
          </div>

          {/* Media Kit PDF Download Card (Mustard Tint) */}
          <div className="p-5 rounded-2xl border-2 border-ink bg-[#FFF8E7] shadow-neo-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/70">
                  Dokumen Resmi 2026
                </span>
                <FileDown className="w-5 h-5 text-mustard" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4">
                Media Kit 2026 (PDF)
              </div>
            </div>

            <a
              href={mediaKitPdfUrl}
              download
              className="w-full py-2.5 px-3 rounded-xl border-2 border-ink bg-mustard hover:bg-mustard-hover font-mono text-xs font-bold text-ink flex items-center justify-center gap-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              aria-label="Unduh Media Kit PDF lengkap"
            >
              <FileDown className="w-4 h-4 text-ink" />
              <span>Unduh Media Kit (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
