import React, { useState } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ShortVideoItem,
  defaultBatuTvShorts,
} from './ShortsAndSidebar';
import {
  LatestNewsPost,
  defaultLatestNewsPosts,
  LatestVideoItem,
  defaultLatestVideos,
  PopularNewsItemData,
  defaultPopularNews,
  TrendingSidebarItem,
  defaultTrendingSidebarItems,
  ViralTopicItem,
  defaultViralTopics,
  SidebarSpecialCardData,
  defaultSidebarSpecialCard,
} from '../data/latestNewsData';
import { SharedSidebar } from './SharedSidebar';
import { NewsFeedItem } from './NewsFeedItem';
import { NewsArticle, VideoNews } from '../types/news';

export interface MainPortalFeedProps {
  shorts?: ShortVideoItem[];
  posts?: LatestNewsPost[];
  videos?: LatestVideoItem[];
  popularNews?: PopularNewsItemData[];
  trendingItems?: TrendingSidebarItem[];
  viralTopics?: ViralTopicItem[];
  specialEvent?: SidebarSpecialCardData;
  showSpecialEvent?: boolean;
  onPlayShort?: (short: ShortVideoItem) => void;
  onPlayVideo?: (video: LatestVideoItem | VideoNews) => void;
  onSelectPost?: (post: LatestNewsPost) => void;
  onSelectPopular?: (item: PopularNewsItemData) => void;
  onSelectTrending?: (item: TrendingSidebarItem) => void;
  onSelectArticle?: (article: NewsArticle | LatestNewsPost | TrendingSidebarItem | PopularNewsItemData) => void;
  onSelectSpecialEvent?: (event: SidebarSpecialCardData) => void;
  onSelectViralTopic?: (topic: ViralTopicItem) => void;
}

/**
 * UNIFIED PORTAL SECTION (SO4 — SO7)
 * 
 * Unifies the left content area and right sidebar into ONE cohesive layout group:
 * 
 * LEFT COLUMN (lg:col-span-8):
 * ├── S04 — BATUTV SHORTS (5 portrait video cards)
 * ├── S05 — TERBARU (Post 01 - Post 07 from latest feed)
 * ├── S06 — VIDEO TERBARU (6 video cards in 2-column grid)
 * └── S07 — JANGAN LEWATKAN (Post 08 - Post 14 continuous feed)
 * 
 * RIGHT COLUMN (lg:col-span-4) — SINGLE UNIFIED SIDEBAR:
 * ├── 1. BERITA TERPOPULER (#1 to #4 circular badges)
 * ├── 2. AGENDA SPESIAL BATUTV (Optional special card)
 * ├── 3. TRENDING (Thumbnail list + "SELENGKAPNYA »" button)
 * └── 4. VIRAL (Ranked #1 to #5 topics with article counts)
 */
export const MainPortalFeed: React.FC<MainPortalFeedProps> = ({
  shorts = defaultBatuTvShorts,
  posts = defaultLatestNewsPosts,
  videos = defaultLatestVideos,
  popularNews = defaultPopularNews,
  trendingItems = defaultTrendingSidebarItems,
  viralTopics = defaultViralTopics,
  specialEvent = defaultSidebarSpecialCard,
  showSpecialEvent = false,
  onPlayShort,
  onPlayVideo,
  onSelectPost,
  onSelectPopular,
  onSelectTrending,
  onSelectArticle,
  onSelectSpecialEvent,
  onSelectViralTopic,
}) => {
  // State for crawlable pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;

  const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const feedEl = document.getElementById('s05-terbaru-feed');
      if (feedEl) {
        feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  // Shorts items (5 items)
  const displayShorts = shorts.slice(0, 5);
  // S05 renders first batch (posts 01 to 07)
  const SO5_LIMIT = 7;
  const SO7_LIMIT = 7;
  const so5Posts = posts.slice(0, SO5_LIMIT);
  // S06 renders 6 latest videos
  const displayVideos = videos.slice(0, 6);
  // S07 renders continuation of latest feed strictly offset after SO5 (posts 08 to 14)
  const so7Posts = posts.slice(SO5_LIMIT, SO5_LIMIT + SO7_LIMIT);

  const handleShortClick = (e: React.MouseEvent<HTMLAnchorElement>, short: ShortVideoItem) => {
    e.preventDefault();
    if (onPlayShort) {
      onPlayShort(short);
    } else if (onPlayVideo) {
      onPlayVideo(short as unknown as VideoNews);
    }
  };

  const handlePostClick = (item: LatestNewsPost) => {
    if (onSelectPost) {
      onSelectPost(item);
    } else if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLAnchorElement>, video: LatestVideoItem) => {
    e.preventDefault();
    if (onPlayVideo) {
      onPlayVideo(video);
    }
  };

  return (
    <div
      id="main-portal-feed-so4-so7"
      className="main-portal-feed-section w-full py-2 sm:py-4 pb-10 sm:pb-16 select-none"
    >
      <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
        <div className="w-full flex flex-col md:flex-row items-start md:gap-[34px] gap-8">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: MAIN CONTENT (SO4 + SO5 + SO6 + SO7) (731px) */}
          {/* ========================================================= */}
          <div className="w-full md:w-[731px] md:max-w-[731px] md:shrink-0 flex flex-col space-y-8 sm:space-y-10">
            
            {/* ------------------------------------------------------- */}
            {/* S04 — BATUTV SHORTS (128px x 227px - 9:16 Portrait)     */}
            {/* ------------------------------------------------------- */}
            <section
              id="s04-batutv-shorts"
              aria-labelledby="batutv-shorts-title"
              className="w-full flex flex-col"
            >
              {/* Header */}
              <div className="section-header mb-3.5 sm:mb-4">
                <h2
                  id="batutv-shorts-title"
                  className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
                >
                  BATUTV SHORTS
                </h2>
                <div
                  aria-hidden="true"
                  className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
                />
              </div>

              {/* Shorts List (5 Horizontal Portrait Cards with exact 128px x 227px (9:16) ratio) */}
              <div className="shorts-list-container relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-[660px] md:min-w-0 justify-between">
                  {displayShorts.map((short, idx) => (
                    <article
                      key={short.id || idx}
                      id={`s04-short-card-${idx + 1}`}
                      className="short-card w-[128px] h-[227px] min-w-[128px] max-w-[128px] aspect-[9/16] shrink-0 relative rounded-lg overflow-hidden group shadow-sm bg-slate-900 select-none flex flex-col justify-end"
                    >
                      <a
                        href={short.href}
                        onClick={(e) => handleShortClick(e, short)}
                        aria-label={`Tonton short: ${short.title}`}
                        className="relative w-full h-full flex flex-col justify-end p-2.5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 z-10"
                      >
                        {/* Thumbnail Background */}
                        <img
                          src={short.thumbnailUrl}
                          alt={short.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 group-hover:brightness-95 transition-all duration-300 pointer-events-none"
                          loading="lazy"
                        />

                        {/* Top subtle brand badge */}
                        <div className="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none opacity-90">
                          <span className="text-[11px] font-black italic text-red-500 tracking-tighter drop-shadow-md">
                            #VOD <span className="text-[10px] font-normal text-white not-italic font-sans">by BatuTV</span>
                          </span>
                        </div>

                        {/* Centered Play Button */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                        >
                          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 group-hover:scale-110 group-hover:bg-[#c8102e] transition-all duration-200 shadow-md">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Dark Gradient Overlay */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-1 pointer-events-none"
                        />

                        {/* Bottom Title */}
                        <div className="relative z-10 mt-auto">
                          <h3 className="text-xs font-bold text-white leading-snug line-clamp-3 group-hover:text-red-100 transition-colors drop-shadow-sm font-sans">
                            {short.title}
                          </h3>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------- */}
            {/* S05 — TERBARU / LATEST NEWS FEED (POSTS 01 — 07)        */}
            {/* ------------------------------------------------------- */}
            <section
              id="s05-terbaru-feed"
              aria-labelledby="terbaru-feed-title"
              className="w-full flex flex-col"
            >
              {/* Header */}
              <div className="section-header mb-3.5 sm:mb-4">
                <h2
                  id="terbaru-feed-title"
                  className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
                >
                  TERBARU
                </h2>
                <div
                  aria-hidden="true"
                  className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
                />
              </div>

              {/* 7 News Feed Posts List (Posts 01 - 07) */}
              {so5Posts.length > 0 ? (
                <div className="news-feed-list divide-y divide-slate-200/80 sm:divide-dashed">
                  {so5Posts.map((item, idx) => (
                    <NewsFeedItem
                      key={item.id || idx}
                      post={item}
                      index={idx}
                      idPrefix="s05-post"
                      lazyLoad={idx !== 0}
                      onSelect={handlePostClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80">
                  <p className="text-slate-500 text-sm font-medium">Belum ada berita terbaru yang dipublikasikan.</p>
                </div>
              )}
            </section>

            {/* ------------------------------------------------------- */}
            {/* S06 — VIDEO TERBARU (6 VIDEO CARDS / 2-COL GRID)        */}
            {/* ------------------------------------------------------- */}
            <section
              id="s06-video-terbaru"
              aria-labelledby="video-terbaru-heading"
              className="w-full flex flex-col"
            >
              {/* Header */}
              <div className="section-header mb-3.5 sm:mb-4">
                <h2
                  id="video-terbaru-heading"
                  className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
                >
                  VIDEO TERBARU
                </h2>
                <div
                  aria-hidden="true"
                  className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
                />
              </div>

              {/* 2-Column Video Grid */}
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
                      {/* 16:9 Landscape Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                          loading="lazy"
                          decoding="async"
                        />

                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
                        />

                        {/* Centered Play Button */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#c8102e] group-hover:text-white transition-all duration-200">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white font-bold text-[11px] rounded tracking-wider backdrop-blur-xs">
                            {video.duration}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-3 group-hover:text-[#c8102e] transition-colors font-sans">
                          {video.title}
                        </h3>

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
            </section>

            {/* ------------------------------------------------------- */}
            {/* S07 — JANGAN LEWATKAN (POSTS 08 — 14 CONTINUOUS FEED)    */}
            {/* ------------------------------------------------------- */}
            <section
              id="s07-jangan-lewatkan"
              aria-labelledby="jangan-lewatkan-title"
              className="w-full flex flex-col"
            >
              {/* Header */}
              <div className="section-header mb-3.5 sm:mb-4">
                <h2
                  id="jangan-lewatkan-title"
                  className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
                >
                  JANGAN LEWATKAN
                </h2>
                <div
                  aria-hidden="true"
                  className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
                />
              </div>

              {/* 7 News Feed Posts List (Continuation of SO5) */}
              {so7Posts.length > 0 ? (
                <div className="news-feed-list divide-y divide-slate-200/80 sm:divide-dashed">
                  {so7Posts.map((item, idx) => (
                    <NewsFeedItem
                      key={item.id || item.slug || `s07-${idx + so5Posts.length}`}
                      post={item}
                      index={idx + so5Posts.length}
                      idPrefix="s07-post"
                      isLeadArticle={false}
                      lazyLoad={true}
                      onSelect={handlePostClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-medium">Belum ada berita lanjutan berikutnya.</p>
                </div>
              )}

              {/* S07.1 — CRAWLABLE PAGINATION NAVIGATION (SEO & Crawler Pathways) */}
              <div className="pt-6 sm:pt-8 pb-2 border-t border-slate-200/80 mt-6">
                <nav
                  aria-label="Navigasi Halaman Berita"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 select-none"
                >
                  {/* Previous Page Link */}
                  <a
                    href={currentPage > 1 ? `/page/${currentPage - 1}/` : '/'}
                    onClick={(e) => handlePageChange(e, Math.max(1, currentPage - 1))}
                    aria-label="Halaman Sebelumnya"
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      currentPage === 1
                        ? 'opacity-40 pointer-events-none border-slate-200 text-slate-400 bg-slate-50'
                        : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 active:scale-95 shadow-2xs'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </a>

                  {/* Page Numbers */}
                  {[1, 2, 3, 4].map((pageNum) => {
                    const pageHref = pageNum === 1 ? '/' : `/page/${pageNum}/`;
                    const isActive = currentPage === pageNum;

                    return (
                      <a
                        key={pageNum}
                        href={pageHref}
                        onClick={(e) => handlePageChange(e, pageNum)}
                        aria-label={`Buka Halaman ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-200 ${
                          isActive
                            ? 'bg-[#c8102e] text-white shadow-sm border border-[#c8102e]'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 active:scale-95'
                        }`}
                      >
                        {pageNum}
                      </a>
                    );
                  })}

                  {/* Next Page Link */}
                  <a
                    href={currentPage < totalPages ? `/page/${currentPage + 1}/` : `/page/${totalPages}/`}
                    onClick={(e) => handlePageChange(e, Math.min(totalPages, currentPage + 1))}
                    aria-label="Halaman Berikutnya"
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'opacity-40 pointer-events-none border-slate-200 text-slate-400 bg-slate-50'
                        : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 active:scale-95 shadow-2xs'
                    }`}
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </nav>
              </div>
            </section>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: UNIFIED SIDEBAR GROUP (255px on Desktop)     */}
          {/* ========================================================= */}
          <aside
            aria-label="Sidebar Berita dan Widget Terpopuler"
            className="w-full md:w-[255px] md:max-w-[255px] md:shrink-0 md:sticky md:top-[68px] self-start"
          >
            <SharedSidebar
              popularNews={popularNews}
              trendingItems={trendingItems}
              viralTopics={viralTopics}
              specialEvent={specialEvent}
              showPopular={true}
              showSpecialEvent={showSpecialEvent}
              showTrending={true}
              showViralTopics={true}
              showMoreTrendingButton={true}
              onSelectPopular={onSelectPopular}
              onSelectArticle={onSelectArticle}
              onSelectSpecialEvent={onSelectSpecialEvent}
              onSelectViralTopic={onSelectViralTopic}
            />
          </aside>

        </div>
      </div>
    </div>
  );
};
