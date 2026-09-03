import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Trash2,
  Save,
  FileText,
  Calendar,
  Layers,
  HardDrive,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { AdminMedia } from '../../../types/admin';
import {
  formatBytes,
  formatDimensions,
  getAspectRatioLabel,
  formatMediaDate,
  updateMedia,
} from '../../../data/mediaAdminStore';

interface MediaDetailModalProps {
  isOpen: boolean;
  media: AdminMedia | null;
  onClose: () => void;
  onMediaUpdated: (updated: AdminMedia) => void;
  onRequestDelete: (media: AdminMedia) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  isOpen,
  media,
  onClose,
  onMediaUpdated,
  onRequestDelete,
}) => {
  if (!isOpen || !media) return null;

  // Editable fields
  const [filename, setFilename] = useState(media.filename || '');
  const [altText, setAltText] = useState(media.altText || '');
  const [caption, setCaption] = useState(media.caption || '');
  const [description, setDescription] = useState(media.description || '');

  // UI state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when media prop changes
  useEffect(() => {
    if (media) {
      setFilename(media.filename || '');
      setAltText(media.altText || '');
      setCaption(media.caption || '');
      setDescription(media.description || '');
      setStatusMsg(null);
      setCopiedUrl(false);
    }
  }, [media]);

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const res = updateMedia(media.id, {
      filename: filename.trim(),
      altText: altText.trim(),
      caption: caption.trim(),
      description: description.trim(),
    });

    setIsSaving(false);

    if (res.success && res.media) {
      setStatusMsg({ type: 'success', text: 'Perubahan metadata berhasil disimpan!' });
      onMediaUpdated(res.media);
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Gagal menyimpan perubahan' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">
              {media.extension.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {media.filename}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Diunggah pada {formatMediaDate(media.createdAt)}</span>
                <span>•</span>
                <span className="font-mono text-slate-700">{formatBytes(media.fileSize)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedUrl
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
              }`}
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'URL Disalin!' : 'Salin URL'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split Left (Preview + Technical) & Right (Metadata Editor + Usages) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Big Preview & Tech Specs (5 cols) */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6 bg-slate-900/5">
            {/* Image Preview Box */}
            <div className="space-y-3">
              <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 relative group flex items-center justify-center min-h-[260px] max-h-[380px]">
                {media.mediaType === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.altText || media.filename}
                    className="max-h-[380px] w-full object-contain"
                  />
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <FileText className="w-16 h-16 text-slate-400" />
                    <span className="text-xs font-mono">{media.filename}</span>
                  </div>
                )}

                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[11px] font-semibold rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Asli</span>
                </a>
              </div>

              {/* Technical Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Dimensi
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {formatDimensions(media.width, media.height)}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Ukuran
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {formatBytes(media.fileSize)}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Rasio
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {getAspectRatioLabel(media.width, media.height, media.mediaType)}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Format / MIME
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 uppercase">
                    {media.extension}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Summary Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Status Penggunaan Media
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    (media.usageCount || 0) > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {(media.usageCount || 0) > 0
                    ? `Total: ${media.usageCount} Konten`
                    : 'Belum Digunakan'}
                </span>
              </div>

              {/* Breakdown by Content Type */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold block">Berita</span>
                  <span className="font-mono font-black text-slate-800 text-sm">
                    {media.usedIn?.filter((u) => u.type === 'news').length || 0}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold block">Video</span>
                  <span className="font-mono font-black text-slate-800 text-sm">
                    {media.usedIn?.filter((u) => u.type === 'video').length || 0}
                  </span>
                </div>
                <div className="p-2 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-[10px] text-red-600 font-semibold block">Total</span>
                  <span className="font-mono font-black text-red-700 text-sm">
                    {media.usageCount || 0}
                  </span>
                </div>
              </div>

              {media.usedIn && media.usedIn.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {media.usedIn.map((u, i) => (
                    <div
                      key={`${u.id}-${i}`}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {u.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-medium capitalize">
                        {u.type === 'news' ? 'Berita' : u.type === 'video' ? 'Video' : u.field || 'Konten'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Media ini belum disematkan pada artikel atau video manapun. Aman untuk dihapus jika tidak diperlukan.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Form (6 cols) */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-4">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Filename */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Nama Berkas (Filename)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Format SEO: huruf kecil & tanda hubung
                  </span>
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Teks Alternatif (Alt Text) *</span>
                  <span className="text-[10px] text-red-600 font-extrabold uppercase">
                    Wajib SEO & Core Web Vitals
                  </span>
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Deskripsikan objek foto..."
                  className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Digunakan oleh pembaca layar tunanetra dan mesin pencari Google Images.
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Keterangan Foto (Caption Artikel)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Tampil pada halaman berita publik
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Contoh: Suasana peresmian fasilitas baru di Kota Batu..."
                  className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Deskripsi Pustaka (Internal)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Catatan arsip redaksi
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan liputan atau hak cipta..."
                  className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons inside right column */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onRequestDelete(media)}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Media</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
