import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AdminMedia } from '../../../types/admin';
import { getStoredMedia, formatBytes, formatDimensions } from '../../../data/mediaAdminStore';
import { MediaUploadModal } from './MediaUploadModal';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: AdminMedia) => void;
  currentSelectedUrl?: string;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  currentSelectedUrl = '',
  title = 'Pilih Featured Image dari Media Library',
}) => {
  const [mediaList, setMediaList] = useState<AdminMedia[]>(() => getStoredMedia());
  const [selectedMedia, setSelectedMedia] = useState<AdminMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filter media
  const filteredList = useMemo(() => {
    return mediaList.filter((m) => {
      if (m.mediaType !== 'image') return false; // Picker specializes in images for featured images
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.filename.toLowerCase().includes(q) ||
        (m.altText && m.altText.toLowerCase().includes(q)) ||
        (m.caption && m.caption.toLowerCase().includes(q))
      );
    });
  }, [mediaList, searchQuery]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    if (selectedMedia) {
      onSelectMedia(selectedMedia);
      onClose();
    }
  };

  const handleMediaUploaded = (newMedia: AdminMedia) => {
    const updated = getStoredMedia();
    setMediaList(updated);
    setSelectedMedia(newMedia);
    setIsUploadOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pilih aset gambar dari pustaka atau unggah berkas baru
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

          {/* Sub Header / Action Bar */}
          <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari foto berdasarkan nama atau topik..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                <span>Unggah Foto Baru</span>
              </button>
            </div>
          </div>

          {/* Main Picker Content: Grid List on Left, Selected Info on Right */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Grid Thumbnails (8 cols) */}
            <div className="md:col-span-8 p-5 overflow-y-auto max-h-[55vh]">
              {filteredList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredList.map((media) => {
                    const isSelected = selectedMedia?.id === media.id;
                    const isCurrent =
                      currentSelectedUrl &&
                      media.url.includes(currentSelectedUrl.split('?')[0]);

                    return (
                      <div
                        key={media.id}
                        onClick={() => setSelectedMedia(media)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-red-600 ring-2 ring-red-500/30 shadow-md'
                            : isCurrent
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-slate-400 bg-slate-100'
                        }`}
                      >
                        <img
                          src={media.sizes?.thumbnail || media.url}
                          alt={media.altText || media.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {isCurrent && !isSelected && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-extrabold text-white">
                            Aktif
                          </div>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 text-left">
                          <p className="text-[10px] font-bold text-white truncate">
                            {media.filename}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                  <p className="text-xs">Tidak ada gambar yang cocok dengan pencarian</p>
                </div>
              )}
            </div>

            {/* Selected Preview Sidebar (4 cols) */}
            <div className="md:col-span-4 p-5 bg-slate-50 flex flex-col justify-between overflow-y-auto max-h-[55vh]">
              {selectedMedia ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Gambar Terpilih
                  </h4>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.altText || selectedMedia.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Nama Berkas
                      </span>
                      <p className="font-mono font-bold text-slate-800 break-all">
                        {selectedMedia.filename}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Alt Text (SEO)
                      </span>
                      <p className="text-slate-700 font-medium">
                        {selectedMedia.altText || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Keterangan Foto (Caption)
                      </span>
                      <p className="text-slate-600 text-[11px] leading-snug">
                        {selectedMedia.caption || '—'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                      <div>
                        <span className="block text-slate-400">Dimensi</span>
                        <span className="font-bold text-slate-700">
                          {formatDimensions(selectedMedia.width, selectedMedia.height)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Ukuran</span>
                        <span className="font-bold text-slate-700">
                          {formatBytes(selectedMedia.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-semibold">Pilih gambar dari daftar di sebelah kiri</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={!selectedMedia}
              onClick={handleConfirmSelection}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan Gambar Ini</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nested Upload Modal if triggered from inside picker */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onMediaUploaded={handleMediaUploaded}
      />
    </>
  );
};
