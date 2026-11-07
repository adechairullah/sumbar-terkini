'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BarChart3,
  Package,
  Settings,
  ExternalLink,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { NeoButton } from '@/components/ui/NeoButton';
import { cn } from '@/lib/utils/cn';

export type AdminTab = 'profile' | 'socials' | 'packages' | 'portfolio' | 'contact';
export type DesktopLayoutMode = 'split' | 'editor' | 'preview';

export interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  authMethod?: 'supabase' | 'passcode' | 'none';
  authEmail?: string;
  desktopLayoutMode?: DesktopLayoutMode;
  onDesktopLayoutModeChange?: (mode: DesktopLayoutMode) => void;
  onOpenMobilePreview?: () => void;
}

const TABS: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'profile', label: 'Profile & Hero', icon: Sparkles },
  { id: 'socials', label: 'Social & Metrics', icon: BarChart3 },
  { id: 'packages', label: 'Packages & Rates', icon: Package },
  { id: 'portfolio', label: 'Portofolio & Viral', icon: Briefcase },
  { id: 'contact', label: 'Contact & Settings', icon: Settings },
];

export function AdminHeader({
  activeTab,
  onTabChange,
  onLogout,
  authMethod = 'passcode',
  authEmail,
  desktopLayoutMode,
  onDesktopLayoutModeChange,
  onOpenMobilePreview,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-b-2 border-ink px-3 sm:px-6 py-2.5 sm:py-3 space-y-2.5">
      {/* Top Row: Brand Identity & Global Actions */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Auth Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-mustard text-ink font-mono font-black flex items-center justify-center border-2 border-ink shadow-neo-sm shrink-0">
            ST
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-ink tracking-tight leading-tight">
                Admin CMS Hub
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-ink bg-mint/20 text-ink font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                {authMethod === 'supabase' && authEmail ? authEmail : 'Passcode Mode'}
              </span>
            </div>
            <p className="text-[10px] font-mono font-bold text-ink/60 uppercase tracking-wider hidden xs:block">
              Sumbar Terkini • Creator Media Kit
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick link to public page */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-button text-xs font-mono py-2 px-3 sm:px-3.5 bg-white text-ink border-2 border-ink rounded-xl shadow-neo-sm flex items-center gap-1.5 min-h-[44px] hover:bg-paper"
            title="Buka Website Publik di Tab Baru"
          >
            <span className="hidden sm:inline">Lihat Publik</span>
            <ExternalLink className="w-4 h-4 text-ink/70" />
          </Link>

          {/* Logout button */}
          <NeoButton
            variant="paper"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-ink border-2 border-ink hover:bg-coral/20 min-h-[44px] px-3"
            title="Keluar dari Admin Dashboard"
          >
            <LogOut className="w-4 h-4 text-coral" />
            <span className="hidden sm:inline">Keluar</span>
          </NeoButton>
        </div>
      </div>

      {/* Bottom Row: Navigation Tabs */}
      <div className="max-w-7xl mx-auto overflow-hidden">
        <nav
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth w-full"
          role="tablist"
          aria-label="Admin Navigation Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-ink font-mono text-xs font-bold whitespace-nowrap transition-all select-none min-h-[44px] shrink-0',
                  isActive
                    ? 'bg-ink text-paper shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-ink hover:bg-mustard/30 shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-mustard' : 'text-ink/70')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
