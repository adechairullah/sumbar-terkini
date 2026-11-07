'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Mail, Phone, FileDown, Check, MessageCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ContactHubProps {
  email: string;
  whatsappNumber: string;
  mediaKitPdfUrl: string;
  className?: string;
}

export function ContactHub({
  email,
  whatsappNumber,
  mediaKitPdfUrl,
  className,
}: ContactHubProps) {
  const { copyText } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyText(val, 'Tersalin ke clipboard!');
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <section id="contact-hub" className={cn('my-16', className)} aria-labelledby="contact-heading">
      <div className="neo-card p-6 sm:p-10 bg-white rounded-2xl border-2 sm:border-3 border-ink shadow-neo-lg">
        <div className="max-w-2xl mb-8">
          <span className="neo-badge bg-mustard text-ink mb-2">
            Saluran Kontak Resmi
          </span>
          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Mulai Kolaborasi Hari Ini
          </h2>
          <p className="text-sm sm:text-base text-ink/80 mt-1 font-normal">
            Satu klik untuk menyalin email atau nomor WhatsApp bisnis, atau unduh Media Kit PDF lengkap untuk presentasi internal brand Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email Copy Card */}
          <div className="p-4 rounded-xl border-2 border-ink bg-paper flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/60">
                  Email Kerjasama
                </span>
                <Mail className="w-4 h-4 text-coral" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4">
                {email || 'kerjasama@sumbarterkini.id'}
              </div>
            </div>

            <button
              type="button"
              role="button"
              tabIndex={0}
              aria-label="Salin email bisnis"
              onClick={() => handleCopy('email', email || 'kerjasama@sumbarterkini.id')}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleCopy('email', email || 'kerjasama@sumbarterkini.id');
                }
              }}
              className="w-full py-2.5 px-3 rounded-lg border-2 border-ink bg-white hover:bg-mustard/20 font-mono text-xs font-bold text-ink flex items-center justify-center gap-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
            >
              {copiedKey === 'email' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-mint stroke-[3]" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Email</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Direct & Copy Card */}
          <div className="p-4 rounded-xl border-2 border-ink bg-paper flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/60">
                  WhatsApp Bisnis
                </span>
                <MessageCircle className="w-4 h-4 text-mint" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4">
                +{whatsappNumber || '6281234567890'}
              </div>
            </div>

            <button
              type="button"
              role="button"
              tabIndex={0}
              aria-label="Salin nomor WhatsApp"
              onClick={() => handleCopy('phone', whatsappNumber || '6281234567890')}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleCopy('phone', whatsappNumber || '6281234567890');
                }
              }}
              className="w-full py-2.5 px-3 rounded-lg border-2 border-ink bg-white hover:bg-mint/20 font-mono text-xs font-bold text-ink flex items-center justify-center gap-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
            >
              {copiedKey === 'phone' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-mint stroke-[3]" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor</span>
                </>
              )}
            </button>
          </div>

          {/* Media Kit PDF Download Card */}
          <div className="p-4 rounded-xl border-2 border-ink bg-paper flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase font-bold text-ink/60">
                  Dokumen Resmi
                </span>
                <FileDown className="w-4 h-4 text-mustard" />
              </div>
              <div className="font-mono font-bold text-sm text-ink truncate mb-4">
                Media Kit 2026 (PDF)
              </div>
            </div>

            <a
              href={mediaKitPdfUrl || '/media-kit-sumbar-terkini.pdf'}
              download
              className="w-full py-2.5 px-3 rounded-lg border-2 border-ink bg-white hover:bg-coral/20 font-mono text-xs font-bold text-ink flex items-center justify-center gap-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              aria-label="Unduh Media Kit PDF lengkap"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

