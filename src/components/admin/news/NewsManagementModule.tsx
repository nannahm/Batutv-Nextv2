import React, { useState, useEffect, useCallback } from 'react';
import { AdminArticle, ArticleStatus, AdminUser } from '../../../types/admin';
import {
  getStoredArticles,
  persistArticle,
  moveArticleToTrash,
  restoreArticleFromTrash,
  deleteArticlePermanently,
  duplicateArticle,
  bulkUpdateStatus,
  bulkPermanentDelete,
  addArticleToHeadline,
  removeArticleFromHeadline,
  updateHeadlineOrder,
} from '../../../data/newsAdminStore';
import { canRolePublish, normalizeUserRole } from '../../../utils/rbac';
import { NewsListView } from './NewsListView';
import { NewsEditorView } from './NewsEditorView';
import { NewsToast, ToastMessage } from './NewsToast';

interface NewsManagementModuleProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser?: AdminUser | null;
}

export const NewsManagementModule: React.FC<NewsManagementModuleProps> = ({
  currentPath,
  onNavigate,
  currentUser,
}) => {
  // Articles state initialized from store
  const [articles, setArticles] = useState<AdminArticle[]>(() => getStoredArticles());
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize on mount and whenever currentPath changes
  useEffect(() => {
    setArticles(getStoredArticles());
  }, [currentPath]);

  // Toast Helper
  const showToast = useCallback(
    (type: ToastMessage['type'], title: string, message?: string, onUndo?: () => void) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, onUndo }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isTulisRoute = currentPath === '/batutv-control/berita/tulis';
  const isEditRoute = currentPath.startsWith('/batutv-control/berita/edit');
  
  // Extract edit ID if any
  useEffect(() => {
    if (isEditRoute) {
      const parts = currentPath.split('/edit/');
      const editId = parts[1];
      if (editId) {
        const found = articles.find((a) => a.id === editId);
        if (found) {
          setEditingArticle(found);
        }
      }
    } else if (isTulisRoute) {
      setEditingArticle(null);
    }
  }, [currentPath, isEditRoute, isTulisRoute, articles]);

  const activeTab: 'all' | 'headlines' | 'draft' | 'scheduled' | 'published' | 'trash' = (() => {
    if (currentPath.includes('/headline')) return 'headlines';
    if (currentPath.includes('/draft')) return 'draft';
    if (currentPath.includes('/terbit')) return 'published';
    if (currentPath.includes('/terjadwal')) return 'scheduled';
    if (currentPath.includes('/sampah')) return 'trash';
    return 'all';
  })();

  // Navigation Handlers
  const handleTabChange = (tab: 'all' | 'headlines' | 'draft' | 'scheduled' | 'published' | 'trash') => {
    if (tab === 'all') onNavigate('/batutv-control/berita');
    else if (tab === 'headlines') onNavigate('/batutv-control/berita/headline');
    else if (tab === 'draft') onNavigate('/batutv-control/berita/draft');
    else if (tab === 'scheduled') onNavigate('/batutv-control/berita/terjadwal');
    else if (tab === 'published') onNavigate('/batutv-control/berita/terbit');
    else if (tab === 'trash') onNavigate('/batutv-control/berita/sampah');
  };

  const handleStartNewArticle = () => {
    setEditingArticle(null);
    onNavigate('/batutv-control/berita/tulis');
  };

  const handleStartEditArticle = (article: AdminArticle) => {
    setEditingArticle(article);
    onNavigate(`/batutv-control/berita/edit/${article.id}`);
  };

  const handleSaveArticle = (savedArticle: AdminArticle) => {
    // If user is reporter or kontributor, enforce status !== 'published' at module level
    let articleToPersist = { ...savedArticle };
    const userRole = normalizeUserRole(currentUser?.role);
    if (!canRolePublish(currentUser?.role) && articleToPersist.status === 'published') {
      articleToPersist.status = 'draft';
      articleToPersist.isHeadline = false;
      articleToPersist.headlinePosition = null;
    }

    const updated = persistArticle(articleToPersist);
    setArticles(updated);
    setEditingArticle(null);
    showToast(
      'success',
      'Berita Berhasil Disimpan',
      `Artikel "${savedArticle.title.slice(0, 45)}..." telah disimpan (${articleToPersist.status.toUpperCase()}).`
    );
    onNavigate('/batutv-control/berita');
  };

  const handleTrashArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    const userRole = normalizeUserRole(currentUser?.role);
    if ((userRole === 'reporter' || userRole === 'kontributor') && target?.status === 'published') {
      showToast(
        'error',
        'Akses Dibatasi',
        'Anda tidak memiliki kewenangan menghapus berita yang sudah diterbitkan.'
      );
      return;
    }

    const updated = moveArticleToTrash(id);
    setArticles(updated);
    showToast(
      'trash',
      'Artikel Dipindahkan ke Sampah',
      `"${target?.title.slice(0, 40)}..." telah masuk folder Sampah.`,
      () => {
        const restored = restoreArticleFromTrash(id);
        setArticles(restored);
        showToast('info', 'Artikel Dipulihkan', 'Artikel telah dikembalikan ke status Draft.');
      }
    );
  };

  const handleRestoreArticle = (id: string) => {
    const updated = restoreArticleFromTrash(id);
    setArticles(updated);
    showToast('success', 'Artikel Berhasil Dipulihkan', 'Artikel telah dikembalikan ke Draft redaksi.');
  };

  const handlePermanentDelete = (id: string) => {
    const userRole = normalizeUserRole(currentUser?.role);
    if (userRole !== 'admin') {
      showToast(
        'error',
        'Akses Ditolak',
        'Hanya Administrator yang berwenang menghapus artikel secara permanen.'
      );
      return;
    }
    const updated = deleteArticlePermanently(id);
    setArticles(updated);
    showToast('info', 'Artikel Dihapus Permanen', 'Naskah artikel telah dihapus sepenuhnya dari sistem.');
  };

  const handleDuplicateArticle = (id: string) => {
    const result = duplicateArticle(id);
    setArticles(result.updatedArticles);
    if (result.newArticle) {
      showToast(
        'success',
        'Artikel Berhasil Diduplikasi',
        `Salinan draft "${result.newArticle.title.slice(0, 35)}..." telah dibuat.`
      );
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: ArticleStatus) => {
    if (!canRolePublish(currentUser?.role) && newStatus === 'published') {
      showToast(
        'error',
        'Akses Ditolak',
        'Reporter dan Kontributor tidak memiliki wewenang menerbitkan berita langsung.'
      );
      return;
    }
    const updated = bulkUpdateStatus([id], newStatus);
    setArticles(updated);
    showToast(
      'success',
      'Status Berita Diperbarui',
      `Status artikel diubah menjadi ${newStatus.toUpperCase()}.`
    );
  };

  const handleBulkTrash = (ids: string[]) => {
    const updated = bulkUpdateStatus(ids, 'trash');
    setArticles(updated);
    showToast(
      'trash',
      `${ids.length} Artikel Masuk Sampah`,
      'Artikel yang dipilih telah dipindahkan ke folder Sampah.'
    );
  };

  const handleBulkRestore = (ids: string[]) => {
    const updated = bulkUpdateStatus(ids, 'draft');
    setArticles(updated);
    showToast(
      'success',
      `${ids.length} Artikel Dipulihkan`,
      'Artikel yang dipilih telah dipulihkan ke status Draft.'
    );
  };

  const handleBulkPermanentDelete = (ids: string[]) => {
    const userRole = normalizeUserRole(currentUser?.role);
    if (userRole !== 'admin') {
      showToast(
        'error',
        'Akses Ditolak',
        'Hanya Administrator yang berwenang menghapus permanen.'
      );
      return;
    }
    const updated = bulkPermanentDelete(ids);
    setArticles(updated);
    showToast(
      'info',
      `${ids.length} Artikel Dihapus Permanen`,
      'Artikel telah dihapus secara permanen dari sistem.'
    );
  };

  const handleBulkStatusChange = (ids: string[], newStatus: ArticleStatus) => {
    if (!canRolePublish(currentUser?.role) && newStatus === 'published') {
      showToast(
        'error',
        'Akses Ditolak',
        'Reporter dan Kontributor tidak memiliki wewenang menerbitkan berita langsung.'
      );
      return;
    }
    const updated = bulkUpdateStatus(ids, newStatus);
    setArticles(updated);
    showToast(
      'success',
      `Status ${ids.length} Artikel Diperbarui`,
      `Status artikel diubah menjadi ${newStatus.toUpperCase()}.`
    );
  };

  // Headline Management Handlers
  const handleToggleHeadline = (id: string, isHeadline: boolean, targetPosition?: number) => {
    const userRole = normalizeUserRole(currentUser?.role);
    if (userRole !== 'admin' && userRole !== 'redaksi') {
      showToast(
        'error',
        'Akses Ditolak',
        'Hanya Admin dan Redaksi yang berwenang menetapkan headline beranda.'
      );
      return;
    }

    const target = articles.find((a) => a.id === id);
    if (!target) return;

    if (isHeadline) {
      if (target.status !== 'published') {
        showToast(
          'info',
          'Perhatian Redaksi',
          'Hanya artikel dengan status Terbit (Published) yang dapat dijadikan Headline aktif di portal.'
        );
        return;
      }
      const updated = addArticleToHeadline(id, targetPosition);
      setArticles(updated);
      showToast(
        'success',
        'Headline Hero Diperbarui',
        `"${target.title.slice(0, 35)}..." kini aktif di grid Hero SO3 Beranda.`
      );
    } else {
      const updated = removeArticleFromHeadline(id);
      setArticles(updated);
      showToast(
        'info',
        'Headline Dinonaktifkan',
        `"${target.title.slice(0, 35)}..." telah dihapus dari jajaran Headline Hero.`
      );
    }
  };

  const handleReorderHeadlines = (orderedIds: string[]) => {
    const userRole = normalizeUserRole(currentUser?.role);
    if (userRole !== 'admin' && userRole !== 'redaksi') {
      showToast(
        'error',
        'Akses Ditolak',
        'Hanya Admin dan Redaksi yang berwenang mengubah susunan headline.'
      );
      return;
    }
    const updated = updateHeadlineOrder(orderedIds);
    setArticles(updated);
    showToast(
      'success',
      'Urutan Headline Tersimpan',
      'Susunan slot Berita Utama dan Sub-Hero portal telah diperbarui.'
    );
  };

  // Render Editor or List View
  if (isTulisRoute || isEditRoute) {
    return (
      <>
        <NewsEditorView
          initialArticle={editingArticle}
          onSave={handleSaveArticle}
          onCancel={() => onNavigate('/batutv-control/berita')}
          currentUser={currentUser}
        />
        <NewsToast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <NewsListView
        articles={articles}
        currentTab={activeTab}
        onTabChange={handleTabChange}
        onNewArticle={handleStartNewArticle}
        onEditArticle={handleStartEditArticle}
        onTrashArticle={handleTrashArticle}
        onRestoreArticle={handleRestoreArticle}
        onPermanentDelete={handlePermanentDelete}
        onDuplicateArticle={handleDuplicateArticle}
        onQuickStatusChange={handleQuickStatusChange}
        onBulkTrash={handleBulkTrash}
        onBulkRestore={handleBulkRestore}
        onBulkPermanentDelete={handleBulkPermanentDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onToggleHeadline={handleToggleHeadline}
        onReorderHeadlines={handleReorderHeadlines}
        currentUser={currentUser}
      />
      <NewsToast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};
