import React, { useState, useEffect, useCallback } from 'react';
import {
  Tags,
  Plus,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileText,
  Video,
  ExternalLink,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { AdminCategory, CategoryStatus } from '../../../types/admin';
import {
  getCategoriesWithCounts,
  addCategory,
  updateCategory,
  deleteCategory,
  bulkUpdateCategoryStatus,
} from '../../../data/categoryAdminStore';
import { CategoryListView } from './CategoryListView';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryDeleteModal } from './CategoryDeleteModal';

interface CategoryManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

export const CategoryManagementModule: React.FC<CategoryManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  // Master state for categories
  const [categories, setCategories] = useState<AdminCategory[]>(() => getCategoriesWithCounts());

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

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

  // Reload categories with live counts
  const reloadCategories = useCallback(() => {
    setCategories(getCategoriesWithCounts());
  }, []);

  // Handler: Add or Edit Category Save
  const handleSaveCategory = (data: {
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    contentTypes: ('news' | 'video')[];
    status: CategoryStatus;
    seoTitle: string;
    metaDescription: string;
  }) => {
    if (categoryToEdit) {
      const res = updateCategory(categoryToEdit.id, data);
      if (res.success) {
        showToast(`Kategori "${data.name}" berhasil diperbarui.`, 'success');
        setIsFormModalOpen(false);
        setCategoryToEdit(null);
        reloadCategories();
      } else {
        showToast(res.error || 'Gagal memperbarui kategori.', 'error');
      }
    } else {
      const res = addCategory(data);
      if (res.success) {
        showToast(`Kategori "${data.name}" berhasil ditambahkan.`, 'success');
        setIsFormModalOpen(false);
        reloadCategories();
      } else {
        showToast(res.error || 'Gagal menambahkan kategori.', 'error');
      }
    }
  };

  // Handler: Delete Category
  const handleConfirmDelete = (id: string) => {
    const res = deleteCategory(id);
    if (res.success) {
      showToast('Kategori berhasil dihapus secara permanen.', 'success');
      reloadCategories();
    } else {
      showToast(res.error || 'Gagal menghapus kategori.', 'error');
    }
  };

  // Handler: Toggle single status
  const handleToggleStatus = (id: string, currentStatus: CategoryStatus) => {
    const newStatus: CategoryStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = updateCategory(id, { status: newStatus });
    if (res.success) {
      showToast(
        `Kategori diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`,
        'info'
      );
      reloadCategories();
    } else {
      showToast(res.error || 'Gagal mengubah status kategori.', 'error');
    }
  };

  // Handler: Deactivate category from delete modal
  const handleDeactivateCategory = (id: string) => {
    const res = updateCategory(id, { status: 'inactive' });
    if (res.success) {
      showToast('Kategori berhasil dinonaktifkan.', 'info');
      reloadCategories();
    }
  };

  // Handler: Bulk status update
  const handleBulkUpdateStatus = (ids: string[], status: CategoryStatus) => {
    const res = bulkUpdateCategoryStatus(ids, status);
    if (res.success) {
      showToast(
        `${res.updatedCount} kategori berhasil diubah menjadi ${
          status === 'active' ? 'Aktif' : 'Nonaktif'
        }.`,
        'success'
      );
      reloadCategories();
    }
  };

  // Stats calculation
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const subCategories = categories.filter((c) => c.parentId).length;
  const totalConnectedContent = categories.reduce((acc, c) => acc + (c.totalCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
              Master Data Relasional
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Kategori
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Pusat pengelolaan rubrik klasifikasi Berita dan Video BatuTV. Kategori terhubung secara
            relasional dengan konten publik dan dioptimasi untuk SEO.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reloadCategories}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCategoryToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Kategori */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Kategori
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalCategories}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Rubrik terdaftar
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Tags className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Kategori Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
              Kategori Aktif
            </span>
            <span className="text-2xl font-black text-emerald-600 block">
              {activeCategories}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Ditampilkan di portal
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Subkategori */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Subkategori
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {subCategories}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Hirarki Level 2
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Konten Terhubung */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Konten Terkait
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

      {/* Main Category List Component */}
      <CategoryListView
        categories={categories}
        onAddNew={() => {
          setCategoryToEdit(null);
          setIsFormModalOpen(true);
        }}
        onEdit={(cat) => {
          setCategoryToEdit(cat);
          setIsFormModalOpen(true);
        }}
        onRequestDelete={(cat) => {
          setCategoryToDelete(cat);
          setIsDeleteModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onViewPublicCategory={
          onNavigateToPublic ? (slug) => onNavigateToPublic(`/kategori/${slug}`) : undefined
        }
      />

      {/* Form Modal (Add / Edit) */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
      />

      {/* Safe Delete Modal */}
      <CategoryDeleteModal
        isOpen={isDeleteModalOpen}
        category={categoryToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        onDeactivate={handleDeactivateCategory}
      />
    </div>
  );
};
