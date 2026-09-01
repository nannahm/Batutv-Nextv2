/**
 * BatuTV SEO Foundation Generator
 * Generates:
 * 1. /sitemap.xml (Standard XML Sitemap for Homepage, Articles, Videos, Categories, Tags, Static Pages)
 * 2. /sitemap-news.xml (Google News Sitemap for Published News Articles)
 * 3. /robots.txt (Crawler directives with sitemap links)
 */

import { getStoredArticles, getArticlePublishedTimestamp } from '../data/newsAdminStore';
import { initialAdminArticles } from '../data/newsAdminDummyData';
import { getStoredVideos } from '../data/videoAdminStore';
import { initialAdminVideos } from '../data/videoAdminDummyData';
import { getStoredCategories } from '../data/categoryAdminStore';
import { initialAdminCategories } from '../data/categoryAdminDummyData';
import { getStoredTags } from '../data/tagAdminStore';
import { initialAdminTags } from '../data/tagAdminDummyData';
import { getStoredPages, getPublishedPages } from '../data/pagesAdminStore';
import { initialAdminPagesData } from '../data/pagesAdminDummyData';
import { getStoredSiteSettings, INITIAL_SITE_SETTINGS } from '../data/siteSettingsStore';
import { allNewsArticles } from '../data/dummyNews';
import { defaultMainVideo, defaultLatestVideoFeed } from '../data/dummyVideos';

// Helper to escape XML special characters
export function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to format ISO date string (W3C Datetime format: YYYY-MM-DDThh:mm:ss+07:00 or ISO)
export function formatW3CDate(dateInput?: string | number | Date): string {
  if (!dateInput) {
    return new Date().toISOString();
  }
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // fallback
  }
  return new Date().toISOString();
}

// Get the canonical base domain
export function getBaseDomain(domainOverride?: string): string {
  if (domainOverride && domainOverride.trim().length > 0) {
    return domainOverride.replace(/\/+$/, '');
  }

  // If in browser and on a live host (e.g., vercel.app or custom host)
  if (typeof window !== 'undefined' && window.location.origin) {
    const currentOrigin = window.location.origin.replace(/\/+$/, '');
    try {
      const settings = getStoredSiteSettings();
      const configuredDomain = settings?.identity?.mainDomain?.replace(/\/+$/, '');
      // If user explicitly configured a matching custom domain, or if configuredDomain is not the default 'https://batutv.com'
      if (configuredDomain && configuredDomain !== 'https://batutv.com' && !configuredDomain.includes('localhost')) {
        return configuredDomain;
      }
    } catch {
      // ignore
    }
    // Default to the actual live origin the user is currently on
    if (currentOrigin && !currentOrigin.includes('localhost:3000')) {
      return currentOrigin;
    }
  }

  try {
    const settings = getStoredSiteSettings();
    if (settings?.identity?.mainDomain) {
      return settings.identity.mainDomain.replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }
  return 'https://batutv.com';
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  type: 'homepage' | 'article' | 'video' | 'category' | 'tag' | 'page';
  title?: string;
}

export interface NewsSitemapEntry {
  loc: string;
  publicationName: string;
  publicationLanguage: string;
  publicationDate: string;
  title: string;
  keywords?: string;
}

/**
 * Collect all published, valid URLs across BatuTV ecosystem
 */
export function getPublishedSitemapEntries(domainOverride?: string): SitemapEntry[] {
  const baseDomain = getBaseDomain(domainOverride);
  const nowIso = new Date().toISOString();
  const entries: SitemapEntry[] = [];
  const seenLocs = new Set<string>();

  const addEntry = (entry: SitemapEntry) => {
    // Clean and validate URL
    if (!entry.loc || typeof entry.loc !== 'string') return;
    const cleanLoc = entry.loc.trim();
    if (seenLocs.has(cleanLoc)) return;
    seenLocs.add(cleanLoc);
    entries.push({
      ...entry,
      loc: cleanLoc,
    });
  };

  // 1. Homepage (Priority: 1.0, Changefreq: daily)
  addEntry({
    loc: `${baseDomain}/`,
    lastmod: nowIso,
    changefreq: 'daily',
    priority: '1.0',
    type: 'homepage',
    title: 'BatuTV - Beranda Portal Berita Batu Raya & Live Streaming',
  });

  // 2. Published News Articles (Priority: 0.9, Changefreq: daily)
  // Exclude drafts, scheduled in future, and trash
  const allArticles = typeof window !== 'undefined' ? getStoredArticles() : initialAdminArticles;
  const combinedArticles = [...allArticles];

  // Also include legacy dummy articles if not already in store
  for (const legacy of allNewsArticles) {
    if (!combinedArticles.some((a) => a.slug === legacy.slug || a.id === legacy.id)) {
      combinedArticles.push({
        id: legacy.id,
        title: legacy.title,
        slug: legacy.slug,
        excerpt: legacy.summary,
        content: Array.isArray(legacy.content) ? legacy.content.join('\n\n') : legacy.content,
        category: legacy.category,
        categorySlug: legacy.categorySlug || legacy.category?.toLowerCase() || 'berita',
        featuredImage: legacy.imageUrl,
        imageCaption: legacy.title,
        imageAlt: legacy.title,
        author: legacy.author?.name || 'Redaksi BatuTV',
        editor: 'Redaktur BatuTV',
        status: 'published',
        publishedAt: legacy.publishedAt || nowIso,
        createdAt: legacy.publishedAt || nowIso,
        updatedAt: legacy.publishedAt || nowIso,
        seoTitle: legacy.title,
        metaDescription: legacy.summary,
        canonicalUrl: `${baseDomain}/berita/${legacy.slug}`,
        views: legacy.views || 100,
        tags: legacy.tags || ['BatuTV', 'Kota Batu'],
      });
    }
  }

  const nowTime = Date.now();
  for (const art of combinedArticles) {
    // Filter strictly published only
    if (art.status !== 'published') continue;
    if (!art.slug || art.slug.trim().length === 0) continue;

    const cleanSlug = art.slug.trim().replace(/^\/+|\/+$/g, '');
    const lastMod = art.updatedAt || art.publishedAt || art.createdAt || nowIso;

    addEntry({
      loc: `${baseDomain}/berita/${cleanSlug}`,
      lastmod: formatW3CDate(lastMod),
      changefreq: 'daily',
      priority: '0.9',
      type: 'article',
      title: art.title,
    });
  }

  // 3. Published Videos (Priority: 0.8, Changefreq: daily)
  const allVideos = typeof window !== 'undefined' ? getStoredVideos() : initialAdminVideos;
  const combinedVideos = [...allVideos];

  if (!combinedVideos.some((v) => v.slug === defaultMainVideo.slug || v.id === defaultMainVideo.id)) {
    combinedVideos.push({
      id: defaultMainVideo.id,
      title: defaultMainVideo.title,
      slug: defaultMainVideo.slug,
      excerpt: defaultMainVideo.summary,
      description: defaultMainVideo.summary,
      youtubeUrl: defaultMainVideo.youtubeUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeVideoId: defaultMainVideo.youtubeVideoId || 'dQw4w9WgXcQ',
      thumbnailSource: 'youtube',
      category: defaultMainVideo.category,
      categorySlug: defaultMainVideo.categorySlug || 'nasional',
      duration: defaultMainVideo.duration || '03:45',
      author: defaultMainVideo.author?.name || 'Tim Redaksi BatuTV',
      status: 'published',
      publishedAt: defaultMainVideo.publishedIso || nowIso,
      createdAt: defaultMainVideo.publishedIso || nowIso,
      updatedAt: defaultMainVideo.updatedIso || nowIso,
      seoTitle: defaultMainVideo.title,
      metaDescription: defaultMainVideo.summary,
      canonicalUrl: `${baseDomain}/video/${defaultMainVideo.slug}`,
      views: defaultMainVideo.views || 250,
      tags: defaultMainVideo.tags?.map((t) => t.name) || ['Video', 'BatuTV'],
    });
  }

  for (const legVid of defaultLatestVideoFeed) {
    if (!combinedVideos.some((v) => v.slug === legVid.slug || v.id === legVid.id)) {
      combinedVideos.push({
        id: legVid.id,
        title: legVid.title,
        slug: legVid.slug,
        excerpt: legVid.title,
        description: legVid.title,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeVideoId: 'dQw4w9WgXcQ',
        thumbnailSource: 'youtube',
        category: legVid.category,
        categorySlug: legVid.category?.toLowerCase() || 'berita',
        duration: legVid.duration || '04:30',
        author: 'Tim Redaksi BatuTV',
        status: 'published',
        publishedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        seoTitle: legVid.title,
        metaDescription: legVid.title,
        canonicalUrl: `${baseDomain}/video/${legVid.slug}`,
        views: 250,
        tags: ['Video', 'BatuTV'],
      });
    }
  }

  for (const vid of combinedVideos) {
    if (vid.status !== 'published') continue;
    if (vid.scheduledAt && new Date(vid.scheduledAt).getTime() > nowTime) {
      continue;
    }
    if (!vid.slug || vid.slug.trim().length === 0) continue;

    const cleanSlug = vid.slug.trim().replace(/^\/+|\/+$/g, '');
    const lastMod = vid.updatedAt || vid.publishedAt || vid.createdAt || nowIso;

    addEntry({
      loc: `${baseDomain}/video/${cleanSlug}`,
      lastmod: formatW3CDate(lastMod),
      changefreq: 'daily',
      priority: '0.8',
      type: 'video',
      title: vid.title,
    });
  }

  // 4. Categories (Priority: 0.7, Changefreq: daily)
  const allCategories = typeof window !== 'undefined' ? getStoredCategories() : initialAdminCategories;
  for (const cat of allCategories) {
    if (cat.status !== 'active') continue;
    if (!cat.slug || cat.slug.trim().length === 0) continue;

    const cleanSlug = cat.slug.trim().replace(/^\/+|\/+$/g, '');
    addEntry({
      loc: `${baseDomain}/kategori/${cleanSlug}`,
      lastmod: formatW3CDate(cat.updatedAt || cat.createdAt || nowIso),
      changefreq: 'daily',
      priority: '0.7',
      type: 'category',
      title: `Kategori: ${cat.name}`,
    });
  }

  // 5. Tags (Priority: 0.6, Changefreq: weekly)
  const allTags = typeof window !== 'undefined' ? getStoredTags() : initialAdminTags;
  for (const tag of allTags) {
    if (tag.status !== 'active') continue;
    if (!tag.slug || tag.slug.trim().length === 0) continue;

    const cleanSlug = tag.slug.trim().replace(/^\/+|\/+$/g, '').replace(/^#/, '');
    addEntry({
      loc: `${baseDomain}/tag/${cleanSlug}`,
      lastmod: formatW3CDate(tag.updatedAt || tag.createdAt || nowIso),
      changefreq: 'weekly',
      priority: '0.6',
      type: 'tag',
      title: `Tag: #${tag.name}`,
    });
  }

  // 6. Pages (Priority: 0.5, Changefreq: monthly)
  const allPages = typeof window !== 'undefined' ? getPublishedPages() : initialAdminPagesData.filter((p) => p.status === 'published');
  for (const page of allPages) {
    if (page.status !== 'published') continue;
    if (!page.slug || page.slug.trim().length === 0) continue;

    const cleanSlug = page.slug.trim().replace(/^\/+|\/+$/g, '');
    addEntry({
      loc: `${baseDomain}/${cleanSlug}`,
      lastmod: formatW3CDate(page.updatedAt || page.createdAt || nowIso),
      changefreq: 'monthly',
      priority: '0.5',
      type: 'page',
      title: page.title,
    });
  }

  return entries;
}

/**
 * Generate standard /sitemap.xml
 */
export function generateSitemapXml(domainOverride?: string): string {
  const entries = getPublishedSitemapEntries(domainOverride);

  const xmlItems = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${escapeXml(entry.changefreq || 'daily')}</changefreq>
    <priority>${escapeXml(entry.priority || '0.5')}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
}

/**
 * Collect published news articles for Google News Sitemap
 */
export function getNewsSitemapEntries(domainOverride?: string): NewsSitemapEntry[] {
  const baseDomain = getBaseDomain(domainOverride);
  const nowIso = new Date().toISOString();
  const nowTime = Date.now();

  const settings = typeof window !== 'undefined' ? getStoredSiteSettings() : INITIAL_SITE_SETTINGS;
  const publicationName = settings?.identity?.siteName || 'BATUTV';

  const allArticles = typeof window !== 'undefined' ? getStoredArticles() : initialAdminArticles;
  const combinedArticles = [...allArticles];

  for (const legacy of allNewsArticles) {
    if (!combinedArticles.some((a) => a.slug === legacy.slug || a.id === legacy.id)) {
      combinedArticles.push({
        id: legacy.id,
        title: legacy.title,
        slug: legacy.slug,
        excerpt: legacy.summary,
        content: Array.isArray(legacy.content) ? legacy.content.join('\n\n') : legacy.content,
        category: legacy.category,
        categorySlug: legacy.categorySlug || legacy.category?.toLowerCase() || 'berita',
        featuredImage: legacy.imageUrl,
        imageCaption: legacy.title,
        imageAlt: legacy.title,
        author: legacy.author?.name || 'Redaksi BatuTV',
        editor: 'Redaktur BatuTV',
        status: 'published',
        publishedAt: legacy.publishedAt || nowIso,
        createdAt: legacy.publishedAt || nowIso,
        updatedAt: legacy.publishedAt || nowIso,
        seoTitle: legacy.title,
        metaDescription: legacy.summary,
        canonicalUrl: `${baseDomain}/berita/${legacy.slug}`,
        views: legacy.views || 100,
        tags: legacy.tags || ['BatuTV', 'Kota Batu'],
      });
    }
  }

  // Filter published only, exclude drafts, trash, and future scheduled
  const publishedArticles = combinedArticles.filter((art) => {
    if (art.status !== 'published') return false;
    return Boolean(art.slug && art.slug.trim().length > 0 && art.title && art.title.trim().length > 0);
  });

  // Sort descending by publication date
  publishedArticles.sort((a, b) => {
    const timeA = getArticlePublishedTimestamp(a);
    const timeB = getArticlePublishedTimestamp(b);
    return timeB - timeA;
  });

  const newsEntries: NewsSitemapEntry[] = [];
  const seenLocs = new Set<string>();

  for (const art of publishedArticles) {
    const cleanSlug = art.slug.trim().replace(/^\/+|\/+$/g, '');
    const loc = `${baseDomain}/berita/${cleanSlug}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);

    const pubDate = formatW3CDate(art.publishedAt || art.createdAt || nowIso);
    newsEntries.push({
      loc,
      publicationName,
      publicationLanguage: 'id',
      publicationDate: pubDate,
      title: art.title.trim(),
      keywords: art.tags && art.tags.length > 0 ? art.tags.join(', ') : undefined,
    });
  }

  return newsEntries;
}

/**
 * Generate Google News Sitemap /sitemap-news.xml
 */
export function generateNewsSitemapXml(domainOverride?: string): string {
  const entries = getNewsSitemapEntries(domainOverride);

  const xmlItems = entries
    .map((entry) => {
      const keywordsTag = entry.keywords
        ? `\n        <news:keywords>${escapeXml(entry.keywords)}</news:keywords>`
        : '';

      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(entry.publicationName)}</news:name>
        <news:language>${escapeXml(entry.publicationLanguage)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(entry.publicationDate)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>${keywordsTag}
    </news:news>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;
}

/**
 * Generate /robots.txt
 */
export function generateRobotsTxt(domainOverride?: string): string {
  const baseDomain = getBaseDomain(domainOverride);

  return `# Robots.txt for BatuTV News Portal
# Website: ${baseDomain}
# Google News & Search Console Ready

User-agent: *
Allow: /

# Disallow admin CMS and internal control panel routes
Disallow: /batutv-control/
Disallow: /batutv-control/*

# Explicitly ensure public portal routes are crawlable
Allow: /
Allow: /berita/
Allow: /video/
Allow: /kategori/
Allow: /tag/
Allow: /pages/

# XML Sitemaps
Sitemap: ${baseDomain}/sitemap.xml
Sitemap: ${baseDomain}/sitemap-news.xml
`;
}
