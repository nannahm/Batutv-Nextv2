import React, { useEffect, useState } from 'react';
import {
  Home,
  Search,
  ArrowLeft,
  AlertTriangle,
  Play,
  Clock,
  Compass,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import { getPublishedNewsFeedPosts } from '../../data/newsAdminStore';
import { getPublishedVideosForHomepage } from '../../data/videoAdminStore';
import { getStoredCategories } from '../../data/categoryAdminStore';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { LatestNewsPost, LatestVideoItem } from '../../data/latestNewsData';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  requestedPath?: string;
  onOpenSearch?: (query?: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  requestedPath,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [latestPosts, setLatestPosts] = useState<LatestNewsPost[]>([]);
  const [latestVideos, setLatestVideos] = useState<LatestVideoItem[]>([]);

  useEffect(() => {
    // 1. Set SEO Meta for 404 (Noindex, follow)
    const settings = getStoredSiteSettings();
    const siteName = settings.identity.siteName || 'BatuTV';
    const titleSep = settings.seo.titleSeparator || '|';
    const prevTitle = document.title;
    document.title = `404 - Halaman Tidak Ditemukan ${titleSep} ${siteName}`;

    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let createdMeta = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
      createdMeta = true;
    }
    const prevRobots = metaRobots.getAttribute('content');
    metaRobots.setAttribute('content', 'noindex, follow');

    // 2. Load latest news & videos
    try {
      const posts = getPublishedNewsFeedPosts();
      setLatestPosts(posts.slice(0, 6));

      const vids = getPublishedVideosForHomepage(4);
      setLatestVideos(vids);
    } catch {
      // fallback
    }

    return () => {
      document.title = prevTitle;
      if (metaRobots) {
        if (prevRobots) {
          metaRobots.setAttribute('content', prevRobots);
        } else if (createdMeta) {
          metaRobots.remove();
        }
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onOpenSearch) {
        onOpenSearch(searchQuery.trim());
      } else {
        onNavigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const categories = getStoredCategories().filter((c) => c.status === 'active').slice(0, 6);

  return (
    <main
      id="main-not-found-content"
      className="flex-1 w-full bg-[#f8f9fa] py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300"
    >
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* ========================================================================= */}
        {/* 404 HERO BLOCK                                                            */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="heading-404"
          className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-10 md:p-14 text-center relative overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            {/* 404 Number Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 font-bold text-sm tracking-wide uppercase shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Status HTTP 404 • Not Found</span>
            </div>

            {/* Giant 404 Display */}
            <h1
              id="heading-404"
              className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-none"
            >
              4<span className="text-red-600">0</span>4
            </h1>

            {/* Headline & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang Anda
                tuju mungkin mengalami kesalahan penulisan.
              </p>
              {requestedPath && (
                <p className="text-xs sm:text-sm font-mono text-slate-400 bg-slate-100 py-1.5 px-3 rounded-md inline-block max-w-full truncate">
                  Path: {requestedPath}
                </p>
              )}
            </div>

            {/* In-Page Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita atau topik lain..."
                  className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl text-sm sm:text-base text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs"
                >
                  Cari
                </button>
              </div>
            </form>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl shadow-sm transition-all transform active:scale-98 text-sm sm:text-base cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    window.history.back();
                  } else {
                    onNavigate('/');
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors text-sm sm:text-base cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Halaman Sebelumnya</span>
              </button>
            </div>

            {/* Quick Category Navigation Pills */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-red-600" /> Jelajahi Kategori:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate(`/kategori/${cat.slug}`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-md font-medium transition-colors cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate('/video')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-md font-medium transition-colors cursor-pointer"
              >
                Video & TV
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RECOMMENDED CONTENT: BERITA TERBARU                                      */}
        {/* ========================================================================= */}
        <section aria-labelledby="heading-latest-news" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              <h3
                id="heading-latest-news"
                className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
              >
                Berita Terbaru BatuTV
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 group"
            >
              Lihat Semua Berita
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => onNavigate(`/berita/${post.slug}`)}
                className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold uppercase rounded tracking-wider shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.time}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RECOMMENDED CONTENT: VIDEO TERBARU                                       */}
        {/* ========================================================================= */}
        {latestVideos.length > 0 && (
          <section aria-labelledby="heading-latest-videos" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#240046] rounded-full" />
                <h3
                  id="heading-latest-videos"
                  className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
                >
                  Video Terkini
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/video')}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 group"
              >
                Lihat Semua Video
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => onNavigate(`/video/${vid.slug || vid.id}`)}
                  className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 opacity-90 group-hover:opacity-100 transition-all duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {vid.duration && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-mono font-bold rounded">
                        {vid.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                      {vid.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                      {vid.category || 'BatuTV News'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
