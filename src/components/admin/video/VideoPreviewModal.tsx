import React, { useState } from 'react';
import {
  X,
  Play,
  Calendar,
  Eye,
  Tag,
  User,
  Clock,
  Globe,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { AdminVideo } from '../../../types/admin';
import { getYouTubeThumbnailUrl, getYouTubeEmbedUrl } from '../../../utils/youtube';
import { getMediaById } from '../../../data/mediaAdminStore';

interface VideoPreviewModalProps {
  video: AdminVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (video: AdminVideo) => void;
  onOpenPublic?: (slug: string) => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  video,
  isOpen,
  onClose,
  onEdit,
  onOpenPublic,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !video) return null;

  const thumbnail =
    video.thumbnailSource === 'custom'
      ? (video.customThumbnail || (video.thumbnailMediaId ? getMediaById(video.thumbnailMediaId)?.url : '') || getYouTubeThumbnailUrl(video.youtubeVideoId))
      : getYouTubeThumbnailUrl(video.youtubeVideoId);

  const getStatusBadge = () => {
    switch (video.status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-500/20">
            Terbit (Published)
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 text-xs font-bold rounded-lg border border-blue-500/20">
            Terjadwal
          </span>
        );
      case 'trash':
        return (
          <span className="px-2.5 py-1 bg-red-500/10 text-red-700 text-xs font-bold rounded-lg border border-red-500/20">
            Sampah
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-xs font-bold rounded-lg border border-amber-500/20">
            Draft
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-preview-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold tracking-wider uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
              Preview Video Redaksi
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(video);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup preview"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* YouTube Video Player / Poster Container */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-md border border-slate-800">
            {isPlaying ? (
              <iframe
                src={getYouTubeEmbedUrl(video.youtubeVideoId, true)}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="relative w-full h-full group">
                <img
                  src={thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer"
                  >
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  </button>
                </div>
                {video.duration && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs font-bold rounded">
                    {video.duration}
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-600/90 text-white text-[11px] font-bold rounded">
                  ID: {video.youtubeVideoId}
                </div>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-extrabold rounded-md">
                {video.category}
              </span>
              <span className="text-xs text-slate-400">/video/{video.slug}</span>
            </div>

            <h2 id="video-preview-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {video.title}
            </h2>

            {video.excerpt && (
              <p className="mt-2 text-sm text-slate-600 italic border-l-2 border-red-500 pl-3">
                {video.excerpt}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Reporter/Author</p>
                <p className="text-xs font-bold text-slate-800">{video.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Publikasi</p>
                <p className="text-xs font-bold text-slate-800">
                  {video.publishedAt.split('T')[0] || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Durasi</p>
                <p className="text-xs font-bold text-slate-800">{video.duration || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Views</p>
                <p className="text-xs font-bold text-slate-800">{video.views.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          {video.description && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Deskripsi Lengkap
              </h3>
              {/<[a-z][\s\S]*>/i.test(video.description) ? (
                <div
                  className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 prose prose-slate max-w-none [&>p]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>h2]:text-base [&>h2]:font-bold [&>h3]:text-sm [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {video.description}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {video.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Buka di YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            {onOpenPublic && video.status === 'published' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPublic(video.slug);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <span>Lihat di Halaman Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
