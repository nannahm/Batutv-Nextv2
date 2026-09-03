import React, { useState, useEffect } from 'react';
import {
  X,
  Hash,
  Globe,
  Sparkles,
  Layers,
  FileText,
  Video,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Info,
} from 'lucide-react';
import { AdminTag, TagContentType, TagStatus } from '../../../types/admin';
import { generateTagSlug, isTagSlugUnique } from '../../../data/tagAdminStore';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    slug: string;
    contentTypes: TagContentType[];
    status: TagStatus;
    seoTitle: string;
    metaDescription: string;
  }) => void;
  tagToEdit?: AdminTag | null;
}

export const TagFormModal: React.FC<TagFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tagToEdit,
}) => {
  const isEditing = !!tagToEdit;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [contentTypes, setContentTypes] = useState<TagContentType[]>(['news', 'video']);
  const [status, setStatus] = useState<TagStatus>('active');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    contentTypes?: string;
  }>({});

  // Populate data on open or tagToEdit change
  useEffect(() => {
    if (isOpen) {
      if (tagToEdit) {
        setName(tagToEdit.name);
        setSlug(tagToEdit.slug);
        setIsSlugManual(true);
        setContentTypes(tagToEdit.contentTypes || ['news', 'video']);
        setStatus(tagToEdit.status || 'active');
        setSeoTitle(tagToEdit.seoTitle || '');
        setMetaDescription(tagToEdit.metaDescription || '');
      } else {
        setName('');
        setSlug('');
        setIsSlugManual(false);
        setContentTypes(['news', 'video']);
        setStatus('active');
        setSeoTitle('');
        setMetaDescription('');
      }
      setErrors({});
    }
  }, [isOpen, tagToEdit]);

  // Auto generate slug when name changes (if user hasn't manually edited slug)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      const generated = generateTagSlug(val);
      setSlug(generated);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManual(true);
    setSlug(generateTagSlug(val));
  };

  const handleToggleContentType = (type: TagContentType) => {
    setContentTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; slug?: string; contentTypes?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nama tag wajib diisi.';
    }

    const cleanSlug = generateTagSlug(slug || name);
    if (!cleanSlug) {
      newErrors.slug = 'Slug wajib diisi dan harus berupa karakter URL yang valid.';
    } else if (!isTagSlugUnique(cleanSlug, tagToEdit?.id)) {
      newErrors.slug = `Slug "${cleanSlug}" sudah dipakai tag lain. Harap gunakan nama/slug lain.`;
    }

    if (contentTypes.length === 0) {
      newErrors.contentTypes = 'Pilih minimal satu tipe konten (Berita atau Video).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalSlug = generateTagSlug(slug || name);
    const finalSeoTitle = seoTitle.trim() || `${name.trim()} | BatuTV`;
    const finalMetaDesc =
      metaDescription.trim() ||
      `Kumpulan berita, video, dan informasi terpercaya seputar topik ${name.trim()} di BatuTV.`;

    onSave({
      name: name.trim(),
      slug: finalSlug,
      contentTypes,
      status,
      seoTitle: finalSeoTitle,
      metaDescription: finalMetaDesc,
    });
  };

  if (!isOpen) return null;

  const currentSlugDisplay = generateTagSlug(slug || name) || 'topik-tag';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Master Tag' : 'Tambah Tag Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Perbarui kata kunci dan konfigurasi metadata untuk "${tagToEdit?.name}"`
                  : 'Daftarkan kata kunci topik untuk menghubungkan Berita dan Video'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Main Info Section */}
          <div className="space-y-4">
            {/* Nama Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Tag <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  #
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Prabowo, Pilkada 2029, Apel Batu"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none transition-all ${
                    errors.name
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  }`}
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Slug URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Slug URL <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {isSlugManual ? 'Disesuaikan manual' : 'Otomatis dari nama'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                  /tag/
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="prabowo"
                  className={`w-full pl-16 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none transition-all ${
                    errors.slug
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  }`}
                />
              </div>
              {errors.slug ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.slug}
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>URL Publik:</span>
                  <code className="text-red-600 font-bold font-mono">
                    https://batutv.id/tag/{currentSlugDisplay}
                  </code>
                </div>
              )}
            </div>

            {/* Digunakan Untuk (Content Types) & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Digunakan Untuk */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Digunakan Untuk <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-800 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contentTypes.includes('news')}
                      onChange={() => handleToggleContentType('news')}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Berita Teks / Artikel</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-800 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contentTypes.includes('video')}
                      onChange={() => handleToggleContentType('video')}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-red-600" />
                      <span>Video YouTube / Liputan</span>
                    </div>
                  </label>
                </div>
                {errors.contentTypes && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contentTypes}
                  </p>
                )}
              </div>

              {/* Status Tag */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status Tag
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-800 font-medium cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-emerald-700">Aktif</span>
                      <span className="text-[10px] text-slate-400">(Tampil di editor)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-800 font-medium cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span className="font-semibold text-slate-600">Nonaktif</span>
                      <span className="text-[10px] text-slate-400">(Disembunyikan)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata Section */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3.5">
            <div className="flex items-center gap-2 text-slate-800">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Pengaturan SEO & Meta Google
              </h3>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  SEO Title
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {seoTitle.length || (name ? `${name} | BatuTV`.length : 0)} / 60 karakter
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name ? `${name} | BatuTV` : 'Judul halaman tag untuk mesin pencari'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Meta Description
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {metaDescription.length} / 160 karakter
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder={
                  name
                    ? `Kumpulan berita, video, dan informasi terpercaya seputar topik ${name} di BatuTV.`
                    : 'Deskripsi ringkas yang tampil di hasil pencarian Google...'
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Google SERP Live Snippet Preview */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Google SERP Snippet Preview
              </div>
              <div className="text-xs text-emerald-700 truncate font-mono">
                https://batutv.id/tag/{currentSlugDisplay}
              </div>
              <div className="text-sm font-medium text-blue-800 hover:underline line-clamp-1">
                {seoTitle.trim() || (name ? `${name} | BatuTV` : 'Topik Tag Berita')}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDescription.trim() ||
                  (name
                    ? `Kumpulan berita, video, dan informasi terpercaya seputar topik ${name} di BatuTV.`
                    : 'Kumpulan berita terkini dan video liputan terpercaya di portal BatuTV.')}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Tag'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
