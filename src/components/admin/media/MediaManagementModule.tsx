import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Layers,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { AdminMedia } from '../../../types/admin';
import {
  getStoredMedia,
  getMediaCounts,
  deleteMedia,
  formatBytes,
} from '../../../data/mediaAdminStore';
import { MediaGridView } from './MediaGridView';
import { MediaDetailModal } from './MediaDetailModal';
import { MediaUploadModal } from './MediaUploadModal';
import { MediaDeleteModal } from './MediaDeleteModal';

interface MediaManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

export const MediaManagementModule: React.FC<MediaManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [selectedMediaForDetail, setSelectedMediaForDetail] = useState<AdminMedia | null>(null);
  const [selectedMediaForDelete, setSelectedMediaForDelete] = useState<AdminMedia | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reload media from store
  const refreshMedia = () => {
    const data = getStoredMedia();
    setMediaList(data);
  };

  useEffect(() => {
    refreshMedia();
  }, []);

  const counts = getMediaCounts();

  // Handlers
  const handleMediaUploaded = (newMedia: AdminMedia) => {
    refreshMedia();
    showToast(`Media "${newMedia.filename}" berhasil diunggah ke pustaka!`, 'success');
  };

  const handleMediaUpdated = (updatedMedia: AdminMedia) => {
    refreshMedia();
    setSelectedMediaForDetail(updatedMedia);
    showToast(`Metadata "${updatedMedia.filename}" berhasil diperbarui!`, 'success');
  };

  const handleConfirmDelete = (id: string) => {
    const res = deleteMedia(id);
    if (res.success) {
      refreshMedia();
      setSelectedMediaForDelete(null);
      setSelectedMediaForDetail(null);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60 backdrop-blur-md'
                : toastMessage.type === 'error'
                ? 'bg-red-900/90 text-red-100 border-red-700/60 backdrop-blur-md'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/60 backdrop-blur-md'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase tracking-wider mb-1">
            <span>KONTEN PENDUKUNG</span>
            <span>/</span>
            <span>MEDIA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-red-600" />
            <span>Media Library & Pustaka Aset</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master repository gambar editorial, foto jurnalistik, thumbnail berita, dan dokumen redaksi portal BatuTV.
          </p>
        </div>

        {/* Header Action */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshMedia}
            title="Segarkan data media"
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Unggah Media</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Berkas
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {counts.total} <span className="text-xs font-semibold text-slate-400">aset</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Aset Foto & Grafis
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {counts.images} <span className="text-xs font-semibold text-slate-400">foto</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Digunakan Berita
            </span>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
              {counts.used} <span className="text-xs font-semibold text-slate-400">terkait</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Ukuran Aset
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {formatBytes(counts.totalSizeBytes)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <MediaGridView
        mediaList={mediaList}
        onSelectMedia={(media) => setSelectedMediaForDetail(media)}
        onRequestDelete={(media) => setSelectedMediaForDelete(media)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Detail Modal */}
      <MediaDetailModal
        isOpen={Boolean(selectedMediaForDetail)}
        media={selectedMediaForDetail}
        onClose={() => setSelectedMediaForDetail(null)}
        onMediaUpdated={handleMediaUpdated}
        onRequestDelete={(media) => {
          setSelectedMediaForDetail(null);
          setSelectedMediaForDelete(media);
        }}
      />

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onMediaUploaded={handleMediaUploaded}
      />

      {/* Delete Modal with Guard Protection */}
      <MediaDeleteModal
        isOpen={Boolean(selectedMediaForDelete)}
        media={selectedMediaForDelete}
        onClose={() => setSelectedMediaForDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
