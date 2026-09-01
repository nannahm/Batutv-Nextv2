import React from 'react';
import {
  X,
  User,
  Shield,
  Mail,
  Calendar,
  Clock,
  Laptop,
  KeyRound,
  UserCheck,
  Edit,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { CMSUser } from '../../../types/user';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';

interface UserDetailModalProps {
  user: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: CMSUser) => void;
  onResetPassword: (user: CMSUser) => void;
  onOpenMonitoring: (user: CMSUser) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onResetPassword,
  onOpenMonitoring,
}) => {
  if (!isOpen || !user) return null;

  const roleInfo = ROLE_PERMISSIONS_MATRIX[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Profil Akun Pengguna CMS
              </h3>
              <p className="text-xs text-slate-500">
                Informasi detail akun internal dan hak otorisasi login
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

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* User Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-extrabold text-white shadow-inner">
                {user.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{user.fullName}</h4>
                <p className="text-xs text-slate-300 font-mono">@{user.username}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border ${roleInfo?.badgeColor} bg-slate-800/80 text-white`}
                  >
                    {roleInfo?.name || user.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      user.status === 'aktif'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : user.status === 'ditangguhkan'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'aktif'
                          ? 'bg-emerald-400'
                          : user.status === 'ditangguhkan'
                          ? 'bg-red-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    {user.status === 'aktif'
                      ? 'Aktif'
                      : user.status === 'ditangguhkan'
                      ? 'Ditangguhkan'
                      : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Akun</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetPassword(user);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Identifiers */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Data Identitas Akun</span>
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">ID Pengguna:</span>
                  <span className="font-mono text-slate-800 font-medium">{user.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Email Login:</span>
                  <span className="text-slate-800 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Tanggal Dibuat:</span>
                  <span className="text-slate-800">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pembaruan Terakhir:</span>
                  <span className="text-slate-800">
                    {new Date(user.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Relasi Penulis Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Relasi Penulis (1 : 1)</span>
              </h5>
              <div className="text-xs space-y-2">
                {user.authorId ? (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{user.authorName || 'Penulis Terhubung'}</span>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        ID: {user.authorId}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Seluruh berita &amp; liputan yang diunggah oleh akun ini akan terasosiasi otomatis dengan profil penulis publik ini.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11.5px]">
                    Akun ini belum ditautkan ke profil Master Data Penulis publik.
                  </div>
                )}
                <p className="text-[11px] text-slate-400 italic">
                  *Catatan: Bio, foto publik, SEO title, dan statistik artikel dikelola terpisah di Master Data Penulis.
                </p>
              </div>
            </div>
          </div>

          {/* Wewenang & Batasan Role */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-600" />
              <span>Cakupan Wewenang Role ({roleInfo?.name})</span>
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              {roleInfo?.description}
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700">Akses Modul Diizinkan:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11.5px]">
                  {roleInfo?.allowedAccess.slice(0, 4).map((acc, idx) => (
                    <li key={idx}>{acc}</li>
                  ))}
                  {(roleInfo?.allowedAccess.length || 0) > 4 && (
                    <li className="text-slate-400">Dan {(roleInfo?.allowedAccess.length || 0) - 4} modul lainnya...</li>
                  )}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700">Workflow Redaksi:</span>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  {roleInfo?.workflowNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Last Login & Security Monitoring Snippet */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800">Riwayat Login Terakhir:</span>
                <span className="text-slate-600">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Belum pernah login'}
                </span>
              </div>
              {user.lastLoginDetails && (
                <p className="text-slate-500 text-[11px] mt-1 pl-6">
                  {user.lastLoginDetails.device} • {user.lastLoginDetails.browser} ({user.lastLoginDetails.ipAddress})
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMonitoring(user);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs self-start sm:self-auto"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Detail Monitoring Sesi</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
