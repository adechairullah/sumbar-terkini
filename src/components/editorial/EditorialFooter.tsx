'use client';

import React from 'react';
import Link from 'next/link';
import { MEDIA_KIT_DATA } from '@/data/mediaKitData';
import {
  MessageCircle,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Heart,
} from 'lucide-react';

export function EditorialFooter() {
  const { brand, platforms } = MEDIA_KIT_DATA;

  return (
    <footer className="bg-slate-950 text-white pt-14 pb-24 lg:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center font-black text-white text-base">
                ST
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                SUMBAR TERKINI
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Portal media informasi digital independen, rujukan berita viral, analisis sosial politik, dan mitra periklanan terpercaya di Sumatera Barat.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>330.200+ Komunitas Terverifikasi</span>
            </div>
          </div>

          {/* Direct Contact Channels (Section 6 in prompt) */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono text-red-400 uppercase tracking-wider">
              Kontak & Pemesanan Iklan
            </h4>
            <div className="space-y-2.5 text-xs font-mono">
              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">WhatsApp Resmi</div>
                  <div className="font-bold text-emerald-400 group-hover:underline">
                    {brand.whatsappDisplay}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/80 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-red-950 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Email Redaksi & Iklan</div>
                  <div className="font-bold text-red-300 group-hover:underline">
                    {brand.email}
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{brand.location}</span>
              </div>
            </div>
          </div>

          {/* Official Media Channels */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono text-red-400 uppercase tracking-wider">
              Akun Media Sosial Resmi
            </h4>
            <div className="space-y-2 text-xs">
              {platforms.map((plat) => (
                <a
                  key={plat.id}
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <span className="font-medium">{plat.name} ({plat.handle})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links & Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono text-red-400 uppercase tracking-wider">
              Navigasi Halaman
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li>
                <a href="#platform-analytics" className="hover:text-amber-300 transition-colors">
                  • Metrik & Analitik Platform
                </a>
              </li>
              <li>
                <a href="#pricing-packages" className="hover:text-amber-300 transition-colors">
                  • Daftar Paket Paid Promote
                </a>
              </li>
              <li>
                <a href="#portfolio-showcase" className="hover:text-amber-300 transition-colors">
                  • Portofolio & Bukti Tayang
                </a>
              </li>
              <li>
                <a href="#pricing-calculator" className="hover:text-amber-300 transition-colors">
                  • Kalkulator Biaya & Pesan WA
                </a>
              </li>
              <li>
                <a href="#terms-accordion" className="hover:text-amber-300 transition-colors">
                  • Syarat & Ketentuan Iklan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-mono text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-slate-200">Sumbar Terkini</span>. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="text-slate-300">
            Platform Media Digital & Paid Promote Independen Ranah Minang
          </div>
        </div>
      </div>
    </footer>
  );
}

