import React from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  FileText,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminMedia } from '../../../types/admin';
import { formatBytes, formatDimensions } from '../../../data/mediaAdminStore';

interface MediaDeleteModalProps {
  isOpen: boolean;
  media: AdminMedia | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  onNavigateToContent?: (slug: string, type: string) => void;
}

export const MediaDeleteModal: React.FC<MediaDeleteModalProps> = ({
  isOpen,
  media,
  onClose,
  onConfirmDelete,
  onNavigateToContent,
}) => {
  if (!isOpen || !media) return null;

  const isUsed = (media.usageCount || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isUsed
              ? 'bg-amber-50/80 border-amber-200'
              : 'bg-red-50/80 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isUsed
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isUsed ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                className={`text-sm font-black tracking-tight ${
                  isUsed ? 'text-amber-900' : 'text-red-900'
                }`}
              >
                {isUsed
                  ? 'Proteksi Penghapusan Media'
                  : 'Hapus Media Permanen'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isUsed
                  ? 'Media sedang aktif digunakan oleh konten redaksi'
                  : 'Tindakan ini tidak dapat dibatalkan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Media Mini Preview Card */}
          <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative">
              {media.mediaType === 'image' ? (
                <img
                  src={media.sizes?.thumbnail || media.url}
                  alt={media.altText || media.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {media.filename}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {media.altText || 'Tanpa alt text'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                <span>{formatDimensions(media.width, media.height)}</span>
                <span>•</span>
                <span>{formatBytes(media.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* Condition: Media is Used -> Protected */}
          {isUsed ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Media sedang digunakan oleh {media.usageCount} konten.
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed pl-6">
                  Menghapus media ini akan menyebabkan <em>broken image</em>{' '}
                  pada portal publik. Silakan lepaskan atau ganti aset pada konten berikut sebelum menghapus:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-white/80 border border-amber-200 rounded-lg py-1 px-2">
                    <span className="text-[10px] text-slate-500 font-sans block">Berita</span>
                    <span className="font-bold text-slate-900">{media.usedIn?.filter(u => u.type === 'news').length || 0}</span>
                  </div>
                  <div className="bg-white/80 border border-amber-200 rounded-lg py-1 px-2">
                    <span className="text-[10px] text-slate-500 font-sans block">Video</span>
                    <span className="font-bold text-slate-900">{media.usedIn?.filter(u => u.type === 'video').length || 0}</span>
                  </div>
                  <div className="bg-amber-100 border border-amber-300 rounded-lg py-1 px-2">
                    <span className="text-[10px] text-amber-900 font-sans font-bold block">Total</span>
                    <span className="font-bold text-amber-900">{media.usageCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Usage List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {media.usedIn && media.usedIn.length > 0 ? (
                  media.usedIn.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded shrink-0">
                        {item.field || 'Featured'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Digunakan di {media.usageCount} artikel redaksi.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Condition: Media is Not Used -> Can be deleted */
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Apakah Anda yakin ingin menghapus file media{' '}
                <strong className="text-slate-900 font-bold font-mono">
                  {media.filename}
                </strong>{' '}
                secara permanen dari Media Library?
              </p>
              <p className="text-[11px] text-slate-400">
                File aset dan seluruh thumbnail yang tersimpan pada cache lokal
                akan dibersihkan secara permanen.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {isUsed ? 'Tutup & Kembali' : 'Batal'}
          </button>

          {!isUsed ? (
            <button
              type="button"
              onClick={() => onConfirmDelete(media.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Permanen</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
