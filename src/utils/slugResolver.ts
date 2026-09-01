import { getStoredArticles } from '../data/newsAdminStore';
import { allNewsArticles } from '../data/dummyNews';
import { getStoredVideos } from '../data/videoAdminStore';
import { defaultMainVideo, defaultLatestVideoFeed, defaultPopularVideosSidebar } from '../data/dummyVideos';
import { getStoredCategories } from '../data/categoryAdminStore';
import { categoriesData } from '../data/dummyNews';
import { getStoredTags } from '../data/tagAdminStore';
import { getStoredPages, getPublishedPages } from '../data/pagesAdminStore';
import { getStoredAuthors } from '../data/authorAdminStore';
import { initialAdminAuthors } from '../data/authorAdminDummyData';

/**
 * Checks whether an article with the given slug exists and is published
 */
export function isArticlePublished(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase();
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const stored = getStoredArticles();
  const foundStored = stored.find(
    (a) => (a.slug && a.slug.toLowerCase() === clean) || (a.id && a.id.toLowerCase() === clean)
  );

  if (foundStored) {
    return foundStored.status === 'published';
  }

  const foundDummy = allNewsArticles.find(
    (a) => (a.slug && a.slug.toLowerCase() === clean) || (a.id && a.id.toLowerCase() === clean)
  );
  return Boolean(foundDummy);
}

/**
 * Checks whether a video with the given slug exists and is published
 */
export function isVideoPublished(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase();
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const nowTime = Date.now();
  const stored = getStoredVideos();
  const foundStored = stored.find(
    (v) => (v.slug && v.slug.toLowerCase() === clean) || (v.id && v.id.toLowerCase() === clean)
  );

  if (foundStored) {
    if (foundStored.status !== 'published') return false;
    if (foundStored.scheduledAt && new Date(foundStored.scheduledAt).getTime() > nowTime) {
      return false;
    }
    return true;
  }

  if (defaultMainVideo.slug.toLowerCase() === clean || defaultMainVideo.id.toLowerCase() === clean) {
    return true;
  }

  const inLatest = defaultLatestVideoFeed.some(
    (v) => (v.slug && v.slug.toLowerCase() === clean) || (v.id && v.id.toLowerCase() === clean)
  );
  if (inLatest) return true;

  const inPopular = defaultPopularVideosSidebar.some(
    (v) => (v.slug && v.slug.toLowerCase() === clean) || (v.id && v.id.toLowerCase() === clean)
  );
  return Boolean(inPopular);
}

/**
 * Checks whether a category with the given slug exists
 */
export function isCategoryExists(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase().replace(/^\/kategori\/?/, '').replace(/\/$/, '');
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const stored = getStoredCategories();
  const foundStored = stored.find(
    (c) => c.slug.toLowerCase() === clean && c.status === 'active'
  );
  if (foundStored) return true;

  const foundDummy = categoriesData.find(
    (c) => c.slug.toLowerCase() === clean
  );
  return Boolean(foundDummy);
}

/**
 * Checks whether a tag with the given slug exists
 */
export function isTagExists(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase().replace(/^\/tag\/?/, '').replace(/^#/, '').replace(/\/$/, '');
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const stored = getStoredTags();
  const foundStored = stored.find(
    (t) => t.slug.toLowerCase() === clean && t.status === 'active'
  );
  if (foundStored) return true;

  // Also check if any stored article or video has this tag
  const articles = getStoredArticles();
  const hasArticleTag = articles.some((a) =>
    a.tags?.some((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean)
  );
  if (hasArticleTag) return true;

  return false;
}

/**
 * Checks whether a static information page with the given slug exists and is published
 */
export function isStaticPagePublished(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase().split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const pages = getPublishedPages();
  return pages.some((p) => p.slug.toLowerCase() === clean && p.status === 'published');
}


/**
 * Checks whether an author with the given slug exists
 */
export function isAuthorExists(slug?: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const clean = slug.trim().toLowerCase().replace(/^\/penulis\/?/, '').replace(/\/$/, '');
  if (!clean || clean === 'undefined' || clean === 'null') return false;

  const stored = getStoredAuthors();
  const foundStored = stored.find(
    (a) => a.slug.toLowerCase() === clean && a.status === 'active'
  );
  if (foundStored) return true;

  const foundDummy = initialAdminAuthors.find(
    (a) => a.slug.toLowerCase() === clean && a.status === 'active'
  );
  if (foundDummy) return true;

  // Also check if any stored article has author matching slug or name
  const articles = getStoredArticles();
  const hasArticle = articles.some(
    (art) =>
      art.author?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean ||
      art.author?.toLowerCase().includes(clean.replace(/-/g, ' '))
  );
  return hasArticle;
}

/**
 * Validates whether a value is a valid, non-empty slug/id string.
 * Rejects whitespace-only, empty strings, and accidental "undefined"/"null" string literals.
 */
export function isValidSlugString(val: unknown): val is string {
  if (typeof val === 'number') {
    return !isNaN(val);
  }
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN') return false;
  return true;
}

/**
 * Normalizes and sanitizes a raw title or string into a URL-friendly slug.
 */
export function sanitizeSlug(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Strict Article Slug Resolver following the business rules:
 * Priority 1: If slug is valid -> use slug.
 * Priority 2: If slug is missing/empty/whitespace but ID is valid -> use ID as unique fallback.
 * Priority 3: If both slug and ID are invalid/empty -> return '' (never fallback to generic universal slug).
 */
export function resolveArticleSlug(
  slug?: string | null,
  id?: string | number | null
): string {
  if (isValidSlugString(slug)) {
    return String(slug).trim();
  }
  if (isValidSlugString(id)) {
    return String(id).trim();
  }
  return '';
}

/**
 * Resolves the absolute internal link for an article.
 * Returns `/berita/${resolvedSlug}` if valid, or empty string `''` if invalid.
 * Never returns generic fallback like `/berita/berita-terkini` or paths containing `undefined`/`null`.
 */
export function resolveArticleHref(
  slug?: string | null,
  id?: string | number | null,
  rawHref?: string | null
): string {
  const targetSlug = resolveArticleSlug(slug, id);
  if (targetSlug) {
    return `/berita/${targetSlug}`;
  }
  if (rawHref && typeof rawHref === 'string') {
    const trimmedHref = rawHref.trim();
    if (
      trimmedHref.startsWith('/berita/') &&
      trimmedHref !== '/berita/' &&
      trimmedHref !== '/berita/berita-terkini' &&
      !trimmedHref.includes('undefined') &&
      !trimmedHref.includes('null')
    ) {
      return trimmedHref;
    }
  }
  return '';
}

/**
 * Ensures all items in a feed have distinct, non-colliding slugs and hrefs.
 * If multiple different items share the exact same slug, appends a unique suffix (e.g. `-${id}`)
 * so that no two published articles share identical URLs.
 */
export function ensureUniqueFeedSlugs<T extends { id?: string | number; slug?: string; href?: string }>(
  items: T[]
): T[] {
  const seenSlugs = new Map<string, string>(); // slug -> id

  return items.map((item) => {
    let resolved = resolveArticleSlug(item.slug, item.id);
    if (!resolved) {
      return {
        ...item,
        slug: '',
        href: '',
      };
    }

    const itemId = item.id !== undefined && item.id !== null ? String(item.id).trim() : '';

    // Check if this exact slug has already been assigned to a different article ID
    if (seenSlugs.has(resolved)) {
      const prevId = seenSlugs.get(resolved);
      if (prevId && itemId && prevId !== itemId) {
        // Disambiguate with item ID
        resolved = `${resolved}-${itemId}`;
      }
    } else {
      seenSlugs.set(resolved, itemId);
    }

    return {
      ...item,
      slug: resolved,
      href: `/berita/${resolved}`,
    };
  });
}
