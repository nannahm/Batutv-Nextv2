import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Clock,
  Calendar,
  Eye,
  Tag as TagIcon,
  Share2,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Flame,
  Tv,
  ArrowRight,
  Volume2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { SocialShareGroup } from '../common/SocialShareGroup';
import {
  DetailedVideoData,
  defaultMainVideo,
  defaultRelatedArticlesList,
} from '../../data/dummyVideos';
import { defaultPopularNews } from '../../data/latestNewsData';
import {
  getVideoBySlug,
  getStoredVideos,
  getPublishedLiveVideos,
  getLiveFeaturedVideo,
  getLiveRelatedVideos,
  getLiveLatestVideosFeed,
  resolveVideoThumbnailUrl,
} from '../../data/videoAdminStore';
import { getMediaById } from '../../data/mediaAdminStore';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  formatDurationToIso8601,
  formatDateToIso8601,
} from '../../utils/youtube';

interface VideoDetailPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  onSelectTag?: (tag: string) => void;
  onSelectAuthor?: (author: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

const cleanHtmlEntities = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, ' ');
};

function formatIndonesianDate(dateInput?: string): string {
  if (!dateInput) return '27 Agustus 2026';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} | ${hours}:${minutes} WIB`;
  } catch {
    return dateInput;
  }
}

export const VideoDetailPage: React.FC<VideoDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectCategory,
  onSelectTag,
  onSelectAuthor,
  onBookmark,
  isBookmarked = false,
}) => {
  // Resolve current video from slug or fallback to featured published video
  const currentVideo: DetailedVideoData = useMemo(() => {
    const allPublished = getPublishedLiveVideos();

    // 1. If slug is provided, search in videoAdminStore
    if (slug) {
      const adminVid = getVideoBySlug(slug);
      if (adminVid) {
        const vidId =
          adminVid.youtubeVideoId ||
          extractYouTubeVideoId(adminVid.youtubeUrl) ||
          'dQw4w9WgXcQ';
        const ytUrl =
          adminVid.youtubeUrl || `https://www.youtube.com/watch?v=${vidId}`;
        const poster = resolveVideoThumbnailUrl(adminVid);

        return {
          ...defaultMainVideo,
          id: adminVid.id,
          slug: adminVid.slug,
          title: adminVid.title,
          category: adminVid.category ? adminVid.category.toUpperCase() : 'BERITA',
          categorySlug:
            adminVid.categorySlug ||
            (adminVid.category || 'berita')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),
          summary: adminVid.excerpt || adminVid.description?.slice(0, 180) || defaultMainVideo.summary,
          descriptionHtml: adminVid.description || undefined,
          descriptionParagraphs: adminVid.description
            ? adminVid.description.split('\n\n').filter(Boolean)
            : defaultMainVideo.descriptionParagraphs,
          duration: adminVid.duration || '04:30',
          durationIso: formatDurationToIso8601(adminVid.duration),
          views: adminVid.views || 2450,
          youtubeVideoId: vidId,
          youtubeUrl: ytUrl,
          videoUrl: ytUrl,
          posterUrl: poster,
          tags:
            adminVid.tags && adminVid.tags.length > 0
              ? adminVid.tags.map((t) => ({
                  name: t,
                  slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                }))
              : defaultMainVideo.tags,
          author: {
            ...defaultMainVideo.author,
            name: adminVid.author || 'Tim Redaksi BatuTV',
            slug: (adminVid.author || 'tim-redaksi')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),
          },
          publishedAt: formatIndonesianDate(adminVid.publishedAt),
          publishedIso: formatDateToIso8601(adminVid.publishedAt),
          updatedAt: formatIndonesianDate(adminVid.updatedAt || adminVid.publishedAt),
          updatedIso: formatDateToIso8601(adminVid.updatedAt || adminVid.publishedAt),
        };
      }
    }

    // 2. If no slug or slug not found, pick the featured/top published video
    const topVid = getLiveFeaturedVideo() || allPublished[0];
    if (topVid) {
      const vidId =
        topVid.youtubeVideoId ||
        extractYouTubeVideoId(topVid.youtubeUrl) ||
        'dQw4w9WgXcQ';
      const ytUrl =
        topVid.youtubeUrl || `https://www.youtube.com/watch?v=${vidId}`;
      const poster = resolveVideoThumbnailUrl(topVid);

      return {
        ...defaultMainVideo,
        id: topVid.id,
        slug: topVid.slug,
        title: topVid.title,
        category: topVid.category ? topVid.category.toUpperCase() : 'WISATA & KULINER',
        categorySlug:
          topVid.categorySlug ||
          (topVid.category || 'wisata-kuliner')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
        summary: topVid.excerpt || topVid.description?.slice(0, 180) || defaultMainVideo.summary,
        descriptionHtml: topVid.description || undefined,
        descriptionParagraphs: topVid.description
          ? topVid.description.split('\n\n').filter(Boolean)
          : defaultMainVideo.descriptionParagraphs,
        duration: topVid.duration || '04:35',
        durationIso: formatDurationToIso8601(topVid.duration),
        views: topVid.views || 8940,
        youtubeVideoId: vidId,
        youtubeUrl: ytUrl,
        videoUrl: ytUrl,
        posterUrl: poster,
        tags:
          topVid.tags && topVid.tags.length > 0
            ? topVid.tags.map((t) => ({
                name: t,
                slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              }))
            : defaultMainVideo.tags,
        author: {
          ...defaultMainVideo.author,
          name: topVid.author || 'Tim Liputan Khusus BatuTV',
          slug: (topVid.author || 'tim-liputan-khusus-batutv')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
        },
        publishedAt: formatIndonesianDate(topVid.publishedAt),
        publishedIso: formatDateToIso8601(topVid.publishedAt),
        updatedAt: formatIndonesianDate(topVid.updatedAt || topVid.publishedAt),
        updatedIso: formatDateToIso8601(topVid.updatedAt || topVid.publishedAt),
      };
    }

    return defaultMainVideo;
  }, [slug]);

  // Dynamic Related & Latest Videos Feed from videoAdminStore
  const dynamicRelatedVideos = useMemo(() => {
    return getLiveRelatedVideos(currentVideo.id, currentVideo.category, 4);
  }, [currentVideo.id, currentVideo.category]);

  const dynamicLatestVideos = useMemo(() => {
    return getLiveLatestVideosFeed(currentVideo.id, 6);
  }, [currentVideo.id]);

  const dynamicPopularVideos = useMemo(() => {
    const published = getPublishedLiveVideos();
    return [...published]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        slug: v.slug,
        title: v.title,
        duration: v.duration || '04:00',
        thumbnailUrl: resolveVideoThumbnailUrl(v),
        views: (v.views || 1500).toLocaleString('id-ID'),
      }));
  }, [currentVideo.id]);

  const [bookmarkedState, setBookmarkedState] = useState(isBookmarked);

  // Sync bookmark state if prop updates
  useEffect(() => {
    setBookmarkedState(isBookmarked);
  }, [isBookmarked]);

  // Settings & Base Domain for SEO & Sharing
  const settings = useMemo(() => getStoredSiteSettings(), []);
  const baseDomain = useMemo(() => getBaseDomain(), []);

  const canonicalPath = `/video/${currentVideo.slug}`;
  const canonicalUrl = `${baseDomain}${canonicalPath}`;
  const siteName = settings.identity.siteName || 'BatuTV';
  const embedUrl = `https://www.youtube.com/embed/${currentVideo.youtubeVideoId || 'dQw4w9WgXcQ'}`;

  const handleToggleBookmark = () => {
    setBookmarkedState(!bookmarkedState);
    if (onBookmark) {
      onBookmark(currentVideo.id);
    }
  };

  // SEO & Structured Data Injection
  useEffect(() => {
    // 1. Title Tag
    const originalTitle = document.title;
    const pageTitle = `${currentVideo.title} ${settings.seo.titleSeparator || '|'} Video ${siteName}`;
    document.title = pageTitle;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', currentVideo.summary);

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph Meta Tags
    const setMetaTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('og:type', 'video.other');
    setMetaTag('og:title', pageTitle);
    setMetaTag('og:description', currentVideo.summary);
    setMetaTag('og:image', currentVideo.posterUrl);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:site_name', siteName);
    setMetaTag('og:video', embedUrl);
    setMetaTag('og:video:secure_url', embedUrl);
    setMetaTag('og:video:type', 'text/html');
    setMetaTag('og:video:width', '1280');
    setMetaTag('og:video:height', '720');
    setMetaTag('video:duration', currentVideo.duration);
    setMetaTag('video:release_date', currentVideo.publishedIso);

    // 5. Twitter Card Meta Tags
    const setTwitterTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'player');
    setTwitterTag('twitter:title', pageTitle);
    setTwitterTag('twitter:description', currentVideo.summary);
    setTwitterTag('twitter:image', currentVideo.posterUrl);
    setTwitterTag('twitter:player', embedUrl);
    setTwitterTag('twitter:player:width', '1280');
    setTwitterTag('twitter:player:height', '720');

    // 6. JSON-LD Structured Data for Google (VideoObject + BreadcrumbList)
    const existingScript = document.getElementById('video-jsonld-schema');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'video-jsonld-schema';

    const videoSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'VideoObject',
          '@id': `${canonicalUrl}#video`,
          name: currentVideo.title,
          description: currentVideo.summary,
          thumbnailUrl: [currentVideo.posterUrl],
          uploadDate: currentVideo.publishedIso,
          duration: currentVideo.durationIso || formatDurationToIso8601(currentVideo.duration),
          contentUrl: currentVideo.youtubeUrl || `https://www.youtube.com/watch?v=${currentVideo.youtubeVideoId}`,
          embedUrl: embedUrl,
          publisher: {
            '@type': 'NewsMediaOrganization',
            name: siteName,
            url: baseDomain,
            logo: {
              '@type': 'ImageObject',
              url: settings.logos.publisher || settings.logos.headerDesktop || `${baseDomain}/logo.png`,
            },
          },
          author: {
            '@type': 'Person',
            name: currentVideo.author.name,
            url: `${baseDomain}/penulis/${currentVideo.author.slug}`,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Beranda',
              item: `${baseDomain}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Video',
              item: `${baseDomain}/video`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: currentVideo.category,
              item: `${baseDomain}/kategori/${currentVideo.categorySlug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: currentVideo.title,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };

    jsonLdScript.text = JSON.stringify(videoSchema);
    document.head.appendChild(jsonLdScript);

    // Smooth scroll to top on video change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById('video-jsonld-schema');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [currentVideo, canonicalUrl, embedUrl]);

  return (
    <main
      id="video-detail-main"
      className="flex-1 w-full bg-[#f8f9fa] py-3 sm:py-4 lg:py-5 font-sans"
    >
      <div className="video-layout max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: MAIN VIDEO CONTENT (8 COLS TO MATCH HOMEPAGE)   */}
        {/* ============================================================ */}
        <article className="video-page lg:col-span-8 w-full bg-white rounded-xl shadow-none p-4 sm:p-5 md:p-6">
          {/* 1. BREADCRUMB */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500">
              <li>
                <a
                  href="/"
                  id="breadcrumb-home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/');
                  }}
                  className="hover:text-red-600 transition-colors"
                >
                  Home
                </a>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                <ChevronRight className="w-3.5 h-3.5 inline" />
              </li>
              <li>
                <a
                  href="/video"
                  id="breadcrumb-video"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/video');
                  }}
                  className="hover:text-red-600 transition-colors font-semibold"
                >
                  Video
                </a>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                <ChevronRight className="w-3.5 h-3.5 inline" />
              </li>
              <li>
                <a
                  href={`/kategori/${currentVideo.categorySlug}`}
                  id="breadcrumb-category"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectCategory) {
                      onSelectCategory(currentVideo.categorySlug);
                    } else {
                      onNavigate(`/kategori/${currentVideo.categorySlug}`);
                    }
                  }}
                  className="text-red-600 font-semibold hover:underline"
                >
                  {currentVideo.category}
                </a>
              </li>
            </ol>
          </nav>

          {/* 2. VIDEO CATEGORY BADGE */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-wider rounded-sm uppercase shadow-2xs">
              <Tv className="w-3.5 h-3.5" />
              {currentVideo.category}
            </span>
          </div>

          {/* 3. VIDEO TITLE / H1 (EXACTLY ONE H1 ON PAGE) */}
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-3 tracking-tight">
            {currentVideo.title}
          </h1>

          {/* 4. VIDEO SUMMARY / SUBHEADLINE */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5 font-normal border-l-3 border-red-500 pl-3.5 italic bg-red-50/40 py-2 rounded-r-md">
            {currentVideo.summary}
          </p>

          {/* 5 & 6. SIMPLIFIED AUTHOR & SHARE BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
            {/* Left: Author Avatar, Name, and Clean Timestamp */}
            <div className="flex items-center gap-3">
              <img
                src={currentVideo.author.avatar}
                alt={currentVideo.author.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
              />
              <div>
                <a
                  href={`/penulis/${currentVideo.author.slug}`}
                  id="author-profile-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectAuthor) {
                      onSelectAuthor(currentVideo.author.name);
                    }
                  }}
                  className="font-bold text-slate-900 text-sm sm:text-[15px] hover:text-red-600 transition-colors block leading-tight"
                >
                  {currentVideo.author.name}
                </a>
                <div className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-tight">
                  <time dateTime={currentVideo.publishedIso}>
                    {currentVideo.publishedAt}
                  </time>
                </div>
              </div>
            </div>

            {/* Right: Compact Circular Share Icons (Official High-Precision SVG Vectors) */}
            <SocialShareGroup
              title={currentVideo.title}
              summary={currentVideo.summary}
              className="self-start sm:self-center"
            />
          </div>

          {/* 7. FEATURED YOUTUBE EMBED PLAYER (16:9 Aspect Ratio) */}
          <div className="video-player-container relative mb-4">
            <div className="w-full aspect-video rounded-md overflow-hidden bg-black shadow-lg relative group border border-slate-800">
              <iframe
                id="main-featured-youtube-player"
                src={`https://www.youtube.com/embed/${currentVideo.youtubeVideoId || 'dQw4w9WgXcQ'}?rel=0&modestbranding=1&playsinline=1`}
                title={currentVideo.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
              />
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Tv className="w-3.5 h-3.5 text-red-600 inline" />
                <span>Pemutar Resmi YouTube HD • BATUTV Streaming</span>
              </span>
              <a
                href={
                  currentVideo.youtubeUrl ||
                  `https://www.youtube.com/watch?v=${currentVideo.youtubeVideoId || 'dQw4w9WgXcQ'}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 8. VIDEO INFORMATION BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Durasi
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {currentVideo.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <TagIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Kategori
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {currentVideo.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Tanggal
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {currentVideo.publishedAt ? currentVideo.publishedAt.split('|')[0].trim() : '27 Agustus 2026'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Penonton
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {(currentVideo.views || 2450).toLocaleString('id-ID')} views
                </p>
              </div>
            </div>
          </div>

          {/* 9. VIDEO DESCRIPTION */}
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3.5 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-red-600 rounded-xs"></span>
              DESKRIPSI VIDEO
            </h2>
            <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {currentVideo.descriptionHtml &&
              /<[a-z][\s\S]*>/i.test(currentVideo.descriptionHtml) ? (
                <div
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-3 [&>figure]:my-5 [&>figure>img]:rounded-md [&>figure>img]:w-full"
                  dangerouslySetInnerHTML={{
                    __html: currentVideo.descriptionHtml,
                  }}
                />
              ) : (
                <div className="space-y-3.5">
                  {currentVideo.descriptionParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{cleanHtmlEntities(paragraph)}</p>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 10. TAGS SECTION */}
          <div className="mb-4 p-4 sm:p-5 bg-[#f8f9fa] rounded-lg border border-slate-100 shadow-none">
            <div className="flex items-center gap-3 mb-3.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 shrink-0">
                Tag
              </h3>
              <div className="flex-1 h-px bg-slate-200 relative">
                <div className="absolute left-0 top-0 h-px w-6 sm:w-8 bg-red-600" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {currentVideo.tags.map((tag) => (
                <a
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  id={`tag-link-${tag.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/tag/${tag.slug}`);
                  }}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#d91424] via-[#9e165b] to-[#431474] text-white font-medium text-xs sm:text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-none"
                >
                  # {tag.name}
                </a>
              ))}
            </div>
          </div>

          {/* 11. SHARE LINK */}
          <div className="mb-8 p-3.5 sm:p-4 bg-[#f8f9fa] rounded-lg border border-slate-100 shadow-none flex items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            <span className="font-bold text-slate-900 text-sm sm:text-base shrink-0">
              Share Link
            </span>
            <SocialShareGroup
              title={currentVideo.title}
              summary={currentVideo.summary}
              className="ml-auto sm:ml-0"
            />
          </div>

          {/* 12. RELATED VIDEOS (DYNAMIC DARI BATUTV VIDEO STORE) */}
          <section className="mb-10">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-xs"></span>
                VIDEO TERKAIT
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Koleksi Terkait
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dynamicRelatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-slate-50 rounded-xl overflow-hidden border border-slate-200/80 hover:border-red-300 hover:shadow-md transition-all flex flex-col"
                >
                  <a
                    href={`/video/${video.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/video/${video.slug}`);
                    }}
                    className="block relative aspect-video overflow-hidden bg-slate-900"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={400}
                      height={225}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[11px] font-bold rounded-sm backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </a>

                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1 block">
                        {video.category}
                      </span>
                      <a
                        href={`/video/${video.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/video/${video.slug}`);
                        }}
                        className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                      >
                        {video.title}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                      <span>{video.publishedAt}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 13. RELATED ARTICLES */}
          <section className="mb-10">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-xs"></span>
                BERITA TERKAIT
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Artikel Terkait Isu
              </span>
            </div>

            <div className="space-y-3.5">
              {defaultRelatedArticlesList.map((article) => (
                <div
                  key={article.id}
                  className="group flex flex-col sm:flex-row gap-3.5 p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 transition-all"
                >
                  <a
                    href={`/berita/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/berita/${article.slug}`);
                    }}
                    className="w-full sm:w-36 h-24 shrink-0 rounded-md overflow-hidden bg-slate-200"
                  >
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      width={200}
                      height={120}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5 block">
                        {article.category}
                      </span>
                      <a
                        href={`/berita/${article.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/berita/${article.slug}`);
                        }}
                        className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-1"
                      >
                        {article.title}
                      </a>
                      <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {article.date} • {article.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 14. LATEST VIDEOS (DYNAMIC LIVE FEED) */}
          <section className="mb-4">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-xs"></span>
                VIDEO TERBARU
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Update Terkini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {dynamicLatestVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="group flex gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all items-start"
                >
                  <a
                    href={`/video/${vid.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/video/${vid.slug}`);
                    }}
                    className="relative w-24 sm:w-28 aspect-[16/10] shrink-0 rounded-md overflow-hidden bg-slate-900"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      width={160}
                      height={100}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/80 text-[10px] text-white font-bold rounded-xs">
                      {vid.duration}
                    </div>
                  </a>

                  <div className="flex-1 min-w-0">
                    <a
                      href={`/video/${vid.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/video/${vid.slug}`);
                      }}
                      className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-1"
                    >
                      {vid.title}
                    </a>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <span className="text-red-600">{vid.category}</span>
                      <span>•</span>
                      <span>{vid.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: SIDEBAR (4 COLS TO MATCH HOMEPAGE)             */}
        {/* ============================================================ */}
        <aside className="video-sidebar lg:col-span-4 w-full space-y-5 lg:sticky lg:top-[68px] self-start">
          {/* SECTION 1: POPULER (01 - 05) */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 tracking-tight">
                <TrendingUp className="w-4 h-4 text-red-600" />
                POPULER
              </h3>
              <span className="text-[11px] font-bold text-red-600 uppercase">
                24 Jam Terakhir
              </span>
            </div>

            <div className="divide-y divide-slate-100/80">
              {defaultPopularNews.slice(0, 5).map((pop, idx) => (
                <div
                  key={pop.id || idx}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group"
                >
                  <span
                    className={`font-black text-xl leading-none w-6 text-center shrink-0 ${
                      idx === 0
                        ? 'text-red-600'
                        : idx === 1
                        ? 'text-amber-600'
                        : idx === 2
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <div className="flex-1">
                    <a
                      href={`/berita/${pop.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/berita/${pop.slug}`);
                      }}
                      className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {pop.title}
                    </a>
                    {pop.category && (
                      <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1 block">
                        {pop.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: TRENDING TOPICS */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 tracking-tight">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                TRENDING
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Wisata Kota Batu', slug: 'wisata-kota-batu' },
                { name: 'Agrowisata Bumiaji', slug: 'agrowisata-bumiaji' },
                { name: 'Pariwisata Malang Raya', slug: 'pariwisata-malang-raya' },
                { name: 'BatuTV Live Streaming', slug: 'batutv-live-streaming' },
                { name: 'Kuliner Legendaris', slug: 'kuliner-legendaris' },
              ].map((topic) => (
                <a
                  key={topic.slug}
                  href={`/tag/${topic.slug}`}
                  id={`sidebar-trend-${topic.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectTag) {
                      onSelectTag(topic.name);
                    } else {
                      onNavigate(`/tag/${topic.slug}`);
                    }
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold transition-all border border-slate-100 hover:border-red-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-orange-500">🔥</span>
                    <span>{topic.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* SECTION 3: VIDEO POPULER (DYNAMIC) */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 tracking-tight">
                <Tv className="w-4 h-4 text-red-600" />
                VIDEO POPULER
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Paling Ditonton
              </span>
            </div>

            <div className="space-y-3">
              {dynamicPopularVideos.map((popVid) => (
                <div key={popVid.id} className="group flex gap-3 items-center">
                  <a
                    href={`/video/${popVid.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/video/${popVid.slug}`);
                    }}
                    className="relative w-20 aspect-video rounded-md overflow-hidden bg-slate-900 shrink-0"
                  >
                    <img
                      src={popVid.thumbnailUrl}
                      alt={popVid.title}
                      width={120}
                      height={70}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-white text-white" />
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[9px] text-white font-bold rounded-2xs">
                      {popVid.duration}
                    </div>
                  </a>

                  <div className="flex-1 min-w-0">
                    <a
                      href={`/video/${popVid.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/video/${popVid.slug}`);
                      }}
                      className="font-bold text-xs text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {popVid.title}
                    </a>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Eye className="w-2.5 h-2.5" /> {popVid.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: PROMO / AD SLOT */}
          <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-4 sm:p-5 text-white shadow-xs">
            <div className="text-[10px] uppercase font-bold tracking-widest text-red-400 mb-2">
              [ PROMO / ADVERTISEMENT ]
            </div>
            <h4 className="font-extrabold text-sm sm:text-base leading-snug mb-1.5">
              BatuTV Digital Streaming App
            </h4>
            <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
              Nikmati siaran langsung HD, breaking news kilat, dan arsip program
              terlengkap dalam genggaman Anda.
            </p>
            <button
              type="button"
              id="promo-download-btn"
              onClick={() => {
                const target = document.getElementById('footer-contact-section') || document.querySelector('footer');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              Download Aplikasi Resmi
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};
