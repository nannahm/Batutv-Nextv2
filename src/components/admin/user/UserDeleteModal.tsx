import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, UserCheck } from 'lucide-react';
import { CMSUser } from '../../../types/user';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';

interface UserDeleteModalProps {
  user: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => void;
  isSelf?: boolean;
  isLastAdmin?: boolean;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
  isSelf = false,
  isLastAdmin = false,
}) => {
  if (!isOpen || !user) return null;

  const roleInfo = ROLE_PERMISSIONS_MATRIX[user.role];
  const isBlocked = isSelf || isLastAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Akun Pengguna CMS
              </h3>
              <p className="text-xs text-red-600 font-medium">
                Konfirmasi penghapusan akses internal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {isSelf ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Tindakan Ditolak Keamanan</span>
              </div>
              <p>
                Anda sedang login menggunakan akun <strong>@{user.username}</strong>. Sistem melarang administrator menghapus akun sendiri demi mencegah terkuncinya akses kontrol.
              </p>
            </div>
          ) : isLastAdmin ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Administrator Terakhir</span>
              </div>
              <p>
                Akun <strong>@{user.username}</strong> adalah satu-satunya Administrator aktif di portal. Anda harus menetapkan Administrator baru terlebih dahulu sebelum menghapus akun ini.
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun pengguna berikut secara permanen dari sistem login BatuTV?
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-mono font-medium text-slate-800">@{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Role:</span>
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${roleInfo?.badgeColor}`}>
                    {roleInfo?.name || user.role}
                  </span>
                </div>
              </div>

              {user.authorName && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11.5px] leading-relaxed">
                    <span className="font-bold">Independensi Data Penulis:</span> Akun ini terhubung ke Penulis <strong>{user.authorName}</strong>. Menghapus akun pengguna login ini <em>TIDAK AKAN</em> menghapus profil Penulis publik di Master Data Penulis.
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Catatan: Tindakan ini akan dicatat ke dalam Log Aktivitas Sistem BatuTV.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isBlocked ? 'Tutup' : 'Batal'}
          </button>

          {!isBlocked && (
            <button
              type="button"
              onClick={() => onConfirmDelete(user.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Pengguna</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
