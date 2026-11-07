'use client';

import React, { useState } from 'react';
import {
  EndorsePackage,
  PackagePlatform,
  PackageTier,
} from '@/types';
import { repository } from '@/lib/data/repository';
import { formatIDR } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/Toast';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Star,
  EyeOff,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PackageBuilderProps {
  initialPackages: EndorsePackage[];
  onPackagesChange?: (packages: EndorsePackage[]) => void;
}

const PLATFORMS: Array<{ id: PackagePlatform; label: string }> = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'cross-platform', label: 'Cross-Platform' },
];

const TIERS: Array<{ id: PackageTier; label: string }> = [
  { id: 'starter', label: 'Starter' },
  { id: 'standard', label: 'Standard' },
  { id: 'vip', label: 'VIP' },
  { id: 'bundle', label: 'Bundle' },
];

export function PackageBuilder({
  initialPackages,
  onPackagesChange,
}: PackageBuilderProps) {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<EndorsePackage[]>(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<EndorsePackage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Form State
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState<PackagePlatform>('instagram');
  const [formPrice, setFormPrice] = useState<number>(1000000);
  const [formDesc, setFormDesc] = useState('');
  const [formDeliverables, setFormDeliverables] = useState<string[]>(['1x Feed Post']);
  const [newDeliverableTag, setNewDeliverableTag] = useState('');
  const [formTier, setFormTier] = useState<PackageTier>('standard');
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formPopular, setFormPopular] = useState(false);
  const [formPriceHidden, setFormPriceHidden] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormName('');
    setFormPlatform('instagram');
    setFormPrice(1500000);
    setFormDesc('Paket endorsement profesional');
    setFormDeliverables(['1x Reels Promosi', '1x Story Link']);
    setNewDeliverableTag('');
    setFormTier('standard');
    setFormDiscount(0);
    setFormPopular(false);
    setFormPriceHidden(false);
    setFormActive(true);
    setFormSortOrder(packages.length + 1);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: EndorsePackage) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormPlatform(pkg.platform);
    setFormPrice(pkg.price);
    setFormDesc(pkg.description);
    setFormDeliverables(pkg.deliverables && pkg.deliverables.length > 0 ? [...pkg.deliverables] : ['1x Deliverable']);
    setNewDeliverableTag('');
    setFormTier(pkg.tier || 'standard');
    setFormDiscount(pkg.discount_percentage || 0);
    setFormPopular(pkg.is_popular);
    setFormPriceHidden(pkg.is_price_hidden);
    setFormActive(pkg.is_active);
    setFormSortOrder(pkg.sort_order);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAddDeliverable = () => {
    const cleanTag = newDeliverableTag.trim();
    if (!cleanTag) return;
    setFormDeliverables([...formDeliverables, cleanTag]);
    setNewDeliverableTag('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    setFormDeliverables(formDeliverables.filter((_, i) => i !== idx));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) {
      errs.name = 'Nama paket wajib diisi.';
    }
    if (formPrice < 0) {
      errs.price = 'Harga paket tidak boleh negatif.';
    }
    if (formDeliverables.length === 0) {
      errs.deliverables = 'Paket minimal harus memiliki 1 deliverable.';
    }
    if (formDiscount < 0 || formDiscount > 100) {
      errs.discount = 'Diskon harus antara 0% dan 100%.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast({ message: 'Harap perbaiki data formulir paket.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPackage) {
        // Update
        const updated = await repository.updateEndorsePackage(editingPackage.id, {
          name: formName.trim(),
          platform: formPlatform,
          price: Number(formPrice),
          description: formDesc.trim(),
          deliverables: formDeliverables,
          tier: formTier,
          discount_percentage: Number(formDiscount),
          is_popular: formPopular,
          is_price_hidden: formPriceHidden,
          is_active: formActive,
          sort_order: Number(formSortOrder),
        });

        const nextList = packages.map((p) => (p.id === updated.id ? updated : p));
        setPackages(nextList);
        onPackagesChange?.(nextList);
        showToast({ message: `Paket "${updated.name}" berhasil diperbarui!`, type: 'success' });
      } else {
        // Create
        const created = await repository.createEndorsePackage({
          name: formName.trim(),
          platform: formPlatform,
          price: Number(formPrice),
          description: formDesc.trim(),
          deliverables: formDeliverables,
          tier: formTier,
          discount_percentage: Number(formDiscount),
          is_popular: formPopular,
          is_price_hidden: formPriceHidden,
          is_active: formActive,
          sort_order: Number(formSortOrder),
        });

        const nextList = [...packages, created];
        setPackages(nextList);
        onPackagesChange?.(nextList);
        showToast({ message: `Paket baru "${created.name}" berhasil dibuat!`, type: 'success' });
      }

      setIsModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan paket.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const success = await repository.deleteEndorsePackage(deletingId);
      if (success) {
        const nextList = packages.filter((p) => p.id !== deletingId);
        setPackages(nextList);
        onPackagesChange?.(nextList);
        showToast({ message: 'Paket endorsement berhasil dihapus.', type: 'success' });
      } else {
        showToast({ message: 'Gagal menghapus paket dari repository.', type: 'error' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus paket.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const packageToDelete = packages.find((p) => p.id === deletingId);

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-mustard" />
            <span>Katalog Paket & Rate Card Endorsement</span>
          </h2>
          <p className="text-xs text-ink/70 font-mono mt-0.5">
            Kelola daftar harga, deliverables, tier diskon, dan flag negosiasi WhatsApp.
          </p>
        </div>

        <NeoButton
          type="button"
          variant="primary"
          size="md"
          onClick={openCreateModal}
          className="gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </NeoButton>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <NeoCard
            key={pkg.id}
            className={cn(
              'p-5 flex flex-col justify-between transition-all',
              !pkg.is_active && 'opacity-60 bg-paper/60'
            )}
          >
            <div>
              {/* Card Header: Platform, Tier, and Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-ink rounded-lg uppercase tracking-wider">
                    {pkg.platform}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-mustard/30 text-ink border border-ink rounded-lg capitalize">
                    Tier: {pkg.tier || 'standard'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {pkg.is_popular && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-ink bg-mustard text-ink font-mono text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-ink text-ink" />
                      <span>Populer</span>
                    </span>
                  )}
                  {pkg.is_price_hidden && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-ink bg-paper text-ink font-mono text-[10px] font-bold">
                      <EyeOff className="w-3 h-3 text-ink/70" />
                      <span>Private WA</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Package Title & Price */}
              <div className="mb-2">
                <h3 className="font-black text-base text-ink tracking-tight">
                  {pkg.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-lg font-black text-ink">
                    {pkg.is_price_hidden ? 'Negosiasi Khusus' : formatIDR(pkg.price)}
                  </span>
                  {pkg.discount_percentage ? (
                    <span className="text-xs font-mono font-bold text-coral">
                      (Diskon {pkg.discount_percentage}%)
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-ink/70 leading-relaxed mb-3">
                {pkg.description}
              </p>

              {/* Deliverables Tags */}
              <div className="space-y-1.5 pt-2 border-t border-ink/10 mb-4">
                <span className="font-mono text-[11px] font-bold text-ink/60 uppercase block">
                  Deliverables ({pkg.deliverables?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.deliverables?.map((deliv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-paper border border-ink rounded-lg font-mono text-xs text-ink flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-mint stroke-[3]" />
                      <span>{deliv}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Edit, Delete */}
            <div className="pt-3 border-t border-ink/20 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-ink/50">
                Urutan: #{pkg.sort_order} • Status: {pkg.is_active ? 'Aktif' : 'Nonaktif'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(pkg)}
                  className="px-3 py-1.5 rounded-lg border-2 border-ink bg-white text-ink hover:bg-mustard/30 transition-colors font-mono text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
                  aria-label={`Edit paket ${pkg.name}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(pkg.id)}
                  className="p-2 rounded-lg border-2 border-ink bg-white text-coral hover:bg-coral/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Hapus paket ${pkg.name}`}
                  title="Hapus paket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </NeoCard>
        ))}
      </div>

      {/* Create / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-paper border-2 border-ink shadow-neo-lg rounded-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-black text-lg text-ink tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mustard" />
                <span>
                  {editingPackage ? `Edit Paket: ${editingPackage.name}` : 'Buat Paket Baru'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-ink bg-white text-ink hover:bg-coral/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 uppercase mb-1">
                  Nama Paket
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Instagram Reels & Story Boost"
                  className={cn(
                    'w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]',
                    formErrors.name && 'border-coral'
                  )}
                  required
                />
                {formErrors.name && (
                  <p className="text-xs font-mono font-bold text-coral mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Platform & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink/80 uppercase mb-1">
                    Platform
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as PackagePlatform)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink/80 uppercase mb-1">
                    Tier Rate Card
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as PackageTier)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                  >
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono font-bold text-ink/80 uppercase">
                      Harga (IDR)
                    </label>
                    <span className="font-mono text-xs font-bold text-ink">
                      {formatIDR(formPrice)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink/80 uppercase mb-1">
                    Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-ink rounded-xl font-mono text-sm text-ink min-h-[44px]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono font-bold text-ink/80 uppercase mb-1">
                  Deskripsi Paket
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detail benefit dan lingkup kerjasama..."
                  className="w-full p-3 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink min-h-[70px]"
                />
              </div>

              {/* Deliverables Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-ink/80 uppercase">
                  Daftar Deliverables (Min. 1 Item)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverableTag}
                    onChange={(e) => setNewDeliverableTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Tambah deliverable (e.g. 1x Video Reels)"
                    className="flex-1 px-3 py-2 bg-white border-2 border-ink rounded-xl font-mono text-xs text-ink min-h-[44px]"
                  />
                  <NeoButton
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddDeliverable}
                    disabled={!newDeliverableTag.trim()}
                    className="gap-1 min-h-[44px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </NeoButton>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formDeliverables.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-paper border-2 border-ink rounded-xl font-mono text-xs text-ink flex items-center gap-2"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-coral hover:text-ink font-bold min-h-[30px] min-w-[20px] flex items-center justify-center"
                        aria-label={`Hapus ${item}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                {formErrors.deliverables && (
                  <p className="text-xs font-mono font-bold text-coral">
                    {formErrors.deliverables}
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="p-3 bg-white border-2 border-ink rounded-xl flex items-center justify-between cursor-pointer min-h-[44px]">
                  <span className="font-mono text-xs font-bold text-ink">Paket Populer ⭐</span>
                  <input
                    type="checkbox"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="w-4 h-4 accent-ink"
                  />
                </label>

                <label className="p-3 bg-white border-2 border-ink rounded-xl flex items-center justify-between cursor-pointer min-h-[44px]">
                  <span className="font-mono text-xs font-bold text-ink">Sembunyikan Harga</span>
                  <input
                    type="checkbox"
                    checked={formPriceHidden}
                    onChange={(e) => setFormPriceHidden(e.target.checked)}
                    className="w-4 h-4 accent-ink"
                  />
                </label>

                <label className="p-3 bg-white border-2 border-ink rounded-xl flex items-center justify-between cursor-pointer min-h-[44px]">
                  <span className="font-mono text-xs font-bold text-ink">Status Aktif</span>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 accent-ink"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-ink">
                <NeoButton
                  type="button"
                  variant="paper"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px]"
                >
                  Batal
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && packageToDelete && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink shadow-neo-lg rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-coral">
              <div className="w-10 h-10 rounded-xl bg-coral/20 border-2 border-ink flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-coral" />
              </div>
              <h3 className="font-black text-base text-ink tracking-tight">
                Konfirmasi Hapus Paket
              </h3>
            </div>

            <p className="text-xs text-ink/80 font-mono leading-relaxed">
              Hapus paket endorsement &quot;{packageToDelete.name}&quot;? Paket yang dihapus tidak akan ditampilkan lagi pada kalkulator publik.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t-2 border-ink">
              <NeoButton
                type="button"
                variant="paper"
                size="md"
                onClick={() => setDeletingId(null)}
                className="min-h-[44px]"
              >
                Batal
              </NeoButton>
              <NeoButton
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmDelete}
                className="bg-coral text-ink border-2 border-ink min-h-[44px]"
              >
                Ya, Hapus Paket
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

