import React from 'react';
import { Play, Tv, Clock, Eye, Video as VideoIcon } from 'lucide-react';
import { VideoNews } from '../types/news';

interface VideoSectionProps {
  videos: VideoNews[];
  onPlayVideo: (video: VideoNews) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videos, onPlayVideo }) => {
  const mainFeaturedVideo = videos[0];
  const sideVideos = videos.slice(1, 4);

  return (
    <section id="video-news-section" className="my-10 bg-[#0f172a] text-white rounded-2xl p-4 sm:p-7 shadow-xl overflow-hidden border border-slate-800">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-serif-heading">
              BatuTV Video Terbaru
            </h3>
            <p className="text-xs text-slate-400">Liputan visual eksklusif, dialog interaktif, dan laporan langsung</p>
          </div>
        </div>

        <button
          onClick={() => mainFeaturedVideo && onPlayVideo(mainFeaturedVideo)}
          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <span>Tonton Semua Video</span>
          <span>→</span>
        </button>
      </div>

      {/* Grid: 1 Big Video Feature on Left + 3 Video Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Video Highlight (7 cols) */}
        {mainFeaturedVideo && (
          <div
            id="featured-video-card"
            onClick={() => onPlayVideo(mainFeaturedVideo)}
            className="lg:col-span-7 bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 group cursor-pointer hover:border-red-600/50 transition-all shadow-lg flex flex-col justify-between"
          >
            {/* Video Thumbnail with Play Button */}
            <div className="relative aspect-video overflow-hidden bg-black">
              <img
                src={mainFeaturedVideo.thumbnailUrl}
                alt={mainFeaturedVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Big Centered Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-500 transition duration-300">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                {mainFeaturedVideo.duration}
              </span>

              {/* Program Badge */}
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow-md tracking-wider">
                {mainFeaturedVideo.program}
              </span>
            </div>

            {/* Video Details */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span className="text-red-400 font-bold uppercase">{mainFeaturedVideo.category}</span>
                <span>•</span>
                <span>{mainFeaturedVideo.publishedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {mainFeaturedVideo.views.toLocaleString('id-ID')} tayangan
                </span>
              </div>

              <h4 className="text-base sm:text-xl font-bold text-white group-hover:text-red-400 transition font-serif-heading leading-snug mb-2 line-clamp-2">
                {mainFeaturedVideo.title}
              </h4>

              <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {mainFeaturedVideo.description}
              </p>
            </div>
          </div>
        )}

        {/* 3 Secondary Video Stack (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {sideVideos.map((video, idx) => (
            <div
              key={video.id}
              id={`side-video-${idx}`}
              onClick={() => onPlayVideo(video)}
              className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 hover:border-red-600/40 hover:bg-slate-800/60 transition group cursor-pointer flex gap-3.5 items-center"
            >
              {/* Mini Thumbnail */}
              <div className="relative w-32 sm:w-36 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition" />
                
                {/* Mini Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center group-hover:scale-110 transition shadow-md">
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold text-slate-200 px-1.5 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-red-400 font-bold mb-1">
                  <span>{video.program}</span>
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-red-400 transition line-clamp-2 leading-snug font-serif-heading">
                  {video.title}
                </h5>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                  <span>Oleh: {video.presenter}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
