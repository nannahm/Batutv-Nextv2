import React from 'react';
import {
  LatestNewsPost,
  defaultLatestNewsPosts,
  SidebarSpecialCardData,
  defaultSidebarSpecialCard,
  TrendingSidebarItem,
  defaultTrendingSidebarItems,
  PopularNewsItemData,
  defaultPopularNews,
  ViralTopicItem,
  defaultViralTopics,
} from '../data/latestNewsData';
import { SharedSidebar } from './SharedSidebar';
import { NewsFeedItem } from './NewsFeedItem';
import { NewsArticle } from '../types/news';

export interface DontMissSectionProps {
  posts?: LatestNewsPost[];
  popularNews?: PopularNewsItemData[];
  trendingItems?: TrendingSidebarItem[];
  viralTopics?: ViralTopicItem[];
  specialEvent?: SidebarSpecialCardData;
  showSpecialEvent?: boolean;
  onSelectPost?: (post: LatestNewsPost) => void;
  onSelectPopular?: (item: PopularNewsItemData) => void;
  onSelectTrending?: (item: TrendingSidebarItem) => void;
  onSelectArticle?: (article: NewsArticle | LatestNewsPost | TrendingSidebarItem | PopularNewsItemData) => void;
  onSelectSpecialEvent?: (event: SidebarSpecialCardData) => void;
  onSelectViralTopic?: (topic: ViralTopicItem) => void;
}

/**
 * S07 — JANGAN LEWATKAN / LANJUTAN BERITA TERBARU + SHARED SIDEBAR
 * 
 * Continuation of S05 (Terbaru):
 * Displays posts 08 to 14 from the continuous latest news feed.
 */
export const DontMissSection: React.FC<DontMissSectionProps> = ({
  posts = defaultLatestNewsPosts,
  popularNews = defaultPopularNews,
  trendingItems = defaultTrendingSidebarItems,
  viralTopics = defaultViralTopics,
  specialEvent = defaultSidebarSpecialCard,
  showSpecialEvent = false,
  onSelectPost,
  onSelectPopular,
  onSelectTrending,
  onSelectArticle,
  onSelectSpecialEvent,
  onSelectViralTopic,
}) => {
  const SO5_LIMIT = 7;
  const SO7_LIMIT = 7;
  const so7Posts = posts.slice(SO5_LIMIT, SO5_LIMIT + SO7_LIMIT);

  const handlePostClick = (item: LatestNewsPost) => {
    if (onSelectPost) {
      onSelectPost(item);
    } else if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  return (
    <section
      id="s07-jangan-lewatkan-standalone"
      aria-label="Jangan Lewatkan - Berita Lanjutan BatuTV"
      className="dont-miss-section w-full py-3 sm:py-4 pb-8 sm:pb-12"
    >
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Content: 7 News Posts (8 / 12 cols = ~68-72%) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Section Header */}
            <div className="section-header mb-3.5 sm:mb-4">
              <h2
                id="standalone-jangan-lewatkan-title"
                className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
              >
                JANGAN LEWATKAN
              </h2>
              {/* Short Red Accent Line */}
              <div
                aria-hidden="true"
                className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
              />
            </div>

            {/* 7 News Feed Posts (Continuation of SO5) */}
            {so7Posts.length > 0 ? (
              <div className="news-feed-list divide-y divide-slate-200/80 sm:divide-dashed">
                {so7Posts.map((item, idx) => (
                  <NewsFeedItem
                    key={item.id || item.slug || `s07-standalone-${idx + SO5_LIMIT}`}
                    post={item}
                    index={idx + SO5_LIMIT}
                    idPrefix="s07-standalone-post"
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
          </div>

          {/* Shared Sidebar (4 / 12 cols = ~28-32%) */}
          <div className="lg:col-span-4 w-full">
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
          </div>

        </div>
      </div>
    </section>
  );
};
