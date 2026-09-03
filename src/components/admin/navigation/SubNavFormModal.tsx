import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Link,
  Tag,
  FolderTree,
  Compass,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SubNavigationItem, SubNavTargetType } from '../../../types/navigation';
import { getStoredCategories } from '../../../data/categoryAdminStore';
import { getStoredTags } from '../../../data/tagAdminStore';

interface SubNavFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SubNavigationItem>) => void;
  itemToEdit?: SubNavigationItem | null;
}

const REGION_PRESETS = [
  { label: 'Kota Batu', slug: 'kota-batu', url: '/kategori/daerah' },
  { label: 'Malang Raya', slug: 'malang-raya', url: '/kategori/malang-raya' },
  { label: 'Jawa Timur (Jatim)', slug: 'jatim', url: '/kategori/jawa-timur' },
  { label: 'Jawa Tengah (Jateng)', slug: 'jateng', url: '/kategori/daerah' },
  { label: 'Jawa Barat (Jabar)', slug: 'jabar', url: '/kategori/daerah' },
  { label: 'DKI Jakarta', slug: 'jakarta', url: '/kategori/nasional' },
  { label: 'Banten', slug: 'banten', url: '/kategori/daerah' },
  { label: 'DI Yogyakarta', slug: 'di-yogya', url: '/kategori/daerah' },
  { label: 'Bali & Nusra', slug: 'bali', url: '/kategori/daerah' },
  { label: 'Sumatera', slug: 'sumatera', url: '/kategori/daerah' },
  { label: 'Kalimantan', slug: 'kalimantan', url: '/kategori/daerah' },
  { label: 'Sulawesi', slug: 'sulawesi', url: '/kategori/daerah' },
  { label: 'Papua & Maluku', slug: 'papua', url: '/kategori/daerah' },
];

export const SubNavFormModal: React.FC<SubNavFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [label, setLabel] = useState('');
  const [targetType, setTargetType] = useState<SubNavTargetType>('region');
  const [targetId, setTargetId] = useState('');
  const [url, setUrl] = useState('');
  const [badge, setBadge] = useState<string>('');
  const [active, setActive] = useState(true);
  const [openNewTab, setOpenNewTab] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [errors, setErrors] = useState<{ label?: string; url?: string }>({});

  const categories = getStoredCategories().filter((c) => c.status === 'active');
  const tags = getStoredTags().filter((t) => t.status === 'active');

  useEffect(() => {
    if (itemToEdit) {
      setLabel(itemToEdit.label);
      setTargetType(itemToEdit.targetType);
      setTargetId(itemToEdit.targetId || '');
      setUrl(itemToEdit.url);
      setBadge(itemToEdit.badge || '');
      setActive(itemToEdit.active);
      setOpenNewTab(itemToEdit.openNewTab);
      setSortOrder(itemToEdit.sortOrder);
    } else {
      setLabel('');
      setTargetType('region');
      setTargetId('kota-batu');
      setUrl('/kategori/daerah');
      setBadge('');
      setActive(true);
      setOpenNewTab(false);
      setSortOrder(1);
    }
    setErrors({});
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle target selection logic
  const handleTargetTypeChange = (newType: SubNavTargetType) => {
    setTargetType(newType);
    if (newType === 'category') {
      const firstCat = categories[0];
      if (firstCat) {
        setTargetId(firstCat.slug);
        setUrl(`/kategori/${firstCat.slug}`);
        if (!label || label === 'Kota Batu') setLabel(firstCat.name);
      }
    } else if (newType === 'tag') {
      const firstTag = tags[0];
      if (firstTag) {
        setTargetId(firstTag.slug);
        setUrl(`/tag/${firstTag.slug}`);
        if (!label) setLabel(firstTag.name);
      }
    } else if (newType === 'region') {
      setTargetId('kota-batu');
      setUrl('/kategori/daerah');
      if (!label) setLabel('Batu');
    } else if (newType === 'custom') {
      setUrl('/');
    } else if (newType === 'external') {
      setUrl('https://');
      setOpenNewTab(true);
    }
  };

  const handleCategorySelect = (slug: string) => {
    setTargetId(slug);
    setUrl(`/kategori/${slug}`);
    const selected = categories.find((c) => c.slug === slug);
    if (selected && (!label || itemToEdit === null)) {
      setLabel(selected.name);
    }
  };

  const handleTagSelect = (slug: string) => {
    setTargetId(slug);
    setUrl(`/tag/${slug}`);
    const selected = tags.find((t) => t.slug === slug);
    if (selected && (!label || itemToEdit === null)) {
      setLabel(selected.name);
    }
  };

  const handleRegionSelect = (slug: string) => {
    setTargetId(slug);
    const selected = REGION_PRESETS.find((r) => r.slug === slug);
    if (selected) {
      setUrl(selected.url);
      if (!label || itemToEdit === null) {
        setLabel(selected.label.replace(/\s*\(.*?\)/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { label?: string; url?: string } = {};

    if (!label.trim()) {
      newErrors.label = 'Label menu sub-navigasi wajib diisi';
    }
    if (!url.trim()) {
      newErrors.url = 'URL tujuan wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      label: label.trim(),
      targetType,
      targetId: targetId || undefined,
      url: url.trim(),
      badge: badge.trim() || undefined,
      active,
      openNewTab,
      sortOrder: Number(sortOrder) || 1,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 rounded-lg border border-red-500/30">
              <Compass className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {itemToEdit ? 'Edit Item Sub-Navigasi' : 'Tambah Item Sub-Navigasi'}
              </h3>
              <p className="text-xs text-slate-300">
                Pilih apakah menu mengarah ke Kategori, Tag Populer, Wilayah Daerah, atau URL Khusus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* 1. Link Target Type (Tabs / Grid) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipe Target Navigasi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'region', label: 'Wilayah', icon: Compass, desc: 'Batu, Jatim, dll' },
                { id: 'category', label: 'Kategori', icon: FolderTree, desc: 'Kategori Berita' },
                { id: 'tag', label: 'Tagar/Topik', icon: Tag, desc: 'Topik Khusus' },
                { id: 'custom', label: 'Custom', icon: Link, desc: 'Internal Path' },
                { id: 'external', label: 'Eksternal', icon: Globe, desc: 'URL Luar' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = targetType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTargetTypeChange(t.id as SubNavTargetType)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs ring-2 ring-red-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-red-600' : 'text-slate-500'}`} />
                    <span className="text-xs leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target Selector Dropdown based on TargetType */}
          {targetType === 'region' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Preset Wilayah / Daerah:
              </label>
              <select
                value={targetId}
                onChange={(e) => handleRegionSelect(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {REGION_PRESETS.map((reg) => (
                  <option key={reg.slug} value={reg.slug}>
                    {reg.label} ({reg.url})
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'category' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Master Kategori:
              </label>
              <select
                value={targetId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'tag' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Tag / Topik Khusus:
              </label>
              <select
                value={targetId}
                onChange={(e) => handleTagSelect(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {tags.map((tg) => (
                  <option key={tg.id} value={tg.slug}>
                    #{tg.name} ({tg.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Menu Label & Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Label Menu Tampilan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                }}
                placeholder="Contoh: Batu, Jatim, Wisata, Pilkada"
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.label
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-300 focus:ring-red-500/30 focus:border-red-500'
                }`}
              />
              {errors.label && <p className="text-xs text-red-500 mt-1 font-medium">{errors.label}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Aksen Badge (Opsional)
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                <option value="">Tanpa Badge</option>
                <option value="HOT">HOT</option>
                <option value="LIVE">LIVE</option>
                <option value="BARU">BARU</option>
                <option value="POPULER">POPULER</option>
              </select>
            </div>
          </div>

          {/* 4. Target URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Link Target <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
              }}
              placeholder="/kategori/jawa-timur atau https://..."
              className={`w-full bg-white border rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 ${
                errors.url
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-slate-300 focus:ring-red-500/30 focus:border-red-500'
              }`}
            />
            {errors.url && <p className="text-xs text-red-500 mt-1 font-medium">{errors.url}</p>}
          </div>

          {/* 5. Toggles: Status Aktif & Buka Tab Baru */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">Status Aktif (Tampil di Sub-Navigasi)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openNewTab}
                onChange={(e) => setOpenNewTab(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600">Buka di Tab Baru (`target="_blank"`)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambahkan Sub-Menu'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
