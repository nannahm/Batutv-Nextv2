import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, FileText, Video, Ban } from 'lucide-react';
import { AdminCategory } from '../../../types/admin';
import { canDeleteCategory } from '../../../data/categoryAdminStore';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  category: AdminCategory | null;
  onClose: () => void;
  onConfirmDelete: (categoryId: string) => void;
  onDeactivate: (categoryId: string) => void;
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  category,
  onClose,
  onConfirmDelete,
  onDeactivate,
}) => {
  if (!isOpen || !category) return null;

  const check = canDeleteCategory(category.id);
  const totalCount = check.totalCount;
  const newsCount = check.newsCount;
  const videoCount = check.videoCount;
  const childrenCount = check.childrenCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                check.allowed
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {check.allowed ? <Trash2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-white">
              {check.allowed ? 'Konfirmasi Hapus Kategori' : 'Kategori Tidak Dapat Dihapus'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-300">
              Kategori yang ditargetkan:{' '}
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {category.name}
              </span>{' '}
              <code className="text-xs text-purple-300">({category.slug})</code>
            </p>
          </div>

          {!check.allowed ? (
            /* BLOCKED DELETE REASON */
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Integritas Data Terkunci</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {childrenCount > 0
                    ? `Kategori ini memiliki ${childrenCount} subkategori aktif. Hapus atau pindahkan subkategori terlebih dahulu.`
                    : `Kategori ini sedang digunakan oleh total ${totalCount} konten redaksi. Menghapus kategori ini secara paksa akan merusak struktur relasi konten.`}
                </p>
              </div>

              {totalCount > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FileText className="w-3.5 h-3.5 text-purple-400" /> Berita:
                    </span>
                    <span className="font-bold text-white">{newsCount} artikel</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Video className="w-3.5 h-3.5 text-purple-400" /> Video:
                    </span>
                    <span className="font-bold text-white">{videoCount} video</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400">
                Saran: Anda dapat memilih <strong>Nonaktifkan Kategori</strong> agar tidak lagi muncul sebagai opsi pada pembuatan konten baru, tanpa merusak riwayat konten lama.
              </p>
            </div>
          ) : (
            /* ALLOWED DELETE PERMANENT */
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Kategori ini memiliki <strong>0 konten</strong> dan tidak memiliki subkategori. Anda dapat menghapus kategori ini secara permanen dari sistem.
              </p>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                Tindakan ini tidak dapat dibatalkan setelah dieksekusi.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Batal
          </button>

          {!check.allowed ? (
            category.status === 'active' && (
              <button
                type="button"
                onClick={() => {
                  onDeactivate(category.id);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Nonaktifkan Kategori</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(category.id);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Permanen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
