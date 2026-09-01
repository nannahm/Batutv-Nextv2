import React from 'react';
import { AlertTriangle, Trash2, ArrowUpRight, X } from 'lucide-react';
import { NavigationItem } from '../../../types/navigation';

interface DeleteParentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToDelete: NavigationItem | null;
  submenus: NavigationItem[];
  onConfirmCascade: (parentId: string) => void;
  onConfirmPromoteToRoot: (parentId: string) => void;
  onConfirmSingleDelete: (itemId: string) => void;
}

export const DeleteParentConfirmModal: React.FC<DeleteParentConfirmModalProps> = ({
  isOpen,
  onClose,
  itemToDelete,
  submenus,
  onConfirmCascade,
  onConfirmPromoteToRoot,
  onConfirmSingleDelete,
}) => {
  if (!isOpen || !itemToDelete) return null;

  const hasSubmenus = submenus.length > 0;

  return (
    <div
      id="delete-parent-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="delete-parent-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {hasSubmenus ? 'Konfirmasi Hapus Parent Menu' : 'Hapus Item Navigasi'}
              </h3>
              <p className="text-xs text-red-100">
                Tindakan ini akan mempengaruhi susunan navigasi SO2 Homepage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Apakah Anda yakin ingin menghapus menu{' '}
              <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                &quot;{itemToDelete.label}&quot;
              </span>
              ?
            </p>
          </div>

          {hasSubmenus ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 font-semibold leading-relaxed">
                  Menu ini memiliki <span className="font-bold">{submenus.length} submenu</span> di bawahnya:
                </div>
              </div>

              {/* List of submenus */}
              <ul className="pl-6 space-y-1 text-xs text-amber-800 list-disc font-medium">
                {submenus.map((sub) => (
                  <li key={sub.id}>
                    <span className="font-bold">{sub.label}</span>{' '}
                    <span className="text-[11px] text-amber-600 font-mono">({sub.url})</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-amber-200/80 text-xs text-amber-900 font-bold">
                Pilih opsi penghapusan yang diinginkan:
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Item ini tidak memiliki submenu turunan dan akan langsung dihapus dari daftar navigasi SO2.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition"
          >
            Batalkan
          </button>

          {hasSubmenus ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onConfirmPromoteToRoot(itemToDelete.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pindahkan Submenu ke Root</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirmCascade(itemToDelete.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Parent + Semua Submenu</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onConfirmSingleDelete(itemToDelete.id);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
