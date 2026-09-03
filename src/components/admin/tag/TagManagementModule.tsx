import React, { useState, useCallback } from 'react';
import {
  Hash,
  Plus,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileText,
  Video,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AdminTag, TagContentType, TagStatus } from '../../../types/admin';
import {
  getTagsWithCounts,
  addTag,
  updateTag,
  deleteTag,
  bulkUpdateTagStatus,
  getStoredTagCounts,
} from '../../../data/tagAdminStore';
import { TagListView } from './TagListView';
import { TagFormModal } from './TagFormModal';
import { TagDeleteModal } from './TagDeleteModal';

interface TagManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

export const TagManagementModule: React.FC<TagManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  // Master state for tags with live counts
  const [tags, setTags] = useState<AdminTag[]>(() => getTagsWithCounts());

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<AdminTag | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<AdminTag | null>(null);

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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  }, []);

  // Reload tags with live counts
  const reloadTags = useCallback(() => {
    setTags(getTagsWithCounts());
  }, []);

  // Handler: Add or Edit Tag Save
  const handleSaveTag = (data: {
    name: string;
    slug: string;
    contentTypes: TagContentType[];
    status: TagStatus;
    seoTitle: string;
    metaDescription: string;
  }) => {
    if (tagToEdit) {
      const res = updateTag(tagToEdit.id, data);
      if (res.success) {
        showToast(`Tag #${data.name} berhasil diperbarui.`, 'success');
        setIsFormModalOpen(false);
        setTagToEdit(null);
        reloadTags();
      } else {
        showToast(res.error || 'Gagal memperbarui tag.', 'error');
      }
    } else {
      const res = addTag(data);
      if (res.success) {
        showToast(`Tag #${data.name} berhasil didaftarkan.`, 'success');
        setIsFormModalOpen(false);
        reloadTags();
      } else {
        showToast(res.error || 'Gagal menambahkan tag baru.', 'error');
      }
    }
  };

  // Handler: Delete Tag Confirm
  const handleConfirmDelete = (id: string) => {
    const res = deleteTag(id);
    if (res.success) {
      showToast('Tag berhasil dihapus secara permanen.', 'success');
      reloadTags();
    } else {
      showToast(res.error || 'Gagal menghapus tag.', 'error');
    }
  };

  // Handler: Toggle single status
  const handleToggleStatus = (id: string, currentStatus: TagStatus) => {
    const newStatus: TagStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = updateTag(id, { status: newStatus });
    if (res.success) {
      showToast(
        `Status tag diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`,
        'info'
      );
      reloadTags();
    } else {
      showToast(res.error || 'Gagal mengubah status tag.', 'error');
    }
  };

  // Handler: Deactivate tag from delete modal
  const handleDeactivateTag = (id: string) => {
    const res = updateTag(id, { status: 'inactive' });
    if (res.success) {
      showToast('Tag berhasil dinonaktifkan.', 'info');
      reloadTags();
    }
  };

  // Handler: Bulk status update
  const handleBulkUpdateStatus = (ids: string[], status: TagStatus) => {
    const res = bulkUpdateTagStatus(ids, status);
    if (res.success) {
      showToast(
        `${res.updatedCount} tag berhasil diubah menjadi ${
          status === 'active' ? 'Aktif' : 'Nonaktif'
        }.`,
        'success'
      );
      reloadTags();
    }
  };

  // Computed summary metrics
  const totalTags = tags.length;
  const activeTags = tags.filter((t) => t.status === 'active').length;
  const inactiveTags = tags.filter((t) => t.status === 'inactive').length;
  const totalConnectedContent = tags.reduce((acc, t) => acc + (t.totalCount || 0), 0);

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

      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md">
              Konten Pendukung
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Master Data &amp; Topik
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Tag &amp; Topik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Master data kata kunci dan topik terintegrasi untuk menghubungkan naskah berita, liputan video, dan indeks URL publik SEO <code className="text-red-600 font-mono">/tag/[slug]</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reloadTags}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTagToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tag Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Tag */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Master Tag
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalTags}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Topik terdaftar
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Tag Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
              Tag Aktif
            </span>
            <span className="text-2xl font-black text-emerald-600 block">
              {activeTags}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Tersedia di editor
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Tag Nonaktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Tag Nonaktif
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {inactiveTags}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Disembunyikan dari editor
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Total Relasi Konten */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Relasi Konten
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalConnectedContent}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Berita &amp; Video terhubung
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List Table View */}
      <TagListView
        tags={tags}
        onEdit={(tag) => {
          setTagToEdit(tag);
          setIsFormModalOpen(true);
        }}
        onDelete={(tag) => {
          setTagToDelete(tag);
          setIsDeleteModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onNavigateToPublic={onNavigateToPublic}
      />

      {/* Tag Add / Edit Modal */}
      <TagFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setTagToEdit(null);
        }}
        onSave={handleSaveTag}
        tagToEdit={tagToEdit}
      />

      {/* Tag Delete Protection Modal */}
      <TagDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTagToDelete(null);
        }}
        tag={tagToDelete}
        onConfirmDelete={handleConfirmDelete}
        onDeactivateTag={handleDeactivateTag}
      />
    </div>
  );
};
