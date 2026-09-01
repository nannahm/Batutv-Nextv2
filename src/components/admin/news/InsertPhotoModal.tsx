import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  UploadCloud,
  Layers,
  Link2,
  Search,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  FileText,
  Info,
} from 'lucide-react';
import { AdminMedia } from '../../../types/admin';
import { getStoredMedia, createMedia, sanitizeFilename, formatBytes, formatDimensions } from '../../../data/mediaAdminStore';
import {
  validateImageFile,
  optimizeUploadedImage,
  MAX_UPLOAD_SIZE_BYTES,
  OptimizedImagePackage,
} from '../../../utils/imageOptimizer';

export interface InsertImagePayload {
  url: string;
  alt: string;
  caption: string;
  mediaId?: string;
}

interface InsertPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (payload: InsertImagePayload) => void;
}

type ActiveTab = 'upload' | 'media-library' | 'external-url';

export const InsertPhotoModal: React.FC<InsertPhotoModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  
  // Media library states
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<AdminMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload tab states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Uploaded media result
  const [uploadedPackage, setUploadedPackage] = useState<OptimizedImagePackage | null>(null);
  const [uploadedOriginalSize, setUploadedOriginalSize] = useState<number>(0);
  const [uploadedMediaRecord, setUploadedMediaRecord] = useState<AdminMedia | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');

  // Media Library custom Alt/Caption states
  const [libraryAltText, setLibraryAltText] = useState('');
  const [libraryCaption, setLibraryCaption] = useState('');

  // External URL states
  const [externalUrl, setExternalUrl] = useState('');
  const [externalAltText, setExternalAltText] = useState('');
  const [externalCaption, setExternalCaption] = useState('');

  // Reset & load data on open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredMedia().filter((m) => m.mediaType === 'image');
      setMediaList(stored);
      setErrorMsg('');
      setIsProcessing(false);
      
      // If we don't have an active selection, select first if available
      if (stored.length > 0 && !selectedMedia) {
        setSelectedMedia(stored[0]);
        setLibraryAltText(stored[0].altText || stored[0].filename);
        setLibraryCaption(stored[0].caption || '');
      }
    }
  }, [isOpen]);

  // Sync Library Alt/Caption when selected media changes
  const handleSelectLibraryMedia = (media: AdminMedia) => {
    setSelectedMedia(media);
    setLibraryAltText(media.altText || media.filename);
    setLibraryCaption(media.caption || '');
  };

  // Filtered media list
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase();
    return mediaList.filter(
      (m) =>
        m.filename.toLowerCase().includes(q) ||
        (m.altText && m.altText.toLowerCase().includes(q)) ||
        (m.caption && m.caption.toLowerCase().includes(q))
    );
  }, [mediaList, searchQuery]);

  if (!isOpen) return null;

  // Handle local file upload with strict validation & auto-optimization
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setErrorMsg('');

    // 1. Validation (Max 2 MB, MIME check)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Berkas tidak memenuhi syarat.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    setUploadedOriginalSize(file.size);

    try {
      // 2. Automatic Optimization pipeline (Resize max 1920px, WebP 85% high quality)
      const optimized = await optimizeUploadedImage(file);
      setUploadedPackage(optimized);

      // Auto generate SEO-friendly Alt & Caption
      const autoTitle = optimized.filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const defaultAlt = `Foto liputan ${autoTitle}`;
      const defaultCaption = `${autoTitle}. (Foto: Dok. Redaksi BatuTV)`;

      setUploadAltText(defaultAlt);
      setUploadCaption(defaultCaption);

      // 3. Save into Media Storage immediately so it exists in central repository
      const cleanFilename = sanitizeFilename(optimized.filename);
      const createResult = createMedia({
        filename: cleanFilename,
        originalName: optimized.originalName || cleanFilename,
        mimeType: optimized.mimeType || 'image/webp',
        extension: optimized.extension || 'webp',
        mediaType: 'image',
        width: optimized.width,
        height: optimized.height,
        fileSize: optimized.fileSize,
        altText: defaultAlt,
        caption: defaultCaption,
        description: 'Diunggah melalui Naskah Editor Berita',
        url: optimized.sizes.large || optimized.sizes.original,
        sizes: optimized.sizes,
      });

      if (createResult.success && createResult.media) {
        setUploadedMediaRecord(createResult.media);
        // Refresh local media list
        setMediaList(getStoredMedia().filter((m) => m.mediaType === 'image'));
      }
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      setErrorMsg(err.message || 'Foto gagal diproses. Silakan gunakan foto lain.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit from Upload Tab
  const handleConfirmUploadInsert = () => {
    if (!uploadedPackage) {
      setErrorMsg('Silakan pilih berkas foto terlebih dahulu.');
      return;
    }

    const targetUrl =
      uploadedPackage.sizes.large ||
      uploadedPackage.sizes.original ||
      uploadedPackage.sizes.medium;

    onInsert({
      url: targetUrl,
      alt: uploadAltText.trim() || uploadedPackage.filename,
      caption: uploadCaption.trim(),
      mediaId: uploadedMediaRecord?.id,
    });

    handleClose();
  };

  // Submit from Media Library Tab
  const handleConfirmLibraryInsert = () => {
    if (!selectedMedia) {
      setErrorMsg('Silakan pilih foto dari Media Library.');
      return;
    }

    const targetUrl =
      selectedMedia.sizes?.large ||
      selectedMedia.sizes?.original ||
      selectedMedia.url;

    onInsert({
      url: targetUrl,
      alt: libraryAltText.trim() || selectedMedia.altText || selectedMedia.filename,
      caption: libraryCaption.trim(),
      mediaId: selectedMedia.id,
    });

    handleClose();
  };

  // Submit from External URL Tab
  const handleConfirmExternalInsert = () => {
    if (!externalUrl.trim()) {
      setErrorMsg('Silakan masukkan URL foto.');
      return;
    }

    onInsert({
      url: externalUrl.trim(),
      alt: externalAltText.trim() || 'Ilustrasi Berita',
      caption: externalCaption.trim(),
    });

    handleClose();
  };

  const handleClose = () => {
    // Reset temporary states
    setUploadedPackage(null);
    setUploadedMediaRecord(null);
    setErrorMsg('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Sisipkan Foto ke Naskah Berita
              </h3>
              <p className="text-[11px] text-slate-500">
                Pusat integrasi Media Library BatuTV — Otomatis terkompresi & siap SEO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Tab 1: Upload Foto */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setErrorMsg('');
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-red-600 text-red-600 bg-red-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Upload Foto Baru</span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                Auto-WebP
              </span>
            </button>

            {/* Tab 2: Pilih dari Media */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('media-library');
                setErrorMsg('');
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'media-library'
                  ? 'border-red-600 text-red-600 bg-red-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Pilih dari Media ({mediaList.length})</span>
            </button>

            {/* Tab 3: URL Eksternal (Opsional / Sekunder) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('external-url');
                setErrorMsg('');
              }}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'external-url'
                  ? 'border-red-600 text-red-600 bg-red-50/40'
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Gunakan URL Eksternal</span>
            </button>
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium shrink-0 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========================================================================= */}
          {/* TAB 1: UPLOAD FOTO BARU                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {/* Rules banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-snug">
                  <span className="font-bold text-slate-900">Ketentuan Upload: </span>
                  Maksimal file original <strong>2 MB</strong> • Format <strong>JPG, JPEG, PNG, WebP</strong>.
                  Sistem otomatis mengompresi dan mengonversi ke format modern <strong>WebP</strong> (target ±100–200 KB) tanpa mengurangi ketajaman visual.
                </div>
              </div>

              {!uploadedPackage ? (
                /* Upload Dropzone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragOver
                      ? 'border-red-500 bg-red-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center mb-3">
                    {isProcessing ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-red-600" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {isProcessing ? 'Sedang Mengoptimasi Gambar...' : 'Tarik & Letakkan Foto ke Sini'}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    atau klik tombol di bawah untuk memilih file dari komputer Anda
                  </p>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Memproses...' : '+ Pilih Berkas Foto'}
                  </button>
                </div>
              ) : (
                /* Uploaded & Optimized Result Card */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                          <span>Foto Berhasil Dioptimasi & Tersimpan di Media</span>
                          <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold rounded-full">
                            WebP
                          </span>
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          Ukuran Asli: <strong>{formatBytes(uploadedOriginalSize)}</strong> → Teroptimasi:{' '}
                          <strong>{formatBytes(uploadedPackage.fileSize)}</strong> (
                          {Math.max(
                            0,
                            Math.round(
                              ((uploadedOriginalSize - uploadedPackage.fileSize) / uploadedOriginalSize) * 100
                            )
                          )}
                          % lebih hemat)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedPackage(null);
                        setUploadedMediaRecord(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ganti Foto Lain
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Thumbnail Preview */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group flex items-center justify-center">
                        <img
                          src={uploadedPackage.sizes.large || uploadedPackage.sizes.original}
                          alt={uploadAltText || 'Pratinjau'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-sm rounded text-[10px] text-white font-mono">
                          {uploadedPackage.width} × {uploadedPackage.height} px
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        Berkas: {uploadedPackage.filename}
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Teks Alternatif (Alt Text SEO) <span className="text-red-500">*</span></span>
                          <span className="text-[10px] text-slate-400 font-normal">Wajib untuk aksesibilitas & Google</span>
                        </label>
                        <input
                          type="text"
                          value={uploadAltText}
                          onChange={(e) => setUploadAltText(e.target.value)}
                          placeholder="Deskripsi foto untuk pembaca layar (misal: Walikota Batu meninjau kebun)"
                          className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Keterangan Foto (Caption)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Opsional (ditampilkan di bawah foto)</span>
                        </label>
                        <input
                          type="text"
                          value={uploadCaption}
                          onChange={(e) => setUploadCaption(e.target.value)}
                          placeholder="Contoh: Suasana panen apel di Bumiaji. (Foto: Dok. BatuTV)"
                          className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                          <span>Media ID: {uploadedMediaRecord?.id || 'Tersimpan'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Foto ini telah tersimpan di Media Storage dan otomatis dapat digunakan kembali di artikel lain tanpa perlu upload ulang.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PILIH DARI MEDIA LIBRARY                                          */}
          {/* ========================================================================= */}
          {activeTab === 'media-library' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari foto berdasarkan nama berkas, caption, atau topik liputan..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Grid & Selection Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                {/* Left: Thumbnail Grid */}
                <div className="md:col-span-7 p-4 overflow-y-auto max-h-[42vh] custom-scrollbar bg-white">
                  {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredMedia.map((media) => {
                        const isSelected = selectedMedia?.id === media.id;
                        return (
                          <div
                            key={media.id}
                            onClick={() => handleSelectLibraryMedia(media)}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-red-600 ring-2 ring-red-500/30 shadow-md'
                                : 'border-slate-200 hover:border-slate-400 bg-slate-100'
                            }`}
                          >
                            <img
                              src={media.sizes?.thumbnail || media.sizes?.medium || media.url}
                              alt={media.altText || media.filename}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4 text-[10px] text-white truncate font-medium">
                              {media.filename}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada foto yang cocok dengan pencarian "{searchQuery}".
                    </div>
                  )}
                </div>

                {/* Right: Selected Photo Preview & Adjustments */}
                <div className="md:col-span-5 p-4 space-y-3.5 bg-slate-50/80">
                  {selectedMedia ? (
                    <>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 relative flex items-center justify-center">
                        <img
                          src={selectedMedia.sizes?.large || selectedMedia.url}
                          alt={selectedMedia.altText || selectedMedia.filename}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-sm rounded text-[10px] text-white font-mono">
                          {formatDimensions(selectedMedia.width, selectedMedia.height)} • {formatBytes(selectedMedia.fileSize)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {selectedMedia.filename}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Reuse Media: ID {selectedMedia.id}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Teks Alternatif (Alt Text)
                        </label>
                        <input
                          type="text"
                          value={libraryAltText}
                          onChange={(e) => setLibraryAltText(e.target.value)}
                          placeholder="Alt text untuk gambar"
                          className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Keterangan Foto (Caption)
                        </label>
                        <input
                          type="text"
                          value={libraryCaption}
                          onChange={(e) => setLibraryCaption(e.target.value)}
                          placeholder="Caption foto (opsional)"
                          className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Pilih foto dari daftar di sebelah kiri untuk melihat rincian.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: URL EKSTERNAL (OPSI SEKUNDER)                                      */}
          {/* ========================================================================= */}
          {activeTab === 'external-url' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <span className="font-bold">Perhatian: </span>
                Penggunaan URL eksternal tidak melewati pipeline kompresi & optimasi WebP Media Library BatuTV. Disarankan menggunakan <strong>Upload Foto</strong> atau <strong>Pilih dari Media</strong>.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  URL Foto Eksternal (https://...) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Teks Alternatif (Alt Text)
                </label>
                <input
                  type="text"
                  value={externalAltText}
                  onChange={(e) => setExternalAltText(e.target.value)}
                  placeholder="Deskripsi foto untuk aksesibilitas"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Keterangan Foto (Caption)
                </label>
                <input
                  type="text"
                  value={externalCaption}
                  onChange={(e) => setExternalCaption(e.target.value)}
                  placeholder="Keterangan foto opsional"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            {activeTab === 'upload' && 'Mode: Upload Langsung & Optimasi'}
            {activeTab === 'media-library' && 'Mode: Reuse dari Media Library'}
            {activeTab === 'external-url' && 'Mode: URL Eksternal'}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            {activeTab === 'upload' && (
              <button
                type="button"
                disabled={!uploadedPackage || isProcessing}
                onClick={handleConfirmUploadInsert}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                Sisipkan Foto ke Naskah
              </button>
            )}

            {activeTab === 'media-library' && (
              <button
                type="button"
                disabled={!selectedMedia}
                onClick={handleConfirmLibraryInsert}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                Sisipkan Foto Terpilih
              </button>
            )}

            {activeTab === 'external-url' && (
              <button
                type="button"
                disabled={!externalUrl.trim()}
                onClick={handleConfirmExternalInsert}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                Sisipkan via URL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
