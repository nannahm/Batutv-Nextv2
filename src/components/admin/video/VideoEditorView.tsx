import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  Calendar,
  Clock,
  Youtube,
  Search,
  Sparkles,
  Link2,
  Tag,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  RefreshCw,
  Play,
  Tv,
  Film,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';
import { AdminVideo, VideoStatus, AdminMedia, AdminUser } from '../../../types/admin';
import { getStoredCategories } from '../../../data/categoryAdminStore';
import { getActiveAuthors } from '../../../data/authorAdminStore';
import { getMediaById } from '../../../data/mediaAdminStore';
import { MediaPickerModal } from '../media/MediaPickerModal';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  generateVideoSlug,
} from '../../../utils/youtube';
import { VideoPreviewModal } from './VideoPreviewModal';
import { NewsRichEditor } from '../news/NewsRichEditor';
import { canRolePublish } from '../../../utils/rbac';

interface VideoEditorViewProps {
  initialVideo?: AdminVideo | null;
  currentUser?: AdminUser | null;
  onSave: (video: AdminVideo) => void;
  onCancel: () => void;
  onPreviewPublic?: (slug: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Wisata & Kuliner',
  'Pemerintahan',
  'Budaya',
  'Ekonomi',
  'Lingkungan',
  'Olahraga',
  'Edukasi',
  'Kesehatan',
  'Hukum & Kriminal',
];

const DEFAULT_REPORTERS = [
  'Tim Liputan Khusus BatuTV',
  'Budi Santoso',
  'Dewi Lestari',
  'Muhamad Yandi',
  'Siti Rahmawati',
  'Tim Olahraga BatuTV',
  'Redaktur Pelaksana',
];

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  initialVideo,
  currentUser,
  onSave,
  onCancel,
  onPreviewPublic,
}) => {
  const userRole = currentUser?.role;
  const canPublish = canRolePublish(userRole);

  // YouTube Fields State
  const [youtubeUrl, setYoutubeUrl] = useState(
    initialVideo?.youtubeUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );
  const [youtubeVideoId, setYoutubeVideoId] = useState(
    initialVideo?.youtubeVideoId || 'dQw4w9WgXcQ'
  );
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  // Form Metadata State
  const [title, setTitle] = useState(initialVideo?.title || '');
  const [slug, setSlug] = useState(initialVideo?.slug || '');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [category, setCategory] = useState(
    initialVideo?.category || 'Wisata & Kuliner'
  );
  // Category & Author dynamic options
  const availableCategories = React.useMemo(() => {
    const stored = getStoredCategories();
    const filtered = stored.filter(
      (c) => c.status === 'active' && c.contentTypes.includes('video')
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
    return getActiveAuthors();
  }, []);

  const [authorId, setAuthorId] = useState<string>(() => {
    if (initialVideo?.authorId) return initialVideo.authorId;
    if (initialVideo?.author) {
      const match = availableAuthors.find(
        (a) => a.name.toLowerCase() === initialVideo.author?.toLowerCase()
      );
      if (match) return match.id;
    }
    return availableAuthors[0]?.id || 'aut-1';
  });

  const [author, setAuthor] = useState(() => {
    if (initialVideo?.author) return initialVideo.author;
    const match = availableAuthors.find((a) => a.id === authorId);
    return match?.name || 'Ahmad Fauzi';
  });

  const [duration, setDuration] = useState(initialVideo?.duration || '04:30');
  const [excerpt, setExcerpt] = useState(initialVideo?.excerpt || '');
  const [description, setDescription] = useState(
    initialVideo?.description || ''
  );

  // Thumbnail State
  const [thumbnailSource, setThumbnailSource] = useState<'youtube' | 'custom'>(
    initialVideo?.thumbnailSource || 'youtube'
  );
  const [customThumbnail, setCustomThumbnail] = useState(
    initialVideo?.customThumbnail || ''
  );
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string | undefined>(
    initialVideo?.thumbnailMediaId
  );
  const [selectedMediaInfo, setSelectedMediaInfo] = useState<AdminMedia | null>(() => {
    if (initialVideo?.thumbnailMediaId) {
      return getMediaById(initialVideo.thumbnailMediaId) || null;
    }
    return null;
  });
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Status & Date Settings
  const [status, setStatus] = useState<VideoStatus>(
    initialVideo?.status || 'draft'
  );

  const parseInitialDate = () => {
    if (!initialVideo?.publishedAt) {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      };
    }
    try {
      const d = new Date(initialVideo.publishedAt);
      if (isNaN(d.getTime())) {
        const now = new Date();
        return {
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 5),
        };
      }
      return {
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5),
      };
    } catch {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      };
    }
  };

  const initialDateTime = parseInitialDate();
  const [publishDate, setPublishDate] = useState(initialDateTime.date);
  const [publishTime, setPublishTime] = useState(initialDateTime.time);

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialVideo?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(
    initialVideo?.metaDescription || ''
  );
  const [tagsInput, setTagsInput] = useState(
    initialVideo?.tags?.join(', ') || 'Kota Batu, Video Berita'
  );

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Detect and validate YouTube Video ID automatically when URL changes
  useEffect(() => {
    if (!youtubeUrl.trim()) {
      setUrlError('URL YouTube tidak boleh kosong.');
      return;
    }
    const detectedId = extractYouTubeVideoId(youtubeUrl);
    if (detectedId) {
      setYoutubeVideoId(detectedId);
      setUrlError(null);
    } else {
      setUrlError(
        'Format URL YouTube tidak valid. Gunakan format seperti: https://www.youtube.com/watch?v=VIDEO_ID atau https://youtu.be/VIDEO_ID'
      );
    }
  }, [youtubeUrl]);

  // Auto-generate slug from title if user hasn't customized it
  useEffect(() => {
    if (!isSlugCustom && title) {
      setSlug(generateVideoSlug(title));
    }
  }, [title, isSlugCustom]);

  // Auto-generate SEO defaults if empty
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(`${title} - Video BatuTV`);
    }
  }, [title, seoTitle]);

  useEffect(() => {
    if (!metaDescription && excerpt) {
      setMetaDescription(excerpt);
    }
  }, [excerpt, metaDescription]);

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Judul video wajib diisi.';
    }

    if (!slug.trim()) {
      errs.slug = 'Slug URL video wajib diisi.';
    }

    if (!youtubeUrl.trim()) {
      errs.youtubeUrl = 'YouTube Video URL wajib dimasukkan.';
    } else if (urlError || !youtubeVideoId) {
      errs.youtubeUrl = 'YouTube Video URL tidak valid.';
    }

    if (!excerpt.trim()) {
      errs.excerpt = 'Ringkasan singkat video wajib diisi.';
    }

    if (!description.trim()) {
      errs.description = 'Deskripsi lengkap video wajib diisi.';
    }

    if (thumbnailSource === 'custom' && !customThumbnail.trim()) {
      errs.customThumbnail = 'Pilih gambar dari Media Library untuk thumbnail kustom.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Media Selection
  const handleSelectMedia = (media: AdminMedia) => {
    setSelectedMediaInfo(media);
    setThumbnailMediaId(media.id);
    setCustomThumbnail(media.url);
    if (errors.customThumbnail) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.customThumbnail;
        return copy;
      });
    }
  };

  // Submit Handler
  const handleSave = (targetStatus?: VideoStatus) => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalStatus = targetStatus || status;
    const publishedIso = `${publishDate}T${publishTime}:00`;
    const cleanTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const videoData: AdminVideo = {
      id: initialVideo?.id || `vid-${Date.now()}`,
      title: title.trim(),
      slug: generateVideoSlug(slug || title),
      excerpt: excerpt.trim(),
      description: description.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeVideoId: youtubeVideoId || 'dQw4w9WgXcQ',
      thumbnailSource,
      customThumbnail: thumbnailSource === 'custom' ? customThumbnail.trim() : undefined,
      thumbnailMediaId: thumbnailSource === 'custom' ? thumbnailMediaId : undefined,
      customThumbnailAlt: thumbnailSource === 'custom' ? selectedMediaInfo?.altText : undefined,
      customThumbnailCaption: thumbnailSource === 'custom' ? selectedMediaInfo?.caption : undefined,
      duration: duration.trim() || '03:30',
      category,
      categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      author,
      authorId,
      status: finalStatus,
      publishedAt: publishedIso,
      scheduledAt: finalStatus === 'scheduled' ? publishedIso : null,
      createdAt: initialVideo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seoTitle: seoTitle.trim() || `${title} - BatuTV Video`,
      metaDescription: metaDescription.trim() || excerpt.trim(),
      canonicalUrl: `https://batutv.id/video/${generateVideoSlug(slug || title)}`,
      views: initialVideo?.views || 0,
      tags: cleanTags,
    };

    onSave(videoData);
  };

  // Preview Object
  const currentPreviewObject: AdminVideo = {
    id: initialVideo?.id || 'preview-id',
    title: title || 'Judul Video Belum Diisi',
    slug: slug || 'video-slug',
    excerpt: excerpt || 'Ringkasan singkat video...',
    description: description || 'Deskripsi lengkap video...',
    youtubeUrl: youtubeUrl,
    youtubeVideoId: youtubeVideoId,
    thumbnailSource,
    customThumbnail: thumbnailSource === 'custom' ? customThumbnail : undefined,
    thumbnailMediaId: thumbnailSource === 'custom' ? thumbnailMediaId : undefined,
    duration: duration || '04:00',
    category,
    author,
    status,
    publishedAt: `${publishDate}T${publishTime}:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seoTitle: seoTitle || title,
    metaDescription: metaDescription || excerpt,
    canonicalUrl: `https://batutv.id/video/${slug}`,
    views: initialVideo?.views || 0,
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
  };

  // Preview Thumbnail URL calculation
  const previewThumbnail = useMemo(() => {
    if (thumbnailSource === 'custom') {
      if (customThumbnail) return customThumbnail;
      if (thumbnailMediaId) {
        const foundMedia = getMediaById(thumbnailMediaId);
        if (foundMedia?.url) return foundMedia.url;
      }
      return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80';
    }
    return getYouTubeThumbnailUrl(youtubeVideoId);
  }, [thumbnailSource, customThumbnail, thumbnailMediaId, youtubeVideoId]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Actions */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Kembali ke Daftar Video"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {initialVideo ? 'Edit Video YouTube' : 'Tambah Video Baru'}
              </h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md uppercase">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Sistem akan memverifikasi YouTube Video ID dan menyinkronkan data metadata penayangan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Draft</span>
          </button>

          {canPublish ? (
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'published' ? 'Perbarui & Terbitkan' : 'Terbitkan Sekarang'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Video ke Redaksi</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Form Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Video Information (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: YouTube Video Source & Live Preview */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Sumber Video YouTube
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                YouTube Embed Ready
              </span>
            </div>

            {/* YouTube URL Input Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                YouTube Video URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=AbCdEf12345 atau https://youtu.be/AbCdEf12345"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                    urlError || errors.youtubeUrl
                      ? 'border-red-400 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
              </div>
              {urlError && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{urlError}</span>
                </p>
              )}
              {errors.youtubeUrl && !urlError && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">
                  {errors.youtubeUrl}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Mendukung URL standar YouTube watch, shortlink (youtu.be), YouTube Shorts, maupun ID 11 karakter.
              </p>
            </div>

            {/* Live YouTube Preview Card */}
            {youtubeVideoId && !urlError && (
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Video Terdeteksi:</span>
                    <strong className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {youtubeVideoId}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTestPlaying(!isTestPlaying)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isTestPlaying ? 'Tutup Pemutar' : 'Uji Putar YouTube'}</span>
                  </button>
                </div>

                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                  {isTestPlaying ? (
                    <iframe
                      src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                      title="YouTube Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="relative w-full h-full group">
                      <img
                        src={previewThumbnail}
                        alt="Preview Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsTestPlaying(true)}
                          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[11px] font-bold rounded">
                        {duration}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Video Titles & Slugs */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Judul Video <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Liputan Khusus: Pesona Agrowisata Petik Apel Mandiri di Bumiaji"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-red-400 focus:ring-red-500/20 bg-red-50/30'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] font-semibold text-red-600">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Slug URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Slug URL Publik <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustom(false);
                    setSlug(generateVideoSlug(title));
                  }}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Reset Otomatis
                </button>
              </div>

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500">
                <span className="px-3 text-xs font-medium text-slate-400 bg-slate-100 border-r border-slate-200 py-2.5 select-none">
                  https://batutv.id/video/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugCustom(true);
                    setSlug(generateVideoSlug(e.target.value));
                  }}
                  placeholder="judul-video-lengkap"
                  className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-mono text-slate-800 focus:outline-none"
                />
              </div>
              {errors.slug && (
                <p className="text-[11px] font-semibold text-red-600">
                  {errors.slug}
                </p>
              )}
            </div>

            {/* Ringkasan / Excerpt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Ringkasan Singkat / Subheadline <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Rangkuman 1-2 kalimat untuk preview video dan feed..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.excerpt
                    ? 'border-red-400 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              {errors.excerpt && (
                <p className="text-[11px] font-semibold text-red-600">
                  {errors.excerpt}
                </p>
              )}
            </div>

            {/* Deskripsi Lengkap Video (Rich Text Editor) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Deskripsi Lengkap Video <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Toolbar format, subjudul, kutipan & foto terintegrasi
                </span>
              </div>
              <NewsRichEditor
                value={description}
                onChange={setDescription}
                placeholder="Tuliskan deskripsi lengkap video, konteks liputan, narasumber, dan informasi tayangan di sini... Anda dapat menggunakan tombol toolbar di atas untuk memasukkan paragraf, subjudul (H2/H3), teks tebal, kutipan narasumber, daftar poin, dan gambar pendukung."
              />
              {errors.description && (
                <p className="text-[11px] font-semibold text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Tag & Kata Kunci (Dipisahkan koma)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Kota Batu, Agrowisata, Apel, Bumiaji"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Settings (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Panel 1: Pengaturan Publikasi */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Status & Jadwal Publikasi</span>
            </h3>

            {/* Status Radio Choices */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Status Tayangan
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    status === 'draft'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Draft
                </button>

                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={() => setStatus('scheduled')}
                  title={!canPublish ? 'Hanya Redaksi & Editor yang berwenang menjadwalkan penayangan' : undefined}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    status === 'scheduled'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  } ${!canPublish ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  Terjadwal
                </button>

                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={() => setStatus('published')}
                  title={!canPublish ? 'Hanya Redaksi & Editor yang berwenang menerbitkan tayangan langsung' : undefined}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    status === 'published'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  } ${!canPublish ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  Terbit
                </button>
              </div>
              {!canPublish && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1">
                  * Role Anda hanya dapat menyimpan sebagai Draft. Penerbitan dilakukan oleh Redaksi/Editor.
                </p>
              )}
            </div>

            {/* Tanggal & Waktu Publikasi */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Waktu (WIB)
                </label>
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              {status === 'published' && (
                <span className="text-emerald-700 font-medium">
                  ✓ Video akan langsung tampil di beranda publik <strong>S06 — Video Terbaru</strong>.
                </span>
              )}
              {status === 'scheduled' && (
                <span className="text-blue-700 font-medium">
                  ⏰ Video dijadwalkan tayang pada waktu di atas.
                </span>
              )}
              {status === 'draft' && (
                <span className="text-amber-700 font-medium">
                  📝 Video tersimpan sebagai draft internal dan belum tayang di portal publik.
                </span>
              )}
            </div>
          </div>

          {/* Panel 2: Informasi Redaksi (Kategori, Author, Durasi) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Informasi Redaksi</span>
            </h3>

            {/* Kategori */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Kategori / Rubrik
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter / Author - Master Data Penulis */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Reporter / Jurnalis Video
                </label>
                <span className="text-[10px] text-slate-400 font-normal">Master Data</span>
              </div>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
              >
                {availableAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Durasi Video */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Durasi Video (MM:SS)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="04:30"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Panel 3: Pengaturan Thumbnail */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Sumber Thumbnail</span>
            </h3>

            {/* Radio Options */}
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="thumbnailSource"
                  checked={thumbnailSource === 'youtube'}
                  onChange={() => {
                    setThumbnailSource('youtube');
                    if (errors.customThumbnail) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.customThumbnail;
                        return copy;
                      });
                    }
                  }}
                  className="text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Otomatis YouTube</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="thumbnailSource"
                  checked={thumbnailSource === 'custom'}
                  onChange={() => setThumbnailSource('custom')}
                  className="text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Kustom dari Media</span>
              </label>
            </div>

            {/* Custom from Media Controls */}
            {thumbnailSource === 'custom' && (
              <div className="space-y-3 pt-1 animate-in fade-in">
                {/* Media Selector Button Card */}
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-950 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                      <span>Pustaka Media Redaksi</span>
                    </span>
                    {selectedMediaInfo && (
                      <span className="text-[9px] text-emerald-700 font-extrabold uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                        Media Terpilih
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-red-800 leading-tight">
                    Pilih poster/thumbnail kustom dari Media Library BATUTV untuk menjaga kualitas & resolusi gambar.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{customThumbnail ? 'Ganti dari Media Library' : 'Pilih dari Media Library'}</span>
                  </button>
                </div>

                {/* Selected Media Details */}
                {selectedMediaInfo && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Nama Berkas:</span>
                      <span className="font-mono font-bold text-slate-800 truncate max-w-[180px]">
                        {selectedMediaInfo.filename}
                      </span>
                    </div>
                    {selectedMediaInfo.altText && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Alt Text:</span>
                        <span className="text-slate-700 truncate max-w-[180px]">
                          {selectedMediaInfo.altText}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Error */}
                {errors.customThumbnail && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.customThumbnail}</span>
                  </p>
                )}
              </div>
            )}

            {/* Thumbnail Preview Card */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img
                src={previewThumbnail}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-xs flex items-center gap-1">
                <span>{thumbnailSource === 'youtube' ? 'YouTube HQ' : 'Media Library'}</span>
                {thumbnailMediaId && (
                  <span className="text-slate-300 font-mono text-[9px]">({thumbnailMediaId})</span>
                )}
              </div>

              {thumbnailSource === 'custom' && (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer backdrop-blur-2xs"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Ganti Gambar Media</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel 4: Optimasi SEO & Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Optimasi Mesin Pencari (SEO)</span>
            </h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Judul untuk Google Search..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Deskripsi singkat yang muncul di hasil pencarian..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Pratinjau Hasil Google
              </span>
              <p className="text-xs text-blue-700 font-bold hover:underline truncate">
                {seoTitle || title || 'Judul Video BatuTV'}
              </p>
              <p className="text-[11px] text-emerald-700 font-mono truncate">
                https://batutv.id/video/{slug || 'judul-video'}
              </p>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                {metaDescription || excerpt || 'Ringkasan video redaksi BatuTV...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={currentPreviewObject}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onOpenPublic={
          onPreviewPublic ? () => onPreviewPublic(slug || 'preview') : undefined
        }
      />

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleSelectMedia}
        currentSelectedUrl={customThumbnail}
        title="Pilih Thumbnail Video dari Media Library"
      />
    </div>
  );
};
