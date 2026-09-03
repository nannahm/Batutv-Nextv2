import React from 'react';
import {
  X,
  AlertTriangle,
  Trash2,
  EyeOff,
  Layers,
  FileText,
  Video,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { AdminTag } from '../../../types/admin';
import { calculateTagUsage } from '../../../data/tagAdminStore';

interface TagDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: AdminTag | null;
  onConfirmDelete: (id: string) => void;
  onDeactivateTag?: (id: string) => void;
}

export const TagDeleteModal: React.FC<TagDeleteModalProps> = ({
  isOpen,
  onClose,
  tag,
  onConfirmDelete,
  onDeactivateTag,
}) => {
  if (!isOpen || !tag) return null;

  // Compute live usages
  const { totalCount, newsCount, videoCount, usedInItems } = calculateTagUsage(tag);
  const isUsed = totalCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isUsed ? 'bg-amber-50/80 border-amber-200' : 'bg-red-50/80 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                isUsed
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}
            >
              {isUsed ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isUsed ? 'Proteksi Hapus Tag Terpasang' : 'Hapus Tag Permanen'}
              </h2>
              <p className="text-xs text-slate-500">
                Tag: <span className="font-semibold text-slate-800">#{tag.name}</span> ({tag.slug})
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Condition A: Tag is Used -> Direct Delete is BLOCKED */}
          {isUsed ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tag digunakan oleh {totalCount} konten.</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed pl-6">
                  Tag ini tidak dapat dihapus secara permanen karena masih terhubung dengan artikel berita atau liputan video publik. Menghapus tag ini secara langsung akan merusak indeks kata kunci dan navigasi konten terkait.
                </p>

                {/* Breakdown counts */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white/90 border border-amber-200 rounded-lg py-1.5 px-2">
                    <span className="text-[10px] text-slate-500 font-sans block">Berita</span>
                    <span className="font-bold text-slate-900 text-sm">{newsCount}</span>
                  </div>
                  <div className="bg-white/90 border border-amber-200 rounded-lg py-1.5 px-2">
                    <span className="text-[10px] text-slate-500 font-sans block">Video</span>
                    <span className="font-bold text-slate-900 text-sm">{videoCount}</span>
                  </div>
                  <div className="bg-amber-100 border border-amber-300 rounded-lg py-1.5 px-2">
                    <span className="text-[10px] text-amber-900 font-sans font-bold block">Total</span>
                    <span className="font-bold text-amber-950 text-sm">{totalCount}</span>
                  </div>
                </div>
              </div>

              {/* Connected Content Preview List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Daftar Konten Terhubung ({usedInItems.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Maks. 5 ditampilkan
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {usedInItems.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.type === 'news' ? (
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <Video className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        )}
                        <span className="text-slate-800 font-medium truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 uppercase bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {item.type === 'news' ? 'Berita' : 'Video'}
                      </span>
                    </div>
                  ))}
                  {usedInItems.length > 5 && (
                    <p className="text-[11px] text-slate-400 text-center italic pt-1">
                      ...dan {usedInItems.length - 5} konten lainnya
                    </p>
                  )}
                </div>
              </div>

              {/* Recommended Action Advice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900">Solusi yang Disarankan:</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Gunakan opsi <strong>Nonaktifkan Tag</strong> agar tag tidak lagi muncul pada pilihan editor konten baru, namun tetap mempertahankan relasi arsip yang sudah terbit.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Condition B: Tag is NOT Used -> Safe to Delete */
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus tag <strong className="text-slate-900 font-bold">#{tag.name}</strong> secara permanen?
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Aman Dihapus (Penggunaan: 0 Konten)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                  Tag ini belum terpasang pada naskah berita atau video manapun. Tindakan penghapusan tidak dapat dibatalkan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>

          {isUsed ? (
            /* Deactivate button for used tags */
            <button
              type="button"
              onClick={() => {
                if (onDeactivateTag) {
                  onDeactivateTag(tag.id);
                }
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <EyeOff className="w-4 h-4 text-slate-700" />
              <span>Nonaktifkan Tag</span>
            </button>
          ) : (
            /* Permanent delete button for unused tags */
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(tag.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Permanen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
