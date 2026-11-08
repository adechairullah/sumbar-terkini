'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { MessageCircle, Mail, Heart, FileDown } from 'lucide-react';

export function EditorialFooter() {
  const { brand, platforms } = MEDIA_KIT_DATA;

  const quickLinks = [
    { label: 'Platform & Metrik', href: '#socials-heading' },
    { label: 'Rate Card Iklan', href: '#rate-calculator' },
    { label: 'Kalkulator Order', href: '#order-calculator-widget' },
    { label: 'Syarat & Ketentuan', href: '#terms-section' },
    { label: 'Kontak Resmi', href: '#contact-hub' },
  ];

  return (
    <footer className="border-t-2 border-ink bg-white mt-16 py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b-2 border-ink/10">
          {/* Brand Info & Logo (Enlarged and Crisp 1:1) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-ink shadow-neo-sm overflow-hidden relative shrink-0">
                <Image
                  src="/logo-sumbar-terkini.png"
                  alt="Sumbar Terkini Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-ink font-sans">
                  {brand.name}
                </h3>
                <p className="font-mono text-xs text-ink/70">
                  Media Kit & Paid Promote Resmi 2026
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink/80 leading-relaxed max-w-md font-sans font-normal">
              {brand.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-button min-h-[44px] py-2 px-3.5 rounded-xl bg-mint text-ink text-xs font-mono font-bold flex items-center gap-1.5 border-2 border-ink shadow-neo-sm hover:bg-mint-hover"
              >
                <MessageCircle className="w-4 h-4 text-ink" />
                <span>WhatsApp: {brand.whatsappDisplay}</span>
              </a>

              <a
                href={`mailto:${brand.email}`}
                className="neo-button min-h-[44px] py-2 px-3.5 rounded-xl bg-paper text-ink text-xs font-mono font-bold flex items-center gap-1.5 border-2 border-ink shadow-neo-sm hover:bg-mustard"
              >
                <Mail className="w-4 h-4 text-ink" />
                <span>{brand.email}</span>
              </a>

              <a
                href="/media-kit-sumbar-terkini.pdf"
                download
                className="neo-button min-h-[44px] py-2 px-3.5 rounded-xl bg-mustard text-ink text-xs font-mono font-bold flex items-center gap-1.5 border-2 border-ink shadow-neo-sm hover:bg-mustard-hover"
              >
                <FileDown className="w-4 h-4 text-ink" />
                <span>Download Media Kit (PDF)</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70 mb-3">
              Navigasi Halaman:
            </h4>
            <ul className="space-y-2 text-xs font-mono font-bold text-ink">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-coral transition-colors flex items-center gap-1.5 py-0.5"
                  >
                    <span>•</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Channels */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink/70 mb-3">
              Akun Media Sosial:
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              {platforms.map((plat) => (
                <li key={plat.id}>
                  <a
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-paper hover:bg-mustard border border-ink/20 text-ink font-bold transition-colors"
                  >
                    <span>{plat.name}</span>
                    <span className="text-[10px] text-ink/70">{plat.followersFormatted}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-ink/70">
          <p>
            © 2026 {brand.name}. {brand.location}. Hak cipta dilindungi undang-undang.
          </p>
          <p className="flex items-center gap-1">
            <span>Dibuat dengan semangat</span>
            <Heart className="w-3.5 h-3.5 fill-coral text-coral" />
            <span>Ranah Minang</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
