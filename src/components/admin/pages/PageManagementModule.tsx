import React, { useState, useEffect, useCallback } from 'react';
import { AdminPage } from '../../../types/admin';
import {
  getStoredPages,
  createPage,
  updatePage,
  deletePage,
  togglePageStatus,
} from '../../../data/pagesAdminStore';
import { PageListView } from './PageListView';
import { PageFormModal } from './PageFormModal';
import { PageDetailModal } from './PageDetailModal';
import { PageDeleteModal } from './PageDeleteModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface PageManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export const PageManagementModule: React.FC<PageManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<AdminPage | null>(null);
  const [selectedPageForDetail, setSelectedPageForDetail] = useState<AdminPage | null>(null);
  const [selectedPageForDelete, setSelectedPageForDelete] = useState<AdminPage | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Load data
  const loadPages = useCallback(() => {
    const data = getStoredPages();
    setPages(data);
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Handlers
  const handleAddNew = () => {
    setSelectedPageForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (page: AdminPage) => {
    setSelectedPageForEdit(page);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (page: AdminPage) => {
    setSelectedPageForDetail(page);
    setIsDetailModalOpen(true);
  };

  const handleViewPublic = (slug: string) => {
    if (onNavigateToPublic) {
      onNavigateToPublic(`/${slug}`);
    } else {
      window.open(`/${slug}`, '_blank');
    }
  };

  const handleSaveForm = (pageData: Partial<AdminPage>) => {
    try {
      if (selectedPageForEdit) {
        // Update existing
        const updated = updatePage(selectedPageForEdit.id, pageData);
        if (updated) {
          showToast(`Halaman "${updated.title}" berhasil diperbarui!`, 'success');
        } else {
          showToast('Gagal memperbarui halaman.', 'error');
        }
      } else {
        // Create new
        const created = createPage(pageData);
        showToast(`Halaman "${created.title}" berhasil dibuat!`, 'success');
      }

      setIsFormModalOpen(false);
      setSelectedPageForEdit(null);
      loadPages();
    } catch (err) {
      console.error('Error saving page:', err);
      showToast('Terjadi kesalahan saat menyimpan halaman.', 'error');
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = togglePageStatus(id);
    if (updated) {
      const statusLabel = updated.status === 'published' ? 'diterbitkan' : 'disimpan sebagai draft';
      showToast(`Status halaman "${updated.title}" berhasil diubah menjadi ${statusLabel}.`, 'info');
      loadPages();
    }
  };

  const handleDeletePrompt = (page: AdminPage) => {
    setSelectedPageForDelete(page);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    const target = pages.find((p) => p.id === id);
    const success = deletePage(id);
    if (success) {
      showToast(`Halaman "${target?.title || id}" berhasil dihapus.`, 'info');
      loadPages();
    } else {
      showToast('Gagal menghapus halaman.', 'error');
    }
    setIsDeleteModalOpen(false);
    setSelectedPageForDelete(null);
  };

  const handleUnpublishInstead = (id: string) => {
    const updated = updatePage(id, { status: 'draft' });
    if (updated) {
      showToast(`Halaman "${updated.title}" berhasil dialihkan ke Draft.`, 'success');
      loadPages();
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Main Page List View */}
      <PageListView
        pages={pages}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onViewDetail={handleViewDetail}
        onViewPublic={handleViewPublic}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeletePrompt}
        onRefresh={loadPages}
      />

      {/* Add / Edit Modal */}
      <PageFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedPageForEdit(null);
        }}
        onSave={handleSaveForm}
        initialData={selectedPageForEdit}
      />

      {/* Detail Modal */}
      <PageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPageForDetail(null);
        }}
        page={selectedPageForDetail}
        onEdit={handleEdit}
        onViewPublic={handleViewPublic}
      />

      {/* Delete Confirmation Modal */}
      <PageDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPageForDelete(null);
        }}
        page={selectedPageForDelete}
        onConfirmDelete={handleConfirmDelete}
        onUnpublishInstead={handleUnpublishInstead}
      />
    </div>
  );
};
