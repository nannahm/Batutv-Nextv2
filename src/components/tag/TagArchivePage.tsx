import React, { useMemo, useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  User,
  Eye,
  Flame,
  TrendingUp,
  Tag as TagIcon,
  Layers,
  ChevronLeft,
  Info,
  X,
  Hash,
} from 'lucide-react';
import { getTagBySlug, getStoredTags, generateTagSlug } from '../../data/tagAdminStore';
import { getStoredArticles } from '../../data/newsAdminStore';
import { getStoredCategories } from '../../data/categoryAdminStore';
import { formatTimeAgo } from '../../utils/youtube';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';
import { TerpopulerWidget } from '../TerpopulerWidget';

interface TagArchivePageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectArticle?: (slug: string) => void;
  onSelectVideo?: (slug: string) => void;
}

const ITEMS_PER_PAGE = 6;

export const TagArchivePage: React.FC<TagArchivePageProps> = ({
  slug,
  onNavigate,
  onSelectArticle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Normalize string helper
  const normalize = (str?: string) =>
    (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const cleanSlug = slug
    .replace(/^\/tag\/?/, '')
    .replace(/^#/, '')
    .replace(/\/$/, '');

  // Reset pagination when tag slug changes
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cleanSlug]);

  // Fetch tag metadata from master store or derive fallback
  const tag = useMemo(() => {
    const found = getTagBySlug(cleanSlug);
    if (found) return found;

    const formattedName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id: `tag-${cleanSlug}`,
      name: formattedName,
      slug: cleanSlug,
      contentTypes: ['news', 'video'] as const,
      status: 'active' as const,
      seoTitle: `${formattedName} | BATUTV`,
      metaDescription: `Kumpulan berita dengan tag ${formattedName} terbaru dari BATUTV.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [cleanSlug]);

  // Update HTML document title, meta description, canonical & Schema for SEO
  useEffect(() => {
    const settings = getStoredSiteSettings();
    const baseDomain = getBaseDomain();
    const siteName = settings.identity.siteName || 'BATUTV';
    const titleSep = settings.seo.titleSeparator || '|';

    const pageTitle = tag.seoTitle || `Tag: ${tag.name} ${titleSep} ${siteName}`;
    document.title = pageTitle;

    // Helper to safely set or update meta tags
    const setMetaTag = (propertyOrName: string, attrName: string, content: string) => {
      let elem = document.querySelector(`meta[${propertyOrName}="${attrName}"]`);
      if (!elem) {
        elem = document.createElement('meta');
        elem.setAttribute(propertyOrName, attrName);
        document.head.appendChild(elem);
      }
      elem.setAttribute('content', content);
    };

    const metaDesc = tag.metaDescription || `Kumpulan berita dengan tag ${tag.name} terbaru dari ${siteName}.`;
    setMetaTag('name', 'description', metaDesc);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl = `${baseDomain}/tag/${tag.slug}`;
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:image', settings.seo.defaultOgImage || `${baseDomain}/logo.png`);

    // JSON-LD Structured Data for BreadcrumbList
    const existingScript = document.getElementById('tag-jsonld-schema');
    if (existingScript) existingScript.remove();

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'tag-jsonld-schema';

    const tagSchema = {
      '@context': 'https://schema.org',
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
          name: `Tag: ${tag.name}`,
          item: canonicalUrl,
        },
      ],
    };

    jsonLdScript.textContent = JSON.stringify(tagSchema);
    document.head.appendChild(jsonLdScript);

    return () => {
      const scriptToRemove = document.getElementById('tag-jsonld-schema');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [tag]);

  // Get matching published articles filtered by TAG (not category) and sorted by publishedAt DESC
  const matchingArticles = useMemo(() => {
    const articles = getStoredArticles();
    const tagNorm = normalize(tag.name);
    const tagSlugNorm = normalize(tag.slug);
    const cleanSlugNorm = normalize(cleanSlug);

    const filtered = articles.filter((art) => {
      if (art.status !== 'published') return false;
      if (!art.tags || !Array.isArray(art.tags) || art.tags.length === 0) return false;

      return art.tags.some((t) => {
        const tNorm = normalize(t);
        const tSlug = generateTagSlug(t);
        return (
          tNorm === tagNorm ||
          tNorm === tagSlugNorm ||
          tNorm === cleanSlugNorm ||
          tSlug === tag.slug ||
          tSlug === cleanSlug ||
          tNorm.includes(tagNorm) ||
          tagNorm.includes(tNorm) ||
          tNorm.includes(cleanSlugNorm)
        );
      });
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    );
  }, [tag, cleanSlug]);

  // Hero article is the newest published article with this tag
  const heroArticle = useMemo(() => {
    return matchingArticles.length > 0 ? matchingArticles[0] : null;
  }, [matchingArticles]);

  // Remaining articles for the paginated feed list
  const remainingArticles = useMemo(() => {
    return matchingArticles.length > 1 ? matchingArticles.slice(1) : [];
  }, [matchingArticles]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(remainingArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return remainingArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [remainingArticles, currentPage]);

  // Sidebar Data: Hot Discussions (Diskusi Terpanas)
  const hotDiscussions = useMemo(() => {
    const tags = getStoredTags().filter((t) => t.status === 'active');
    if (tags.length > 0) {
      return tags.slice(0, 6).map((t) => ({
        tag: t.name,
        slug: t.slug,
        count: `${t.totalCount || Math.floor(Math.random() * 20 + 8)} Diskusi`,
      }));
    }
    return [
      { tag: 'Pilkada Kota Batu', slug: 'pilkada-kota-batu', count: '48 Diskusi' },
      { tag: 'Apel Bumiaji', slug: 'apel-bumiaji', count: '32 Diskusi' },
      { tag: 'Wisata Songgoriti', slug: 'wisata-songgoriti', count: '29 Diskusi' },
      { tag: 'Pasar Induk Batu', slug: 'pasar-induk-batu', count: '24 Diskusi' },
      { tag: 'Infrastruktur Jatim', slug: 'infrastruktur-jatim', count: '19 Diskusi' },
    ];
  }, []);

  // Sidebar Data: Berita Populer
  const popularArticles = useMemo(() => {
    const articles = getStoredArticles().filter((a) => a.status === 'published');
    return [...articles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, []);

  // Sidebar Data: Kategori Populer
  const popularCategories = useMemo(() => {
    const all = getStoredCategories().filter((c) => c.status === 'active');
    return all.slice(0, 6);
  }, []);

  const handleArticleClick = (articleSlug: string) => {
    if (onSelectArticle) {
      onSelectArticle(articleSlug);
    } else {
      onNavigate(`/berita/${articleSlug}`);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper date format for Hero matching Homepage
  const formatHeroDate = (dateStr?: string) => {
    if (!dateStr) return 'Kamis, 27 Agustus 2026 | 09:30 WIB';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${dayName}, ${dateNum} ${monthName} ${year} | ${hours}:${minutes} WIB`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-16">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB NAVIGATION — Container Width 980px Identik Homepage         */}
      {/* ========================================================================= */}
      <div className="w-full bg-white border-b border-slate-200/80 py-2.5">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="hover:text-red-600 transition-colors"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Tag</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <a
            href={`/tag/${tag.slug}`}
            onClick={(e) => {
              e.preventDefault();
            }}
            className="text-red-600 font-bold"
          >
            {tag.name}
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER — Max Width 980px Seragam Persis Homepage & Kategori       */}
      {/* ========================================================================= */}
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6">
        {/* LAYOUT GRID: KIRI 8 COLS & KANAN 4 COLS (70% : 30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* ========================================================================= */}
          {/* KOLOM KIRI (Desktop: 8 COLS): HERO + DAFTAR ARTIKEL                      */}
          {/* ========================================================================= */}
          <main className="lg:col-span-8 space-y-6 w-full">
            {matchingArticles.length === 0 ? (
              /* EMPTY STATE */
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                  <Layers className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Belum ada artikel dengan tag ini.
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Redaksi BatuTV sedang mempersiapkan liputan terkini seputar topik #{tag.name}. Silakan jelajahi topik dan kategori lainnya.
                </p>
                <div className="pt-2">
                  <a
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/');
                    }}
                    className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* HERO ARTIKEL TERBARU (HANYA MUNCUL DI HALAMAN 1) — TAMPILAN IDENTIK HOMEPAGE S03 */}
                {heroArticle && currentPage === 1 && (
                  <article
                    id="tag-hero-headline"
                    className="headline-card main-headline-card w-full group"
                  >
                    {/* MOBILE & TABLET VIEW (< lg): Gambar di atas + Teks di bawah */}
                    <div className="block lg:hidden">
                      <a
                        href={`/berita/${heroArticle.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleArticleClick(heroArticle.slug);
                        }}
                        aria-label={`Berita utama topik tag: ${heroArticle.title}`}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
                      >
                        <div className="w-full aspect-[16/10] xs:aspect-[16/9] rounded-md overflow-hidden bg-slate-900 shadow-sm relative">
                          <img
                            src={getOptimizedImageUrl(heroArticle.featuredImage, 'large')}
                            alt={heroArticle.title}
                            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                            loading="eager"
                          />
                        </div>

                        <div className="pt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-slate-500">
                            <span className="text-red-600 font-bold uppercase">
                              {heroArticle.category || 'Berita'}
                            </span>
                            <span>|</span>
                            <span>{formatTimeAgo(heroArticle.publishedAt || heroArticle.createdAt)}</span>
                          </div>

                          <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 leading-tight sm:leading-snug tracking-tight group-hover:text-red-600 transition-colors font-sans">
                            {heroArticle.title}
                          </h1>
                        </div>
                      </a>
                    </div>

                    {/* DESKTOP VIEW (>= lg): Card dengan dark gradient overlay seragam Homepage */}
                    <div className="hidden lg:block relative w-full aspect-[16/9] min-h-[320px] rounded-md overflow-hidden shadow-sm bg-slate-900">
                      <a
                        href={`/berita/${heroArticle.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleArticleClick(heroArticle.slug);
                        }}
                        aria-label={`Berita utama topik tag: ${heroArticle.title}`}
                        className="relative w-full h-full flex flex-col justify-end p-5 lg:p-6 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600 z-10"
                      >
                        <img
                          src={getOptimizedImageUrl(heroArticle.featuredImage, 'large')}
                          alt={heroArticle.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out z-0 pointer-events-none"
                          loading="eager"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-1 pointer-events-none"
                        />
                        <div className="relative z-10 space-y-3 max-w-2xl">
                          <h1 className="text-[25px] font-black text-white leading-[1.25] tracking-tight group-hover:text-red-100 transition-colors drop-shadow-sm font-sans">
                            {heroArticle.title}
                          </h1>
                          <div className="flex items-center flex-wrap gap-2.5 pt-0.5 text-[13px] font-medium text-slate-200">
                            <span className="inline-flex items-center justify-center bg-white text-slate-950 font-black text-xs px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                              {heroArticle.category || 'Berita'}
                            </span>
                            <time className="text-slate-200 font-normal">
                              {formatHeroDate(heroArticle.publishedAt || heroArticle.createdAt)}
                            </time>
                          </div>
                        </div>
                      </a>
                    </div>
                  </article>
                )}

                {/* DAFTAR ARTIKEL BERDASARKAN TAG (ITEM FEED LIST) */}
                <section className="space-y-4 pt-2">
                  <div className="section-header pb-2 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight font-sans">
                        Arsip #{tag.name}
                      </h2>
                      <div
                        aria-hidden="true"
                        className="w-10 h-1 bg-[#c8102e] mt-1 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                  </div>

                  {paginatedArticles.length === 0 && currentPage > 1 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">Tidak ada artikel di halaman ini.</p>
                      <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        className="mt-3 text-xs text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Kembali ke Halaman 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 sm:space-y-4">
                      {paginatedArticles.map((article) => (
                        <article
                          key={article.id}
                          className="group bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start"
                        >
                          {/* Thumbnail Kiri (Medium Image) */}
                          <div className="relative w-full sm:w-44 sm:h-28 h-40 rounded-md overflow-hidden shrink-0 bg-slate-900 block">
                            <a
                              href={`/berita/${article.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleArticleClick(article.slug);
                              }}
                              className="w-full h-full block"
                            >
                              <img
                                src={getOptimizedImageUrl(article.featuredImage, 'medium')}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </a>
                            <div className="absolute top-2 left-2 z-10">
                              <a
                                href={`/kategori/${article.categorySlug || article.category.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onNavigate(`/kategori/${article.categorySlug || article.category.toLowerCase().replace(/\s+/g, '-')}`);
                                }}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded shadow-xs transition-colors block"
                              >
                                {article.category}
                              </a>
                            </div>
                          </div>

                          {/* Konten Kanan: Judul, Excerpt, Badge Kategori, Tanggal, Author */}
                          <div className="flex-1 flex flex-col justify-between min-w-0 h-full space-y-1.5 w-full">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {formatTimeAgo(article.publishedAt || article.createdAt)}
                                </span>
                                {article.author && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-slate-600">
                                      <User className="w-3 h-3 text-slate-400" />
                                      {article.author}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                                <a
                                  href={`/berita/${article.slug}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleArticleClick(article.slug);
                                  }}
                                >
                                  {article.title}
                                </a>
                              </h3>

                              {article.excerpt && (
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                                  {article.excerpt}
                                </p>
                              )}
                            </div>

                            {/* Footer Item */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                              <a
                                href={`/berita/${article.slug}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleArticleClick(article.slug);
                                }}
                                className="text-red-600 font-bold hover:underline inline-flex items-center gap-0.5 text-xs"
                              >
                                Baca Selengkapnya
                                <ChevronRight className="w-3.5 h-3.5" />
                              </a>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views || 0} pembaca</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination Arsip Tag"
                    className="flex items-center justify-center gap-2 pt-4 pb-2"
                  >
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>

          {/* ========================================================================= */}
          {/* KOLOM KANAN (Desktop: 4 COLS): TERPOPULER WIDGET + DISKUSI TERPANAS        */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-4 space-y-5 w-full lg:sticky lg:top-[68px] self-start">
            {/* 1. TERPOPULER WIDGET (Desain Persis Gambar 1) */}
            <TerpopulerWidget
              id="tag-terpopuler"
              onSelectArticle={(item) => {
                if (onSelectArticle) {
                  onSelectArticle(item.slug);
                } else {
                  onNavigate(`/berita/${item.slug}`);
                }
              }}
              onNavigateMore={() => onNavigate('/tren')}
            />

            {/* 2. DISKUSI TERPANAS */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  DISKUSI TERPANAS
                </h3>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  HOT TOPIC
                </span>
              </div>

              <div className="space-y-1.5">
                {hotDiscussions.map((topic) => (
                  <a
                    key={topic.slug}
                    href={`/tag/${topic.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/tag/${topic.slug}`);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg transition group border ${
                      topic.slug === cleanSlug
                        ? 'bg-red-50 border-red-200 text-red-600 font-black'
                        : 'bg-slate-50 hover:bg-red-50/80 hover:text-red-600 border-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="text-red-500 font-mono">#</span>
                      <span>{topic.tag}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-red-500 font-medium">
                      {topic.count}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* 3. KATEGORI POPULER */}
            {popularCategories.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <TagIcon className="w-4 h-4 text-red-600" />
                    KATEGORI PILIHAN
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Jelajahi</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {popularCategories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/kategori/${cat.slug}`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <span>{cat.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BERITA TERPOPULER */}
            {popularArticles.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    BERITA TERPOPULER
                  </h3>
                  <span className="text-[11px] text-slate-400">24 Jam</span>
                </div>

                <div className="space-y-2.5">
                  {popularArticles.map((pop, idx) => (
                    <a
                      key={pop.id}
                      href={`/berita/${pop.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleArticleClick(pop.slug);
                      }}
                      className="flex items-start gap-2.5 group py-1"
                    >
                      <span
                        className={`text-base font-black shrink-0 w-5 text-center leading-none mt-0.5 ${
                          idx === 0
                            ? 'text-red-600'
                            : idx === 1
                            ? 'text-orange-500'
                            : 'text-slate-300'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                          {pop.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-red-500">
                            {pop.category || 'Nasional'}
                          </span>
                          <span>•</span>
                          <span>{formatTimeAgo(pop.publishedAt || pop.createdAt)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
