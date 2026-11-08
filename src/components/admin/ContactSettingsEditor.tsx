'use client';

import React, { useState } from 'react';
import { SiteSettings } from '@/types';
import { repository } from '@/lib/data/repository';
import { normalizePhoneNumber } from '@/lib/utils/whatsapp';
import { useToast } from '@/components/ui/Toast';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import {
  PhoneCall,
  Mail,
  FileDown,
  MessageSquare,
  Save,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ContactSettingsEditorProps {
  initialSettings: SiteSettings;
  onSaveSuccess?: (updated: SiteSettings) => void;
}

const TEMPLATE_VARIABLES = [
  { label: 'Nama Kreator', token: '{{creator_name}}' },
  { label: 'Paket Terpilih', token: '{{package_names}}' },
  { label: 'Total Harga', token: '{{total_price}}' },
  { label: 'Tier Paket', token: '{{tier_name}}' },
];

export function ContactSettingsEditor({
  initialSettings,
  onSaveSuccess,
}: ContactSettingsEditorProps) {
  const { showToast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsapp_number || '081234567890'
  );
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    initialSettings.whatsapp_template ||
    'Halo Admin {{creator_name}}, saya tertarik untuk booking endorsement: {{package_names}} (Tier {{tier_name}}).'
  );
  const [businessEmail, setBusinessEmail] = useState(
    initialSettings.business_email || 'mrrobot4444@gmail.com'
  );
  const [mediaKitPdfUrl, setMediaKitPdfUrl] = useState(
    initialSettings.media_kit_pdf_url || '/downloads/media-kit-sumbar-terkini.pdf'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedPhone = normalizePhoneNumber(whatsappNumber);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!normalizedPhone || normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      errs.phone = 'Nomor WhatsApp tidak valid (harus 8 - 15 digit angka).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!businessEmail.trim() || !emailRegex.test(businessEmail.trim())) {
      errs.email = 'Format alamat email bisnis tidak valid.';
    }

    const cleanPdf = mediaKitPdfUrl.trim();
    if (!cleanPdf || !cleanPdf.toLowerCase().endsWith('.pdf')) {
      errs.pdf = 'URL Media Kit harus berakhiran ekstensi .pdf.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInsertToken = (token: string) => {
    setWhatsappTemplate((prev) => `${prev} ${token}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast({ message: 'Harap perbaiki kolom yang tidak valid.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await repository.updateSiteSettings({
        whatsapp_number: normalizedPhone,
        whatsapp_template:
          whatsappTemplate.trim() || 'Halo Admin, booking endorsement.',
        business_email: businessEmail.trim(),
        media_kit_pdf_url: mediaKitPdfUrl.trim(),
      });

      showToast({ message: 'Pengaturan Kontak & CTA berhasil disimpan!', type: 'success' });
      onSaveSuccess?.(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan kontak.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 font-sans pb-12">
      {/* Section 1: WhatsApp Business Contact */}
      <NeoCard className="p-5 sm:p-6 space-y-6">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-mint" />
              <span>Nomor WhatsApp Bisnis & Normalisasi</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Normalisasi otomatis dari format lokal (08xxx) atau internasional (+62xxx) ke kode negara 62.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label
              htmlFor="wa-number"
              className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
            >
              Input Nomor WhatsApp
            </label>
            <input
              id="wa-number"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="0812-3456-7890"
              className={cn(
                'w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                errors.phone && 'border-coral'
              )}
              required
            />
            {errors.phone && (
              <p className="text-xs font-mono font-bold text-coral mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Normalization Live Feedback Box */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">
                Hasil Normalisasi
              </span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-mint">
                <CheckCircle2 className="w-4 h-4" />
                <span>Terverifikasi</span>
              </span>
            </div>

            <div className="font-mono text-lg font-black text-ink">
              +{normalizedPhone || '62...'}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-ink/20">
              <a
                href={`https://wa.me/${normalizedPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border-2 border-ink bg-white text-ink hover:bg-mustard/30 transition-colors font-mono text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Buka WhatsApp Test</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </NeoCard>

      {/* Section 2: Automated WhatsApp Template */}
      <NeoCard className="p-5 sm:p-6 space-y-6">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-mustard" />
              <span>Template Pesan WhatsApp Otomatis</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Teks order pre-filled yang langsung terbuka saat klien mengklik tombol Order di rate card.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="wa-template"
              className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider"
            >
              Teks Template Pesan
            </label>
            <span className="text-[11px] font-mono text-ink/60">
              Klik chip di bawah untuk menyisipkan variabel dinamis
            </span>
          </div>

          <textarea
            id="wa-template"
            rows={4}
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            placeholder="Halo Admin, booking endorsement."
            className="w-full p-4 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[120px]"
            required
          />

          {/* Variable Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="font-mono text-xs font-bold text-ink/70 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-mustard" />
              <span>Variabel:</span>
            </span>
            {TEMPLATE_VARIABLES.map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={() => handleInsertToken(v.token)}
                className="px-2.5 py-1.5 rounded-xl border border-ink bg-white hover:bg-mustard/30 text-ink font-mono text-xs font-bold shadow-neo-sm transition-colors min-h-[44px] flex items-center"
              >
                + {v.token} ({v.label})
              </button>
            ))}
          </div>
        </div>
      </NeoCard>

      {/* Section 3: Business Email & Media Kit PDF URL */}
      <NeoCard className="p-5 sm:p-6 space-y-6">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-coral" />
              <span>Email Bisnis & Tautan Media Kit PDF</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Kanal alternatif kemitraan agensi dan download file ringkasan media kit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Business Email */}
          <div>
            <label
              htmlFor="business-email"
              className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
            >
              Email Resmi Kemitraan
            </label>
            <input
              id="business-email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="mrrobot4444@gmail.com"
              className={cn(
                'w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                errors.email && 'border-coral'
              )}
              required
            />
            {errors.email && (
              <p className="text-xs font-mono font-bold text-coral mt-1">{errors.email}</p>
            )}
          </div>

          {/* Media Kit PDF URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="pdf-url"
                className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider"
              >
                URL File PDF Media Kit (Wajib .pdf)
              </label>
              {mediaKitPdfUrl.toLowerCase().endsWith('.pdf') && (
                <a
                  href={mediaKitPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-ink underline hover:text-coral flex items-center gap-1 min-h-[44px]"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Test Unduh PDF</span>
                </a>
              )}
            </div>
            <input
              id="pdf-url"
              type="text"
              value={mediaKitPdfUrl}
              onChange={(e) => setMediaKitPdfUrl(e.target.value)}
              placeholder="/downloads/media-kit-sumbar-terkini.pdf"
              className={cn(
                'w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                errors.pdf && 'border-coral'
              )}
              required
            />
            {errors.pdf && (
              <p className="text-xs font-mono font-bold text-coral mt-1">{errors.pdf}</p>
            )}
          </div>
        </div>
      </NeoCard>

      {/* Save Action Bar */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <NeoButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSaving}
          className="gap-2 shadow-neo min-h-[48px] px-8"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Kontak'}</span>
        </NeoButton>
      </div>
    </form>
  );
}

