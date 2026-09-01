import React, { useEffect, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  Home,
  FileQuestion,
  ArrowLeft,
  BookOpen,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { AdminPage } from '../../types/admin';
import { getStoredPages, getPageBySlug, getPublishedPages } from '../../data/pagesAdminStore';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';

interface InformationPageViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

/**
 * Helper to update or create a meta tag safely
 */
function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create canonical link
 */
function setCanonicalLink(url: string | null) {
  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (url) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  } else if (canonical) {
    canonical.remove();
  }
}

export const InformationPageView: React.FC<InformationPageViewProps> = ({
  slug,
  onNavigate,
}) => {
  // Normalize clean slug (strip query params, hash, leading/trailing slashes)
  const cleanSlug = useMemo(() => {
    return (slug || '')
      .toLowerCase()
      .trim()
      .split('?')[0]
      .split('#')[0]
      .replace(/^\/+|\/+$/g, '');
  }, [slug]);

  // Find target page by slug
  const page = useMemo(() => {
    return getPageBySlug(cleanSlug);
  }, [cleanSlug]);

  const isPublished = page?.status === 'published';

  // Dynamic SEO, Meta Robots, Canonical & Open Graph synchronization
  useEffect(() => {
    const settings = getStoredSiteSettings();
    const baseDomain = getBaseDomain();
    const siteName = settings.identity.siteName || 'BATUTV';
    const titleSep = settings.seo.titleSeparator || '|';

    if (page && isPublished) {
      const pageTitle = page.seoTitle || `${page.title} ${titleSep} ${siteName}`;
      document.title = pageTitle;

      const pageDesc =
        page.metaDescription ||
        page.excerpt ||
        `Informasi resmi mengenai ${page.title} dari ${siteName}.`;
      const canonicalUrl = `${baseDomain}/${page.slug}`;
      const imageUrl =
        page.featuredImageUrl || settings.seo.defaultOgImage || `${baseDomain}/logo.png`;

      // 1. Robots Indexing: Allowed for Published
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow');

      // 2. Standard Meta Description
      setMetaTag('meta[name="description"]', 'name', 'description', pageDesc);

      // 3. Open Graph Tags
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', pageDesc);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
      setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);

      // 4. Canonical URL
      setCanonicalLink(canonicalUrl);
    } else {
      // 404 Mode: Strict noindex to prevent crawler indexing
      document.title = `Halaman Tidak Ditemukan (404) ${titleSep} ${siteName}`;
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
      setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', 'noindex, nofollow');
      setCanonicalLink(null);
    }

    // Smooth scroll to top on page switch
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cleanup when unmounting or navigating away
    return () => {
      // restore default robots index
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
    };
  }, [page, isPublished]);

  // Structured Data JSON-LD Schema (WebPage + BreadcrumbList)
  const structuredData = useMemo(() => {
    if (!page || !isPublished) return null;

    const settings = getStoredSiteSettings();
    const baseDomain = getBaseDomain();
    const siteName = settings.identity.siteName || 'BATUTV';
    const pageUrl = `${baseDomain}/${page.slug}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: page.seoTitle || page.title,
          headline: page.title,
          description: page.metaDescription || page.excerpt || '',
          inLanguage: 'id-ID',
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${baseDomain}/#website`,
            name: siteName,
            url: baseDomain,
          },
          breadcrumb: {
            '@id': `${pageUrl}#breadcrumb`,
          },
          publisher: {
            '@type': 'NewsMediaOrganization',
            name: siteName,
            url: baseDomain,
            logo: {
              '@type': 'ImageObject',
              url: settings.logos.publisherSchema || settings.logos.headerDesktop || `${baseDomain}/logo.png`,
            },
          },
          datePublished: page.createdAt,
          dateModified: page.updatedAt || page.createdAt,
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
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
              name: page.title,
              item: pageUrl,
            },
          ],
        },
      ],
    };
  }, [page, isPublished]);

  // Handle internal link navigation clicked inside rendered HTML content
  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      // If relative internal path and not opening in new tab/window
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        target.target !== '_blank'
      ) {
        e.preventDefault();
        onNavigate(href);
      }
    },
    [onNavigate]
  );

  // 404 NOT FOUND VIEW (Draft or non-existent)
  if (!page || !isPublished) {
    return (
      <main className="w-full bg-[#f8f9fa] min-h-[65vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-[540px] w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-extrabold uppercase tracking-wider rounded-md">
              Error 404
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Halaman informasi pada alamat{' '}
              <span className="font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                /{cleanSlug || 'slug'}
              </span>{' '}
              tidak tersedia, masih dalam status draft, atau telah dipindahkan.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onNavigate('/');
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </a>
            <a
              href="/peta-situs"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onNavigate('/peta-situs');
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Lihat Peta Situs</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  // PUBLISHED PAGE VIEW
  return (
    <main className="w-full bg-[#f8f9fa] min-h-screen text-slate-900 pb-16">
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          id="schema-webpage-page"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* ========================================================= */}
      {/* 1. BREADCRUMB NAVIGATION                                   */}
      {/* ========================================================= */}
      <div className="w-full bg-white border-b border-slate-200/80">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-600 font-medium overflow-x-auto"
          >
            {/* Home Link with full semantic href */}
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onNavigate('/');
                }
              }}
              className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 transition-colors shrink-0 group"
            >
              <Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
              <span>Home</span>
            </a>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Active Current Page Name */}
            <span
              aria-current="page"
              className="text-slate-900 font-semibold truncate"
            >
              {page.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT CONTAINER (MAX-W-980PX HOMEPAGE EQUIVALENT)*/}
      {/* ========================================================= */}
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <article className="w-full bg-white p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-none">
          {/* Page Main Heading */}
          <header className="mb-6 pb-4 border-b border-slate-100">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {page.title}
            </h1>
          </header>

          {/* Optional Featured Image Header */}
          {page.featuredImageUrl && (
            <figure className="mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={page.featuredImageUrl}
                alt={page.title}
                className="w-full h-auto max-h-[380px] object-cover"
                loading="lazy"
              />
            </figure>
          )}

          {/* Semantic HTML Page Content with Event-Delegated Internal Linking */}
          <div
            onClick={handleContentClick}
            className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 [&>p]:leading-relaxed [&>p]:text-slate-700 [&>h2]:text-lg sm:[&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-2.5 [&>h2]:pt-3 [&>h2]:border-t [&>h2]:border-slate-100 [&>h3]:text-sm sm:[&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-5 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>li]:text-slate-700 [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:bg-slate-50 [&>blockquote]:p-3.5 [&>blockquote]:rounded-r-xl [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>a]:text-red-600 [&>a]:font-semibold [&>a]:underline hover:[&>a]:text-red-700"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </main>
  );
};
