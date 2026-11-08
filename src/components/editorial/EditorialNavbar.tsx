'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import { MessageCircle, Menu, X, Flame, ShieldCheck, Newspaper } from 'lucide-react';

export function EditorialNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { brand } = MEDIA_KIT_DATA;

  const navLinks = [
    { label: 'Analitik Platform', href: '#platform-analytics' },
    { label: 'Daftar Tarif', href: '#pricing-packages' },
    { label: 'Portofolio Iklan', href: '#portfolio-showcase' },
    { label: 'Kalkulator Order', href: '#pricing-calculator' },
    { label: 'Ketentuan Iklan', href: '#terms-accordion' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Ticker Ribbon */}
      <div className="bg-red-900 text-white text-[11px] sm:text-xs font-mono font-medium py-1 px-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold tracking-wide uppercase">
            Official Media Kit & Paid Promote 2026
          </span>
          <span className="hidden md:inline text-red-200">|</span>
          <span className="hidden md:inline text-red-100">
            {brand.followersBadge}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-red-200">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            Media Terpercaya Sumbar
          </span>
          <span>WhatsApp: {brand.whatsappDisplay}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-700 to-red-900 border border-red-500/40 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-950/40 group-hover:scale-105 transition-transform">
              <span className="tracking-tighter">ST</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  SUMBAR TERKINI
                </span>
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Digital News & Viral Media Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-red-900/30 transition-all border border-red-600"
            >
              <MessageCircle className="w-4 h-4 text-amber-300" />
              <span>Hubungi WhatsApp</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-800">
            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-700 text-white font-bold text-sm shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-amber-300" />
              <span>Konsultasi Slot WhatsApp (0896-1766-2378)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

