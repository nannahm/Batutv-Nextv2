import React, { useState, useEffect } from 'react';
import {
  categoriesData,
  hotTopicsData,
  breakingNewsData,
  weatherData,
  liveScheduleData,
  heroLeadArticle,
  heroCompanionArticles,
  allNewsArticles,
  trendingRankingArticles,
  videoNewsData,
  regionalBatuArticles,
  editorPickArticles,
} from './data/dummyNews';
import { NewsArticle, VideoNews } from './types/news';
import { TopBar } from './components/TopBar';
import { BreakingNews } from './components/BreakingNews';
import { SiteHeader } from './components/SiteHeader';
import { PrimaryNavigation } from './components/PrimaryNavigation';
import { HeroHeadlineGrid } from './components/HeroHeadlineGrid';
import { getHeroHeadlineData, getPublishedNewsFeedPosts } from './data/newsAdminStore';
import { getPublishedVideosForHomepage } from './data/videoAdminStore';
import { generateTagSlug } from './data/tagAdminStore';
import { resolveArticleSlug } from './utils/slugResolver';
import { MainPortalFeed } from './components/MainPortalFeed';
import { ShortVideoItem } from './components/ShortsAndSidebar';
import {
  LatestNewsPost,
  TrendingSidebarItem,
  SidebarSpecialCardData,
  LatestVideoItem,
  ViralTopicItem,
  PopularNewsItemData,
} from './data/latestNewsData';
import { Navbar } from './components/Navbar';
import { TrendingTopicsBar } from './components/TrendingTopicsBar';
import { HeroNews } from './components/HeroNews';
import { LatestNews } from './components/LatestNews';
import { TrendingSection } from './components/TrendingSection';
import { VideoSection } from './components/VideoSection';
import { RegionalSpotlight } from './components/RegionalSpotlight';
import { RecommendedNews } from './components/RecommendedNews';
import { SearchModal } from './components/SearchModal';
import { ArticleModal } from './components/ArticleModal';
import { LiveStreamModal } from './components/LiveStreamModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { BookmarksModal } from './components/BookmarksModal';
import { MobileMenu } from './components/MobileMenu';
import { Footer } from './components/Footer';
import { LoginPage } from './components/admin/LoginPage';
import { DashboardLayout } from './components/admin/DashboardLayout';
import { ArticleDetailPage, defaultSpecificArticle } from './components/article/ArticleDetailPage';
import { VideoDetailPage } from './components/video/VideoDetailPage';
import { CategoryArchivePage } from './components/category/CategoryArchivePage';
import { TagArchivePage } from './components/tag/TagArchivePage';
import { AuthorArchivePage } from './components/author/AuthorArchivePage';
import { InformationPageView } from './components/page/InformationPageView';
import { NotFoundPage } from './components/common/NotFoundPage';
import { SeoViewerPage } from './components/seo/SeoViewerPage';
import {
  isArticlePublished,
  isVideoPublished,
  isCategoryExists,
  isTagExists,
  isAuthorExists,
  isStaticPagePublished,
} from './utils/slugResolver';
import {
  getStoredAdminSession,
  saveAdminSession,
  clearAdminSession,
} from './utils/authSession';
import {
  getStoredSiteSettings,
  applySiteSettingsToDOM,
  SITE_SETTINGS_UPDATED_EVENT,
} from './data/siteSettingsStore';
import {
  getStoredMaintenanceConfig,
  SYSTEM_MAINTENANCE_UPDATED_EVENT,
  logSystemActivity,
} from './data/systemSettingsStore';
import { MaintenancePage } from './components/common/MaintenancePage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { ROLE_PERMISSIONS_MATRIX } from './data/userAdminStore';

export default function App() {
  // Routing State for /batutv-control/login & Public Portal
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [authAdmin, setAuthAdmin] = useState<{
    name: string;
    email: string;
    role: string;
    uid?: string;
  } | null>(() => {
    return getStoredAdminSession();
  });

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If user is already authenticated and lands on /batutv-control/login, update address bar to /batutv-control/dashboard
  useEffect(() => {
    if (authAdmin && currentPath === '/batutv-control/login') {
      try {
        window.history.replaceState({}, '', '/batutv-control/dashboard');
      } catch {
        // ignore
      }
      setCurrentPath('/batutv-control/dashboard');
    }
  }, [authAdmin, currentPath]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idTokenResult = await fbUser.getIdTokenResult();
          const claimRole = idTokenResult.claims.role as string | undefined;

          let userName = fbUser.displayName || 'Pengguna CMS';
          let userRole = claimRole || 'admin';

          try {
            const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (userSnap.exists()) {
              const uData = userSnap.data();
              userName = uData.fullName || uData.name || userName;
              userRole = uData.role || userRole;
            } else {
              const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
              if (adminSnap.exists()) {
                const aData = adminSnap.data();
                userName = aData.fullName || aData.name || userName;
                userRole = aData.role || userRole;
              }
            }
          } catch {
            // ignore
          }

          const formattedRole =
            ROLE_PERMISSIONS_MATRIX[userRole as keyof typeof ROLE_PERMISSIONS_MATRIX]?.name ||
            userRole;

          const newAuthData = {
            name: userName,
            email: fbUser.email || 'admin@batutv.id',
            role: formattedRole,
            uid: fbUser.uid,
          };

          saveAdminSession(newAuthData);
          setAuthAdmin(newAuthData);
        } catch (err) {
          console.warn('Error hydrating auth state:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogout = async () => {
    if (authAdmin) {
      logSystemActivity(
        authAdmin,
        'Logout CMS',
        `Pengguna ${authAdmin.name} (${authAdmin.role}) keluar dari sesi BatuTV Control`,
        'info',
        'Auth'
      );
    }
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    clearAdminSession();
    setAuthAdmin(null);
    navigateTo('/batutv-control/login');
  };

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', path);
      } catch {
        // ignore
      }
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State Management
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoNews | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: Small, 1: Normal, 2: Large
  const [newsFeedPosts, setNewsFeedPosts] = useState<LatestNewsPost[]>(() => getPublishedNewsFeedPosts());
  const [heroHeadlineData, setHeroHeadlineData] = useState(() => getHeroHeadlineData());
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => getStoredMaintenanceConfig());

  // Listen to CMS publish/update events and route transitions
  useEffect(() => {
    const refreshData = () => {
      setNewsFeedPosts(getPublishedNewsFeedPosts());
      setHeroHeadlineData(getHeroHeadlineData());
      setMaintenanceConfig(getStoredMaintenanceConfig());
    };
    refreshData();

    // Initialize and apply Site Settings to DOM (Title, Favicon, Meta, Colors, CSS vars, Schema)
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

    window.addEventListener('batutv_news_updated', refreshData);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
    window.addEventListener(SYSTEM_MAINTENANCE_UPDATED_EVENT, handleMaintenanceUpdate);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('batutv_news_updated', refreshData);
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
      window.removeEventListener(SYSTEM_MAINTENANCE_UPDATED_EVENT, handleMaintenanceUpdate);
      window.removeEventListener('storage', refreshData);
    };
  }, [currentPath]);

  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('batutv_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('batutv_bookmarks', JSON.stringify(bookmarkedArticleIds));
    } catch {
      // ignore storage limits
    }
  }, [bookmarkedArticleIds]);

  // Keyboard shortcut (⌘K or Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsLiveStreamOpen(false);
        setIsBookmarksOpen(false);
        setIsMobileMenuOpen(false);
        if (selectedArticle) setSelectedArticle(null);
        if (selectedVideo) setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, selectedVideo]);

  // Scroll detection for Sticky Header Shrink Transformation
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle Bookmark
  const handleToggleBookmark = (article: NewsArticle) => {
    setBookmarkedArticleIds((prev) =>
      prev.includes(article.id)
        ? prev.filter((id) => id !== article.id)
        : [...prev, article.id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedArticleIds.includes(id);

  const savedArticlesList = allNewsArticles.filter((art) =>
    bookmarkedArticleIds.includes(art.id)
  );

  const handleSelectBreaking = (title: string) => {
    const found = allNewsArticles.find((a) => a.title.toLowerCase().includes(title.toLowerCase().slice(0, 20)));
    if (found) {
      setSelectedArticle(found);
      navigateTo(`/berita/${found.slug}`);
    } else {
      setSearchInitialQuery(title.slice(0, 25));
      setIsSearchOpen(true);
    }
  };

  const handleSelectTopic = (topic: string) => {
    const cleanTag = topic.replace(/^#/, '').trim();
    const tagSlug = generateTagSlug(cleanTag);
    setActiveTopic(topic);
    navigateTo(`/tag/${tagSlug}`);
  };

  const handleSelectCategory = (slug: string, url?: string) => {
    if (slug === 'live') {
      setIsLiveStreamOpen(true);
      return;
    }
    if (slug === 'home' || url === '/') {
      handleGoHome();
      return;
    }
    if (slug === 'video' || url === '/video') {
      setActiveCategory('video');
      navigateTo('/video');
      return;
    }

    if (url && url.startsWith('/kategori/')) {
      setActiveCategory(slug);
      navigateTo(url);
      return;
    }

    if (url) {
      navigateTo(url);
      return;
    }

    setActiveCategory(slug);
    if (currentPath !== '/') {
      navigateTo(`/kategori/${slug}`);
    } else {
      const el = document.getElementById('latest-news-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGoHome = () => {
    setActiveCategory('home');
    setActiveTopic('');
    setSelectedArticle(null);
    navigateTo('/');
  };

  // Check special SEO routes
  const isSitemapXml = currentPath === '/sitemap.xml';
  const isNewsSitemapXml = currentPath === '/sitemap-news.xml';
  const isRobotsTxt = currentPath === '/robots.txt';

  // Check if current route is Article Detail Page
  const isArticleDetailPage = currentPath.startsWith('/berita');
  const articleSlug = isArticleDetailPage
    ? currentPath.replace(/^\/berita\/?/, '').split('?')[0].split('#')[0].trim()
    : '';
  const isArticleValid = isArticleDetailPage && Boolean(articleSlug) && isArticlePublished(articleSlug);

  // Check if current route is Video Detail Page
  const isVideoDetailPage = currentPath.startsWith('/video');
  const videoSlug = isVideoDetailPage
    ? currentPath.replace(/^\/video\/?/, '').split('?')[0].split('#')[0].trim()
    : '';
  const isVideoValid = isVideoDetailPage && (!videoSlug || isVideoPublished(videoSlug));

  // Check if current route is Category Archive Page
  const isCategoryArchivePage = currentPath.startsWith('/kategori');
  const categoryArchiveSlug = isCategoryArchivePage
    ? currentPath.replace(/^\/kategori\/?/, '').split('?')[0].split('#')[0].trim()
    : '';
  const isCategoryValid = isCategoryArchivePage && Boolean(categoryArchiveSlug) && isCategoryExists(categoryArchiveSlug);

  // Check if current route is Tag Archive Page
  const isTagArchivePage = currentPath.startsWith('/tag');
  const tagArchiveSlug = isTagArchivePage
    ? currentPath.replace(/^\/tag\/?/, '').split('?')[0].split('#')[0].trim()
    : '';
  const isTagValid = isTagArchivePage && Boolean(tagArchiveSlug) && isTagExists(tagArchiveSlug);

  // Check if current route is Author Archive Page (/penulis/:slug)
  const isAuthorArchivePage = currentPath.startsWith('/penulis');
  const authorArchiveSlug = isAuthorArchivePage
    ? currentPath.replace(/^\/penulis\/?/, '').split('?')[0].split('#')[0].trim()
    : '';
  const isAuthorValid = isAuthorArchivePage && Boolean(authorArchiveSlug) && isAuthorExists(authorArchiveSlug);

  // Check if current route is Static Information Page (/tentang-kami, /kontak-kami, /pedoman-media-siber, etc.)
  const isPotentialInformationPage =
    currentPath !== '/' &&
    !isSitemapXml &&
    !isNewsSitemapXml &&
    !isRobotsTxt &&
    !isArticleDetailPage &&
    !isVideoDetailPage &&
    !isCategoryArchivePage &&
    !isTagArchivePage &&
    !isAuthorArchivePage &&
    !currentPath.startsWith('/batutv-control');

  const informationPageSlug = isPotentialInformationPage
    ? currentPath.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').trim()
    : '';
  const isInformationPageValid = isPotentialInformationPage && Boolean(informationPageSlug) && isStaticPagePublished(informationPageSlug);

  // Determine if current route is an invalid / 404 path
  const isNotFoundPage =
    (isArticleDetailPage && !isArticleValid) ||
    (isVideoDetailPage && !isVideoValid) ||
    (isCategoryArchivePage && !isCategoryValid) ||
    (isTagArchivePage && !isTagValid) ||
    (isAuthorArchivePage && !isAuthorValid) ||
    (isPotentialInformationPage && !isInformationPageValid);

  // Handle /batutv-control/login and Admin Routes
  if (currentPath.startsWith('/batutv-control')) {
    // If not authenticated, redirect all protected admin routes to login
    if (!authAdmin) {
      return (
        <LoginPage
          onLoginSuccess={(user) => {
            logSystemActivity(
              user,
              'Login CMS',
              `Pengguna ${user.name} (${user.role}) berhasil masuk ke dashboard BatuTV Control`,
              'success',
              'Auth'
            );
            saveAdminSession(user);
            setAuthAdmin(user);
            const targetPath =
              currentPath && currentPath !== '/batutv-control/login'
                ? currentPath
                : '/batutv-control/dashboard';
            navigateTo(targetPath);
          }}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // If authenticated and currently on login page, redirect to dashboard
    if (currentPath === '/batutv-control/login') {
      return (
        <DashboardLayout
          currentPath="/batutv-control/dashboard"
          user={authAdmin}
          onNavigate={navigateTo}
          onLogout={handleAdminLogout}
        />
      );
    }

    // Authenticated admin view for /batutv-control/dashboard and subroutes
    return (
      <DashboardLayout
        currentPath={currentPath}
        user={authAdmin}
        onNavigate={navigateTo}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Handle Maintenance Mode for public visitors
  if (maintenanceConfig.isEnabled && !authAdmin) {
    return <MaintenancePage onNavigateToLogin={() => navigateTo('/batutv-control/login')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-900 selection:bg-red-600 selection:text-white font-sans">
      {/* Admin Bypass Notice when Maintenance Mode is ON */}
      {maintenanceConfig.isEnabled && authAdmin && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-600 z-50 sticky top-0">
          <span>⚠️ Mode Maintenance Aktif untuk Pengunjung Publik. Anda sedang melihat situs dalam mode Bypass Admin.</span>
          <button
            onClick={() => navigateTo('/batutv-control/pengaturan')}
            className="underline hover:text-black font-extrabold cursor-pointer ml-2"
          >
            Kelola Pengaturan Sistem &rarr;
          </button>
        </div>
      )}

      {/* S01 — SITE HEADER (Scrolls naturally out of view) */}
      <SiteHeader
        isScrolled={isScrolled}
        onOpenSearch={(query) => {
          setSearchInitialQuery(query || '');
          setIsSearchOpen(true);
        }}
        onOpenUserAccount={() => {
          navigateTo('/batutv-control/login');
        }}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onGoHome={handleGoHome}
      />

      {/* S02 — PRIMARY NAVIGATION (Sticky pinned to top of viewport like kompas.tv / tvonenews) */}
      <PrimaryNavigation
        isScrolled={isScrolled}
        activeSlug={isCategoryArchivePage && isCategoryValid ? categoryArchiveSlug : activeCategory}
        currentPath={currentPath}
        onSelectNav={handleSelectCategory}
        onNavigate={navigateTo}
        onGoHome={handleGoHome}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onOpenUserAccount={() => navigateTo('/batutv-control/login')}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setIsSearchOpen(true);
        }}
      />

      {/* MAIN CONTENT AREA */}
      {isSitemapXml ? (
        <SeoViewerPage type="sitemap" onNavigate={navigateTo} />
      ) : isNewsSitemapXml ? (
        <SeoViewerPage type="news-sitemap" onNavigate={navigateTo} />
      ) : isRobotsTxt ? (
        <SeoViewerPage type="robots" onNavigate={navigateTo} />
      ) : isNotFoundPage ? (
        <NotFoundPage
          onNavigate={navigateTo}
          requestedPath={currentPath}
          onOpenSearch={(query) => {
            setSearchInitialQuery(query || '');
            setIsSearchOpen(true);
          }}
        />
      ) : isArticleDetailPage ? (
        <ArticleDetailPage
          slug={articleSlug}
          article={selectedArticle}
          onNavigate={navigateTo}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            navigateTo('/');
          }}
          onSelectTag={(tag) => {
            const cleanTag = tag.replace(/^#/, '').trim();
            const tagSlug = generateTagSlug(cleanTag);
            navigateTo(`/tag/${tagSlug}`);
          }}
          onSelectAuthor={(author) => {
            setSearchInitialQuery(author);
            setIsSearchOpen(true);
          }}
          onBookmark={handleToggleBookmark}
          isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : isBookmarked(defaultSpecificArticle.id)}
        />
      ) : isVideoDetailPage ? (
        <VideoDetailPage
          slug={videoSlug || undefined}
          onNavigate={navigateTo}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            navigateTo('/');
          }}
          onSelectTag={(tag) => {
            const cleanTag = tag.replace(/^#/, '').trim();
            const tagSlug = generateTagSlug(cleanTag);
            navigateTo(`/tag/${tagSlug}`);
          }}
          onSelectAuthor={(author) => {
            setSearchInitialQuery(author);
            setIsSearchOpen(true);
          }}
          onBookmark={handleToggleBookmark}
          isBookmarked={isBookmarked(videoSlug || 'vid-001')}
        />
      ) : isCategoryArchivePage ? (
        <CategoryArchivePage
          slug={categoryArchiveSlug || 'politik'}
          onNavigate={navigateTo}
          onSelectArticle={(slug) => navigateTo(`/berita/${slug}`)}
          onSelectVideo={(slug) => navigateTo(`/video/${slug}`)}
        />
      ) : isTagArchivePage ? (
        <TagArchivePage
          slug={tagArchiveSlug || 'kota-batu'}
          onNavigate={navigateTo}
          onSelectArticle={(slug) => navigateTo(`/berita/${slug}`)}
          onSelectVideo={(slug) => navigateTo(`/video/${slug}`)}
        />
      ) : isAuthorArchivePage ? (
        <AuthorArchivePage
          slug={authorArchiveSlug || 'ahmad-fauzi'}
          onNavigate={navigateTo}
          onSelectArticle={(slug) => navigateTo(`/berita/${slug}`)}
          onSelectVideo={(slug) => navigateTo(`/video/${slug}`)}
        />
      ) : isInformationPageValid ? (
        <InformationPageView
          slug={informationPageSlug}
          onNavigate={navigateTo}
        />
      ) : (
        <main className="flex-1 w-full">
          {/* TOPIK BAR (# TOPIK - Positioned right above Hero Headline Grid) */}
          <TrendingTopicsBar
            topics={hotTopicsData}
            activeTopic={activeTopic}
            onSelectTopic={(topic) => {
              const cleanTopic = topic.replace(/^#/, '').trim();
              const tagSlug = generateTagSlug(cleanTopic);
              navigateTo(`/tag/${tagSlug}`);
            }}
          />

          {/* S03 — HERO / HEADLINE GRID */}
          <HeroHeadlineGrid
            data={heroHeadlineData}
            onSelectArticle={(item) => {
              const found = allNewsArticles.find(
                (a) => a.slug === item.slug || a.id === item.id || a.title.includes(item.title.slice(0, 15))
              );
              if (found) {
                setSelectedArticle(found);
                navigateTo(`/berita/${found.slug}`);
              } else {
                const targetSlug = resolveArticleSlug(item.slug, item.id);
                if (targetSlug) {
                  navigateTo(`/berita/${targetSlug}`);
                }
              }
            }}
            onNavigateMore={() => navigateTo('/tren')}
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
              navigateTo(`/video/${targetSlug}`);
            }}
            onSelectPost={(item) => {
              const found = allNewsArticles.find(
                (a) => a.slug === item.slug || a.id === item.id || a.title.includes(item.title.slice(0, 15))
              );
              if (found) {
                setSelectedArticle(found);
                navigateTo(`/berita/${found.slug}`);
              } else {
                const targetSlug = resolveArticleSlug(item.slug, item.id);
                if (targetSlug) {
                  navigateTo(`/berita/${targetSlug}`);
                }
              }
            }}
            onSelectPopular={(item) => {
              const found = allNewsArticles.find(
                (a) => a.slug === item.slug || a.id === item.id || a.title.includes(item.title.slice(0, 15))
              );
              if (found) {
                setSelectedArticle(found);
                navigateTo(`/berita/${found.slug}`);
              } else {
                const targetSlug = resolveArticleSlug(item.slug, item.id);
                if (targetSlug) {
                  navigateTo(`/berita/${targetSlug}`);
                }
              }
            }}
            onSelectTrending={(item) => {
              const found = allNewsArticles.find(
                (a) => a.slug === item.slug || a.id === item.id || a.title.includes(item.title.slice(0, 15))
              );
              if (found) {
                setSelectedArticle(found);
                navigateTo(`/berita/${found.slug}`);
              } else {
                const targetSlug = resolveArticleSlug(item.slug, item.id);
                if (targetSlug) {
                  navigateTo(`/berita/${targetSlug}`);
                }
              }
            }}
            onSelectArticle={(item) => {
              const found = allNewsArticles.find(
                (a) => a.slug === item.slug || a.id === item.id || a.title.includes(item.title.slice(0, 15))
              );
              if (found) {
                setSelectedArticle(found);
                navigateTo(`/berita/${found.slug}`);
              } else {
                const targetSlug = resolveArticleSlug(item.slug, item.id);
                if (targetSlug) {
                  navigateTo(`/berita/${targetSlug}`);
                }
              }
            }}
            onSelectSpecialEvent={(event: SidebarSpecialCardData) => {
              navigateTo(`/berita/dialog-nasional-batutv-2026`);
            }}
            onSelectViralTopic={(topic) => {
              const targetSlug = topic.slug || generateTagSlug(topic.title.replace(/^#/, ''));
              navigateTo(`/tag/${targetSlug}`);
            }}
          />
        </main>
      )}

      {/* FOOTER */}
      <Footer
        categories={categoriesData}
        onSelectCategory={handleSelectCategory}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onNavigateAdmin={() => navigateTo('/batutv-control/login')}
        onNavigate={navigateTo}
      />

      {/* Interactive Modals */}
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={allNewsArticles}
        onSelectArticle={setSelectedArticle}
        initialQuery={searchInitialQuery}
      />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectRelated={setSelectedArticle}
        relatedArticles={allNewsArticles.filter((a) => a.id !== selectedArticle?.id && a.category === selectedArticle?.category)}
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
        onSelectArticle={setSelectedArticle}
        onRemoveBookmark={(id) => setBookmarkedArticleIds((prev) => prev.filter((i) => i !== id))}
        onClearAllBookmarks={() => setBookmarkedArticleIds([])}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categoriesData}
        activeCategory={isCategoryArchivePage ? categoryArchiveSlug : activeCategory}
        currentPath={currentPath}
        onSelectCategory={handleSelectCategory}
        onNavigate={navigateTo}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setIsSearchOpen(true);
        }}
        hotTopics={hotTopicsData}
        onSelectTopic={handleSelectTopic}
        onNavigateLogin={() => navigateTo('/batutv-control/login')}
      />
    </div>
  );
}
