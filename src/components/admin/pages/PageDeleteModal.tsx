import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, EyeOff } from 'lucide-react';
import { AdminPage } from '../../../types/admin';

interface PageDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: AdminPage | null;
  onConfirmDelete: (pageId: string) => void;
  onUnpublishInstead: (pageId: string) => void;
}

const CRITICAL_PAGES_SLUGS = [
  'tentang-kami',
  'kontak-kami',
  'pedoman-media-siber',
  'kebijakan-privasi',
  'disclaimer',
  'panduan-kebijakan',
  'info-iklan',
  'redaksi',
  'syarat-ketentuan',
];

export const PageDeleteModal: React.FC<PageDeleteModalProps> = ({
  isOpen,
  onClose,
  page,
  onConfirmDelete,
  onUnpublishInstead,
}) => {
  if (!isOpen || !page) return null;

  const isCriticalPage = CRITICAL_PAGES_SLUGS.includes(page.slug.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            {isCriticalPage ? (
              <ShieldAlert className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Hapus Halaman Informasi?
          </h3>
          <p className="text-xs text-slate-600 mb-4">
            Anda akan menghapus halaman <strong className="text-slate-900">"{page.title}"</strong> (<span className="font-mono text-red-600">/{page.slug}</span>).
          </p>

          {isCriticalPage && (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-left text-xs text-amber-900 space-y-1 mb-4">
              <p className="font-bold flex items-center gap-1 text-amber-950">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Peringatan Halaman Inti Peta Situs:</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Halaman ini terhubung dengan navigasi utama footer portal. Jika dihapus, pembaca yang membuka tautan tersebut akan menemui halaman 404. Anda disarankan untuk <strong>Menyembunyikan (Draft)</strong> saja.
              </p>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Tindakan penghapusan permanen tidak dapat dibatalkan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          {isCriticalPage && page.status === 'published' && (
            <button
              type="button"
              onClick={() => {
                onUnpublishInstead(page.id);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Sembunyikan Saja (Draft)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onConfirmDelete(page.id);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
