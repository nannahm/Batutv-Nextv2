import React from 'react';
import { X, Play, Clock, Eye, User, Share2, Tv, ExternalLink } from 'lucide-react';
import { VideoNews } from '../types/news';
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '../utils/youtube';

interface VideoPlayerModalProps {
  video: VideoNews | null;
  onClose: () => void;
  onSelectVideo: (video: VideoNews) => void;
  allVideos: VideoNews[];
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onSelectVideo,
  allVideos,
}) => {
  if (!video) return null;

  const otherVideos = allVideos.filter((v) => v.id !== video.id);
  const videoId =
    extractYouTubeVideoId((video as any).youtubeUrl) ||
    (video as any).youtubeVideoId ||
    extractYouTubeVideoId(video.videoEmbedId) ||
    extractYouTubeVideoId(video.id) ||
    'dQw4w9WgXcQ';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div id="video-player-modal-backdrop" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="video-player-modal-container"
        className="bg-[#0f172a] text-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-800 overflow-hidden my-4 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 font-black text-xs px-2 py-0.5 rounded text-white uppercase">
              {video.program}
            </span>
            <span className="text-xs text-slate-400">Liputan Video BatuTV</span>
          </div>

          <button
            id="btn-close-video-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Main YouTube Video Player */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 mb-5">
            <iframe
              id="modal-youtube-player-iframe"
              src={embedUrl}
              title={video.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video Metadata */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
              <span className="text-red-400 font-bold uppercase">{video.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {video.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {video.views.toLocaleString('id-ID')} tayangan
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3.5 h-3.5" />
                Presenter: {video.presenter}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-heading mb-3">
              {video.title}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {video.description}
            </p>
          </div>

          {/* Related Videos List */}
          {otherVideos.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-500" />
                Video Terkait Lainnya
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {otherVideos.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-red-500/40 cursor-pointer group transition"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold text-white px-1.5 py-0.5 rounded">
                        {v.duration}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-red-400 uppercase mb-1">{v.program}</div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 line-clamp-2 leading-snug">
                      {v.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
