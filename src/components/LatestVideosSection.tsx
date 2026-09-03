import React from 'react';
import { Play } from 'lucide-react';
import {
  LatestVideoItem,
  defaultLatestVideos,
  TrendingSidebarItem,
  ViralTopicItem,
} from '../data/latestNewsData';
import { SharedSidebar } from './SharedSidebar';
import { NewsArticle } from '../types/news';

export interface LatestVideosSectionProps {
  videos?: LatestVideoItem[];
  onPlayVideo?: (video: LatestVideoItem) => void;
  onSelectArticle?: (article: NewsArticle | TrendingSidebarItem) => void;
  onSelectViralTopic?: (topic: ViralTopicItem) => void;
}

/**
 * SO6 — BATUTV VIDEO TERBARU + SHARED SIDEBAR
 * 
 * Main Content:
 * - Section Header: "VIDEO TERBARU" + Short Red Accent Line
 * - Video Grid: Exactly 6 videos arranged in 2 columns (Desktop) / 1 column (Mobile)
 * - Video Card: Landscape 16:9 thumbnail, centered play button, duration badge, title & metadata
 * 
 * Shared Sidebar:
 * - Shared reusable sidebar from SO4/SO5 containing Trending items with "SELENGKAPNYA »" button
 *   and VIRAL ranked topics with black square badges (#1 to #5).
 */
export const LatestVideosSection: React.FC<LatestVideosSectionProps> = ({
  videos = defaultLatestVideos,
  onPlayVideo,
  onSelectArticle,
  onSelectViralTopic,
}) => {
  // Enforce exactly 6 videos on initial render as specified
  const displayVideos = videos.slice(0, 6);

  const handleVideoClick = (e: React.MouseEvent<HTMLAnchorElement>, video: LatestVideoItem) => {
    e.preventDefault();
    if (onPlayVideo) {
      onPlayVideo(video);
    }
  };

  return (
    <section
      id="s06-video-terbaru"
      aria-labelledby="latest-videos-heading"
      className="latest-videos-section w-full py-2.5 sm:py-3 pb-8 sm:pb-12"
    >
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* MAIN CONTENT: 2-COLUMN VIDEO GRID (~68-72% = 8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Section Header */}
            <div className="section-header mb-3.5 sm:mb-4">
              <h2
                id="latest-videos-heading"
                className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
              >
                VIDEO TERBARU
              </h2>
              {/* Short Red Accent Line */}
              <div
                aria-hidden="true"
                className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
              />
            </div>

            {/* Video Grid: 2 columns on desktop/tablet, 1 column on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {displayVideos.map((video, idx) => (
                <article
                  key={video.id || idx}
                  id={`s06-video-card-${idx + 1}`}
                  className="video-card bg-white rounded-xl border border-slate-100 hover:border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <a
                    href={video.href}
                    onClick={(e) => handleVideoClick(e, video)}
                    aria-label={`Tonton video: ${video.title}`}
                    className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-xl"
                  >
                    {/* Landscape 16:9 Thumbnail with Overlay */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                      />

                      {/* Subtle Dark Gradient Overlay */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
                      />

                      {/* Centered High-Contrast Play Button */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#c8102e] group-hover:text-white transition-all duration-200">
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      {/* Duration Badge in Bottom-Right Corner */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white font-bold text-[11px] rounded tracking-wider backdrop-blur-xs">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Content Section: Title + Metadata */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      {/* Video Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-3 group-hover:text-[#c8102e] transition-colors font-sans">
                        {video.title}
                      </h3>

                      {/* Metadata: Category | Date */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pt-1">
                        <span className="text-[#c8102e] uppercase font-bold tracking-wide">
                          {video.category}
                        </span>
                        <span className="text-slate-300 font-light">|</span>
                        <time dateTime={video.date} className="text-slate-400 font-normal">
                          {video.date}
                        </time>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>

          {/* SHARED SIDEBAR CONTINUATION (~28-32% = 4 cols) */}
          <div className="lg:col-span-4 w-full">
            <SharedSidebar
              showSpecialEvent={false}
              showTrending={true}
              showMoreTrendingButton={true}
              showViralTopics={true}
              onSelectArticle={onSelectArticle}
              onSelectViralTopic={onSelectViralTopic}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
