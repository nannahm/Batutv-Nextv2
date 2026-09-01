import React from 'react';
import {
  TrendingSidebarItem,
  SidebarSpecialCardData,
  ViralTopicItem,
  PopularNewsItemData,
  defaultSidebarSpecialCard,
  defaultTrendingSidebarItems,
  defaultViralTopics,
  defaultPopularNews,
} from '../data/latestNewsData';
import { NewsArticle } from '../types/news';
import { SidebarAdBannerSlot } from './NewsHomepageLayout';

export interface SharedSidebarProps {
  popularNews?: PopularNewsItemData[];
  specialEvent?: SidebarSpecialCardData;
  trendingItems?: TrendingSidebarItem[];
  viralTopics?: ViralTopicItem[];
  showPopular?: boolean;
  showSpecialEvent?: boolean;
  showTrending?: boolean;
  showViralTopics?: boolean;
  showMoreTrendingButton?: boolean;
  showAdBanner?: boolean;
  adBannerSize?: 'medium' | 'skyscraper';
  showSkyscraperAd?: boolean;
  adBannerUrl?: string;
  adTargetUrl?: string;
  onSelectArticle?: (article: NewsArticle | TrendingSidebarItem | PopularNewsItemData) => void;
  onSelectPopular?: (item: PopularNewsItemData) => void;
  onSelectSpecialEvent?: (event: SidebarSpecialCardData) => void;
  onSelectViralTopic?: (topic: ViralTopicItem) => void;
  className?: string;
}

/**
 * UNIFIED SHARED SIDEBAR (SO4 — SO6)
 * 
 * Unified continuous sidebar group (255px width on desktop) containing:
 * 1. Berita Terpopuler Widget (#1 to #4 circular red badges)
 * 2. Special Event / Topic Highlight Card (Optional)
 * 3. 255px x 213px Medium Ad Banner Slot (Optional)
 * 4. Trending News Widget (thumbnails + "SELENGKAPNYA »" button)
 * 5. Viral Topic Widget (ranked badges #1 to #5 with article counts)
 * 6. 255px x 510px Skyscraper Ad Banner Slot (Optional)
 */
export const SharedSidebar: React.FC<SharedSidebarProps> = ({
  popularNews = defaultPopularNews,
  specialEvent = defaultSidebarSpecialCard,
  trendingItems = defaultTrendingSidebarItems,
  viralTopics = defaultViralTopics,
  showPopular = true,
  showSpecialEvent = false,
  showTrending = true,
  showViralTopics = true,
  showMoreTrendingButton = true,
  showAdBanner = false,
  adBannerSize = 'medium',
  showSkyscraperAd = false,
  adBannerUrl,
  adTargetUrl,
  onSelectArticle,
  onSelectPopular,
  onSelectSpecialEvent,
  onSelectViralTopic,
  className = '',
}) => {
  const handlePopularClick = (e: React.MouseEvent<HTMLAnchorElement>, item: PopularNewsItemData) => {
    e.preventDefault();
    if (onSelectPopular) {
      onSelectPopular(item);
    } else if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  const handleTrendingClick = (e: React.MouseEvent<HTMLAnchorElement>, item: TrendingSidebarItem) => {
    e.preventDefault();
    if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  const handleSpecialEventClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (onSelectSpecialEvent) {
      onSelectSpecialEvent(specialEvent);
    }
  };

  const handleViralTopicClick = (e: React.MouseEvent<HTMLAnchorElement>, topic: ViralTopicItem) => {
    e.preventDefault();
    if (onSelectViralTopic) {
      onSelectViralTopic(topic);
    }
  };

  return (
    <aside
      id="batutv-shared-sidebar"
      aria-label="Sidebar Berita dan Trending BatuTV"
      className={`shared-sidebar w-full space-y-6 lg:space-y-6 ${className}`}
    >
      {/* 1. BERITA TERPOPULER WIDGET (S04) */}
      {showPopular && popularNews && popularNews.length > 0 && (
        <div
          id="sidebar-popular-widget"
          className="popular-widget bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none"
        >
          {/* Section Header */}
          <div className="mb-3.5 sm:mb-4">
            <h3
              id="sidebar-popular-title"
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase font-sans"
            >
              BERITA TERPOPULER
            </h3>
            {/* Short Red Accent Line */}
            <div
              aria-hidden="true"
              className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
            />
          </div>

          {/* Popular List with Circular Number Badges */}
          <div className="divide-y divide-slate-100/80">
            {popularNews.slice(0, 4).map((item) => (
              <article
                key={item.id || item.rank}
                id={`sidebar-popular-item-${item.rank}`}
                className="popular-item py-2.5 first:pt-0 last:pb-0 group"
              >
                <a
                  href={item.href}
                  onClick={(e) => handlePopularClick(e, item)}
                  aria-label={`Berita terpopuler peringkat ${item.rank}: ${item.title}`}
                  className="flex items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md p-0.5 -m-0.5"
                >
                  {/* Red Circular Rank Badge */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#c8102e] text-white font-extrabold text-xs sm:text-[13px] flex items-center justify-center shadow-none group-hover:scale-105 transition-transform">
                      {item.rank}
                    </span>
                  </div>

                  {/* News Title */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-800 leading-snug group-hover:text-[#c8102e] transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    {item.category && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <span className="uppercase text-[#c8102e] font-bold">{item.category}</span>
                        {item.date && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>{item.date}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 2. SPECIAL EVENT / EDITORIAL CARD (Optional) */}
      {showSpecialEvent && specialEvent && (
        <div
          id="sidebar-special-card"
          className="bg-[#0b1320] text-white rounded-xl p-5 sm:p-6 border border-slate-800/80 shadow-sm relative overflow-hidden group"
        >
          {/* Subtle background glow effect */}
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"
          />

          <div className="relative z-10 space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-500 block mb-1">
                AGENDA SPESIAL BATUTV
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight font-sans">
                {specialEvent.title}
              </h3>
              {specialEvent.subtitle && (
                <p className="text-xs text-slate-300 font-medium mt-1">
                  {specialEvent.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs border-y border-slate-800/80 py-3">
              {specialEvent.eventDate && (
                <div className="text-slate-300">
                  <span className="text-slate-400 block text-[11px]">Jadwal Siaran:</span>
                  <span className="font-semibold text-white">{specialEvent.eventDate}</span>
                </div>
              )}
              {specialEvent.speaker && (
                <div className="text-slate-300">
                  <span className="text-slate-400 block text-[11px]">Narasumber:</span>
                  <span className="font-semibold text-white">{specialEvent.speaker}</span>
                  {specialEvent.speakerDate && (
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {specialEvent.speakerDate}
                    </span>
                  )}
                </div>
              )}
            </div>

            <a
              href={specialEvent.href}
              onClick={handleSpecialEventClick}
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full border border-white/80 text-white hover:bg-white hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <span>{specialEvent.buttonText}</span>
            </a>
          </div>
        </div>
      )}

      {/* 2.5 OPTIONAL MEDIUM AD BANNER SLOT (255px x 213px) */}
      {showAdBanner && (
        <SidebarAdBannerSlot
          id="sidebar-ad-medium"
          size={adBannerSize}
          bannerUrl={adBannerUrl}
          targetUrl={adTargetUrl}
        />
      )}

      {/* 3. TRENDING WIDGET */}
      {showTrending && (
        <div id="sidebar-trending-widget" className="trending-widget bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none">
          {/* Section Header */}
          <div className="mb-3.5 sm:mb-4">
            <h3
              id="sidebar-trending-title"
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase font-sans"
            >
              TRENDING
            </h3>
            {/* Short Red Accent Line */}
            <div
              aria-hidden="true"
              className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
            />
          </div>

          {/* Trending News List */}
          <div className="divide-y divide-slate-100/80">
            {trendingItems.map((item, idx) => (
              <article
                key={item.id || idx}
                id={`sidebar-trending-item-${item.id}`}
                className="trending-item py-3.5 first:pt-0 last:pb-0 group"
              >
                <a
                  href={item.href}
                  onClick={(e) => handleTrendingClick(e, item)}
                  aria-label={`Trending: ${item.title}`}
                  className="flex items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg p-1 -m-1"
                >
                  {/* Compact Thumbnail Image */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-100 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      loading="lazy"
                    />
                  </div>

                  {/* Content: Title + Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-[#c8102e] transition-colors font-sans">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <span className="text-[#c8102e] uppercase font-bold">{item.category}</span>
                      <span className="text-slate-300 font-light">|</span>
                      <time dateTime={`${item.date}T${item.time}`} className="text-slate-400 font-normal">
                        {item.date} - {item.time}
                      </time>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>

          {/* Selengkapnya Button (Solid Red) */}
          {showMoreTrendingButton && (
            <div className="pt-4 mt-2 border-t border-slate-100/80">
              <a
                href="/trending"
                onClick={(e) => {
                  e.preventDefault();
                  if (trendingItems.length > 0 && onSelectArticle) {
                    onSelectArticle(trendingItems[0]);
                  }
                }}
                className="w-full py-2.5 px-4 bg-[#8b181b] hover:bg-[#a31a1e] text-white font-black text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span>SELENGKAPNYA</span>
                <span className="text-sm leading-none font-sans">»</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* 4. VIRAL TOPIC WIDGET */}
      {showViralTopics && viralTopics && viralTopics.length > 0 && (
        <div id="sidebar-viral-widget" className="viral-widget bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none">
          {/* Section Header */}
          <div className="mb-3.5 sm:mb-4">
            <h3
              id="sidebar-viral-title"
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase font-sans"
            >
              VIRAL
            </h3>
            {/* Short Red Accent Line */}
            <div
              aria-hidden="true"
              className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
            />
          </div>

          {/* Viral Topics Ranked List */}
          <div className="divide-y divide-slate-100/80">
            {viralTopics.map((topic, idx) => (
              <article
                key={topic.rank || idx}
                id={`sidebar-viral-item-${topic.rank}`}
                className="viral-topic-item py-3 first:pt-0 last:pb-0 group"
              >
                <a
                  href={topic.href}
                  onClick={(e) => handleViralTopicClick(e, topic)}
                  aria-label={`Topik Viral #${topic.rank}: ${topic.title}`}
                  className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg p-1 -m-1"
                >
                  {/* Black Square Badge with White Number */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-[#1e2329] text-white rounded-lg flex items-center justify-center font-black text-sm sm:text-base font-sans tracking-tighter shadow-none group-hover:bg-[#c8102e] transition-colors">
                    #{topic.rank}
                  </div>

                  {/* Topic Title & Article Count */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-[#c8102e] transition-colors font-sans truncate">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {topic.articleCount.toLocaleString('id-ID')} artikel
                    </p>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 5. OPTIONAL SKYSCRAPER AD BANNER SLOT (255px x 510px) */}
      {showSkyscraperAd && (
        <SidebarAdBannerSlot
          id="sidebar-ad-skyscraper"
          size="skyscraper"
          bannerUrl={adBannerUrl}
          targetUrl={adTargetUrl}
        />
      )}
    </aside>
  );
};

