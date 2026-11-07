'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PortfolioItem, PackagePlatform } from '@/types';
import { repository } from '@/lib/data/repository';
import { useToast } from '@/components/ui/Toast';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoBadge } from '@/components/ui/NeoBadge';
import { formatCompactNumber } from '@/lib/utils/formatters';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  Heart,
  Save,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PortfolioManagerProps {
  initialItems: PortfolioItem[];
  onItemsChange?: (items: PortfolioItem[]) => void;
}

const PLATFORM_OPTIONS: Array<{ value: PackagePlatform; label: string }> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'cross-platform', label: 'Multi / Cross-Platform' },
];

const PRESET_THUMBNAILS = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
];

export function PortfolioManager({
  initialItems,
  onItemsChange,
}: PortfolioManagerProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [brandName, setBrandName] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [platform, setPlatform] = useState<PackagePlatform>('cross-platform');
  const [viewsCount, setViewsCount] = useState<number>(100000);
  const [likesCount, setLikesCount] = useState<number>(8500);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tag, setTag] = useState('Brand Campaign');
  const [caseStudyUrl, setCaseStudyUrl] = useState('');

  const resetForm = () => {
    setBrandName('');
    setCampaignTitle('');
    setPlatform('cross-platform');
    setViewsCount(100000);
    setLikesCount(8500);
    setThumbnailUrl('');
    setTag('Brand Campaign');
    setCaseStudyUrl('');
    setEditingId(null);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
    setThumbnailUrl(PRESET_THUMBNAILS[0] || '');
  };

  const handleStartEdit = (item: PortfolioItem) => {
    setIsCreating(false);
    setEditingId(item.id);
    setBrandName(item.brand_name);
    setCampaignTitle(item.campaign_title);
    setPlatform(item.platform);
    setViewsCount(item.views_count);
    setLikesCount(item.likes_count);
    setThumbnailUrl(item.thumbnail_url);
    setTag(item.tag);
    setCaseStudyUrl(item.case_study_url || '');
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      showToast({ message: 'Nama brand wajib diisi!', type: 'error' });
      return;
    }
    if (!campaignTitle.trim()) {
      showToast({ message: 'Judul campaign wajib diisi!', type: 'error' });
      return;
    }
    if (!thumbnailUrl.trim()) {
      showToast({ message: 'URL gambar thumbnail wajib diisi!', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        const created = await repository.createPortfolioItem({
          brand_name: brandName.trim(),
          campaign_title: campaignTitle.trim(),
          platform,
          views_count: Math.max(0, viewsCount),
          likes_count: Math.max(0, likesCount),
          thumbnail_url: thumbnailUrl.trim(),
          tag: tag.trim() || 'Brand Campaign',
          case_study_url: caseStudyUrl.trim() || undefined,
        });
        const updatedList = [...items, created];
        setItems(updatedList);
        onItemsChange?.(updatedList);
        showToast({ message: `Kolaborasi ${created.brand_name} berhasil ditambahkan!`, type: 'success' });
        resetForm();
      } else if (editingId) {
        const updated = await repository.updatePortfolioItem(editingId, {
          brand_name: brandName.trim(),
          campaign_title: campaignTitle.trim(),
          platform,
          views_count: Math.max(0, viewsCount),
          likes_count: Math.max(0, likesCount),
          thumbnail_url: thumbnailUrl.trim(),
          tag: tag.trim() || 'Brand Campaign',
          case_study_url: caseStudyUrl.trim() || undefined,
        });
        const updatedList = items.map((it) => (it.id === editingId ? { ...it, ...updated } : it));
        setItems(updatedList);
        onItemsChange?.(updatedList);
        showToast({ message: `Kolaborasi ${updated.brand_name} berhasil diperbarui!`, type: 'success' });
        resetForm();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan portofolio.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Hapus portofolio kolaborasi dengan ${name}?`)) return;

    try {
      await repository.deletePortfolioItem(id);
      const updatedList = items.filter((it) => it.id !== id);
      setItems(updatedList);
      onItemsChange?.(updatedList);
      showToast({ message: `Portofolio ${name} berhasil dihapus!`, type: 'success' });
      if (editingId === id) resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus item.';
      showToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Header Card */}
      <NeoCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-mustard" />
              <span>Portofolio & Kolaborasi Viral</span>
            </h2>
            <p className="text-xs text-ink/70 font-mono mt-0.5">
              Kelola daftar kolaborasi brand, campaign viral, dan statistik views/likes.
            </p>
          </div>

          <NeoButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleStartCreate}
            className="gap-2 shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Kolaborasi</span>
          </NeoButton>
        </div>
      </NeoCard>

      {/* Editor Modal / Card (Visible during Create or Edit) */}
      {(isCreating || editingId) && (
        <NeoCard className="p-4 sm:p-6 border-3 border-ink shadow-neo-lg bg-[#FFFDF8]">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-5">
            <h3 className="font-black text-sm sm:text-base text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-mustard" />
              <span>{isCreating ? 'Tambah Kolaborasi Brand Baru' : 'Edit Kolaborasi Brand'}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg border border-ink hover:bg-paper transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Tutup form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Nama Brand / Klien *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Bank Nagari, Janji Jiwa"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>

              {/* Tag / Category */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Kategori / Tag Kampanye
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Contoh: Fintech, F&B, UMKM, Pariwisata"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                />
              </div>

              {/* Campaign Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Judul Kampanye / Ringkasan Kolaborasi *
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Contoh: Grand Opening Outlet Baru Khatib Sulaiman Padang"
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                  required
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Platform Utama
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PackagePlatform)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Study URL */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Link Postingan / Video (Opsional)
                </label>
                <input
                  type="url"
                  value={caseStudyUrl}
                  onChange={(e) => setCaseStudyUrl(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                />
              </div>

              {/* Views Count */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Jumlah Views / Tayangan
                </label>
                <input
                  type="number"
                  min="0"
                  value={viewsCount}
                  onChange={(e) => setViewsCount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                />
                <span className="text-[10px] font-mono text-ink/60 mt-1 block">
                  Tampil sebagai {formatCompactNumber(viewsCount)} views
                </span>
              </div>

              {/* Likes Count */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  Jumlah Likes / Interaksi
                </label>
                <input
                  type="number"
                  min="0"
                  value={likesCount}
                  onChange={(e) => setLikesCount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                />
                <span className="text-[10px] font-mono text-ink/60 mt-1 block">
                  Tampil sebagai {formatCompactNumber(likesCount)} likes
                </span>
              </div>

              {/* Thumbnail URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-bold text-ink/80 mb-1">
                  URL Gambar Thumbnail *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mustard min-h-[44px]"
                    required
                  />
                  {thumbnailUrl && (
                    <div className="w-11 h-11 rounded-xl border-2 border-ink overflow-hidden shrink-0 bg-paper">
                      <Image
                        src={thumbnailUrl}
                        alt="Preview"
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-ink/60">Contoh Foto Cepat:</span>
                  {PRESET_THUMBNAILS.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setThumbnailUrl(thumb)}
                      className="w-6 h-6 rounded-md border border-ink overflow-hidden hover:scale-110 transition-transform"
                      title={`Gunakan gambar sample ${idx + 1}`}
                    >
                      <Image
                        src={thumb}
                        alt={`Sample ${idx + 1}`}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/15">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-mono font-bold text-ink/70 hover:text-ink min-h-[44px]"
              >
                Batal
              </button>
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                className="gap-2 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Portofolio'}</span>
              </NeoButton>
            </div>
          </form>
        </NeoCard>
      )}

      {/* Portfolio Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <NeoCard
            key={item.id}
            className="p-4 bg-white flex flex-col justify-between hover:shadow-neo transition-all"
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-ink overflow-hidden shrink-0 bg-paper">
                  <Image
                    src={item.thumbnail_url || PRESET_THUMBNAILS[0]!}
                    alt={item.brand_name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-ink text-white">
                    {item.platform}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-mustard/30 text-ink border border-ink/40">
                      {item.tag}
                    </span>
                    {item.case_study_url && (
                      <a
                        href={item.case_study_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink/60 hover:text-ink p-1"
                        title="Buka tautan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <h4 className="font-black text-sm text-ink truncate">{item.brand_name}</h4>
                  <p className="text-xs text-ink/70 line-clamp-2 mt-0.5">{item.campaign_title}</p>
                </div>
              </div>

              {/* Metrics pill */}
              <div className="flex items-center gap-3 py-2 px-3 bg-paper rounded-xl border border-ink/20 font-mono text-xs font-bold text-ink/80 mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-mustard" />
                  <span>{formatCompactNumber(item.views_count)} Views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-coral" />
                  <span>{formatCompactNumber(item.likes_count)} Likes</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/10">
              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                className="px-3 py-1.5 rounded-lg border-2 border-ink bg-paper text-ink font-mono text-xs font-bold hover:bg-mustard transition-colors flex items-center gap-1.5 min-h-[36px]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id, item.brand_name)}
                className="p-1.5 rounded-lg border-2 border-ink text-coral hover:bg-coral/20 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={`Hapus ${item.brand_name}`}
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </NeoCard>
        ))}

        {items.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border-2 border-ink border-dashed">
            <Briefcase className="w-8 h-8 text-ink/40 mx-auto mb-2" />
            <p className="font-bold text-sm text-ink">Belum ada portofolio kolaborasi</p>
            <p className="font-mono text-xs text-ink/60 mt-1">
              Klik tombol &quot;Tambah Kolaborasi&quot; di atas untuk menambahkan hasil kerja sama brand.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

