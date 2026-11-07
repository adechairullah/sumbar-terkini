'use client';

import React, { useState } from 'react';
import { SocialPlatform, PlatformId, SyncMode, DemographicCity, SiteSettings } from '@/types';
import { repository } from '@/lib/data/repository';
import { calculateER, formatCompactNumber } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/Toast';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import {
  BarChart3,
  RefreshCw,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Zap,
  Save,
  ArrowRight,
  ArrowLeft,
  Globe,
  Eye,
  EyeOff,
  LayoutGrid,
} from 'lucide-react';
import {
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiFacebook,
  SiX,
} from '@icons-pack/react-simple-icons';
import { cn } from '@/lib/utils/cn';

export interface SocialMediaManagerProps {
  initialPlatforms: SocialPlatform[];
  siteSettings?: SiteSettings | null;
  onSaveSuccess?: (updated: SocialPlatform) => void;
  onSettingsSaveSuccess?: (updated: SiteSettings) => void;
}

const PLATFORM_CONFIG: Record<
  PlatformId,
  { name: string; icon: React.ElementType; color: string; hoverBorder: string }
> = {
  instagram: {
    name: 'Instagram',
    icon: SiInstagram,
    color: '#E4405F',
    hoverBorder: 'border-[#E4405F]',
  },
  tiktok: {
    name: 'TikTok',
    icon: SiTiktok,
    color: '#000000',
    hoverBorder: 'border-ink',
  },
  youtube: {
    name: 'YouTube',
    icon: SiYoutube,
    color: '#FF0000',
    hoverBorder: 'border-[#FF0000]',
  },
  facebook: {
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877F2',
    hoverBorder: 'border-[#1877F2]',
  },
  x: {
    name: 'X (Twitter)',
    icon: SiX,
    color: '#000000',
    hoverBorder: 'border-ink',
  },
};

export function SocialMediaManager({
  initialPlatforms,
  siteSettings,
  onSaveSuccess,
  onSettingsSaveSuccess,
}: SocialMediaManagerProps) {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(initialPlatforms);
  const [selectedPlatformId, setSelectedPlatformId] = useState<PlatformId>('instagram');

  // Bento Grid Section Header State
  const [bentoBadgeText, setBentoBadgeText] = useState(
    siteSettings?.bento_badge_text || 'Live Verified Social Metrics'
  );
  const [bentoTitleText, setBentoTitleText] = useState(
    siteSettings?.bento_title_text || 'Multi-Platform Bento Grid'
  );
  const [bentoSubtitleText, setBentoSubtitleText] = useState(
    siteSettings?.bento_subtitle_text ||
      'Jangkauan organik lintas platform media sosial terverifikasi Sumbar Terkini.'
  );
  const [isSavingBentoHeader, setIsSavingBentoHeader] = useState(false);

  // Currently active platform
  const currentPlatform =
    platforms.find((p) => p.platform_id === selectedPlatformId) || platforms[0];

  // Local Form state for currently selected platform
  const [platformName, setPlatformName] = useState<string>(
    currentPlatform?.platform_name || ''
  );
  const [handle, setHandle] = useState<string>(
    currentPlatform?.handle || ''
  );
  const [profileUrl, setProfileUrl] = useState<string>(
    currentPlatform?.profile_url || ''
  );
  const [syncMode, setSyncMode] = useState<SyncMode>(currentPlatform?.sync_mode || 'MANUAL');
  const [isActive, setIsActive] = useState<boolean>(currentPlatform?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState<number>(currentPlatform?.sort_order ?? 0);
  const [followers, setFollowers] = useState<number>(currentPlatform?.followers_count || 0);
  const [avgViews, setAvgViews] = useState<number>(currentPlatform?.avg_views || 0);
  const [avgLikes, setAvgLikes] = useState<number>(currentPlatform?.avg_likes || 0);
  const [avgComments, setAvgComments] = useState<number>(currentPlatform?.avg_comments || 0);
  const [engagementRate, setEngagementRate] = useState<number>(
    currentPlatform?.engagement_rate || 0
  );
  const [genderMale, setGenderMale] = useState<number>(
    currentPlatform?.demographics?.gender?.male ?? 50
  );
  const [genderFemale, setGenderFemale] = useState<number>(
    currentPlatform?.demographics?.gender?.female ?? 50
  );
  const [topCities, setTopCities] = useState<DemographicCity[]>(
    currentPlatform?.demographics?.top_cities || []
  );
  const [newCityName, setNewCityName] = useState('');
  const [newCityPercent, setNewCityPercent] = useState<number>(10);

  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sorted list of platforms according to current sort_order
  const sortedPlatformsList = [...platforms].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  // Switch selected platform tab
  const handleSelectPlatform = (pId: PlatformId) => {
    const target = platforms.find((p) => p.platform_id === pId);
    if (!target) return;

    setSelectedPlatformId(pId);
    setPlatformName(target.platform_name || '');
    setHandle(target.handle || '');
    setProfileUrl(target.profile_url || '');
    setSyncMode(target.sync_mode);
    setIsActive(target.is_active ?? true);
    setSortOrder(target.sort_order ?? 0);
    setFollowers(target.followers_count);
    setAvgViews(target.avg_views);
    setAvgLikes(target.avg_likes);
    setAvgComments(target.avg_comments);
    setEngagementRate(target.engagement_rate);
    setGenderMale(target.demographics?.gender?.male ?? 50);
    setGenderFemale(target.demographics?.gender?.female ?? 50);
    setTopCities(target.demographics?.top_cities || []);
  };

  // Reorder platforms: Move Up (Left) or Down (Right)
  const handleMovePlatform = async (direction: 'up' | 'down') => {
    if (!currentPlatform) return;
    const sorted = [...platforms].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const currentIndex = sorted.findIndex((p) => p.id === currentPlatform.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetPlatform = sorted[targetIndex];
    if (!targetPlatform) return;

    const newCurrentOrder = targetPlatform.sort_order ?? targetIndex;
    const newTargetOrder = currentPlatform.sort_order ?? currentIndex;

    try {
      await Promise.all([
        repository.updateSocialPlatform(currentPlatform.id, { sort_order: newCurrentOrder }),
        repository.updateSocialPlatform(targetPlatform.id, { sort_order: newTargetOrder }),
      ]);

      const updatedList = platforms
        .map((p) => {
          if (p.id === currentPlatform.id) return { ...p, sort_order: newCurrentOrder };
          if (p.id === targetPlatform.id) return { ...p, sort_order: newTargetOrder };
          return p;
        })
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      setPlatforms(updatedList);
      setSortOrder(newCurrentOrder);
      onSaveSuccess?.({ ...currentPlatform, sort_order: newCurrentOrder });

      showToast({
        message: `Urutan platform ${currentPlatform.platform_name} berhasil ${direction === 'up' ? 'dimajukan' : 'dimundurkan'}!`,
        type: 'success',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memindahkan urutan.';
      showToast({ message: msg, type: 'error' });
    }
  };

  // Save Bento Grid Section Header
  const handleSaveBentoHeader = async () => {
    setIsSavingBentoHeader(true);
    try {
      const updated = await repository.updateSiteSettings({
        bento_badge_text: bentoBadgeText.trim() || 'Live Verified Social Metrics',
        bento_title_text: bentoTitleText.trim() || 'Multi-Platform Bento Grid',
        bento_subtitle_text:
          bentoSubtitleText.trim() ||
          'Jangkauan organik lintas platform media sosial terverifikasi Sumbar Terkini.',
      });
      showToast({
        message: 'Judul dan header Bento Grid berhasil disimpan!',
        type: 'success',
      });
      onSettingsSaveSuccess?.(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan header Bento Grid.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSavingBentoHeader(false);
    }
  };

  // Real-time automatic ER calculation
  const calculatedER = calculateER(avgLikes, avgComments, followers);

  // Demographic gender validation
  const genderSum = Number(genderMale) + Number(genderFemale);
  const isGenderValid = genderSum === 100;

  // Add City
  const handleAddCity = () => {
    const cleanCity = newCityName.trim();
    if (!cleanCity) return;
    if (newCityPercent < 0 || newCityPercent > 100) return;

    setTopCities([...topCities, { city: cleanCity, percentage: newCityPercent }]);
    setNewCityName('');
    setNewCityPercent(10);
  };

  // Remove City
  const handleRemoveCity = (index: number) => {
    setTopCities(topCities.filter((_, idx) => idx !== index));
  };

  // 1-Click Apply ER
  const handleApplyER = () => {
    setEngagementRate(calculatedER);
    showToast({
      message: `Engagement Rate diperbarui menjadi ${calculatedER.toFixed(2)}%!`,
      type: 'success',
    });
  };

  // Test & Sync Now API trigger
  const handleTestSyncNow = async () => {
    if (!currentPlatform) return;
    setIsSyncingApi(true);

    try {
      const res = await fetch('/api/sync-socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform_id: currentPlatform.platform_id }),
      });

      if (!res.ok) {
        throw new Error(`Sync gagal dengan status HTTP ${res.status}`);
      }

      const data = await res.json();
      const syncedResult = data.synced_platforms?.[0];

      if (syncedResult && syncedResult.metrics) {
        setFollowers(syncedResult.metrics.followers_count ?? followers);
        setAvgViews(syncedResult.metrics.avg_views ?? avgViews);
        setAvgLikes(syncedResult.metrics.avg_likes ?? avgLikes);
        setAvgComments(syncedResult.metrics.avg_comments ?? avgComments);
        setEngagementRate(syncedResult.metrics.engagement_rate ?? engagementRate);
      }

      showToast({
        message: `Sinkronisasi ${currentPlatform.platform_name} berhasil (${syncedResult?.status || 'OK'})!`,
        type: 'success',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi API sync.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSyncingApi(false);
    }
  };

  // Save current platform changes
  const handleSavePlatform = async () => {
    if (!currentPlatform) return;

    if (!isGenderValid) {
      showToast({
        message: `Total persentase gender harus 100% (saat ini: ${genderSum}%).`,
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: Partial<SocialPlatform> = {
        platform_name: platformName.trim() || currentPlatform.platform_name,
        handle: handle.trim() || currentPlatform.handle,
        profile_url: profileUrl.trim() || currentPlatform.profile_url,
        sync_mode: syncMode,
        is_active: isActive,
        sort_order: sortOrder,
        followers_count: Math.max(0, followers),
        avg_views: Math.max(0, avgViews),
        avg_likes: Math.max(0, avgLikes),
        avg_comments: Math.max(0, avgComments),
        engagement_rate: Math.max(0, engagementRate),
        demographics: {
          gender: {
            male: genderMale,
            female: genderFemale,
          },
          top_cities: topCities,
        },
        last_synced_at: new Date().toISOString(),
      };

      const updated = await repository.updateSocialPlatform(currentPlatform.id, updatedData);

      // Update local state list and re-sort
      const updatedList = platforms
        .map((p) => (p.id === currentPlatform.id ? { ...p, ...updated } : p))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setPlatforms(updatedList);

      showToast({
        message: `Metrik ${currentPlatform.platform_name} berhasil disimpan!`,
        type: 'success',
      });
      onSaveSuccess?.(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan platform.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ER status badge helper
  const getERBadge = (rate: number) => {
    if (rate >= 5.0) {
      return { label: 'Viral / Sangat Tinggi', color: 'bg-mint text-ink' };
    }
    if (rate >= 3.0) {
      return { label: 'Sehat / Performa Baik', color: 'bg-mustard text-ink' };
    }
    if (rate >= 1.0) {
      return { label: 'Normal / Rata-rata', color: 'bg-white text-ink' };
    }
    return { label: 'Rendah / Cek Ulang', color: 'bg-coral/20 text-ink' };
  };

  const erBadge = getERBadge(calculatedER);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-12 w-full max-w-full overflow-hidden">
      {/* Section 0: Bento Grid Section Title & Subtitle Customizer */}
      <NeoCard className="p-4 sm:p-6 space-y-4">
        <div className="border-b-2 border-ink pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-mint" />
              <span>Pengaturan Judul & Header Bento Grid</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Ubah label badge, judul utama, dan subjudul section Live Verified Social Metrics di halaman publik.
            </p>
          </div>

          <NeoButton
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveBentoHeader}
            disabled={isSavingBentoHeader}
            className="gap-2 min-h-[44px] shrink-0"
          >
            <Save className="w-4 h-4 text-ink" />
            <span>{isSavingBentoHeader ? 'Menyimpan...' : 'Simpan Judul Bento'}</span>
          </NeoButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5">
              Label Badge Atas
            </label>
            <input
              type="text"
              value={bentoBadgeText}
              onChange={(e) => setBentoBadgeText(e.target.value)}
              placeholder="Live Verified Social Metrics"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5">
              Judul Utama Section
            </label>
            <input
              type="text"
              value={bentoTitleText}
              onChange={(e) => setBentoTitleText(e.target.value)}
              placeholder="Multi-Platform Bento Grid"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-1.5">
              Deskripsi Subjudul
            </label>
            <input
              type="text"
              value={bentoSubtitleText}
              onChange={(e) => setBentoSubtitleText(e.target.value)}
              placeholder="Jangkauan organik lintas platform..."
              className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
            />
          </div>
        </div>
      </NeoCard>

      {/* Platform Selector Bar */}
      <div>
        <div className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Pilih Kartu Platform Media Sosial:</span>
          <span className="text-[11px] text-ink/60">
            {platforms.filter((p) => p.is_active !== false).length} dari {platforms.length} Platform Ditampilkan
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {sortedPlatformsList.map((plat) => {
            const cfg = PLATFORM_CONFIG[plat.platform_id] || {
              name: plat.platform_name,
              icon: BarChart3,
              color: '#1E1E1E',
              hoverBorder: 'border-ink',
            };
            const Icon = cfg.icon;
            const isSelected = plat.platform_id === selectedPlatformId;
            const isPlatformActive = plat.is_active !== false;

            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => handleSelectPlatform(plat.platform_id)}
                className={cn(
                  'p-3.5 rounded-2xl border-2 border-ink transition-all text-left flex flex-col justify-between min-h-[95px]',
                  isSelected
                    ? 'bg-ink text-paper shadow-neo translate-x-[-2px] translate-y-[-2px]'
                    : isPlatformActive
                      ? 'bg-white text-ink hover:bg-paper shadow-neo-sm'
                      : 'bg-paper/70 text-ink/60 border-dashed hover:bg-paper'
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon
                    className="w-5 h-5 shrink-0"
                    style={{ color: isSelected ? '#FFD166' : cfg.color }}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={cn(
                        'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase',
                        !isPlatformActive
                          ? 'border-coral text-coral bg-coral/10'
                          : isSelected
                            ? 'border-mint text-mint bg-ink'
                            : 'border-mint text-ink bg-mint/20'
                      )}
                    >
                      {!isPlatformActive ? 'Hidden' : 'Live'}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="font-black text-xs block leading-tight truncate">
                    {plat.platform_name || cfg.name}
                  </span>
                  <span className="font-mono text-[11px] opacity-75">
                    {formatCompactNumber(plat.followers_count)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentPlatform && (
        <NeoCard className="p-5 sm:p-6 space-y-6">
          {/* Header of Selected Platform */}
          <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-ink shadow-neo-sm flex items-center justify-center">
                {React.createElement(
                  PLATFORM_CONFIG[currentPlatform.platform_id]?.icon || BarChart3,
                  {
                    className: 'w-6 h-6',
                    style: {
                      color:
                        PLATFORM_CONFIG[currentPlatform.platform_id]?.color || '#1E1E1E',
                    },
                  }
                )}
              </div>
              <div>
                <h2 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
                  <span>{platformName || currentPlatform.platform_name}</span>
                  <span className="text-xs font-mono font-normal text-ink/60">
                    {handle || currentPlatform.handle}
                  </span>
                </h2>
                <p className="text-xs text-ink/70 font-mono mt-0.5">
                  Terakhir disinkronkan:{' '}
                  {new Date(currentPlatform.last_synced_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Test & Sync Now Button */}
            <div className="flex items-center gap-2">
              <NeoButton
                type="button"
                variant="paper"
                size="md"
                onClick={handleTestSyncNow}
                disabled={isSyncingApi}
                className="gap-2 min-h-[44px]"
                title="Panggil API sinkronisasi langsung"
              >
                <RefreshCw className={cn('w-4 h-4 text-ink', isSyncingApi && 'animate-spin')} />
                <span>{isSyncingApi ? 'Menyinkronkan...' : 'Test & Sync Now'}</span>
              </NeoButton>
            </div>
          </div>

          {/* Section: Platform Custom Name & Identity (Requested Feature) */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-ink/15 pb-2">
              <Globe className="w-4 h-4 text-mustard" />
              <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
                Nama & Tautan Profil Sosial Media
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Platform Display Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Nama Tampilan Platform
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="Contoh: Instagram Utama"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
                <span className="text-[10px] font-mono text-ink/60 mt-1 block">
                  Nama yang tampil di kartu Bento publik
                </span>
              </div>

              {/* Username / Handle */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@sumbar_terkini"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
                <span className="text-[10px] font-mono text-ink/60 mt-1 block">
                  Identitas akun di platform
                </span>
              </div>

              {/* Profile URL */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Tautan URL Profil
                </label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://instagram.com/sumbar_terkini"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
                <span className="text-[10px] font-mono text-ink/60 mt-1 block">
                  URL tujuan ketika pengunjung klik kartu
                </span>
              </div>
            </div>
          </div>

          {/* Section: Platform Public Visibility (Show / Hide) */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl border-2 border-ink flex items-center justify-center shadow-neo-sm shrink-0',
                  isActive ? 'bg-mint text-ink' : 'bg-white text-ink/40'
                )}
              >
                {isActive ? <Eye className="w-5 h-5 text-ink" /> : <EyeOff className="w-5 h-5 text-coral" />}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide block">
                  Visibilitas Platform di Live Verified Metrics
                </span>
                <p className="text-xs text-ink/70 mt-0.5">
                  {isActive
                    ? 'Platform ini aktif dan DITAMPILKAN di Bento Grid publik.'
                    : 'Platform ini DISEMBUNYIKAN dari publik (metrik tetap tersimpan di CMS).'}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={cn(
                'relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px]',
                isActive ? 'bg-mint' : 'bg-paper'
              )}
              title={isActive ? 'Klik untuk Sembunyikan Platform' : 'Klik untuk Tampilkan Platform'}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border-2 border-ink shadow-neo-sm transition duration-200 ease-in-out my-auto',
                  isActive ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Section: Platform Sort Order (Requested Feature) */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border-2 border-ink bg-mustard text-ink flex items-center justify-center font-mono font-black text-sm shadow-neo-sm shrink-0">
                #{sortedPlatformsList.findIndex((p) => p.id === currentPlatform.id) + 1}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide block">
                  Urutan Tampil di Bento Grid (Sort Order)
                </span>
                <p className="text-xs text-ink/70 mt-0.5">
                  Platform dengan posisi lebih awal akan tampil di urutan atas kartu Bento publik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMovePlatform('up')}
                disabled={sortedPlatformsList.findIndex((p) => p.id === currentPlatform.id) === 0}
                className="px-3.5 py-2 rounded-xl border-2 border-ink bg-white hover:bg-mustard/30 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] shadow-neo-sm select-none"
                title="Pindah urutan ke kiri / tampil lebih awal"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Maju (⬅️)</span>
              </button>

              <button
                type="button"
                onClick={() => handleMovePlatform('down')}
                disabled={
                  sortedPlatformsList.findIndex((p) => p.id === currentPlatform.id) ===
                  sortedPlatformsList.length - 1
                }
                className="px-3.5 py-2 rounded-xl border-2 border-ink bg-white hover:bg-mustard/30 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] shadow-neo-sm select-none"
                title="Pindah urutan ke kanan / tampil lebih akhir"
              >
                <span>Mundur (➡️)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sync Mode Switcher */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide block">
                  Mode Sinkronisasi Metrik
                </span>
                <p className="text-xs text-ink/70 mt-0.5">
                  {syncMode === 'MANUAL'
                    ? 'Mode Manual: Metrik diedit manual dan tidak akan ditimpa sinkronisasi otomatis.'
                    : 'Mode Auto API: Metrik disinkronkan secara berkala dari endpoint API social media.'}
                </p>
              </div>

              <div className="flex items-center bg-white border-2 border-ink rounded-xl p-1 shadow-neo-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setSyncMode('MANUAL')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all min-h-[44px]',
                    syncMode === 'MANUAL' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'
                  )}
                >
                  MANUAL
                </button>
                <button
                  type="button"
                  onClick={() => setSyncMode('AUTO_API')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all min-h-[44px]',
                    syncMode === 'AUTO_API' ? 'bg-mint text-ink font-black' : 'text-ink hover:bg-paper'
                  )}
                >
                  AUTO_API
                </button>
              </div>
            </div>
          </div>

          {/* Core Numerical Metrics Grid */}
          <div>
            <div className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-mustard" />
              <span>Metrik Audiens & Interaksi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Followers */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Followers / Subscribers
                </label>
                <input
                  type="number"
                  min="0"
                  max="1500000000"
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>

              {/* Avg Views */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Rata-rata Views / Tayangan
                </label>
                <input
                  type="number"
                  min="0"
                  value={avgViews}
                  onChange={(e) => setAvgViews(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>

              {/* Avg Likes */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Rata-rata Likes / Suka
                </label>
                <input
                  type="number"
                  min="0"
                  value={avgLikes}
                  onChange={(e) => setAvgLikes(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>

              {/* Avg Comments */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Rata-rata Komentar
                </label>
                <input
                  type="number"
                  min="0"
                  value={avgComments}
                  onChange={(e) => setAvgComments(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Automatic ER Calculation Helper */}
          <div className="p-4 bg-paper rounded-2xl border-2 border-ink shadow-neo-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mustard" />
                  <span className="font-mono text-xs font-bold text-ink uppercase tracking-wide">
                    Automatic ER Calculator Helper
                  </span>
                </div>
                <p className="text-xs text-ink/70 mt-0.5">
                  Formula terverifikasi: ((Likes + Komentar) / Followers) * 100
                </p>
              </div>

              {/* Live calculated ER display & Apply Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-ink shadow-neo-sm">
                  <span className="font-mono text-base font-black text-ink">
                    {calculatedER.toFixed(2)}%
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-ink',
                      erBadge.color
                    )}
                  >
                    {erBadge.label}
                  </span>
                </div>

                <NeoButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApplyER}
                  className="gap-1.5 min-h-[44px]"
                  title="Terapkan hasil kalkulasi ke Engagement Rate platform"
                >
                  <span>Terapkan ke ER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NeoButton>
              </div>
            </div>

            {/* Platform Stored ER Input */}
            <div className="pt-2 border-t border-ink/20 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                  Engagement Rate Aktif Tersimpan di Platform (% desimal)
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-ink/50">
                    %
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink/60 max-w-md">
                Angka inilah yang tampil pada Bento Grid dan Rate Calculator publik. Klik &quot;Terapkan ke ER&quot; untuk memperbarui otomatis.
              </p>
            </div>
          </div>

          {/* Demographic Breakdown Section */}
          <div className="border-t-2 border-ink pt-5 space-y-5">
            <div className="text-xs font-mono font-bold text-ink/80 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-mint" />
              <span>Demografi Audiens (Gender & Kota Teratas)</span>
            </div>

            {/* Gender breakdown */}
            <div className="p-4 bg-white border-2 border-ink rounded-xl shadow-neo-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-ink">
                  Distribusi Gender (Harus Berjumlah Tepat 100%)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setGenderMale(50);
                    setGenderFemale(50);
                  }}
                  className="text-[11px] font-mono font-bold text-ink underline hover:text-coral min-h-[44px] flex items-center"
                >
                  Reset 50:50
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                    Laki-laki (% Pria)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={genderMale}
                    onChange={(e) => setGenderMale(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-paper border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink/70 mb-1">
                    Perempuan (% Wanita)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={genderFemale}
                    onChange={(e) => setGenderFemale(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-paper border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                  />
                </div>
              </div>

              {!isGenderValid ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-coral bg-coral/10 text-ink font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-coral shrink-0" />
                  <span>
                    Total persentase gender harus tepat 100% (saat ini: {genderSum}%). Harap perbaiki sebelum menyimpan.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-mint">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Distribusi gender valid (100%).</span>
                </div>
              )}
            </div>

            {/* Top Cities */}
            <div className="p-4 bg-white border-2 border-ink rounded-xl shadow-neo-sm space-y-3">
              <span className="font-mono text-xs font-bold text-ink block">
                Kota Teratas (Top Cities Distribution)
              </span>

              {/* Add City Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nama Kota (e.g. Padang, Bukittinggi)"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-paper border-2 border-ink rounded-xl font-mono text-xs min-h-[44px]"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={newCityPercent}
                  onChange={(e) => setNewCityPercent(Number(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-paper border-2 border-ink rounded-xl font-mono text-xs min-h-[44px]"
                />
                <NeoButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddCity}
                  disabled={!newCityName.trim()}
                  className="gap-1.5 min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kota</span>
                </NeoButton>
              </div>

              {/* City List */}
              <div className="space-y-2 pt-2">
                {topCities.map((item, idx) => (
                  <div
                    key={`${item.city}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-paper border-2 border-ink rounded-xl"
                  >
                    <span className="font-mono text-xs font-bold text-ink">
                      {item.city}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-ink">
                        {item.percentage}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(idx)}
                        className="p-1.5 text-coral hover:bg-coral/20 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={`Hapus kota ${item.city}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button for Current Platform */}
          <div className="sticky bottom-4 z-20 flex justify-end pt-4">
            <NeoButton
              type="button"
              variant="primary"
              size="lg"
              disabled={isSaving || !isGenderValid}
              onClick={handleSavePlatform}
              className="gap-2 shadow-neo min-h-[48px] px-8"
            >
              <Save className="w-5 h-5" />
              <span>
                {isSaving
                  ? 'Menyimpan...'
                  : `Simpan Metrik ${currentPlatform.platform_name}`}
              </span>
            </NeoButton>
          </div>
        </NeoCard>
      )}
    </div>
  );
}

