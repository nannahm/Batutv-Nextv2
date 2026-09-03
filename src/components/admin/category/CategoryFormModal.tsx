import React, { useState, useEffect } from 'react';
import {
  X,
  Tags,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  Globe,
  FileText,
  Video,
  Check,
  Lock,
  Unlock,
} from 'lucide-react';
import { AdminCategory, CategoryContentType, CategoryStatus } from '../../../types/admin';
import {
  generateCategorySlug,
  isCategoryNameUnique,
  isCategorySlugUnique,
  getParentCategoryOptions,
} from '../../../data/categoryAdminStore';

interface CategoryFormModalProps {
  isOpen: boolean;
  categoryToEdit?: AdminCategory | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    contentTypes: CategoryContentType[];
    status: CategoryStatus;
    seoTitle: string;
    metaDescription: string;
  }) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(categoryToEdit);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [useForNews, setUseForNews] = useState(true);
  const [useForVideo, setUseForVideo] = useState(true);
  const [status, setStatus] = useState<CategoryStatus>('active');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSlugWarning, setShowSlugWarning] = useState(false);

  // Parent Category options (level 1 only, excluding current category)
  const parentOptions = getParentCategoryOptions(categoryToEdit?.id);

  // Populate or reset form when modal opens or categoryToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setSlug(categoryToEdit.slug);
        setIsSlugManuallyEdited(true); // Don't auto-overwrite existing slug
        setDescription(categoryToEdit.description || '');
        setParentId(categoryToEdit.parentId || '');
        setUseForNews(categoryToEdit.contentTypes.includes('news'));
        setUseForVideo(categoryToEdit.contentTypes.includes('video'));
        setStatus(categoryToEdit.status);
        setSeoTitle(categoryToEdit.seoTitle || '');
        setMetaDescription(categoryToEdit.metaDescription || '');
        setShowSlugWarning(false);
      } else {
        setName('');
        setSlug('');
        setIsSlugManuallyEdited(false);
        setDescription('');
        setParentId('');
        setUseForNews(true);
        setUseForVideo(true);
        setStatus('active');
        setSeoTitle('');
        setMetaDescription('');
        setShowSlugWarning(false);
      }
      setErrors({});
    }
  }, [isOpen, categoryToEdit]);

  // Auto-generate slug when name changes (if slug not manually edited)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited && !isEditing) {
      const generated = generateCategorySlug(val);
      setSlug(generated);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  // Handle custom slug change
  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    const cleaned = generateCategorySlug(val);
    setSlug(cleaned);

    if (isEditing && categoryToEdit && cleaned !== categoryToEdit.slug) {
      setShowSlugWarning(true);
    } else {
      setShowSlugWarning(false);
    }

    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Nama kategori wajib diisi.';
    } else if (!isCategoryNameUnique(trimmedName, categoryToEdit?.id)) {
      newErrors.name = `Kategori dengan nama "${trimmedName}" sudah ada.`;
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      newErrors.slug = 'Slug wajib diisi.';
    } else if (!isCategorySlugUnique(trimmedSlug, categoryToEdit?.id)) {
      newErrors.slug = `Slug "${trimmedSlug}" sudah digunakan oleh kategori lain.`;
    }

    if (!useForNews && !useForVideo) {
      newErrors.contentTypes = 'Pilih minimal satu peruntukan kategori (Berita atau Video).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contentTypes: CategoryContentType[] = [];
    if (useForNews) contentTypes.push('news');
    if (useForVideo) contentTypes.push('video');

    onSave({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      parentId: parentId ? parentId : null,
      contentTypes,
      status,
      seoTitle: seoTitle.trim(),
      metaDescription: metaDescription.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Kategori Master' : 'Tambah Kategori Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing
                  ? `Perbarui data dan peruntukan rubrik "${categoryToEdit?.name}"`
                  : 'Buat rubrik klasifikasi baru untuk Berita dan Video BatuTV'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* NAMA KATEGORI */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Politik, Wisata & Kuliner, Sepak Bola"
              className={`w-full px-4 py-2.5 bg-white border ${
                errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              } rounded-xl text-slate-900 text-sm focus:outline-none transition-all placeholder:text-slate-400 font-medium`}
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* SLUG */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Slug URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                {isSlugManuallyEdited ? (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Lock className="w-3 h-3" /> Diedit manual
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Unlock className="w-3 h-3" /> Auto-sync nama
                  </span>
                )}
              </div>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs text-slate-400 select-none">/kategori/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="politik"
                className={`w-full pl-22 pr-4 py-2.5 bg-white border ${
                  errors.slug ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                } rounded-xl text-slate-900 font-mono text-sm focus:outline-none transition-all placeholder:text-slate-400`}
              />
            </div>
            {errors.slug && <p className="mt-1 text-xs text-red-500 font-medium">{errors.slug}</p>}

            {showSlugWarning && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Peringatan SEO:</strong> Perubahan slug dapat mengubah URL publik kategori (
                  <code>/kategori/{categoryToEdit?.slug}</code> &rarr; <code>/kategori/{slug}</code>). Pastikan
                  perubahan ini disengaja.
                </span>
              </div>
            )}
          </div>

          {/* PARENT KATEGORI (MAX 1 LEVEL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Parent Kategori (Opsional)
              </label>
              <span className="text-[11px] text-slate-400">Maks. 1 tingkat hirarki</span>
            </div>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all cursor-pointer"
            >
              <option value="">-- Tidak Ada Parent (Kategori Utama / Level 1) --</option>
              {parentOptions.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.slug})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Jika memilih parent, kategori ini akan menjadi sub-kategori tingkat 2.
            </p>
          </div>

          {/* DIGUNAKAN UNTUK (CONTENT TYPES) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Digunakan Untuk Konten <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  useForNews
                    ? 'bg-red-50/60 border-red-200 text-red-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={useForNews}
                  onChange={(e) => setUseForNews(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${useForNews ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium">Berita &amp; Artikel</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  useForVideo
                    ? 'bg-red-50/60 border-red-200 text-red-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={useForVideo}
                  onChange={(e) => setUseForVideo(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Video className={`w-4 h-4 ${useForVideo ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium">Video YouTube</span>
                </div>
              </label>
            </div>
            {errors.contentTypes && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.contentTypes}</p>}
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Rubrik
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan topik atau materi liputan dalam kategori ini..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status Kategori
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="categoryStatus"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aktif (Tersedia untuk konten baru)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="categoryStatus"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Nonaktif (Arsip / Tersembunyi)
                </span>
              </label>
            </div>
          </div>

          {/* SEO METADATA ACCORDION / BOX */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-red-600" />
              <span>Pengaturan SEO &amp; Meta Halaman Publik</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">SEO Title (Opsional)</label>
                <span className="text-[10px] text-slate-400">
                  Fallback: {name ? `${name} | BatuTV` : 'Nama Kategori | BatuTV'}
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name ? `Kumpulan Berita ${name} Terkini | BatuTV` : 'Judul halaman SEO'}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                <span className="text-[10px] text-slate-400">{metaDescription.length} karakter</span>
              </div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={description || 'Deskripsi ringkas untuk cuplikan pencarian Google...'}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200">
              <span className="text-slate-400">Canonical URL:</span>
              <code className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                /kategori/{slug || 'slug'}
              </code>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
