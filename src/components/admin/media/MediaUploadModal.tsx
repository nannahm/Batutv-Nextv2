import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  FolderOpen,
  Layers,
  Zap,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AdminMedia, AdminMediaSizes } from '../../../types/admin';
import { createMedia, sanitizeFilename, formatBytes } from '../../../data/mediaAdminStore';
import {
  validateImageFile,
  optimizeUploadedImage,
  generateUrlVariations,
  MAX_UPLOAD_SIZE_BYTES,
  OptimizedImagePackage,
} from '../../../utils/imageOptimizer';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaUploaded: (newMedia: AdminMedia) => void;
}

// Preset Quick Demo Photos for convenient tester experience with pre-optimized WebP links
const PRESET_DEMO_IMAGES = [
  {
    title: 'Apel Organik Bumiaji',
    filename: 'kebun-apel-organik-bumiaji.webp',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1920&auto=format&fit=crop&fm=webp&q=85',
    altText: 'Perkebunan apel organik segar di kawasan Bumiaji Kota Batu',
    caption: 'Suasana panen apel manalagi organik di perkebunan Bumiaji. (Foto: Dok. Redaksi BatuTV)',
    description: 'Foto liputan program agrowisata apel mandiri Kota Batu.',
    width: 1920,
    height: 1080,
    fileSize: 420000,
  },
  {
    title: 'Coban Rondo Air Terjun',
    filename: 'wisata-air-terjun-coban-rondo-pujon.webp',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&auto=format&fit=crop&fm=webp&q=85',
    altText: 'Debit air terjun Coban Rondo yang jernih di tengah rimbunnya hutan pinus',
    caption: 'Pesona air terjun Coban Rondo menjadi salah satu destinasi alam unggulan Malang Raya. (Foto: BatuTV / Bagus)',
    description: 'Arsip foto wisata alam dan konservasi hutan lereng Gunung Panderman.',
    width: 1920,
    height: 1280,
    fileSize: 550000,
  },
  {
    title: 'Gedung Balai Kota Batu',
    filename: 'balai-kota-among-tani-panoramik.webp',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1920&auto=format&fit=crop&fm=webp&q=85',
    altText: 'Lansekap kompleks perkantoran terpadu Balai Kota Among Tani Kota Batu',
    caption: 'Gedung Balai Kota Among Tani dari ketinggian di waktu pagi. (Foto: Dok. Humas Pemkot)',
    description: 'Master foto gedung pemerintahan Kota Batu untuk artikel birokrasi dan kebijakan daerah.',
    width: 1920,
    height: 1280,
    fileSize: 680000,
  },
  {
    title: 'Kebun Teh Wonosari',
    filename: 'hamparan-kebun-teh-lereng-arjuno.webp',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=1920&auto=format&fit=crop&fm=webp&q=85',
    altText: 'Hamparan perkebunan teh hijau di kaki Gunung Arjuno',
    caption: 'Sejuknya udara pagi di kawasan agrowisata kebun teh lereng pegunungan. (Foto: BatuTV / Hendra)',
    description: 'Dokumentasi potensi agrowisata perkebunan Malang Raya.',
    width: 1600,
    height: 1067,
    fileSize: 360000,
  },
];

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onMediaUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [imageUrl, setImageUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setImageCaption] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fileSize, setFileSize] = useState(450000);
  const [mimeType, setMimeType] = useState('image/webp');
  const [extension, setExtension] = useState('webp');
  const [generatedSizes, setGeneratedSizes] = useState<AdminMediaSizes | null>(null);
  const [optimizedPackage, setOptimizedPackage] = useState<OptimizedImagePackage | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form
  const resetForm = () => {
    setImageUrl('');
    setFilename('');
    setOriginalName('');
    setAltText('');
    setImageCaption('');
    setDescription('');
    setWidth(1920);
    setHeight(1080);
    setFileSize(450000);
    setMimeType('image/webp');
    setExtension('webp');
    setGeneratedSizes(null);
    setOptimizedPackage(null);
    setErrorMsg('');
    setIsProcessing(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle preset quick pick
  const handleSelectPreset = (preset: (typeof PRESET_DEMO_IMAGES)[0]) => {
    const vars = generateUrlVariations(preset.url, preset.width, preset.height);
    setImageUrl(preset.url);
    setFilename(preset.filename);
    setOriginalName(preset.filename);
    setAltText(preset.altText);
    setImageCaption(preset.caption);
    setDescription(preset.description);
    setWidth(preset.width);
    setHeight(preset.height);
    setFileSize(preset.fileSize);
    setExtension('webp');
    setMimeType('image/webp');
    setGeneratedSizes(vars);
    setOptimizedPackage(null);
    setErrorMsg('');
  };

  // Handle manual file selection with strict validation & auto optimization
  const handleFile = async (file: File) => {
    if (!file) return;

    setErrorMsg('');

    // Rule 1, 2, 3: Validate Max 2MB and Allowed Formats (JPG, JPEG, PNG, WebP)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Berkas tidak memenuhi syarat.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);

    try {
      // Rule 4, 5, 6: Automatic optimization pipeline
      const optimized = await optimizeUploadedImage(file);
      setOptimizedPackage(optimized);

      setImageUrl(optimized.sizes.original);
      setFilename(optimized.filename);
      setOriginalName(optimized.originalName);
      setWidth(optimized.width);
      setHeight(optimized.height);
      setFileSize(optimized.fileSize);
      setMimeType(optimized.mimeType);
      setExtension(optimized.extension);
      setGeneratedSizes(optimized.sizes);

      // Auto generate preliminary Alt Text & Caption from clean filename
      const autoTitle = optimized.filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      if (!altText) setAltText(`Dokumentasi ${autoTitle} - Liputan BatuTV`);
      if (!caption) {
        setImageCaption(
          `${autoTitle}. (Foto: Dok. Redaksi BatuTV / ${new Date().toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })})`
        );
      }
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      setErrorMsg(err.message || 'Gagal memproses dan mengoptimasi gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setErrorMsg('Silakan pilih gambar atau unggah berkas');
      return;
    }

    if (!filename.trim()) {
      setErrorMsg('Nama berkas (filename) wajib diisi');
      return;
    }

    if (!altText.trim()) {
      setErrorMsg('Alt Text (Teks Alternatif) wajib diisi untuk standar SEO & Core Web Vitals');
      return;
    }

    const cleanFilename = sanitizeFilename(filename.trim());

    // Ensure variations exist
    const finalSizes: AdminMediaSizes = generatedSizes || generateUrlVariations(imageUrl, width, height);

    const result = createMedia({
      filename: cleanFilename,
      originalName: originalName || cleanFilename,
      mimeType: mimeType || 'image/webp',
      extension: extension || 'webp',
      mediaType: 'image',
      width: width,
      height: height,
      fileSize: fileSize,
      altText: altText.trim(),
      caption: caption.trim(),
      description: description.trim(),
      url: imageUrl,
      sizes: finalSizes,
    });

    if (result.success && result.media) {
      onMediaUploaded(result.media);
      onClose();
    } else {
      setErrorMsg(result.message || 'Gagal menyimpan media');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Unggah & Optimasi Media Otomatis</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  WebP Auto-Converter
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Otomatis resize max 1920px, kompresi 85%, dan generate 4 variasi ukuran (Thumbnail, Medium, Large, Original)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Rules Banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5 leading-snug">
              <p className="font-bold">Standar Unggah & Optimasi Gambar BatuTV:</p>
              <p className="text-amber-800">
                Maksimal ukuran <strong>2 MB</strong> • Format: <strong>JPG, JPEG, PNG, WebP</strong> • Otomatis dikonversi ke WebP kualitas tinggi 85% dengan aspect ratio terjaga.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Dropzone / Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              1. Berkas Foto yang Diunggah
            </label>

            {imageUrl ? (
              /* Image Preview Box with Optimization Specs */
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 group flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={altText || 'Pratinjau upload'}
                    className="max-h-[300px] w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Ganti Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setGeneratedSizes(null);
                        setOptimizedPackage(null);
                      }}
                      className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-md text-[11px] text-white font-mono flex items-center gap-2">
                    <span>{width}×{height} px</span>
                    <span>•</span>
                    <span>{formatBytes(fileSize)}</span>
                    <span>•</span>
                    <span className="uppercase text-emerald-400 font-extrabold">{extension} (85% Q)</span>
                  </div>
                </div>

                {/* 4 Auto-Generated Variations Breakdown */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-red-600" />
                      <span>Variasi Gambar yang Dihasilkan Sistem:</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Siap Digunakan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700">Thumbnail</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {optimizedPackage?.variantsMeta?.thumbnail
                          ? formatBytes(optimizedPackage.variantsMeta.thumbnail.sizeBytes)
                          : 'Max 320px'} (≤60 KB)
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Daftar & Feed Card</div>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700">Medium</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {optimizedPackage?.variantsMeta?.medium
                          ? formatBytes(optimizedPackage.variantsMeta.medium.sizeBytes)
                          : 'Max 640px'} (≤120 KB)
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Homepage & Arsip</div>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700">Large</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {optimizedPackage?.variantsMeta?.large
                          ? formatBytes(optimizedPackage.variantsMeta.large.sizeBytes)
                          : 'Max 1280px'} (≤200 KB)
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">SO3 Hero & Artikel</div>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700">Original</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {optimizedPackage?.variantsMeta?.original
                          ? formatBytes(optimizedPackage.variantsMeta.original.sizeBytes)
                          : 'Max 1920px'} (Master)
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Master Asset Pustaka</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone */
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
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-red-500 bg-red-50/50'
                    : 'border-slate-300 hover:border-red-400 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  {isProcessing ? 'Sedang Mengoptimasi Gambar...' : 'Tarik berkas foto ke sini, atau klik untuk memilih'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format: <strong>JPG, JPEG, PNG, WebP</strong> (Maksimal <strong>2 MB</strong>)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Quick Presets for Demo Testers */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span className="font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Sampel Foto Liputan Kota Batu (Klik untuk Memilih):
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_DEMO_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 group-hover:text-red-600 truncate leading-tight">
                        {preset.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Metadata Editor Section */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              2. Informasi & Metadata Media (SEO Friendly)
            </label>

            {/* Nama File */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Nama Berkas (Filename SEO) *</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Format WebP otomatis
                </span>
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="kebun-apel-organik-bumiaji.webp"
                className="w-full px-3.5 py-2 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Alt Text (WAJIB) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Teks Alternatif (Alt Text) *</span>
                <span className="text-[10px] text-red-600 font-extrabold uppercase">
                  Wajib untuk SEO & Aksesibilitas
                </span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Deskripsikan objek foto secara gamblang untuk mesin pencari..."
                className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Caption / Keterangan Foto */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Keterangan Foto (Caption Artikel)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Tampil di bawah foto artikel berita publik
                </span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Contoh: Suasana panen apel di Bumiaji Kota Batu. (Foto: BatuTV / Muhamad Yandi)"
                className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Deskripsi Internal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Catatan & Deskripsi Internal</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Hanya untuk Media Library internal
                </span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dokumentasi liputan khusus..."
                className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan ke Media Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

