import React, { useMemo, useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  User,
  Eye,
  Flame,
  Mail,
  Phone,
  Calendar,
  Layers,
  ChevronLeft,
  Info,
  X,
  Share2,
  Award,
  BookOpen,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { getAuthorBySlug, getStoredAuthors } from '../../data/authorAdminStore';
import { getStoredArticles } from '../../data/newsAdminStore';
import { getStoredVideos } from '../../data/videoAdminStore';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';
import { formatTimeAgo } from '../../utils/youtube';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

interface AuthorArchivePageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectArticle?: (slug: string) => void;
  onSelectVideo?: (slug: string) => void;
}

const ITEMS_PER_PAGE = 6;

export const AuthorArchivePage: React.FC<AuthorArchivePageProps> = ({
  slug,
  onNavigate,
  onSelectArticle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'video'>('all');

  const cleanSlug = slug
    .replace(/^\/penulis\/?/, '')
    .replace(/\/$/, '')
    .trim();

  // Reset pagination when author slug changes
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cleanSlug]);

  // Fetch author metadata from master store or fallback
  const author = useMemo(() => {
    const found = getAuthorBySlug(cleanSlug);
    if (found) return found;

    // Fallback if not directly matched
    const formattedName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id: `aut-${cleanSlug}`,
      name: formattedName,
      slug: cleanSlug,
      position: 'Jurnalis & Kontributor',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      email: `${cleanSlug}@batutv.id`,
      bio: `Jurnalis dan kontributor berita BatuTV yang berfokus pada liputan aktual Kota Batu, Malang Raya, dan perkembangan nasional terkini.`,
      status: 'active' as const,
      newsCount: 10,
      videoCount: 2,
      totalCount: 12,
      seoTitle: `Profil & Berita Karya ${formattedName} - Jurnalis BatuTV`,
      metaDescription: `Kumpulan berita terkini, liputan mendalam, dan artikel oleh jurnalis ${formattedName} di portal resmi BatuTV.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [cleanSlug]);

  const settings = useMemo(() => getStoredSiteSettings(), []);
  const baseDomain = useMemo(() => getBaseDomain(), []);

  // Update HTML document title, meta description & canonical for SEO
  useEffect(() => {
    const pageTitle = author.seoTitle || `${author.name} - Profil & Karya Penulis | ${settings.identity.siteName || 'BATUTV'}`;
    document.title = pageTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      author.metaDescription || `Kumpulan berita, ulasan, dan liputan jurnalis ${author.name} di portal berita BatuTV.`
    );

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl = `${baseDomain}/penulis/${author.slug}`;
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph
    const setMetaTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('og:title', pageTitle);
    setMetaTag('og:description', author.metaDescription || author.bio);
    setMetaTag('og:image', author.photoUrl);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', 'profile');
    setMetaTag('og:site_name', settings.identity.siteName || 'BatuTV');

    // JSON-LD Structured Data for Person & BreadcrumbList
    const existingScript = document.getElementById('author-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'author-jsonld-schema';

    const authorSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${canonicalUrl}#person`,
          name: author.name,
          jobTitle: author.position,
          description: author.bio,
          image: author.photoUrl,
          url: canonicalUrl,
          worksFor: {
            '@type': 'NewsMediaOrganization',
            name: settings.identity.siteName || 'BatuTV',
            url: baseDomain,
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
              name: 'Redaksi',
              item: `${baseDomain}/redaksi`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: author.name,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };

    jsonLdScript.textContent = JSON.stringify(authorSchema);
    document.head.appendChild(jsonLdScript);

    return () => {
      const el = document.getElementById('author-jsonld-schema');
      if (el) el.remove();
    };
  }, [author, baseDomain, settings]);

  // Normalize string helper
  const normalize = (str?: string) =>
    (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  // Get matching published articles by this author
  const matchingArticles = useMemo(() => {
    const articles = getStoredArticles();
    const authorNameNorm = normalize(author.name);
    const authorSlugNorm = normalize(author.slug);

    const filtered = articles.filter((art) => {
      if (art.status !== 'published') return false;
      const artAuthorNorm = normalize(art.author);
      return (
        artAuthorNorm === authorNameNorm ||
        artAuthorNorm === authorSlugNorm ||
        artAuthorNorm.includes(authorNameNorm) ||
        authorNameNorm.includes(artAuthorNorm)
      );
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    );
  }, [author]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(matchingArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return matchingArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [matchingArticles, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <main
      id="main-author-content"
      className="flex-1 w-full bg-[#f8f9fa] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300"
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* ========================================================================= */}
        {/* BREADCRUMB NAVIGATION                                                     */}
        {/* ========================================================================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-red-600 font-medium transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400">Penulis</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 truncate max-w-xs">{author.name}</span>
        </nav>

        {/* ========================================================================= */}
        {/* AUTHOR PROFILE HEADER                                                     */}
        {/* ========================================================================= */}
        <header className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Author Avatar with Ring */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-red-100 shadow-md bg-slate-100">
                <img
                  src={getOptimizedImageUrl(author.photoUrl, 'medium')}
                  alt={`Foto profil ${author.name}`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 p-1.5 bg-red-600 text-white rounded-full shadow-md border-2 border-white" title="Terverifikasi Redaksi">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Author Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-full tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>{author.position || 'Jurnalis BatuTV'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {author.name}
                </h1>
              </div>

              {/* Bio */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                {author.bio}
              </p>

              {/* Meta & Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-slate-800">{matchingArticles.length}</span>
                  <span>Artikel Diterbitkan</span>
                </div>
                {author.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{author.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* PUBLISHED ARTICLES LIST                                                   */}
        {/* ========================================================================= */}
        <section aria-labelledby="author-articles-heading" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              <h2
                id="author-articles-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
              >
                Karya Tulis &amp; Liputan ({matchingArticles.length})
              </h2>
            </div>
          </div>

          {paginatedArticles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Belum Ada Artikel Dipublikasikan</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Penulis ini belum memiliki naskah berita yang berstatus terbit saat ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => {
                    if (onSelectArticle) {
                      onSelectArticle(art.slug);
                    } else {
                      onNavigate(`/berita/${art.slug}`);
                    }
                  }}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer"
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(art.featuredImage, 'medium')}
                      alt={art.imageAlt || art.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold uppercase rounded-md tracking-wider shadow-xs">
                        {art.category || 'Berita'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      {art.excerpt && (
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {art.publishedAt ? formatTimeAgo(art.publishedAt) : 'Terbaru'}
                      </span>
                      <span className="font-semibold text-red-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGINATION CONTROLS                                                       */}
          {/* ========================================================================= */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
