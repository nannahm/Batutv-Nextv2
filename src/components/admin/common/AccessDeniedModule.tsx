import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Lock, UserCheck, AlertTriangle, Home, LogOut } from 'lucide-react';
import { AdminUser } from '../../../types/admin';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';
import { normalizeUserRole } from '../../../utils/rbac';
import { logSystemActivity } from '../../../data/systemSettingsStore';

interface AccessDeniedModuleProps {
  currentPath: string;
  moduleName?: string;
  requiredRoleName?: string;
  reason?: string;
  user: AdminUser | null;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const AccessDeniedModule: React.FC<AccessDeniedModuleProps> = ({
  currentPath,
  moduleName = 'Modul Dilindungi',
  requiredRoleName = 'Administrator',
  reason = 'Anda tidak memiliki hak akses yang cukup untuk membuka halaman ini.',
  user,
  onNavigate,
  onLogout,
}) => {
  const roleKey = normalizeUserRole(user?.role);
  const roleInfo = ROLE_PERMISSIONS_MATRIX[roleKey];

  // Log unauthorized access attempt to security audit log
  useEffect(() => {
    logSystemActivity(
      user || { name: 'Tamu / Unauthorized', role: 'Anonymous' },
      'Percobaan Akses Ditolak (403)',
      `Akses tidak sah ke rute "${currentPath}" (${moduleName}) diblokir. Role pengguna: ${roleInfo?.name || user?.role || 'Tidak Diketahui'}`,
      'warning',
      'Keamanan'
    );
  }, [currentPath, moduleName, roleInfo?.name, user]);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider">
                Status 403 Forbidden
              </span>
              <span className="text-xs text-rose-100 font-medium">BatuTV RBAC Guard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Akses Ditolak / Dibatasi
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 mt-1">
              Halaman <strong>{moduleName}</strong> tidak dapat diakses dengan tingkat otorisasi Anda.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Detail Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Alasan Pembatasan Hak Akses:
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 font-medium block text-[10px]">Role Akun Anda Saat Ini:</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${roleKey === 'admin' ? 'bg-red-500' : roleKey === 'redaksi' ? 'bg-rose-500' : roleKey === 'editor' ? 'bg-amber-500' : roleKey === 'reporter' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  {roleInfo?.name || user?.role || 'Pengguna'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 font-medium block text-[10px]">Otoritas yang Dibutuhkan:</span>
                <span className="font-extrabold text-red-700 block mt-0.5">
                  {requiredRoleName}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Guidance Card */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">Catatan Workflow Redaksional BatuTV:</p>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                {roleInfo?.workflowNotes ||
                  'Setiap akun memiliki batasan fungsi operasional yang telah disesuaikan dengan struktur kerja redaksi BatuTV.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/batutv-control/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Ganti Akun (Logout)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
