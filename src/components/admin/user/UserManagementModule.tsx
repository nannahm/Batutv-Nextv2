import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { CMSUser, UserFormInput } from '../../../types/user';
import { AdminUser } from '../../../types/admin';
import {
  getStoredUsers,
  addUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserSuspend,
  toggleForcePasswordChange,
  revokeAllUserSessions,
  getUserStats,
  USER_UPDATED_EVENT,
} from '../../../data/userAdminStore';
import { UserListView } from './UserListView';
import { UserFormModal } from './UserFormModal';
import { UserDetailModal } from './UserDetailModal';
import { UserResetPasswordModal } from './UserResetPasswordModal';
import { UserDeleteModal } from './UserDeleteModal';
import { RolePermissionMatrixModal } from './RolePermissionMatrixModal';
import { LoginMonitoringModal } from './LoginMonitoringModal';

interface UserManagementModuleProps {
  currentUser?: AdminUser | null;
  onNavigateToSettings?: () => void;
  onNavigateToAuthors?: () => void;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  currentUser,
  onNavigateToSettings,
  onNavigateToAuthors,
}) => {
  // Main State
  const [users, setUsers] = useState<CMSUser[]>(() => getStoredUsers());
  const [stats, setStats] = useState(() => getUserStats());

  // Modal State Management
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<CMSUser | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<CMSUser | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<CMSUser | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CMSUser | null>(null);

  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [userToMonitor, setUserToMonitor] = useState<CMSUser | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
    },
    []
  );

  // Reload handler
  const reloadUsers = useCallback(() => {
    const fresh = getStoredUsers();
    setUsers(fresh);
    setStats(getUserStats());
  }, []);

  // Listen for background updates
  useEffect(() => {
    const handleUpdate = () => {
      reloadUsers();
    };
    window.addEventListener(USER_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(USER_UPDATED_EVENT, handleUpdate);
  }, [reloadUsers]);

  // Handler: Open Create Form
  const handleOpenAdd = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handler: Open Edit Form
  const handleOpenEdit = (user: CMSUser) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  // Handler: Open Detail View
  const handleOpenDetail = (user: CMSUser) => {
    setUserToView(user);
    setIsDetailModalOpen(true);
  };

  // Handler: Open Reset Password
  const handleOpenResetPassword = (user: CMSUser) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };

  // Handler: Open Delete Confirmation
  const handleOpenDelete = (user: CMSUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Handler: Open Login Monitoring
  const handleOpenMonitoring = (user: CMSUser) => {
    setUserToMonitor(user);
    setIsMonitoringModalOpen(true);
  };

  // Handler: Save Add / Edit
  const handleSaveUser = (data: UserFormInput) => {
    if (userToEdit) {
      const res = updateUser(userToEdit.id, data, currentUser || undefined);
      if (res.success) {
        showToast(`Akun pengguna @${data.username} berhasil diperbarui.`, 'success');
        setIsFormModalOpen(false);
        setUserToEdit(null);
        reloadUsers();
      } else {
        showToast(res.error || 'Gagal memperbarui pengguna.', 'error');
      }
    } else {
      const res = addUser(data, currentUser || undefined);
      if (res.success) {
        showToast(`Akun pengguna baru @${data.username} berhasil didaftarkan.`, 'success');
        setIsFormModalOpen(false);
        reloadUsers();
      } else {
        showToast(res.error || 'Gagal menambahkan pengguna baru.', 'error');
      }
    }
  };

  // Handler: Confirm Password Reset
  const handleConfirmResetPassword = (userId: string, newPass: string, forceChange: boolean) => {
    const res = resetUserPassword(userId, newPass, forceChange, currentUser || undefined);
    if (res.success) {
      showToast('Kata sandi pengguna berhasil diatur ulang.', 'success');
      setIsResetModalOpen(false);
      setUserToReset(null);
      reloadUsers();
    } else {
      showToast(res.error || 'Gagal mereset kata sandi.', 'error');
    }
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = (userId: string) => {
    const res = deleteUser(userId, currentUser || undefined);
    if (res.success) {
      showToast('Akun pengguna berhasil dihapus dari sistem.', 'success');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      reloadUsers();
    } else {
      showToast(res.error || 'Gagal menghapus pengguna.', 'error');
    }
  };

  // Handler: Toggle Suspend
  const handleToggleSuspend = (userId: string) => {
    const res = toggleUserSuspend(userId, currentUser || undefined);
    if (res.success) {
      const isSuspended = res.newStatus === 'ditangguhkan';
      showToast(
        isSuspended
          ? 'Akun berhasil ditangguhkan (seluruh sesi dicabut).'
          : 'Akun telah diaktifkan kembali.',
        isSuspended ? 'error' : 'success'
      );
      reloadUsers();
    } else {
      showToast(res.error || 'Gagal mengubah status penangguhan.', 'error');
    }
  };

  // Handler: Toggle Force Password Change
  const handleToggleForcePassword = (userId: string) => {
    const res = toggleForcePasswordChange(userId, currentUser || undefined);
    if (res.success) {
      showToast(
        res.forceChange
          ? 'Pengguna wajib mengganti password pada saat login berikutnya.'
          : 'Kewajiban ganti password telah dinonaktifkan.',
        'info'
      );
      reloadUsers();
    } else {
      showToast(res.error || 'Gagal mengubah status kewajiban kata sandi.', 'error');
    }
  };

  // Handler: Revoke All Sessions
  const handleRevokeSessions = (userId: string) => {
    const res = revokeAllUserSessions(userId, currentUser || undefined);
    if (res.success) {
      showToast('Seluruh sesi aktif untuk pengguna ini telah dicabut secara paksa.', 'success');
      reloadUsers();
      if (userToMonitor && userToMonitor.id === userId) {
        setUserToMonitor(getStoredUsers().find((u) => u.id === userId) || null);
      }
    } else {
      showToast(res.error || 'Gagal mencabut sesi pengguna.', 'error');
    }
  };

  return (
    <div id="batutv-user-management-module" className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-scaleUp">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold text-white border ${
              toast.type === 'success'
                ? 'bg-slate-900 border-slate-800'
                : toast.type === 'error'
                ? 'bg-red-600 border-red-500'
                : 'bg-blue-600 border-blue-500'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-white" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>PENGATURAN</span>
            <span>/</span>
            <span className="text-red-600 font-bold">PENGGUNA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Pengguna CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pusat pengelolaan akun internal, hak otorisasi login, dan peran redaksional portal BatuTV.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsMatrixModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Matriks Hak Akses</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Top Summary Stat Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Akun CMS</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {stats.admins} Admin • {stats.redaksi} Redaksi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Active Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pengguna Aktif</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              {stats.editors} Editor • {stats.reporters} Reporter
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Suspended Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Akun Ditangguhkan</span>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.suspended}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {stats.inactive} akun nonaktif
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Linked to Authors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Relasi Penulis</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.linkedToAuthor}</p>
            <span className="text-[11px] text-blue-700 mt-0.5 block">
              Sinkron 1:1 ke Master Penulis
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Context Notice on Author Management vs User Management */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-800">Independensi Data:</span> Modul <strong>Pengguna</strong> khusus mengelola akun login internal &amp; otorisasi CMS. Profil publik seperti foto avatar, bio, SEO title, dan statistik karya dikelola secara mandiri di{' '}
            <strong className="text-slate-800">Master Data → Penulis</strong>.
          </div>
        </div>

        {onNavigateToAuthors && (
          <button
            type="button"
            onClick={onNavigateToAuthors}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline whitespace-nowrap self-end sm:self-auto"
          >
            Buka Master Data Penulis →
          </button>
        )}
      </div>

      {/* Main Table List */}
      <UserListView
        users={users}
        onViewDetail={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onResetPassword={handleOpenResetPassword}
        onOpenMonitoring={handleOpenMonitoring}
        onToggleSuspend={handleToggleSuspend}
        onToggleForcePassword={handleToggleForcePassword}
        onRevokeSessions={handleRevokeSessions}
      />

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        userToEdit={userToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={userToView}
        onClose={() => {
          setIsDetailModalOpen(false);
          setUserToView(null);
        }}
        onEdit={(u) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(u);
        }}
        onResetPassword={(u) => {
          setIsDetailModalOpen(false);
          handleOpenResetPassword(u);
        }}
        onOpenMonitoring={(u) => {
          setIsDetailModalOpen(false);
          handleOpenMonitoring(u);
        }}
      />

      <UserResetPasswordModal
        isOpen={isResetModalOpen}
        user={userToReset}
        onClose={() => {
          setIsResetModalOpen(false);
          setUserToReset(null);
        }}
        onConfirmReset={handleConfirmResetPassword}
      />

      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        user={userToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        isSelf={
          Boolean(
            currentUser &&
              userToDelete &&
              (currentUser as any).email &&
              userToDelete.email.toLowerCase() === (currentUser as any).email.toLowerCase()
          )
        }
        isLastAdmin={Boolean(userToDelete?.role === 'admin' && stats.admins <= 1)}
      />

      <RolePermissionMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
      />

      <LoginMonitoringModal
        isOpen={isMonitoringModalOpen}
        user={userToMonitor}
        onClose={() => {
          setIsMonitoringModalOpen(false);
          setUserToMonitor(null);
        }}
        onRevokeSessions={handleRevokeSessions}
      />
    </div>
  );
};
