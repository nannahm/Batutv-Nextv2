import React, { useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Layers,
  Award,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AdminAuthor, AuthorPosition, AuthorStatus } from '../../../types/admin';
import { UserFormInput } from '../../../types/user';
import {
  getAuthorsWithCounts,
  addAuthor,
  updateAuthor,
  deleteAuthor,
  getStoredAuthorCounts,
} from '../../../data/authorAdminStore';
import { addUser } from '../../../data/userAdminStore';
import { AuthorListView } from './AuthorListView';
import { AuthorFormModal } from './AuthorFormModal';
import { AuthorDetailModal } from './AuthorDetailModal';
import { AuthorDeleteModal } from './AuthorDeleteModal';
import { UserFormModal } from '../user/UserFormModal';

interface AuthorManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
  onNavigateToUserManagement?: () => void;
}

export const AuthorManagementModule: React.FC<AuthorManagementModuleProps> = ({
  onNavigateToPublic,
  onNavigateToUserManagement,
}) => {
  // State for all authors with live calculated usage counts
  const [authors, setAuthors] = useState<AdminAuthor[]>(() => getAuthorsWithCounts());

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [authorToEdit, setAuthorToEdit] = useState<AdminAuthor | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [authorToView, setAuthorToView] = useState<AdminAuthor | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<AdminAuthor | null>(null);

  // User CMS Account Creation Modal State
  const [isCreateCMSModalOpen, setIsCreateCMSModalOpen] = useState(false);
  const [preselectedAuthorForCMS, setPreselectedAuthorForCMS] = useState<AdminAuthor | null>(null);

  // Toast feedback state
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

  // Reload authors with accurate counts
  const reloadAuthors = useCallback(() => {
    setAuthors(getAuthorsWithCounts());
  }, []);

  // Handler: Open Add Form
  const handleOpenAddForm = () => {
    setAuthorToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handler: Open Edit Form
  const handleOpenEditForm = (author: AdminAuthor) => {
    setAuthorToEdit(author);
    setIsFormModalOpen(true);
  };

  // Handler: Open Detail
  const handleOpenDetail = (author: AdminAuthor) => {
    setAuthorToView(author);
    setIsDetailModalOpen(true);
  };

  // Handler: Open Delete
  const handleOpenDelete = (author: AdminAuthor) => {
    setAuthorToDelete(author);
    setIsDeleteModalOpen(true);
  };

  // Handler: Open Create CMS User Account
  const handleOpenCreateCMS = (author: AdminAuthor) => {
    setPreselectedAuthorForCMS(author);
    setIsCreateCMSModalOpen(true);
  };

  // Handler: Save Add / Edit Author
  const handleSaveAuthor = (data: {
    name: string;
    slug: string;
    photoMediaId?: string;
    photoUrl?: string;
    position: AuthorPosition;
    email: string;
    phone?: string;
    bio?: string;
    status: AuthorStatus;
    seoTitle?: string;
    metaDescription?: string;
  }) => {
    if (authorToEdit) {
      const res = updateAuthor(authorToEdit.id, data);
      if (res.success) {
        showToast(`Profil penulis "${data.name}" berhasil diperbarui.`, 'success');
        setIsFormModalOpen(false);
        setAuthorToEdit(null);
        reloadAuthors();
      } else {
        showToast(res.error || 'Gagal memperbarui data penulis.', 'error');
      }
    } else {
      const res = addAuthor(data);
      if (res.success) {
        showToast(`Penulis baru "${data.name}" berhasil didaftarkan.`, 'success');
        setIsFormModalOpen(false);
        reloadAuthors();
      } else {
        showToast(res.error || 'Gagal mendaftarkan penulis baru.', 'error');
      }
    }
  };

  // Handler: Save New CMS User Account
  const handleSaveCMSUser = (data: UserFormInput) => {
    const res = addUser(data);
    if (res.success) {
      showToast(
        `Akun CMS login @${data.username} berhasil dibuat dan terhubung ke Master Data Penulis!`,
        'success'
      );
      setIsCreateCMSModalOpen(false);
      setPreselectedAuthorForCMS(null);
      reloadAuthors();
    } else {
      showToast(res.error || 'Gagal membuat akun login CMS.', 'error');
    }
  };

  // Handler: Toggle single status
  const handleToggleStatus = (id: string, currentStatus: AuthorStatus) => {
    const newStatus: AuthorStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = updateAuthor(id, { status: newStatus });
    if (res.success) {
      showToast(
        `Status penulis diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`,
        'info'
      );
      reloadAuthors();
    } else {
      showToast(res.error || 'Gagal mengubah status penulis.', 'error');
    }
  };

  // Handler: Deactivate author
  const handleDeactivate = (id: string) => {
    const res = updateAuthor(id, { status: 'inactive' });
    if (res.success) {
      showToast('Penulis berhasil dinonaktifkan dari sistem.', 'info');
      reloadAuthors();
    } else {
      showToast(res.error || 'Gagal menonaktifkan penulis.', 'error');
    }
  };

  // Handler: Confirm Permanent Delete
  const handleConfirmDelete = (id: string) => {
    const res = deleteAuthor(id);
    if (res.success) {
      showToast('Data penulis berhasil dihapus secara permanen.', 'success');
      reloadAuthors();
    } else {
      showToast(res.error || 'Gagal menghapus penulis.', 'error');
    }
  };

  // Metrics summary
  const counts = getStoredAuthorCounts();

  return (
    <div className="space-y-6">
      {/* Toast Feedback Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-2 duration-200 border ${
            toast.type === 'success'
              ? 'bg-slate-900 border-emerald-500/50'
              : toast.type === 'error'
              ? 'bg-red-600 border-red-700'
              : 'bg-slate-900 border-blue-500/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0" />}
          {toast.type === 'info' && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. HEADER & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md">
              Master Data
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Koleksi Jurnalis &amp; Redaksi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Master Data Penulis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sumber data utama untuk profil publik, nama, foto, bio, dan relasi akun login CMS internal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reloadAuthors}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Penulis</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTIC METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Penulis */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Penulis
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {counts.all}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {counts.active} Aktif • {counts.inactive} Nonaktif
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Reporter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Reporter Lapangan
            </span>
            <span className="text-2xl font-black text-blue-600 block">
              {counts.reporter}
            </span>
            <span className="text-[11px] text-slate-500 block">Wartawan liputan Batu</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Editor & Redaksi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Editor &amp; Redaksi
            </span>
            <span className="text-2xl font-black text-purple-600 block">
              {counts.editor + counts.redaksi}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {counts.editor} Editor • {counts.redaksi} Redaksi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Konten Dihubungkan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Karya Konten
            </span>
            <span className="text-2xl font-black text-red-600 block">
              {counts.totalContent}
            </span>
            <span className="text-[11px] text-slate-500 block">Berita &amp; Video terbit</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. MAIN LIST VIEW WITH SEARCH, FILTER, SORT & ACTIONS */}
      <AuthorListView
        authors={authors}
        onOpenDetail={handleOpenDetail}
        onOpenEdit={handleOpenEditForm}
        onOpenDelete={handleOpenDelete}
        onToggleStatus={handleToggleStatus}
        onCreateCMSAccount={handleOpenCreateCMS}
      />

      {/* 4. MODALS */}
      {/* Add / Edit Form Modal */}
      <AuthorFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setAuthorToEdit(null);
        }}
        onSave={handleSaveAuthor}
        initialAuthor={authorToEdit}
      />

      {/* Detail Modal */}
      <AuthorDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setAuthorToView(null);
        }}
        author={authorToView}
        onEdit={(author) => {
          setIsDetailModalOpen(false);
          handleOpenEditForm(author);
        }}
      />

      {/* Delete / Deactivate Modal with Protection */}
      <AuthorDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAuthorToDelete(null);
        }}
        author={authorToDelete}
        onConfirmDelete={handleConfirmDelete}
        onDeactivate={handleDeactivate}
      />

      {/* Direct Create CMS User Modal */}
      <UserFormModal
        isOpen={isCreateCMSModalOpen}
        onClose={() => {
          setIsCreateCMSModalOpen(false);
          setPreselectedAuthorForCMS(null);
        }}
        userToEdit={null}
        onSave={handleSaveCMSUser}
        preselectedAuthorId={preselectedAuthorForCMS?.id}
      />
    </div>
  );
};
