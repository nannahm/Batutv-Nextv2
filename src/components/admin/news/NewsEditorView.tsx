import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Search,
  Sparkles,
  Link2,
  Tag,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  RefreshCw,
  Flame,
  Lock,
  Info,
} from 'lucide-react';
import { AdminArticle, ArticleStatus, AdminMedia, AdminUser } from '../../../types/admin';
import { getStoredCategories } from '../../../data/categoryAdminStore';
import { getActiveAuthors } from '../../../data/authorAdminStore';
import { checkArticleEditPermission, canRolePublish, normalizeUserRole } from '../../../utils/rbac';
import { NewsRichEditor } from './NewsRichEditor';
import { NewsPreviewModal } from './NewsPreviewModal';
import { MediaPickerModal } from '../media/MediaPickerModal';

interface NewsEditorViewProps {
  initialArticle?: AdminArticle | null;
  onSave: (article: AdminArticle) => void;
  onCancel: () => void;
  onPreviewPublic?: (slug: string) => void;
  currentUser?: AdminUser | null;
}

const DEFAULT_CATEGORIES = [
  'Daerah',
  'Nasional',
  'Ekonomi',
  'Wisata',
  'Politik',
  'Teknologi',
  'Gaya Hidup',
  'Otomotif',
  'Budaya',
  'Olahraga',
  'Kesehatan',
];

const DEFAULT_AUTHORS = [
  'Muhamad Yandi',
  'Siti Rahmawati',
  'Budi Santoso',
  'Dewi Lestari',
  'Tim Liputan Daerah',
  'Redaktur Pelaksana',
];

const DEFAULT_EDITORS = [
  'Hendra Wijaya',
  'Agus Supriyadi',
  'Dewi Sartika',
  'Redaktur Utama BatuTV',
];

export const NewsEditorView: React.FC<NewsEditorViewProps> = ({
  initialArticle,
  onSave,
  onCancel,
  currentUser,
}) => {
  const userRole = normalizeUserRole(currentUser?.role);
  const canPublish = canRolePublish(currentUser?.role);
  const editPermission = checkArticleEditPermission(currentUser?.role, initialArticle, currentUser);
  const isReadOnly = editPermission.isReadOnly;
  const isHeadlineAllowed = userRole === 'admin' || userRole === 'redaksi';

  // Form State
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [category, setCategory] = useState(initialArticle?.category || 'Daerah');

  // Dynamic active categories from master data
  const availableCategories = React.useMemo(() => {
    const stored = getStoredCategories();
    const filtered = stored.filter(
      (c) => c.status === 'active' && c.contentTypes.includes('news')
    );
    if (filtered.length > 0) {
      const names = filtered.map((c) => c.name);
      if (category && !names.includes(category)) {
        return [category, ...names];
      }
      return names;
    }
    return DEFAULT_CATEGORIES;
  }, [category]);

  // Master Data Penulis integration
  const availableAuthors = useMemo(() => {
    const list = getActiveAuthors();
    return list;
  }, []);

  const [authorId, setAuthorId] = useState<string>(() => {
    if (initialArticle?.authorId) return initialArticle.authorId;
    if (initialArticle?.author) {
      const match = availableAuthors.find(
        (a) => a.name.toLowerCase() === initialArticle.author?.toLowerCase()
      );
      if (match) return match.id;
    }
    // If current logged-in user has linked author or matches name
    if (currentUser?.name) {
      const matchCurrent = availableAuthors.find(
        (a) => a.name.toLowerCase() === currentUser.name.toLowerCase()
      );
      if (matchCurrent) return matchCurrent.id;
    }
    return availableAuthors[0]?.id || 'aut-1';
  });

  const [author, setAuthor] = useState(() => {
    if (initialArticle?.author) return initialArticle.author;
    const match = availableAuthors.find((a) => a.id === authorId);
    return match?.name || currentUser?.name || 'Ahmad Fauzi';
  });

  const [editor, setEditor] = useState(initialArticle?.editor || 'Hendra Wijaya');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  
  // Media State
  const [featuredImage, setFeaturedImage] = useState(
    initialArticle?.featuredImage ||
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80'
  );
  const [imageCaption, setImageCaption] = useState(initialArticle?.imageCaption || '');
  const [imageAlt, setImageAlt] = useState(initialArticle?.imageAlt || '');

  // Publish Settings State
  const [status, setStatus] = useState<ArticleStatus>(() => {
    if (!canPublish) return 'draft';
    return initialArticle?.status || 'draft';
  });
  
  // Date & Time
  const parseInitialDate = () => {
    const getLocalNow = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return {
        date: `${y}-${m}-${d}`,
        time: `${hh}:${mm}`,
      };
    };

    if (!initialArticle?.publishedAt) {
      return getLocalNow();
    }
    try {
      const match = initialArticle.publishedAt.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}))?/);
      if (match) {
        return {
          date: match[1],
          time: match[2] || '09:00',
        };
      }
      const d = new Date(initialArticle.publishedAt);
      if (isNaN(d.getTime())) {
        return getLocalNow();
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return {
        date: `${y}-${m}-${day}`,
        time: `${hh}:${mm}`,
      };
    } catch {
      return getLocalNow();
    }
  };

  const initialDateTime = parseInitialDate();
  const [publishDate, setPublishDate] = useState(initialDateTime.date);
  const [publishTime, setPublishTime] = useState(initialDateTime.time);

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialArticle?.metaDescription || '');
  const [tagsInput, setTagsInput] = useState(
    initialArticle?.tags?.join(', ') || 'Kota Batu, Berita Daerah'
  );

  // Headline Hero (SO3) State
  const [isHeadline, setIsHeadline] = useState<boolean>(initialArticle?.isHeadline || false);
  const [headlinePosition, setHeadlinePosition] = useState<number>(
    initialArticle?.headlinePosition || 1
  );
  const [headlineUntil, setHeadlineUntil] = useState<string>(
    initialArticle?.headlineUntil ? initialArticle.headlineUntil.split('T')[0] : ''
  );

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Media Library Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Auto slug generation from title if not customized
  useEffect(() => {
    if (!isSlugCustom && !initialArticle) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generated);
    }
  }, [title, isSlugCustom, initialArticle]);

  // Auto SEO sync
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(`${title.slice(0, 55)} - BatuTV`);
    }
  }, [title, seoTitle]);

  useEffect(() => {
    if (!metaDescription && excerpt) {
      setMetaDescription(excerpt.slice(0, 155));
    }
  }, [excerpt, metaDescription]);

  // Handle Generate/Regenerate Slug
  const handleRegenerateSlug = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generated);
    setIsSlugCustom(false);
  };

  // Build current article object for saving or previewing
  const buildArticleObject = (targetStatus?: ArticleStatus): AdminArticle => {
    const finalStatus = targetStatus || status;
    const finalDateTimeIso = `${publishDate}T${publishTime}:00`;
    const finalSlug = slug || 'artikel-baru';
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return {
      id: initialArticle?.id || `art-${Date.now()}`,
      title: title || 'Draft Artikel Tanpa Judul',
      slug: finalSlug,
      excerpt: excerpt || '',
      content: content || '<p>Tuliskan naskah berita di sini...</p>',
      category,
      categorySlug,
      author,
      authorId,
      editor,
      featuredImage:
        featuredImage ||
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80',
      imageCaption,
      imageAlt: imageAlt || title,
      status: finalStatus,
      publishedAt: finalDateTimeIso,
      updatedAt: new Date().toISOString(),
      createdAt: initialArticle?.createdAt || new Date().toISOString(),
      seoTitle: seoTitle || `${title} - BatuTV`,
      metaDescription: metaDescription || excerpt || title,
      canonicalUrl: `https://batutv.id/berita/${finalSlug}`,
      views: initialArticle?.views || 0,
      tags,
      isHeadline: Boolean(isHeadline),
      headlinePosition: isHeadline ? Number(headlinePosition) : null,
      headlineUntil: isHeadline && headlineUntil ? `${headlineUntil}T23:59:59` : null,
    };
  };

  const handleSaveAsDraft = () => {
    const article = buildArticleObject('draft');
    onSave(article);
  };

  const handlePublish = () => {
    const article = buildArticleObject(status === 'scheduled' ? 'scheduled' : 'published');
    onSave(article);
  };

  const currentPreviewArticle = buildArticleObject();

  return (
    <div className="space-y-6 pb-20">
      {/* Read Only Banner */}
      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <span>Mode Baca Saja (Read-Only)</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px] font-bold">
                {userRole.toUpperCase()}
              </span>
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {editPermission.reason || 'Anda tidak memiliki hak untuk mengedit atau menerbitkan naskah milik penulis lain.'}
            </p>
          </div>
        </div>
      )}

      {/* Top Navigation & Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-2 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            title="Kembali ke Daftar Berita"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {initialArticle ? (isReadOnly ? 'Lihat Naskah Berita' : 'Edit Naskah Berita') : 'Tulis Berita Baru'}
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {initialArticle ? `ID: ${initialArticle.id} • Modul Berita Redaksi` : 'Lengkapi naskah, gambar, SEO, dan publikasi'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Simpan Draft */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </button>
          )}

          {/* Button: Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors border border-purple-200/60 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span>Pratinjau (Preview)</span>
          </button>

          {/* Button: Terbitkan / Kirim ke Redaksi */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={canPublish ? handlePublish : handleSaveAsDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {canPublish
                  ? status === 'scheduled'
                    ? 'Jadwalkan Publikasi'
                    : status === 'published'
                    ? 'Simpan & Publikasikan'
                    : 'Terbitkan Berita'
                  : 'Kirim Naskah ke Redaksi'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INFORMASI BERITA & ISI NASKAH (8 COLS)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. INFORMASI BERITA */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>1. Informasi Utama Berita</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Wajib diisi</span>
            </div>

            {/* Judul / Headline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Judul Berita (Headline) <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-bold ${title.length > 70 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {title.length} / 80 karakter disarankan
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pemkot Batu Resmikan Pusat Edukasi Pertanian Apel Ramah Lingkungan di Bumiaji"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Slug URL Berita</span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Buat Ulang dari Judul</span>
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
                <span className="pl-3 pr-1 text-xs text-slate-400 font-mono select-none">
                  batutv.id/berita/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setIsSlugCustom(true);
                  }}
                  placeholder="pemkot-batu-resmikan-pusat-edukasi"
                  className="w-full px-2 py-2 text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Ringkasan / Excerpt / Lead */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Ringkasan / Paragraf Pembuka (Excerpt)
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {excerpt.length} karakter
                </span>
              </div>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tuliskan ringkasan singkat inti berita atau lead paragraph untuk memikat pembaca..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. ISI BERITA (RICH TEXT EDITOR) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>2. Naskah Lengkap Berita</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Gunakan toolbar editor di bawah untuk memasukkan struktur paragraf, subjudul, kutipan, dan foto.
                </p>
              </div>
            </div>

            <NewsRichEditor value={content} onChange={setContent} />
          </div>

          {/* 3. MEDIA & FOTO UTAMA */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>3. Media & Foto Utama (Featured Image)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Rasio 16:9</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Image Preview */}
              <div className="space-y-2">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={imageAlt || 'Featured preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">Belum ada foto</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Pratinjau tampilan gambar utama di portal BatuTV
                </p>
              </div>

              {/* Image Input Controls */}
              <div className="space-y-3.5">
                {/* Media Library Master Selector Button */}
                <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                      <span>Pustaka Aset Terintegrasi</span>
                    </span>
                    <span className="text-[10px] text-red-600 font-extrabold uppercase bg-red-100 px-2 py-0.5 rounded-full">
                      Direkomendasikan
                    </span>
                  </div>
                  <p className="text-[11px] text-red-800 leading-tight">
                    Pilih foto dari repositori media redaksi untuk memastikan metadata SEO & hak cipta lengkap tanpa duplikasi file.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Pilih dari Media Library</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>URL Foto Utama (Featured Image)</span>
                    <span className="text-[10px] text-slate-400 font-normal">atau ketik URL kustom</span>
                  </label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                    <span>Pilihan Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80');
                        setImageAlt('Perkebunan apel ramah lingkungan di Bumiaji Kota Batu');
                        setImageCaption('Kawasan perkebunan apel percontohan Bumiaji Kota Batu. (Foto: Dok. BatuTV)');
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    >
                      Kebun Apel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80');
                        setImageAlt('Instalasi PLTS Atap Rumah Tangga');
                        setImageCaption('Instalasi panel surya atap perumahan mandiri. (Foto: Dok. Antara)');
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    >
                      Panel Surya
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80');
                        setImageAlt('Pedagang Pasar Induk Among Tani Kota Batu');
                        setImageCaption('Aktivitas jual beli di Pasar Induk Among Tani. (Foto: BatuTV)');
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    >
                      Pasar Among Tani
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Keterangan Foto (Caption)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Contoh: Suasana perkebunan apel percontohan di Desa Bumiaji Kota Batu. (Foto: Dok. BatuTV)"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Teks Alternatif (Alt Text SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Deskripsi foto untuk pembaca layar & Google Image"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PUBLIKASI, REDAKSI & PENGATURAN SEO (4 COLS)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* S1. PUBLIKASI & STATUS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Status & Jadwal Publikasi</span>
            </h3>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Status Artikel</label>
              {canPublish ? (
                <select
                  disabled={isReadOnly}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="draft">Draft (Disimpan Sementara)</option>
                  <option value="scheduled">Terjadwal (Akan Tayang Otomatis)</option>
                  <option value="published">Terbit (Live di Portal)</option>
                  <option value="trash">Sampah (Nonaktif)</option>
                </select>
              ) : (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Draft Redaksi (Review Workflow)</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-tight">
                    Sebagai {userRole.toUpperCase()}, naskah Anda akan disimpan sebagai <strong>Draft</strong> untuk direview dan diterbitkan oleh Editor/Redaktur Pelaksana.
                  </p>
                </div>
              )}
            </div>

            {/* Date Picker (Only if can publish) */}
            {canPublish && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tanggal Terbit</span>
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Waktu Terbit (WIB)</span>
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </>
            )}

            {/* Action Box inside sidebar */}
            {!isReadOnly && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={canPublish ? handlePublish : handleSaveAsDraft}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {canPublish
                      ? status === 'scheduled'
                        ? 'Simpan Jadwal'
                        : status === 'published'
                        ? 'Perbarui Publikasi'
                        : 'Terbitkan Sekarang'
                      : 'Kirim Naskah ke Redaksi'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Simpan sebagai Draft</span>
                </button>
              </div>
            )}
          </div>

          {/* S2. PENGATURAN HEADLINE (BERANDA) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Headline (Beranda)</span>
              </h3>
              {isHeadline && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-extrabold rounded-full animate-pulse">
                  AKTIF #{headlinePosition}
                </span>
              )}
            </div>

            {isHeadlineAllowed ? (
              <>
                {/* Headline Toggle Switch */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    disabled={isReadOnly}
                    type="checkbox"
                    id="toggle-is-headline"
                    checked={isHeadline}
                    onChange={(e) => setIsHeadline(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label htmlFor="toggle-is-headline" className="cursor-pointer space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">
                      Jadikan Headline Beranda
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Tampilkan artikel ini di blok Headline pada halaman depan portal BatuTV.
                    </span>
                  </label>
                </div>

                {/* Position and Expiry Controls when isHeadline is active */}
                {isHeadline && (
                  <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in">
                    {/* Position Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Posisi Tayang Grid Headline</span>
                        <span className="text-[10px] font-normal text-slate-400">Pilih 1 dari 5 slot</span>
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={headlinePosition}
                        onChange={(e) => setHeadlinePosition(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer disabled:bg-slate-100"
                      >
                        <option value={1}>Posisi 1 — Headline Utama (Slot Kiri)</option>
                        <option value={2}>Posisi 2 — Sub-Headline #1 (Kanan Atas 1)</option>
                        <option value={3}>Posisi 3 — Sub-Headline #2 (Kanan Atas 2)</option>
                        <option value={4}>Posisi 4 — Sub-Headline #3 (Kanan Bawah 1)</option>
                        <option value={5}>Posisi 5 — Sub-Headline #4 (Kanan Bawah 2)</option>
                      </select>
                    </div>

                    {/* Expiry Date (Optional) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tayang Sampai Tanggal (Opsional)</span>
                      </label>
                      <input
                        disabled={isReadOnly}
                        type="date"
                        value={headlineUntil}
                        onChange={(e) => setHeadlineUntil(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-slate-100"
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        Kosongkan jika ingin terus tayang sampai digantikan redaktur.
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-snug flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Catatan Redaksi:</strong> Berita headline hanya akan tampil aktif di Hero Beranda jika status naskah adalah <strong>Terbit (Published)</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Penetapan status <strong>Headline Hero</strong> dibatasi khusus untuk <strong>Admin</strong> dan <strong>Redaksi Pelaksana</strong>.
                </p>
              </div>
            )}
          </div>

          {/* S3. KATEGORI & REDAKSI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-600" />
              <span>Rubrik & Tim Redaksi</span>
            </h3>

            {/* Rubrik / Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kategori Berita</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Penulis (Author) - Master Data Penulis */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Penulis (Master Redaksi)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Master Data</span>
              </label>
              <select
                value={authorId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setAuthorId(selectedId);
                  const found = availableAuthors.find((a) => a.id === selectedId);
                  if (found) {
                    setAuthor(found.name);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
              >
                {availableAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Editor (Redaktur) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Editor Penanggung Jawab</span>
              </label>
              <input
                type="text"
                list="editor-list"
                value={editor}
                onChange={(e) => setEditor(e.target.value)}
                placeholder="Pilih atau ketik nama editor"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <datalist id="editor-list">
                {DEFAULT_EDITORS.map((ed) => (
                  <option key={ed} value={ed} />
                ))}
              </datalist>
            </div>

            {/* Tagar / Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tagar Topik (Pisahkan Koma)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Kota Batu, Pertanian, Apel, Bumiaji"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* S3. PENGATURAN SEO & METADATA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600" />
              <span>Optimasi Mesin Pencari (SEO)</span>
            </h3>

            {/* SEO Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">SEO Title</label>
                <span className={`text-[10px] font-bold ${seoTitle.length >= 50 && seoTitle.length <= 60 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {seoTitle.length} / 60 char
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Judul optimal di halaman hasil pencarian Google"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Meta Description</label>
                <span className={`text-[10px] font-bold ${metaDescription.length >= 120 && metaDescription.length <= 160 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {metaDescription.length} / 160 char
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Deskripsi ringkas yang muncul di bawah judul Google Search..."
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Canonical URL</label>
              <input
                type="text"
                readOnly
                value={`https://batutv.id/berita/${slug || 'artikel-baru'}`}
                className="w-full px-3 py-2 text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-xl select-all cursor-text"
              />
            </div>

            {/* Google SERP Simulator Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Simulasi Cuplikan Google Search
              </span>
              <div className="text-xs text-[#202124]">
                <div className="text-[11px] text-[#4d5156] truncate">
                  https://batutv.id › berita › {slug || 'artikel-baru'}
                </div>
                <div className="text-sm font-semibold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                  {seoTitle || title || 'Judul Artikel BatuTV'}
                </div>
                <div className="text-[11px] text-[#4d5156] line-clamp-2">
                  {metaDescription || excerpt || 'Deskripsi ringkas artikel berita di portal media digital BatuTV...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Layout Preview Modal */}
      <NewsPreviewModal
        article={currentPreviewArticle}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onPublishNow={(art) => {
          onSave({ ...art, status: 'published' });
        }}
      />

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        currentSelectedUrl={featuredImage}
        onSelectMedia={(media: AdminMedia) => {
          setFeaturedImage(media.url);
          if (media.altText) {
            setImageAlt(media.altText);
          }
          if (media.caption) {
            setImageCaption(media.caption);
          }
        }}
      />
    </div>
  );
};
