import React from 'react';
import {
  X,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Laptop,
  Clock,
  LogOut,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { CMSUser } from '../../../types/user';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';

interface LoginMonitoringModalProps {
  user: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onRevokeSessions: (userId: string) => void;
}

export const LoginMonitoringModal: React.FC<LoginMonitoringModalProps> = ({
  user,
  isOpen,
  onClose,
  onRevokeSessions,
}) => {
  if (!isOpen || !user) return null;

  const roleInfo = ROLE_PERMISSIONS_MATRIX[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monitoring Sesi &amp; Aktivitas Login
              </h3>
              <p className="text-xs text-slate-500">
                Audit perangkat, alamat IP, dan riwayat otentikasi @{user.username}
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* User Header Summary */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                {user.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{user.fullName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">@{user.username}</span>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10.5px] font-bold rounded border ${roleInfo?.badgeColor}`}
                  >
                    {roleInfo?.name || user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'aktif'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : user.status === 'ditangguhkan'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user.status === 'aktif'
                      ? 'bg-emerald-500'
                      : user.status === 'ditangguhkan'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                  }`}
                />
                {user.status === 'aktif'
                  ? 'Akun Aktif'
                  : user.status === 'ditangguhkan'
                  ? 'Ditangguhkan'
                  : 'Nonaktif'}
              </span>
            </div>
          </div>

          {/* Security Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>Sesi Login Aktif</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {user.sessionsCount && user.sessionsCount > 0
                  ? `${user.sessionsCount} Perangkat`
                  : 'Tidak ada'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Percobaan Gagal</span>
              </div>
              <p
                className={`text-lg font-bold ${
                  (user.failedLoginAttempts || 0) > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {user.failedLoginAttempts || 0} Kali
              </p>
            </div>
          </div>

          {/* Sesi Login Terakhir Detail */}
          <div className="border border-slate-200 rounded-xl p-4.5 bg-white space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Detail Otentikasi Terakhir</span>
              </h5>
              {user.lastLogin ? (
                <span className="text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Otentikasi Sah
                </span>
              ) : (
                <span className="text-[11.5px] text-slate-400">Belum pernah login</span>
              )}
            </div>

            {user.lastLoginDetails ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Waktu Login:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(user.lastLoginDetails.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Perangkat (Hardware):</span>
                  <span className="font-medium text-slate-800">{user.lastLoginDetails.device}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Aplikasi / Browser:</span>
                  <span className="font-medium text-slate-800">{user.lastLoginDetails.browser}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Alamat IP Klien:</span>
                  <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {user.lastLoginDetails.ipAddress}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                Pengguna baru ini belum melakukan login pertama sejak akun dibuat pada{' '}
                {new Date(user.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}.
              </p>
            )}
          </div>

          {/* Relasi Penulis Status */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800">Relasi Penulis Publik</p>
                <p className="text-slate-500 text-[11px]">
                  {user.authorName ? `Terhubung ke: ${user.authorName}` : 'Belum terhubung ke profil Penulis'}
                </p>
              </div>
            </div>
            {user.authorName && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-semibold rounded">
                1 : 1 Sinkron
              </span>
            )}
          </div>

          {/* Security Policy Flags */}
          {user.forcePasswordChange && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Paksa Ganti Password Aktif</p>
                <p className="text-amber-800 text-[11.5px] mt-0.5">
                  Pengguna ini akan langsung diarahkan ke form ganti kata sandi wajib pada saat login berikutnya.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onRevokeSessions(user.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Semua Sesi</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
