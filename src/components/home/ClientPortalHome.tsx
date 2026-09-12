'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminArticle } from '@/src/types/admin';
import { HeroHeadlineData, defaultHeroHeadlineData, HeadlineArticleData } from '@/src/components/HeroHeadlineGrid';
import {
  LatestNewsPost,
  TrendingSidebarItem,
  SidebarSpecialCardData,
  LatestVideoItem,
  ViralTopicItem,
  PopularNewsItemData,
} from '@/src/data/latestNewsData';
import {
  mapAdminArticlesToFeedPosts,
  mapAdminArticlesToHeroData,
} from '@/src/utils/newsFormatters';
import { getStoredArticles } from '@/src/data/newsAdminStore';
import { getPublishedVideosForHomepage } from '@/src/data/videoAdminStore';
import { generateTagSlug } from '@/src/data/tagAdminStore';
import { resolveArticleSlug } from '@/src/utils/slugResolver';
import {
  categoriesData,
  hotTopicsData,
  allNewsArticles,
  videoNewsData,
  liveScheduleData,
} from '@/src/data/dummyNews';
import { NewsArticle, VideoNews } from '@/src/types/news';

// Layout & Section Components
import { SiteHeader } from '@/src/components/SiteHeader';
import { PrimaryNavigation } from '@/src/components/PrimaryNavigation';
import { TrendingTopicsBar } from '@/src/components/TrendingTopicsBar';
import { HeroHeadlineGrid } from '@/src/components/HeroHeadlineGrid';
import { MainPortalFeed } from '@/src/components/MainPortalFeed';
import { Footer } from '@/src/components/Footer';

// Modals
import { SearchModal } from '@/src/components/SearchModal';
import { ArticleModal } from '@/src/components/ArticleModal';
import { VideoPlayerModal } from '@/src/components/VideoPlayerModal';
import { LiveStreamModal } from '@/src/components/LiveStreamModal';
import { BookmarksModal } from '@/src/components/BookmarksModal';
import { MobileMenu } from '@/src/components/MobileMenu';

// Stores & Utilities
import {
  getStoredSiteSettings,
  applySiteSettingsToDOM,
  SITE_SETTINGS_UPDATED_EVENT,
} from '@/src/data/siteSettingsStore';
import {
  getStoredMaintenanceConfig,
  SYSTEM_MAINTENANCE_UPDATED_EVENT,
} from '@/src/data/systemSettingsStore';
import { MaintenancePage } from '@/src/components/common/MaintenancePage';
import { getStoredAdminSession, StoredAdminSession } from '@/src/utils/authSession';

export interface ClientPortalHomeProps {
  initialArticles?: AdminArticle[];
}

export function ClientPortalHome({ initialArticles = [] }: ClientPortalHomeProps) {
  const router = useRouter();

  // 1. Initial State Derived from Server-Passed Articles (SSG/ISR with fallback)
  const [newsFeedPosts, setNewsFeedPosts] = useState<LatestNewsPost[]>(() => {
    if (initialArticles && initialArticles.length > 0) {
      return mapAdminArticlesToFeedPosts(initialArticles);
    }
    const local = getStoredArticles();
    return mapAdminArticlesToFeedPosts(local);
  });

  const [heroHeadlineData, setHeroHeadlineData] = useState<HeroHeadlineData>(() => {
    if (initialArticles && initialArticles.length > 0) {
      return mapAdminArticlesToHeroData(initialArticles);
    }
    const local = getStoredArticles();
    return mapAdminArticlesToHeroData(local);
  });

  // UI Interactive States
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoNews | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [authAdmin, setAuthAdmin] = useState<StoredAdminSession | null>(() => getStoredAdminSession());
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => getStoredMaintenanceConfig());

  // Bookmarks state
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('batutv_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isBookmarked = (id: string) => bookmarkedArticleIds.includes(id);

  const handleToggleBookmark = (articleOrId: NewsArticle | string) => {
    const id = typeof articleOrId === 'string' ? articleOrId : articleOrId.id;
    setBookmarkedArticleIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('batutv_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const savedArticlesList = allNewsArticles.filter((a) =>
    bookmarkedArticleIds.includes(a.id)
  );

  // Scroll listener for Header / Navbar sticky effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync with CMS updates and local client storage
  useEffect(() => {
    const refreshData = () => {
      const articles = getStoredArticles();
      setNewsFeedPosts(mapAdminArticlesToFeedPosts(articles));
      setHeroHeadlineData(mapAdminArticlesToHeroData(articles));
      setMaintenanceConfig(getStoredMaintenanceConfig());
      setAuthAdmin(getStoredAdminSession());
    };

    // Apply saved site settings
    try {
      applySiteSettingsToDOM(getStoredSiteSettings());
    } catch {
      // ignore
    }

    const handleSiteSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        applySiteSettingsToDOM(customEvent.detail);
      } else {
        applySiteSettingsToDOM(getStoredSiteSettings());
      }
    };

    const handleMaintenanceUpdate = () => {
      setMaintenanceConfig(getStoredMaintenanceConfig());
    };

    // Register listeners
    window.addEventListener('batutv_news_updated', refreshData);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
    window.addEventListener(SYSTEM_MAINTENANCE_UPDATED_EVENT, handleMaintenanceUpdate);
    window.addEventListener('storage', refreshData);

    // Guaranteed cleanup
    return () => {
      window.removeEventListener('batutv_news_updated', refreshData);
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
      window.removeEventListener(SYSTEM_MAINTENANCE_UPDATED_EVENT, handleMaintenanceUpdate);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

  // Navigation handlers using Next.js useRouter()
  const handleGoHome = () => {
    setActiveCategory('home');
    setActiveTopic('');
    setSelectedArticle(null);
    router.push('/');
  };

  const handleSelectCategory = (slug: string, url?: string) => {
    if (url && url.startsWith('/video')) {
      router.push('/video');
      return;
    }
    if (url && url.startsWith('/kategori/')) {
      setActiveCategory(slug);
      router.push(url);
      return;
    }
    if (url) {
      router.push(url);
      return;
    }
    setActiveCategory(slug);
    const el = document.getElementById('latest-news-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/kategori/${slug}`);
    }
  };

  const handleSelectTopic = (topic: string) => {
    const cleanTopic = topic.replace(/^#/, '').trim();
    const tagSlug = generateTagSlug(cleanTopic);
    router.push(`/tag/${tagSlug}`);
  };

  const handleNavigateToArticle = (slugOrHref: string) => {
    const targetSlug = resolveArticleSlug(slugOrHref);
    if (targetSlug) {
      router.push(`/berita/${targetSlug}`);
    }
  };

  // Maintenance Mode check for public visitors
  if (maintenanceConfig.isEnabled && !authAdmin) {
    return <MaintenancePage onNavigateToLogin={() => router.push('/login')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-900 selection:bg-red-600 selection:text-white font-sans">
      {/* Admin Bypass Notice when Maintenance Mode is ON */}
      {maintenanceConfig.isEnabled && authAdmin && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-600 z-50 sticky top-0">
          <span>⚠️ Mode Maintenance Aktif untuk Pengunjung Publik. Anda sedang melihat situs dalam mode Bypass Admin.</span>
          <button
            onClick={() => router.push('/batutv-control/pengaturan')}
            className="underline hover:text-black font-extrabold cursor-pointer ml-2"
          >
            Kelola Pengaturan Sistem &rarr;
          </button>
        </div>
      )}

      {/* S01 — SITE HEADER */}
      <SiteHeader
        isScrolled={isScrolled}
        onOpenSearch={(query) => {
          setSearchInitialQuery(query || '');
          setIsSearchOpen(true);
        }}
        onOpenUserAccount={() => {
          router.push(authAdmin ? '/batutv-control' : '/login');
        }}
        currentUser={authAdmin}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onGoHome={handleGoHome}
      />

      {/* S02 — PRIMARY NAVIGATION */}
      <PrimaryNavigation
        isScrolled={isScrolled}
        activeSlug={activeCategory}
        currentPath="/"
        currentUser={authAdmin}
        onSelectNav={handleSelectCategory}
        onNavigate={(path) => router.push(path)}
        onGoHome={handleGoHome}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onOpenUserAccount={() => router.push(authAdmin ? '/batutv-control' : '/login')}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setIsSearchOpen(true);
        }}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full">
        {/* TOPIK BAR (# TOPIK - Positioned right above Hero Headline Grid) */}
        <TrendingTopicsBar
          topics={hotTopicsData}
          activeTopic={activeTopic}
          onSelectTopic={(topic) => handleSelectTopic(topic)}
        />

        {/* S03 — HERO / HEADLINE GRID */}
        <HeroHeadlineGrid
          data={heroHeadlineData}
          onSelectArticle={(item) => {
            const targetSlug = ('slug' in item && item.slug) ? item.slug : resolveArticleSlug(String(item.id || ('href' in item ? (item as any).href : '')));
            if (targetSlug) {
              router.push(`/berita/${targetSlug}`);
            }
          }}
          onNavigateMore={() => router.push('/tren')}
        />

        {/* SO4 — SO6 UNIFIED MAIN PORTAL FEED & SIDEBAR GROUP */}
        <MainPortalFeed
          posts={newsFeedPosts}
          videos={getPublishedVideosForHomepage(6)}
          onPlayShort={(short) => {
            const foundVideo = videoNewsData.find((v) => v.id === short.id || v.title === short.title);
            if (foundVideo) {
              setSelectedVideo(foundVideo);
            } else {
              setSelectedVideo({
                id: short.id,
                title: short.title,
                category: 'BatuTV Shorts',
                duration: short.duration || '0:50',
                thumbnailUrl: short.thumbnailUrl,
                videoEmbedId: short.videoEmbedId || 'dQw4w9WgXcQ',
                publishedAt: '26/08/2026',
                views: 2450,
                presenter: 'Redaksi BatuTV',
                program: 'BatuTV Shorts',
                description: short.title,
              });
            }
          }}
          onPlayVideo={(video) => {
            const videoItem = video as LatestVideoItem;
            const targetSlug = videoItem.slug || videoItem.id || 'menkes-ajak-anggota-dpr-bantu-warga-ntt';
            router.push(`/video/${targetSlug}`);
          }}
          onSelectPost={(item) => {
            const targetSlug = item.slug || resolveArticleSlug(String(item.id || ('href' in item ? (item as any).href : '')));
            if (targetSlug) {
              router.push(`/berita/${targetSlug}`);
            }
          }}
          onSelectPopular={(item) => {
            const targetSlug = item.slug || resolveArticleSlug(String(item.id || ('href' in item ? (item as any).href : '')));
            if (targetSlug) {
              router.push(`/berita/${targetSlug}`);
            }
          }}
          onSelectTrending={(item) => {
            const targetSlug = item.slug || resolveArticleSlug(String(item.id || ('href' in item ? (item as any).href : '')));
            if (targetSlug) {
              router.push(`/berita/${targetSlug}`);
            }
          }}
          onSelectArticle={(item) => {
            const targetSlug = ('slug' in item && (item as any).slug) ? (item as any).slug : resolveArticleSlug(String(item.id || (item as any).href || ''));
            if (targetSlug) {
              router.push(`/berita/${targetSlug}`);
            }
          }}
          onSelectSpecialEvent={(_event: SidebarSpecialCardData) => {
            router.push(`/berita/dialog-nasional-batutv-2026`);
          }}
          onSelectViralTopic={(topic: ViralTopicItem) => {
            const targetSlug = topic.slug || generateTagSlug(topic.title.replace(/^#/, ''));
            router.push(`/tag/${targetSlug}`);
          }}
        />
      </main>

      {/* FOOTER */}
      <Footer
        categories={categoriesData}
        onSelectCategory={handleSelectCategory}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onNavigateAdmin={() => router.push(authAdmin ? '/batutv-control' : '/login')}
        onNavigate={(path) => router.push(path)}
      />

      {/* Interactive Modals */}
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={allNewsArticles}
        onSelectArticle={(art: any) => {
          setSelectedArticle(art);
          if (art?.slug) {
            router.push(`/berita/${art.slug}`);
          }
        }}
        initialQuery={searchInitialQuery}
      />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectRelated={(art: any) => {
          setSelectedArticle(art);
          if (art?.slug) {
            router.push(`/berita/${art.slug}`);
          }
        }}
        relatedArticles={allNewsArticles.filter(
          (a) => a.id !== selectedArticle?.id && a.category === selectedArticle?.category
        )}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleToggleBookmark}
        fontSizeLevel={fontSizeLevel}
        onChangeFontSize={setFontSizeLevel}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={setSelectedVideo}
        allVideos={videoNewsData}
      />

      {/* Live Stream Modal */}
      <LiveStreamModal
        isOpen={isLiveStreamOpen}
        onClose={() => setIsLiveStreamOpen(false)}
        schedule={liveScheduleData}
      />

      {/* Bookmarks Drawer Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedArticles={savedArticlesList}
        onSelectArticle={(art: any) => {
          setSelectedArticle(art);
          if (art?.slug) {
            router.push(`/berita/${art.slug}`);
          }
        }}
        onRemoveBookmark={(id) => setBookmarkedArticleIds((prev) => prev.filter((i) => i !== id))}
        onClearAllBookmarks={() => setBookmarkedArticleIds([])}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categoriesData}
        activeCategory={activeCategory}
        currentPath="/"
        onSelectCategory={handleSelectCategory}
        onNavigate={(path) => router.push(path)}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setIsSearchOpen(true);
        }}
        hotTopics={hotTopicsData}
        onSelectTopic={handleSelectTopic}
        onNavigateLogin={() => router.push(authAdmin ? '/batutv-control' : '/login')}
      />
    </div>
  );
}
export default ClientPortalHome;
