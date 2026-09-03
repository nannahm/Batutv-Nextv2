import React from 'react';
import {
  LatestNewsPost,
  defaultLatestNewsPosts,
  SidebarSpecialCardData,
  TrendingSidebarItem,
} from '../data/latestNewsData';
import { SharedSidebar } from './SharedSidebar';
import { NewsFeedItem } from './NewsFeedItem';
import { NewsArticle } from '../types/news';

interface LatestNewsSectionProps {
  posts?: LatestNewsPost[];
  onSelectPost?: (post: LatestNewsPost | NewsArticle | TrendingSidebarItem) => void;
  onSelectSpecialEvent?: (event: SidebarSpecialCardData) => void;
}

/**
 * S05 — TERBARU / NEWS FEED + SHARED SIDEBAR BATUTV
 * 
 * S05.1 — SECTION HEADER: "TERBARU" + Accent Line
 * S05.2 — NEWS FEED: Exactly 7 News Posts with horizontal image, title, metadata & excerpt
 * SHARED SIDEBAR: Integrated 2-column layout on desktop (70/30) with special card & trending list
 */
export const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  posts = defaultLatestNewsPosts,
  onSelectPost,
  onSelectSpecialEvent,
}) => {
  // Enforce exactly 7 posts on initial render as mandated
  const displayPosts = posts.slice(0, 7);

  const handlePostClick = (item: LatestNewsPost) => {
    if (onSelectPost) {
      onSelectPost(item);
    }
  };

  return (
    <section
      id="s05-terbaru-news-feed"
      aria-label="Berita Terbaru BatuTV"
      className="latest-news-section w-full py-2.5 sm:py-3 pb-8 sm:pb-10"
    >
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* S05.1 & S05.2 — MAIN CONTENT: 7 LATEST NEWS POSTS (8 / 12 cols = ~68-72%) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* S05.1 — Section Header */}
            <div className="section-header mb-3.5 sm:mb-4">
              <h2
                id="terbaru-section-title"
                className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
              >
                TERBARU
              </h2>
              {/* Short Red Accent Line */}
              <div
                aria-hidden="true"
                className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
              />
            </div>

            {/* S05.2 — 7 News Feed Posts List */}
            <div className="news-feed-list divide-y divide-slate-200/80 sm:divide-dashed">
              {displayPosts.map((item, idx) => (
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
          </div>

          {/* S05 — SHARED SIDEBAR (4 / 12 cols = ~28-32%) */}
          <div className="lg:col-span-4 w-full">
            <SharedSidebar
              onSelectArticle={onSelectPost}
              onSelectSpecialEvent={onSelectSpecialEvent}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

