'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteSettings, ThemePreset, StickerItem, HeaderMenuItem } from '@/types';
import { repository } from '@/lib/data/repository';
import { useToast } from '@/components/ui/Toast';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { StickersManager } from '@/components/admin/StickersManager';
import {
  User,
  AtSign,
  Image as ImageIcon,
  FileText,
  Clock,
  Palette,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  Megaphone,
  Layers,
  Compass,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ProfileHeroEditorProps {
  initialSettings: SiteSettings;
  onSaveSuccess?: (updated: SiteSettings) => void;
}

const DEFAULT_HEADER_MENU: HeaderMenuItem[] = [
  { id: 'menu-1', label: 'Bento Grid', href: '#socials-heading', is_active: true },
  { id: 'menu-2', label: 'Rate Card', href: '#rate-calculator', is_active: true },
  { id: 'menu-3', label: 'Portofolio', href: '#portfolio-showcase', is_active: true },
  { id: 'menu-4', label: 'Kontak', href: '#contact-hub', is_active: true },
];

const AVATAR_PRESETS: Array<{ name: string; url: string }> = [
  {
    name: 'Minang Red',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Creative Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Professional Female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Media Producer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  },
];

const THEME_PRESETS: Array<{
  id: ThemePreset;
  title: string;
  description: string;
  bgHex: string;
  accentHex: string;
}> = [
  {
    id: 'neo-warm',
    title: 'Neo-Warm (Default)',
    description: 'Aksen Mustard cerah dengan latar hangat Minang klasik (#FAF8F5).',
    bgHex: '#FAF8F5',
    accentHex: '#FFD166',
  },
  {
    id: 'neo-mint',
    title: 'Neo-Mint Fresh',
    description: 'Aksen Mint segar, energetik, dan modern dengan latar lembut (#E6FBF5).',
    bgHex: '#E6FBF5',
    accentHex: '#06D6A0',
  },
  {
    id: 'neo-mustard',
    title: 'Neo-Mustard Bold',
    description: 'Kontras tinggi hitam pekat dengan aksen kuning emas cerah (#FFFBEA).',
    bgHex: '#FFFBEA',
    accentHex: '#FFB703',
  },
];

export function ProfileHeroEditor({
  initialSettings,
  onSaveSuccess,
}: ProfileHeroEditorProps) {
  const { showToast } = useToast();
  const [name, setName] = useState(initialSettings.creator_name || '');
  const [creatorTitle, setCreatorTitle] = useState(
    initialSettings.creator_title || 'Sumatera Barat Creator & Media Hub'
  );
  const [handle, setHandle] = useState(initialSettings.creator_handle || '');
  const [location, setLocation] = useState(initialSettings.location || 'Padang, Sumatera Barat');
  const [avatarUrl, setAvatarUrl] = useState(initialSettings.creator_avatar_url || '');
  const [bio, setBio] = useState(initialSettings.creator_bio || '');

  // Logo & Announcement settings
  const [logoText, setLogoText] = useState(initialSettings.logo_text || 'ST');
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url || '');
  const [announcementText, setAnnouncementText] = useState(
    initialSettings.announcement_text ||
      'Portal Media Kit Resmi & Endorsement Hub Sumbar Terkini 2026 | Ranah Minang & Perantauan'
  );

  // Public Header Navigation Menu Settings
  const [headerMenuItems, setHeaderMenuItems] = useState<HeaderMenuItem[]>(
    initialSettings.header_menu_items && initialSettings.header_menu_items.length > 0
      ? initialSettings.header_menu_items
      : DEFAULT_HEADER_MENU
  );
  const [headerCtaText, setHeaderCtaText] = useState(
    initialSettings.header_cta_text || 'Booking Slot'
  );
  const [headerCtaHref, setHeaderCtaHref] = useState(
    initialSettings.header_cta_href || '#rate-calculator'
  );

  // Slot availability
  const [slotAvailable, setSlotAvailable] = useState(initialSettings.slot_available ?? true);
  const [slotStatusText, setSlotStatusText] = useState(
    initialSettings.slot_status_text || 'Slot Terbuka Minggu Ini'
  );
  const [slotsRemaining, setSlotsRemaining] = useState<number>(
    initialSettings.slots_remaining ?? 3
  );

  // Theme preset
  const [themePreset, setThemePreset] = useState<ThemePreset>(
    initialSettings.theme_preset || 'neo-warm'
  );

  const [stickers, setStickers] = useState<StickerItem[]>(initialSettings.stickers || []);

  // Interactive Creator Hub Widget Settings (Left Column)
  const [showInteractiveHub, setShowInteractiveHub] = useState(
    initialSettings.show_interactive_hub !== false
  );
  const [interactiveHubDefaultTab, setInteractiveHubDefaultTab] = useState<'predictor' | 'highfive' | 'stats'>(
    initialSettings.interactive_hub_default_tab || 'predictor'
  );
  const [interactiveHubTitle, setInteractiveHubTitle] = useState(
    initialSettings.interactive_hub_title || 'Kalkulator Potensi Viral FYP & Apresiasi'
  );

  // Live Audience Pulse Settings (Right Column Top)
  const [showAudiencePulse, setShowAudiencePulse] = useState(
    initialSettings.show_audience_pulse !== false
  );
  const [audiencePulseTitle, setAudiencePulseTitle] = useState(
    initialSettings.audience_pulse_title || 'Live Audience Pulse & Fan Energy'
  );
  const [audiencePulseBadge, setAudiencePulseBadge] = useState(
    initialSettings.audience_pulse_badge || '2.8k Audiens Aktif'
  );

  // Creator Trust Radar Settings (Right Column Bottom)
  const [showTrustRadar, setShowTrustRadar] = useState(
    initialSettings.show_trust_radar !== false
  );
  const [trustRadarTitle, setTrustRadarTitle] = useState(
    initialSettings.trust_radar_title || 'Garansi Resmi & Radar Kolaborasi'
  );
  const [trustGuarantee1, setTrustGuarantee1] = useState(
    initialSettings.trust_guarantee_1 || '100% Organik & Anti-Bot Minang'
  );
  const [trustGuarantee2, setTrustGuarantee2] = useState(
    initialSettings.trust_guarantee_2 || 'Garansi 2x Revisi Draft Konten'
  );
  const [trustGuarantee3, setTrustGuarantee3] = useState(
    initialSettings.trust_guarantee_3 || 'Laporan Transparan Analytics H+3'
  );
  const [trustBonusText, setTrustBonusText] = useState(
    initialSettings.trust_bonus_text || 'Bonus Free Repost Story 24 Jam'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleThemeChange = (newTheme: ThemePreset) => {
    setThemePreset(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Menu Item Manipulation Helpers
  const handleAddMenuItem = () => {
    const newItem: HeaderMenuItem = {
      id: `menu-${Date.now()}`,
      label: 'Menu Baru',
      href: '#',
      is_active: true,
    };
    setHeaderMenuItems((prev) => [...prev, newItem]);
  };

  const handleUpdateMenuItem = (index: number, field: 'label' | 'href', value: string) => {
    setHeaderMenuItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleToggleMenuItem = (index: number) => {
    setHeaderMenuItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, is_active: !item.is_active } : item
      )
    );
  };

  const handleDeleteMenuItem = (index: number) => {
    setHeaderMenuItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= headerMenuItems.length) return;
    const reordered = [...headerMenuItems];
    const temp = reordered[index];
    const target = reordered[targetIdx];
    if (!temp || !target) return;
    reordered[index] = target;
    reordered[targetIdx] = temp;
    setHeaderMenuItems(reordered);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      errs.name = 'Nama kreator harus 2 - 100 karakter.';
    }

    const cleanHandle = handle.trim();
    if (!cleanHandle || cleanHandle.length < 2 || cleanHandle.length > 50) {
      errs.handle = 'Handle username harus 2 - 50 karakter.';
    }

    if (!avatarUrl.trim()) {
      errs.avatarUrl = 'URL avatar tidak boleh kosong.';
    }

    const cleanBio = bio.trim();
    if (!cleanBio || cleanBio.length < 5 || cleanBio.length > 500) {
      errs.bio = 'Bio kreator harus 5 - 500 karakter.';
    }

    const cleanSlotText = slotStatusText.trim();
    if (!cleanSlotText || cleanSlotText.length < 2 || cleanSlotText.length > 100) {
      errs.slotStatusText = 'Teks status slot harus 2 - 100 karakter.';
    }

    const cleanLogoText = logoText.trim();
    if (cleanLogoText.length > 10) {
      errs.logoText = 'Singkatan logo teks maksimal 10 karakter.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast({ message: 'Harap perbaiki kolom yang tidak valid.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const normalizedHandle = handle.trim().startsWith('@')
        ? handle.trim()
        : `@${handle.trim()}`;

      const updated = await repository.updateSiteSettings({
        creator_name: name.trim(),
        creator_title: creatorTitle.trim(),
        creator_handle: normalizedHandle,
        creator_avatar_url: avatarUrl.trim(),
        creator_bio: bio.trim(),
        location: location.trim(),
        slot_available: slotAvailable,
        slot_status_text: slotStatusText.trim(),
        slots_remaining: slotsRemaining,
        logo_text: logoText.trim() || 'ST',
        logo_url: logoUrl.trim(),
        announcement_text: announcementText.trim(),
        header_menu_items: headerMenuItems,
        header_cta_text: headerCtaText.trim() || 'Booking Slot',
        header_cta_href: headerCtaHref.trim() || '#rate-calculator',
        theme_preset: themePreset,
        stickers,
        show_interactive_hub: showInteractiveHub,
        interactive_hub_default_tab: interactiveHubDefaultTab,
        interactive_hub_title: interactiveHubTitle.trim() || 'Kalkulator Potensi Viral FYP & Apresiasi',
        show_audience_pulse: showAudiencePulse,
        audience_pulse_title: audiencePulseTitle.trim() || 'Live Audience Pulse & Fan Energy',
        audience_pulse_badge: audiencePulseBadge.trim() || '2.8k Audiens Aktif',
        show_trust_radar: showTrustRadar,
        trust_radar_title: trustRadarTitle.trim() || 'Garansi Resmi & Radar Kolaborasi',
        trust_guarantee_1: trustGuarantee1.trim() || '100% Organik & Anti-Bot Minang',
        trust_guarantee_2: trustGuarantee2.trim() || 'Garansi 2x Revisi Draft Konten',
        trust_guarantee_3: trustGuarantee3.trim() || 'Laporan Transparan Analytics H+3',
        trust_bonus_text: trustBonusText.trim() || 'Bonus Free Repost Story 24 Jam',
      });

      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', themePreset);
      }

      showToast({ message: 'Profil dan Hero berhasil diperbarui!', type: 'success' });
      onSaveSuccess?.(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 sm:space-y-8 font-sans pb-12 w-full max-w-full overflow-hidden">
      {/* Section 1: Creator Identity & Avatar */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-mustard" />
              <span>Identitas Kreator & Avatar</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Kelola nama tampilan, handle, lokasi, dan foto profil utama.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Avatar Preview & Quick Presets */}
          <div className="flex flex-col items-center justify-center p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm">
            <div className="relative w-28 h-28 rounded-2xl border-2 border-ink overflow-hidden bg-white shadow-neo mb-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name || 'Avatar'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-paper text-ink/40">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
            </div>
            <span className="font-mono text-xs font-bold text-ink">Preview Avatar</span>
            <span className="font-mono text-[10px] text-ink/60 text-center mt-0.5 mb-3">
              Rekomendasi rasio 1:1
            </span>

            {/* Quick Avatar Presets */}
            <div className="w-full pt-2 border-t border-ink/20">
              <span className="block text-[11px] font-mono font-bold text-ink/70 mb-2 text-center uppercase tracking-wider">
                Preset Cepat:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={cn(
                      'relative w-10 h-10 rounded-xl border-2 border-ink overflow-hidden transition-all',
                      avatarUrl === preset.url
                        ? 'ring-2 ring-mustard shadow-neo-sm scale-105'
                        : 'opacity-70 hover:opacity-100'
                    )}
                    title={preset.name}
                  >
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields: Name, Handle, Title, Location */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="creator-name"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Nama Tampilan Brand / Kreator *
                </label>
                <input
                  id="creator-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sumbar Terkini"
                  className={cn(
                    'w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                    errors.name && 'border-coral ring-2 ring-coral/30'
                  )}
                  maxLength={100}
                  required
                />
                {errors.name && (
                  <p className="text-xs font-mono font-bold text-coral mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="creator-handle"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Handle Username Media *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50 font-mono text-sm">
                    @
                  </span>
                  <input
                    id="creator-handle"
                    type="text"
                    value={handle.replace(/^@/, '')}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="sumbar_terkini"
                    className={cn(
                      'w-full pl-8 pr-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                      errors.handle && 'border-coral ring-2 ring-coral/30'
                    )}
                    maxLength={50}
                    required
                  />
                </div>
                {errors.handle && (
                  <p className="text-xs font-mono font-bold text-coral mt-1">{errors.handle}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="creator-title"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Tagline / Judul Subtitle
                </label>
                <input
                  id="creator-title"
                  type="text"
                  value={creatorTitle}
                  onChange={(e) => setCreatorTitle(e.target.value)}
                  placeholder="Sumatera Barat Creator & Media Hub"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={120}
                />
              </div>

              <div>
                <label
                  htmlFor="creator-location"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Lokasi Operasional
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-ink/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="creator-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Padang, Sumatera Barat"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            {/* Custom Avatar URL Input */}
            <div>
              <label
                htmlFor="creator-avatar"
                className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
              >
                URL Foto Profil Avatar *
              </label>
              <input
                id="creator-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={cn(
                  'w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                  errors.avatarUrl && 'border-coral ring-2 ring-coral/30'
                )}
                required
              />
              {errors.avatarUrl && (
                <p className="text-xs font-mono font-bold text-coral mt-1">{errors.avatarUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio Copy */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="creator-bio"
              className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-ink/60" />
              <span>Bio Editorial Kreator (Maks. 500 Karakter) *</span>
            </label>
            <span
              className={cn(
                'text-xs font-mono font-bold',
                bio.length > 480 ? 'text-coral' : 'text-ink/60'
              )}
            >
              {bio.length} / 500
            </span>
          </div>
          <textarea
            id="creator-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tuliskan bio editorial profil Anda..."
            className={cn(
              'w-full p-4 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[100px]',
              errors.bio && 'border-coral ring-2 ring-coral/30'
            )}
            maxLength={500}
            required
          />
          {errors.bio && (
            <p className="text-xs font-mono font-bold text-coral mt-1">{errors.bio}</p>
          )}
        </div>
      </NeoCard>

      {/* Section 2: Logo Brand & Announcement Bar */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-coral" />
              <span>Pengaturan Logo Brand & Banner Pengumuman</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Kustomisasi logo di navbar header dan pesan bar promosi paling atas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Logo Visual Preview Box */}
          <div className="flex flex-col items-center justify-center p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm">
            <div className="w-20 h-20 rounded-2xl border-2 border-ink overflow-hidden bg-ink text-paper shadow-neo flex items-center justify-center mb-3">
              {logoUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={logoUrl}
                    alt={logoText || 'Logo'}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="font-mono font-black text-2xl text-mustard">
                  {logoText || 'ST'}
                </span>
              )}
            </div>
            <span className="font-mono text-xs font-bold text-ink">Preview Logo Navbar</span>
            <span className="font-mono text-[10px] text-ink/60 text-center mt-0.5">
              Tampil di Header & Footer
            </span>
          </div>

          {/* Logo Inputs */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="logo-text"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Inisial / Teks Logo (Maks. 10 Huruf)
                </label>
                <input
                  id="logo-text"
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="ST"
                  maxLength={10}
                  className={cn(
                    'w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                    errors.logoText && 'border-coral ring-2 ring-coral/30'
                  )}
                />
                {errors.logoText && (
                  <p className="text-xs font-mono font-bold text-coral mt-1">{errors.logoText}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="logo-url"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  URL Gambar Logo Kustom (Opsional)
                </label>
                <input
                  id="logo-url"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... atau /logo.png"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="announcement-text"
                className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
              >
                Pesan Bar Pengumuman Teratas (Top Banner)
              </label>
              <input
                id="announcement-text"
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Portal Media Kit Resmi & Endorsement Hub Sumbar Terkini 2026..."
                className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                maxLength={200}
              />
              <p className="text-[11px] font-mono text-ink/60 mt-1">
                Teks berjalan atau banner highlight yang terlihat paling atas di layar pengunjung.
              </p>
            </div>
          </div>
        </div>
      </NeoCard>

      {/* Section 3: Public Header Menu & CTA Customizer */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-mustard" />
              <span>Menu Navigasi & Tombol CTA Header Publik</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Kelola teks menu navbar, link jangkar (#section), urutan, dan tombol aksi utama.
            </p>
          </div>

          <NeoButton
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddMenuItem}
            className="gap-1.5 min-h-[40px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu</span>
          </NeoButton>
        </div>

        {/* Menu Items List */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider block">
            Daftar Link Menu Navbar:
          </span>

          {headerMenuItems.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                'p-3 rounded-2xl border-2 border-ink transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                item.is_active ? 'bg-white shadow-neo-sm' : 'bg-paper/70 border-dashed opacity-60'
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-lg bg-paper border border-ink text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateMenuItem(idx, 'label', e.target.value)}
                    placeholder="Nama Menu (e.g. Rate Card)"
                    className="px-3 py-2 bg-paper border border-ink rounded-xl font-mono text-xs text-ink min-h-[40px]"
                  />
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => handleUpdateMenuItem(idx, 'href', e.target.value)}
                    placeholder="Link Target (e.g. #rate-calculator)"
                    className="px-3 py-2 bg-paper border border-ink rounded-xl font-mono text-xs text-ink min-h-[40px]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 shrink-0">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => handleMoveMenuItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-xl border border-ink bg-paper hover:bg-mustard/30 disabled:opacity-30 disabled:cursor-not-allowed min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Pindah ke atas"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-ink" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveMenuItem(idx, 'down')}
                  disabled={idx === headerMenuItems.length - 1}
                  className="p-2 rounded-xl border border-ink bg-paper hover:bg-mustard/30 disabled:opacity-30 disabled:cursor-not-allowed min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Pindah ke bawah"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-ink" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleMenuItem(idx)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl border border-ink font-mono text-[11px] font-bold flex items-center gap-1 min-h-[38px]',
                    item.is_active ? 'bg-mint text-ink' : 'bg-paper text-ink/60'
                  )}
                  title={item.is_active ? 'Sembunyikan Menu' : 'Tampilkan Menu'}
                >
                  {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{item.is_active ? 'Aktif' : 'Draft'}</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteMenuItem(idx)}
                  className="p-2 rounded-xl border border-ink bg-white text-coral hover:bg-coral/20 min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button Settings */}
        <div className="pt-4 border-t border-ink/15">
          <span className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider block mb-2">
            Tombol Aksi Utama Header (CTA Button):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-ink/70 mb-1">
                Teks Tombol CTA
              </label>
              <input
                type="text"
                value={headerCtaText}
                onChange={(e) => setHeaderCtaText(e.target.value)}
                placeholder="Booking Slot"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-ink/70 mb-1">
                Link Target CTA
              </label>
              <input
                type="text"
                value={headerCtaHref}
                onChange={(e) => setHeaderCtaHref(e.target.value)}
                placeholder="#rate-calculator"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
              />
            </div>
          </div>
        </div>
      </NeoCard>

      {/* Section 4: Slot Availability & Status */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-mint" />
              <span>Ketersediaan Slot Endorsement</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Tampilkan status aktif penerimaan endorsement dan jumlah kuota tersisa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
          {/* Toggle Switch */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex items-center justify-between min-h-[80px]">
            <div>
              <div className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
                Status Ketersediaan
              </div>
              <p className="text-xs text-ink/70 mt-0.5">
                {slotAvailable ? 'Slot Terbuka (Hijau)' : 'Slot Ditutup (Merah)'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={slotAvailable}
              onClick={() => setSlotAvailable((v) => !v)}
              className={cn(
                'relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px]',
                slotAvailable ? 'bg-mint' : 'bg-paper'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border-2 border-ink shadow-neo-sm transition duration-200 ease-in-out my-auto',
                  slotAvailable ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Status Text Input */}
          <div>
            <label
              htmlFor="slot-status-text"
              className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
            >
              Teks Label Status Slot *
            </label>
            <input
              id="slot-status-text"
              type="text"
              value={slotStatusText}
              onChange={(e) => setSlotStatusText(e.target.value)}
              placeholder="Slot Terbuka Minggu Ini"
              className={cn(
                'w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]',
                errors.slotStatusText && 'border-coral ring-2 ring-coral/30'
              )}
              maxLength={100}
              required
            />
            {errors.slotStatusText && (
              <p className="text-xs font-mono font-bold text-coral mt-1">
                {errors.slotStatusText}
              </p>
            )}
          </div>

          {/* Slots Remaining Input */}
          <div>
            <label
              htmlFor="slots-remaining"
              className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
            >
              Jumlah Slot Tersisa Bulan Ini
            </label>
            <input
              id="slots-remaining"
              type="number"
              min={0}
              max={99}
              value={slotsRemaining}
              onChange={(e) => setSlotsRemaining(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
            />
          </div>
        </div>
      </NeoCard>

      {/* Section 5: Theme Preset Selector */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Palette className="w-5 h-5 text-coral" />
              <span>Preset Palet Tema Neo-Brutalis</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Pilih gaya palet warna. Perubahan langsung aktif di website publik & preview.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEME_PRESETS.map((t) => {
            const isSelected = themePreset === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  'text-left p-4 rounded-2xl border-2 border-ink transition-all select-none min-h-[110px] flex flex-col justify-between',
                  isSelected
                    ? 'shadow-neo ring-2 ring-ink translate-x-[-2px] translate-y-[-2px]'
                    : 'bg-white hover:bg-paper/80 shadow-neo-sm'
                )}
                style={{ backgroundColor: isSelected ? t.bgHex : '#FFFFFF' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-ink tracking-tight">
                      {t.title}
                    </span>
                    <span
                      className="w-6 h-6 rounded-full border-2 border-ink shadow-neo-sm"
                      style={{ backgroundColor: t.accentHex }}
                    />
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-ink/20 flex items-center justify-between text-[11px] font-mono font-bold">
                  <span
                    className="px-2 py-0.5 rounded border border-ink shadow-neo-sm"
                    style={{ backgroundColor: t.accentHex, color: '#1E1E1E' }}
                  >
                    Warna Utama
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-ink font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4 text-mint fill-ink" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </NeoCard>

      {/* Section 6: Widget Interaktif Creator Hub (Kolom Kiri) */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-mustard" />
              <span>Widget Interaktif Creator Hub (Kolom Kiri)</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Atur modul interaktif di bawah bio (Prediktor Skor FYP, High-Five Realtime, Kesiapan Slot).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle Switch */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex items-center justify-between min-h-[72px]">
            <div>
              <div className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
                Tampilkan Widget Interaktif Creator Hub
              </div>
              <p className="text-xs text-ink/70 mt-0.5">
                {showInteractiveHub
                  ? 'Aktif: Menampilkan modul interaktif di kolom kiri bawah bio'
                  : 'Nonaktif: Menyembunyikan modul interaktif tambahan'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showInteractiveHub}
              onClick={() => setShowInteractiveHub((v) => !v)}
              className={cn(
                'relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px]',
                showInteractiveHub ? 'bg-mint' : 'bg-paper'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border-2 border-ink shadow-neo-sm transition duration-200 ease-in-out my-auto',
                  showInteractiveHub ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {showInteractiveHub && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label
                  htmlFor="interactive-hub-title"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Judul Widget Interaktif
                </label>
                <input
                  id="interactive-hub-title"
                  type="text"
                  value={interactiveHubTitle}
                  onChange={(e) => setInteractiveHubTitle(e.target.value)}
                  placeholder="Kalkulator Potensi Viral FYP & Apresiasi"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5">
                  Tab Bawaan yang Terbuka Pertama Kali
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'predictor', label: '🎯 Prediktor' },
                      { id: 'highfive', label: '👏 High-Five' },
                      { id: 'stats', label: '⚡ Kesiapan' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInteractiveHubDefaultTab(t.id)}
                      className={cn(
                        'py-2 px-2 rounded-xl border-2 border-ink font-mono text-xs font-bold text-center transition-all min-h-[44px]',
                        interactiveHubDefaultTab === t.id
                          ? 'bg-mustard text-ink shadow-neo-sm'
                          : 'bg-white text-ink/70 hover:text-ink'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </NeoCard>

      {/* Section 7: Pengaturan Live Audience Pulse (Kolom Kanan Atas) */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-coral" />
              <span>Modul Live Audience Pulse & Respon Komunitas (Kolom Kanan)</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Atur modul indikator energi audiens langsung dan tombol reaksi komunitas (Kolom Kanan Atas).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex items-center justify-between min-h-[72px]">
            <div>
              <div className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
                Tampilkan Modul Respon Audiens Real-time
              </div>
              <p className="text-xs text-ink/70 mt-0.5">
                {showAudiencePulse
                  ? 'Aktif: Menampilkan indikator energi dan tombol reaksi di kolom kanan'
                  : 'Nonaktif: Menyembunyikan modul respon audiens'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showAudiencePulse}
              onClick={() => setShowAudiencePulse((v) => !v)}
              className={cn(
                'relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px]',
                showAudiencePulse ? 'bg-mint' : 'bg-paper'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border-2 border-ink shadow-neo-sm transition duration-200 ease-in-out my-auto',
                  showAudiencePulse ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {showAudiencePulse && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label
                  htmlFor="audience-pulse-title"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Judul Modul Respon Audiens
                </label>
                <input
                  id="audience-pulse-title"
                  type="text"
                  value={audiencePulseTitle}
                  onChange={(e) => setAudiencePulseTitle(e.target.value)}
                  placeholder="Live Audience Pulse & Fan Energy"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={80}
                />
              </div>

              <div>
                <label
                  htmlFor="audience-pulse-badge"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Label Badge Status Komunitas
                </label>
                <input
                  id="audience-pulse-badge"
                  type="text"
                  value={audiencePulseBadge}
                  onChange={(e) => setAudiencePulseBadge(e.target.value)}
                  placeholder="2.8k Audiens Aktif"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={40}
                />
              </div>
            </div>
          )}
        </div>
      </NeoCard>

      {/* Section 8: Pengaturan Garansi Resmi & Creator Trust Radar (Kolom Kanan Bawah) */}
      <NeoCard className="p-4 sm:p-6 space-y-6 w-full">
        <div className="border-b-2 border-ink pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-mint" />
              <span>Modul Garansi Resmi & Radar Kolaborasi Brand (Kolom Kanan)</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Atur jaminan keamanan kolaborasi dan rekomendasi niche pengiklan (Kolom Kanan Bawah).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex items-center justify-between min-h-[72px]">
            <div>
              <div className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
                Tampilkan Modul Garansi Resmi & Radar Kolaborasi
              </div>
              <p className="text-xs text-ink/70 mt-0.5">
                {showTrustRadar
                  ? 'Aktif: Menampilkan kartu garansi resmi dan radar niche di kolom kanan'
                  : 'Nonaktif: Menyembunyikan modul garansi kolaborasi'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showTrustRadar}
              onClick={() => setShowTrustRadar((v) => !v)}
              className={cn(
                'relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px]',
                showTrustRadar ? 'bg-mint' : 'bg-paper'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border-2 border-ink shadow-neo-sm transition duration-200 ease-in-out my-auto',
                  showTrustRadar ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {showTrustRadar && (
            <div className="space-y-4 pt-2">
              <div>
                <label
                  htmlFor="trust-radar-title"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Judul Modul Garansi Kolaborasi
                </label>
                <input
                  id="trust-radar-title"
                  type="text"
                  value={trustRadarTitle}
                  onChange={(e) => setTrustRadarTitle(e.target.value)}
                  placeholder="Garansi Resmi & Radar Kolaborasi"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={80}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="trust-guarantee-1"
                    className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                  >
                    Poin Garansi 1
                  </label>
                  <input
                    id="trust-guarantee-1"
                    type="text"
                    value={trustGuarantee1}
                    onChange={(e) => setTrustGuarantee1(e.target.value)}
                    placeholder="100% Organik & Anti-Bot Minang"
                    className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    maxLength={60}
                  />
                </div>

                <div>
                  <label
                    htmlFor="trust-guarantee-2"
                    className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                  >
                    Poin Garansi 2
                  </label>
                  <input
                    id="trust-guarantee-2"
                    type="text"
                    value={trustGuarantee2}
                    onChange={(e) => setTrustGuarantee2(e.target.value)}
                    placeholder="Garansi 2x Revisi Draft Konten"
                    className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    maxLength={60}
                  />
                </div>

                <div>
                  <label
                    htmlFor="trust-guarantee-3"
                    className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                  >
                    Poin Garansi 3
                  </label>
                  <input
                    id="trust-guarantee-3"
                    type="text"
                    value={trustGuarantee3}
                    onChange={(e) => setTrustGuarantee3(e.target.value)}
                    placeholder="Laporan Transparan Analytics H+3"
                    className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    maxLength={60}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="trust-bonus-text"
                  className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Teks Penawaran Bonus Eksklusif
                </label>
                <input
                  id="trust-bonus-text"
                  type="text"
                  value={trustBonusText}
                  onChange={(e) => setTrustBonusText(e.target.value)}
                  placeholder="Bonus Free Repost Story 24 Jam"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  maxLength={80}
                />
              </div>
            </div>
          )}
        </div>
      </NeoCard>

      {/* Section 9: Draggable Stickers Manager */}
      <NeoCard className="p-4 sm:p-6 w-full">
        <StickersManager stickers={stickers} onChange={setStickers} />
      </NeoCard>

      {/* Save Action Bar */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <NeoButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSaving}
          className="gap-2 shadow-neo min-h-[48px] px-8 w-full sm:w-auto"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Profil & Hero'}</span>
        </NeoButton>
      </div>
    </form>
  );
}
