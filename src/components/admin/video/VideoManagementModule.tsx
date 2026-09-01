import React, { useState, useEffect, useCallback } from 'react';
import { AdminVideo, VideoStatus, AdminUser } from '../../../types/admin';
import {
  getStoredVideos,
  persistVideo,
  moveVideoToTrash,
  restoreVideoFromTrash,
  deleteVideoPermanently,
  duplicateVideo,
  bulkUpdateVideoStatus,
  bulkPermanentDeleteVideos,
} from '../../../data/videoAdminStore';
import { canRolePublish, canRolePermanentDelete, canRoleTrashPublished } from '../../../utils/rbac';
import { VideoListView } from './VideoListView';
import { VideoEditorView } from './VideoEditorView';
import { VideoToast, VideoToastMessage } from './VideoToast';

interface VideoManagementModuleProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onNavigateToPublic?: (slug: string) => void;
  currentUser?: AdminUser | null;
}

export const VideoManagementModule: React.FC<VideoManagementModuleProps> = ({
  currentPath = '/batutv-control/video',
  onNavigate,
  onNavigateToPublic,
  currentUser,
}) => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);

  // Videos List State
  const [videos, setVideos] = useState<AdminVideo[]>(() => getStoredVideos());

  // Toasts State
  const [toasts, setToasts] = useState<VideoToastMessage[]>([]);

  // Load videos on mount and path change
  const refreshVideos = useCallback(() => {
    const list = getStoredVideos();
    setVideos(list);
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [currentPath, refreshVideos]);

  // Routing detection based on currentPath
  const isTambahRoute = currentPath === '/batutv-control/video/tambah';
  const isEditRoute = currentPath.startsWith('/batutv-control/video/edit');

  useEffect(() => {
    if (isEditRoute) {
      const parts = currentPath.split('/edit/');
      const editId = parts[1];
      if (editId) {
        const found = getStoredVideos().find((v) => v.id === editId);
        if (found) {
          setEditingVideo(found);
          setCurrentView('edit');
        }
      }
    } else if (isTambahRoute) {
      setEditingVideo(null);
      setCurrentView('create');
    } else {
      setEditingVideo(null);
      setCurrentView('list');
    }
  }, [currentPath, isEditRoute, isTambahRoute]);

  // Compute active tab from current route URL
  const activeTab: 'all' | 'draft' | 'scheduled' | 'published' | 'trash' = (() => {
    if (currentPath.includes('/draft')) return 'draft';
    if (currentPath.includes('/terbit')) return 'published';
    if (currentPath.includes('/terjadwal')) return 'scheduled';
    if (currentPath.includes('/sampah')) return 'trash';
    return 'all';
  })();

  const handleTabChange = (tab: 'all' | 'draft' | 'scheduled' | 'published' | 'trash') => {
    if (onNavigate) {
      if (tab === 'all') onNavigate('/batutv-control/video');
      else if (tab === 'draft') onNavigate('/batutv-control/video/draft');
      else if (tab === 'scheduled') onNavigate('/batutv-control/video/terjadwal');
      else if (tab === 'published') onNavigate('/batutv-control/video/terbit');
      else if (tab === 'trash') onNavigate('/batutv-control/video/sampah');
    }
  };

  // Toast Helper
  const addToast = (
    type: 'success' | 'error' | 'info' | 'trash',
    title: string,
    message?: string,
    onUndo?: () => void
  ) => {
    const newToast: VideoToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      onUndo,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Counts for Tabs & Badges
  const counts = {
    all: videos.filter((v) => v.status !== 'trash').length,
    draft: videos.filter((v) => v.status === 'draft').length,
    scheduled: videos.filter((v) => v.status === 'scheduled').length,
    published: videos.filter((v) => v.status === 'published').length,
    trash: videos.filter((v) => v.status === 'trash').length,
  };

  // Handlers
  const handleNewVideo = () => {
    setEditingVideo(null);
    if (onNavigate) {
      onNavigate('/batutv-control/video/tambah');
    } else {
      setCurrentView('create');
    }
  };

  const handleEditVideo = (video: AdminVideo) => {
    setEditingVideo(video);
    if (onNavigate) {
      onNavigate(`/batutv-control/video/edit/${video.id}`);
    } else {
      setCurrentView('edit');
    }
  };

  const handleCancelEditor = () => {
    setEditingVideo(null);
    if (onNavigate) {
      onNavigate('/batutv-control/video');
    } else {
      setCurrentView('list');
    }
  };

  const handleSaveVideo = (savedVideo: AdminVideo) => {
    const userRole = currentUser?.role;
    const canPublish = canRolePublish(userRole);

    let normalizedStatus = savedVideo.status;
    if (!canPublish && (savedVideo.status === 'published' || savedVideo.status === 'scheduled')) {
      normalizedStatus = 'draft';
      addToast(
        'info',
        'Naskah Video Dikirim ke Redaksi',
        'Role Reporter/Kontributor tidak memiliki izin terbit langsung. Video tersimpan sebagai Draft untuk ditinjau Editor/Redaksi.'
      );
    }

    const videoToSave = {
      ...savedVideo,
      status: normalizedStatus,
    };

    const updated = persistVideo(videoToSave, userRole);
    setVideos(updated);
    setEditingVideo(null);

    const isNew = !editingVideo;
    const statusText =
      videoToSave.status === 'published'
        ? 'Diterbitkan'
        : videoToSave.status === 'scheduled'
        ? 'Dijadwalkan'
        : 'Disimpan sebagai Draft';

    if (canPublish || normalizedStatus === 'draft') {
      addToast(
        'success',
        isNew ? 'Video Berhasil Ditambahkan' : 'Video Berhasil Diperbarui',
        `"${videoToSave.title.slice(0, 45)}..." ${statusText}.`
      );
    }

    if (onNavigate) {
      if (videoToSave.status === 'published') onNavigate('/batutv-control/video/terbit');
      else if (videoToSave.status === 'scheduled') onNavigate('/batutv-control/video/terjadwal');
      else if (videoToSave.status === 'draft') onNavigate('/batutv-control/video/draft');
      else onNavigate('/batutv-control/video');
    } else {
      setCurrentView('list');
    }
  };

  const handleTrashVideo = (id: string) => {
    const target = videos.find((v) => v.id === id);
    const userRole = currentUser?.role;

    if (target && target.status === 'published' && !canRoleTrashPublished(userRole)) {
      addToast(
        'error',
        'Aksi Tidak Diizinkan',
        'Hanya Admin, Redaksi, dan Editor yang dapat memindahkan video terbit ke sampah.'
      );
      return;
    }

    const updated = moveVideoToTrash(id, userRole);
    setVideos(updated);

    addToast(
      'trash',
      'Video Dipindahkan ke Sampah',
      target ? `"${target.title.slice(0, 40)}..." masuk ke tab Sampah.` : undefined,
      () => {
        const restored = restoreVideoFromTrash(id);
        setVideos(restored);
        addToast('success', 'Video Dipulihkan', 'Video dikembalikan ke status Draft.');
      }
    );
  };

  const handleRestoreVideo = (id: string) => {
    const updated = restoreVideoFromTrash(id);
    setVideos(updated);
    addToast('success', 'Video Dipulihkan', 'Video dikembalikan ke tab Draft.');
  };

  const handlePermanentDelete = (id: string) => {
    const userRole = currentUser?.role;
    if (!canRolePermanentDelete(userRole)) {
      addToast(
        'error',
        'Akses Ditolak (403)',
        'Hanya Super Admin yang berwenang menghapus video secara permanen.'
      );
      return;
    }

    const updated = deleteVideoPermanently(id, userRole);
    setVideos(updated);
    addToast('info', 'Video Dihapus Permanen', 'Video telah dihapus dari sistem.');
  };

  const handleDuplicateVideo = (id: string) => {
    const { updatedVideos, newVideo } = duplicateVideo(id);
    setVideos(updatedVideos);
    if (newVideo) {
      addToast(
        'success',
        'Video Berhasil Diduplikasi',
        `Salinan dibuat: "${newVideo.title.slice(0, 40)}..." (Status: Draft)`
      );
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: VideoStatus) => {
    const userRole = currentUser?.role;
    if (newStatus === 'published' && !canRolePublish(userRole)) {
      addToast(
        'error',
        'Akses Ditolak',
        'Role Anda tidak memiliki wewenang untuk menerbitkan video secara langsung.'
      );
      return;
    }

    const updated = bulkUpdateVideoStatus([id], newStatus, userRole);
    setVideos(updated);
    addToast(
      'success',
      'Status Video Diperbarui',
      `Status video diubah menjadi: ${newStatus === 'published' ? 'Terbit' : 'Draft'}.`
    );
  };

  const handleBulkStatusChange = (ids: string[], newStatus: VideoStatus) => {
    const userRole = currentUser?.role;
    if (newStatus === 'published' && !canRolePublish(userRole)) {
      addToast(
        'error',
        'Akses Ditolak',
        'Role Anda tidak memiliki wewenang untuk menerbitkan video secara massal.'
      );
      return;
    }

    const updated = bulkUpdateVideoStatus(ids, newStatus, userRole);
    setVideos(updated);
    addToast(
      'success',
      'Perubahan Massal Berhasil',
      `${ids.length} video diubah statusnya menjadi ${newStatus}.`
    );
  };

  const handleBulkPermanentDelete = (ids: string[]) => {
    const userRole = currentUser?.role;
    if (!canRolePermanentDelete(userRole)) {
      addToast(
        'error',
        'Akses Ditolak (403)',
        'Hanya Super Admin yang berwenang melakukan penghapusan massal permanen.'
      );
      return;
    }

    const updated = bulkPermanentDeleteVideos(ids, userRole);
    setVideos(updated);
    addToast(
      'info',
      'Penghapusan Massal Selesai',
      `${ids.length} video telah dihapus permanen dari sistem.`
    );
  };

  const handleNavigateToPublicPage = (slug: string) => {
    if (onNavigateToPublic) {
      onNavigateToPublic(slug);
    } else {
      window.location.href = `/video/${slug}`;
    }
  };

  return (
    <div className="relative">
      {/* Toast Notifications */}
      <VideoToast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Dynamic View Router */}
      {currentView === 'list' && (
        <VideoListView
          videos={videos}
          activeTab={activeTab}
          counts={counts}
          currentUser={currentUser}
          onTabChange={handleTabChange}
          onNewVideo={handleNewVideo}
          onEditVideo={handleEditVideo}
          onTrashVideo={handleTrashVideo}
          onRestoreVideo={handleRestoreVideo}
          onPermanentDelete={handlePermanentDelete}
          onDuplicateVideo={handleDuplicateVideo}
          onQuickStatusChange={handleQuickStatusChange}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkPermanentDelete={handleBulkPermanentDelete}
          onNavigateToPublic={handleNavigateToPublicPage}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <VideoEditorView
          initialVideo={editingVideo}
          currentUser={currentUser}
          onSave={handleSaveVideo}
          onCancel={handleCancelEditor}
          onPreviewPublic={handleNavigateToPublicPage}
        />
      )}
    </div>
  );
};
