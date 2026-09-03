import React from 'react';
import { Video, Youtube, ChevronRight, Play, ExternalLink } from 'lucide-react';
import { AdminVideoItem, ContentStatus } from '../../types/admin';

interface LatestVideosGridProps {
  videos: AdminVideoItem[];
  onViewAll: () => void;
  onSelectVideo?: (video: AdminVideoItem) => void;
}

export const LatestVideosGrid: React.FC<LatestVideosGridProps> = ({
  videos,
  onViewAll,
  onSelectVideo,
}) => {
  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Youtube className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Video Terbaru (YouTube)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Siaran dan liputan berita terintegrasi melalui URL YouTube BatuTV
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50"
        >
          <span>Lihat Semua Video</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Video Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="group bg-slate-50/70 hover:bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container with Play Overlay & YouTube Badge */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 mb-3 border border-slate-200">
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* YouTube ID Indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  <Youtube className="w-3 h-3 text-red-500" />
                  <span>YouTube</span>
                </div>

                {vid.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                    {vid.duration}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 bg-white text-slate-700 text-[10px] font-bold rounded border border-slate-200">
                    {vid.category}
                  </span>
                  {getStatusBadge(vid.status)}
                </div>

                <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug pt-1">
                  {vid.title}
                </h4>
              </div>
            </div>

            {/* Date & Action */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>{vid.publishDate}</span>
              <a
                href={vid.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka video di YouTube: ${vid.title}`}
                className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Tonton</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer view all bar */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-red-50 transition-colors"
        >
          <span>Lihat Semua Video ({videos.length} Konten Ditampilkan)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
