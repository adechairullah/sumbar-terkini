'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';

export function EditorialNavbar() {
  const { brand } = MEDIA_KIT_DATA;

  const navLinks = [
    { label: 'Platform & Metrik', href: '#socials-heading' },
    { label: 'Rate Card Iklan', href: '#rate-calculator' },
    { label: 'Kalkulator Order', href: '#order-calculator-widget' },
    { label: 'Syarat & Ketentuan', href: '#terms-section' },
    { label: 'Kontak Resmi', href: '#contact-hub' },
  ];

  return (
    <>
      {/* Top Announcement Bar (Clean without slot mention) */}
      <div className="bg-mustard border-b-2 border-ink py-2 px-4 text-center text-xs font-mono font-bold text-ink">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-ink shrink-0" />
          <span>{brand.followersBadge} Lintas Ranah Minang & Nasional • Media Kit & Paid Promote Resmi Sumbar Terkini</span>
        </span>
      </div>

      {/* Sticky Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-ink px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand Identity (Enlarged and Proportional) */}
          <a href="#" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-ink shadow-neo-sm flex items-center justify-center overflow-hidden shrink-0 relative group-hover:scale-105 transition-transform">
              <Image
                src="/logo-sumbar-terkini.png"
                alt="Sumbar Terkini Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-black text-base sm:text-xl text-ink font-sans tracking-tight block leading-tight">
                {brand.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-ink/70 block uppercase tracking-wider">
                Media Kit & Paid Promote Resmi
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs font-bold text-ink">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-coral transition-colors py-1.5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2.5">
            <a
              href="#order-calculator-widget"
              className="neo-button min-h-[44px] text-xs font-mono font-bold py-2.5 px-4 sm:px-5 bg-mint hover:bg-mint-hover text-ink rounded-xl flex items-center gap-1.5 border-2 border-ink shadow-neo-sm"
            >
              <span>Pasang Iklan</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink" />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
