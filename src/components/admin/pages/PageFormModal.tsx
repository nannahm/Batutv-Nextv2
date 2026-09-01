import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  FileText,
  Globe,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminPage, PageStatus, AdminMedia } from '../../../types/admin';
import { generatePageSlug, generateUniquePageSlug, isPageSlugUnique, getStoredPages } from '../../../data/pagesAdminStore';
import { PageRichEditor } from './PageRichEditor';
import { MediaPickerModal } from '../media/MediaPickerModal';

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: Partial<AdminPage>) => void;
  initialData?: AdminPage | null;
}

export const PageFormModal: React.FC<PageFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = !!initialData;

  // Form States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PageStatus>('published');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | undefined>(undefined);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | undefined>(undefined);

  // Media Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate data on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setSlug(initialData.slug || '');
        setIsSlugManuallyEdited(true);
        setExcerpt(initialData.excerpt || '');
        setContent(initialData.content || '');
        setStatus(initialData.status || 'published');
        setSeoTitle(initialData.seoTitle || '');
        setMetaDescription(initialData.metaDescription || '');
        setFeaturedImageMediaId(initialData.featuredImageMediaId);
        setFeaturedImageUrl(initialData.featuredImageUrl);
      } else {
        setTitle('');
        setSlug('');
        setIsSlugManuallyEdited(false);
        setExcerpt('');
        setContent('<p>Tuliskan naskah isi halaman informasi Anda di sini...</p>');
        setStatus('published');
        setSeoTitle('');
        setMetaDescription('');
        setFeaturedImageMediaId(undefined);
        setFeaturedImageUrl(undefined);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  // Auto-generate slug and SEO title if not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = generatePageSlug(val);
      setSlug(generated);
    }
    if (!seoTitle || seoTitle.includes('BATUTV')) {
      setSeoTitle(val ? `${val} | BATUTV` : '');
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(generatePageSlug(val));
  };

  const handleSelectMedia = (media: AdminMedia) => {
    setFeaturedImageMediaId(media.id);
    setFeaturedImageUrl(media.url);
    setIsMediaPickerOpen(false);
  };

  const handleRemoveMedia = () => {
    setFeaturedImageMediaId(undefined);
    setFeaturedImageUrl(undefined);
  };

  const validateForm = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Judul halaman wajib diisi.';
    }

    const cleanSlugCandidate = generatePageSlug(slug.trim());
    if (!cleanSlugCandidate) {
      errs.slug = 'Slug URL halaman wajib diisi.';
    } else {
      // Check reserved system prefixes
      const reservedPrefixes = ['berita', 'video', 'kategori', 'tag', 'batutv-control', 'api'];
      if (reservedPrefixes.includes(cleanSlugCandidate)) {
        errs.slug = `Slug "/${cleanSlugCandidate}" merupakan kata kunci sistem yang dilindungi. Silakan gunakan slug lain.`;
      } else if (!isPageSlugUnique(cleanSlugCandidate, initialData?.id)) {
        const allPages = getStoredPages();
        const conflictPage = allPages.find(
          (p) => p.slug.toLowerCase() === cleanSlugCandidate.toLowerCase() && p.id !== initialData?.id
        );
        errs.slug = `Slug "/${cleanSlugCandidate}" sudah digunakan oleh halaman "${conflictPage?.title || cleanSlugCandidate}". Slug harus unik.`;
      }
    }

    if (!content.trim() || content === '<p></p>') {
      errs.content = 'Konten isi halaman wajib diisi.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: Partial<AdminPage> = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      status,
      seoTitle: seoTitle.trim() || `${title.trim()} | BATUTV`,
      metaDescription: metaDescription.trim() || excerpt.trim() || `Informasi resmi mengenai ${title.trim()} dari BatuTV.`,
      featuredImageMediaId,
      featuredImageUrl,
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {isEditing ? 'Edit Halaman Informasi' : 'Tambah Halaman Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Mengubah data halaman statis: /${initialData?.slug}`
                  : 'Buat halaman statis baru untuk informasi publik portal BatuTV'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="page-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Section */}
          <div className="space-y-4">
            {/* Judul Page */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Halaman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Tentang Kami, Pedoman Media Siber, dsb..."
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-semibold ${
                  errors.title
                    ? 'border-red-400 focus:ring-red-500/20 text-red-900'
                    : 'border-slate-300 focus:ring-red-500/20 text-slate-900'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Slug URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Slug URL <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Preview URL: <span className="font-mono text-red-600 font-bold">/{slug || 'slug-halaman'}</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 text-xs font-mono bg-slate-100 text-slate-500 border border-r-0 border-slate-300 rounded-l-xl select-none">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="tentang-kami"
                  className={`w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.slug
                      ? 'border-red-400 focus:ring-red-500/20 text-red-900'
                      : 'border-slate-300 focus:ring-red-500/20 text-slate-900'
                  }`}
                />
              </div>
              {errors.slug && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.slug}</span>
                </p>
              )}
            </div>

            {/* Status & Excerpt Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Radio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status Publikasi
                </label>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'published'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terbit (Published)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'draft'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Draft (Sembunyikan)</span>
                  </button>
                </div>
              </div>

              {/* Excerpt (2 col) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ringkasan / Excerpt <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat isi halaman untuk ditampilkan di pencarian / overview"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900"
                />
              </div>
            </div>

            {/* Featured Image (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Gambar Utama / Banner Halaman <span className="text-slate-400 font-normal">(Opsional)</span></span>
                <span className="text-[11px] text-slate-400 font-normal">Dari Konten Pendukung → Media</span>
              </label>
              
              {featuredImageUrl ? (
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="w-24 h-16 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Gambar Terpilih</p>
                    <p className="text-[11px] text-slate-500 truncate">{featuredImageUrl}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                      >
                        Ganti Gambar
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveMedia}
                        className="text-[11px] text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50/60 hover:bg-red-50/30 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Pilih Gambar dari Media Library</span>
                </button>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Naskah Konten Halaman <span className="text-red-500">*</span>
              </label>
              <PageRichEditor value={content} onChange={setContent} />
              {errors.content && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.content}</span>
                </p>
              )}
            </div>

            {/* SEO Optimization Accordion Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Globe className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Optimasi SEO & Mesin Pencari</h3>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Meta Title (Tag Judul SEO)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Judul Halaman | BATUTV"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Meta Description (Deskripsi Cuplikan Google)
                  </label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Deskripsi ringkas yang muncul pada hasil pencarian Google..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="page-form"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Halaman'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleSelectMedia}
        selectedMediaId={featuredImageMediaId}
        mediaTypeFilter="image"
      />
    </div>
  );
};
