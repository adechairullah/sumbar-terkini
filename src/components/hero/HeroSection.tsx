'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, CheckCircle2, MapPin, Calculator, Sparkles } from 'lucide-react';
import { SiteSettings, VisitorReaction } from '@/types';
import { SlotBadge } from './SlotBadge';
import { ParticleMoodClicker } from './ParticleMoodClicker';
import { InteractiveBrandPlayground } from './InteractiveBrandPlayground';
import { CreatorTrustRadar } from './CreatorTrustRadar';
import { normalizePhoneNumber } from '@/lib/utils/whatsapp';
import { cn } from '@/lib/utils/cn';

export interface HeroSectionProps {
  settings?: SiteSettings;
  reactions?: VisitorReaction[];
  className?: string;
}

function resolveName(name?: string): string {
  if (name && name.trim().length > 0) return name.trim();
  return 'Creator Media Kit';
}

function resolveAvatar(url?: string): string {
  if (url && url.trim().length > 0) return url.trim();
  return '/avatar-placeholder.png';
}

export function HeroSection({
  settings,
  reactions = [],
  className,
}: HeroSectionProps) {
  const heroCardRef = React.useRef<HTMLDivElement>(null);

  const creatorName = resolveName(settings?.creator_name);
  const creatorTitle = settings?.creator_title;
  const creatorHandle = settings?.creator_handle || '@sumbar_terkini';
  const avatarUrl = resolveAvatar(settings?.creator_avatar_url);
  const bio = settings?.creator_bio || 'Platform media digital kreatif dan amplifikasi brand nomor 1 di Sumatera Barat.';
  const locationText = settings?.location || 'Sumatera Barat, Indonesia';
  const cleanPhone = normalizePhoneNumber(settings?.whatsapp_number || '6281234567890');

  const whatsappConsultationUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Tim ${creatorName}! 👋\n\nSaya tertarik untuk konsultasi slot endorsement dan kampanye promosi brand kami. Mohon info ketersediaan slot terkini. Terima kasih!`
  )}`;

  return (
    <section
      ref={heroCardRef}
      className={cn(
        'neo-card p-6 sm:p-8 lg:p-10 mb-8 bg-white rounded-2xl sm:rounded-3xl relative overflow-hidden',
        'border-2 sm:border-3 border-ink shadow-neo-lg',
        className
      )}
    >
      {/* Decorative Neo-Brutalist Top Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-ink/10">
        <div className="flex items-center gap-2">
          <span className="neo-badge bg-mustard text-ink text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-ink" />
            Official Creator Hub 2026
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-ink/70">
            <MapPin className="w-3.5 h-3.5 text-ink" />
            <span>{locationText}</span>
          </div>
        </div>

        {/* Live Slot Availability Badge */}
        <SlotBadge
          available={settings?.slot_available}
          statusText={settings?.slot_status_text}
          slotsRemaining={settings?.slots_remaining}
        />
      </div>

      {/* Main Grid: Avatar + Bio + Interactive Creator Hub on Left, Reactions & Minimalist Pillars on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (lg:col-span-8): Creator Identity, Bio, Interactive Widget, & CTAs */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar Image with High Priority */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 sm:border-3 border-ink shadow-neo overflow-hidden bg-mustard/30 shrink-0">
              <Image
                src={avatarUrl}
                alt={creatorName}
                width={120}
                height={120}
                priority
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Creator Title and Handle */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight font-sans">
                  {creatorName}
                </h1>
                <CheckCircle2
                  className="w-6 h-6 text-mint fill-mint/30 stroke-ink"
                  aria-label="Verified Creator"
                />
              </div>
              {creatorTitle && (
                <p className="text-xs sm:text-sm font-bold text-ink/90 font-mono mb-1">
                  {creatorTitle}
                </p>
              )}
              <p className="font-mono text-xs sm:text-sm font-bold text-ink/70">
                {creatorHandle}
              </p>
              <p className="text-xs font-mono font-semibold text-ink/60 mt-0.5 sm:hidden">
                {locationText}
              </p>
            </div>
          </div>

          {/* Minang Bio Copy (Capped to 500 characters) */}
          <div className="mt-1">
            <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-sans font-normal max-w-2xl line-clamp-4">
              {bio.slice(0, 500)}
            </p>
          </div>

          {/* Interactive Creator Hub Suite (Moved to Left Column) */}
          {settings?.show_interactive_hub !== false && (
            <div className="mt-2">
              <InteractiveBrandPlayground
                whatsappNumber={cleanPhone}
                creatorName={creatorName}
                defaultTab={settings?.interactive_hub_default_tab}
                title={settings?.interactive_hub_title}
              />
            </div>
          )}

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-2 pt-3 border-t-2 border-ink/10">
            <a
              href={whatsappConsultationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'neo-button bg-mint text-ink px-5 py-3 rounded-xl font-bold text-sm sm:text-base',
                'flex items-center gap-2 hover:bg-mint-hover'
              )}
            >
              <MessageCircle className="w-5 h-5 text-ink" />
              <span>Konsultasi Slot via WhatsApp</span>
            </a>

            <a
              href="#rate-calculator"
              className={cn(
                'neo-button bg-white text-ink px-4 py-3 rounded-xl font-bold text-sm sm:text-base',
                'flex items-center gap-2 hover:bg-paper'
              )}
            >
              <Calculator className="w-5 h-5 text-ink" />
              <span>Hitung Estimasi Paket</span>
            </a>
          </div>
        </div>

        {/* Right Column (lg:col-span-4): Live Audience Pulse & Creator Trust Radar */}
        <div className="lg:col-span-4 w-full flex flex-col gap-4">
          {settings?.show_audience_pulse !== false && (
            <ParticleMoodClicker
              initialReactions={reactions}
              title={settings?.audience_pulse_title}
              liveBadge={settings?.audience_pulse_badge}
            />
          )}

          {/* Creator Trust Radar & Brand Collaboration Guarantee */}
          {settings?.show_trust_radar !== false && (
            <CreatorTrustRadar
              title={settings?.trust_radar_title}
              guarantee1={settings?.trust_guarantee_1}
              guarantee2={settings?.trust_guarantee_2}
              guarantee3={settings?.trust_guarantee_3}
              bonusText={settings?.trust_bonus_text}
              whatsappNumber={cleanPhone}
              creatorName={creatorName}
            />
          )}
        </div>
      </div>
    </section>
  );
}

