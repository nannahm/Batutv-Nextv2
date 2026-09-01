import { AdminArticle, ArticleStatus } from '../types/admin';
import { initialAdminArticles } from './newsAdminDummyData';
import { HeroHeadlineData, HeadlineArticleData, defaultHeroHeadlineData } from '../components/HeroHeadlineGrid';
import { LatestNewsPost } from './latestNewsData';
import { resolveArticleSlug, resolveArticleHref, ensureUniqueFeedSlugs } from '../utils/slugResolver';
import { firestoreArticleRepository } from '../repositories/firestore/firestoreArticleRepository';

const STORAGE_KEY = 'batutv_admin_articles_store';

// Initialize real-time synchronization with Firestore
let isSubscribed = false;
export function initArticleStoreSync(): void {
  if (isSubscribed || typeof window === 'undefined') return;
  isSubscribed = true;

  firestoreArticleRepository.subscribe(
    (remoteArticles) => {
      if (Array.isArray(remoteArticles) && remoteArticles.length > 0) {
        saveStoredArticles(remoteArticles, false);
      }
    },
    (err) => {
      console.warn('[newsAdminStore] Firestore subscription error, retaining cache:', err);
    }
  );
}

// Auto-trigger sync on module load in client browser
if (typeof window !== 'undefined') {
  initArticleStoreSync();
}

// Helper to retrieve articles from localStorage or fallback to initial dummy data
export function getStoredArticles(): AdminArticle[] {
  if (typeof window === 'undefined') {
    return initialAdminArticles;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read articles from localStorage', e);
  }
  return initialAdminArticles;
}

// Helper to save articles to localStorage and notify all subscribers
export function saveStoredArticles(articles: AdminArticle[], syncToFirestore: boolean = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    // Dispatch reactive update event for instantaneous cross-component revalidation
    window.dispatchEvent(new CustomEvent('batutv_news_updated', { detail: { count: articles.length } }));
  } catch (e) {
    console.warn('Failed to save articles to localStorage', e);
  }
}

// Parse article published date string into exact timestamp for deterministic sorting (DESC)
export function getArticlePublishedTimestamp(art: AdminArticle): number {
  if (art.publishedAt) {
    const match = art.publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
      const t = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)).getTime();
      if (!isNaN(t)) return t;
    }
    const t = new Date(art.publishedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (art.createdAt) {
    const t = new Date(art.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

// Format date and time for News Feed display (Indonesian WIB standard)
export function formatNewsFeedDateTime(dateStr?: string): { date: string; time: string; fullDateIndo: string } {
  if (!dateStr) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return {
      date: `${d}/${m}/${y}`,
      time: `${hh}:${mm} WIB`,
      fullDateIndo: `${d} ${m} ${y}`,
    };
  }

  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, m, d, hh = '00', mm = '00'] = match;
      const day = d.padStart(2, '0');
      const month = m.padStart(2, '0');
      const year = y;
      const hours = hh.padStart(2, '0');
      const minutes = mm.padStart(2, '0');

      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const fullDateIndo = `${parseInt(day, 10)} ${monthNames[monthIndex] || month} ${year}`;

      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes} WIB`,
        fullDateIndo,
      };
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const fullDateIndo = `${d.getDate()} ${monthNames[d.getMonth()]} ${year}`;

      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes} WIB`,
        fullDateIndo,
      };
    }
  } catch {
    // ignore
  }

  return { date: '27/08/2026', time: '09:00 WIB', fullDateIndo: '27 Agustus 2026' };
}

/**
 * SO5 Query: Get all Published Articles for News Feed sorted strictly by publishedAt DESC
 * Guarantees that any newly published article immediately appears at index 0 on Homepage.
 */
export function getPublishedNewsFeedPosts(limit?: number): LatestNewsPost[] {
  const articles = getStoredArticles();
  const now = Date.now();

  // Strict Filter: Only status === 'published' (exclude draft, trash, and future scheduled)
  const publishedArticles = articles.filter((a) => {
    if (a.status !== 'published') return false;
    // Exclude scheduled articles that haven't reached their published time yet
    if (a.publishedAt) {
      const pubTime = getArticlePublishedTimestamp(a);
      if (pubTime > now) return false;
    }
    return true;
  });

  // Strict Sort: Order by publishedAt descending (latest first)
  publishedArticles.sort((a, b) => {
    return getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a);
  });

  // Map to LatestNewsPost format expected by SO5 MainPortalFeed & NewsFeedItem
  const rawFeedPosts: LatestNewsPost[] = publishedArticles.map((art) => {
    const dt = formatNewsFeedDateTime(art.publishedAt || art.createdAt);

    let cleanExcerpt = art.excerpt ? art.excerpt.trim() : '';
    if (!cleanExcerpt && art.content) {
      cleanExcerpt = art.content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
      if (cleanExcerpt.length >= 160) cleanExcerpt += '...';
    }

    const safeSlug = resolveArticleSlug(art.slug, art.id);
    const safeHref = resolveArticleHref(art.slug, art.id);

    return {
      id: art.id,
      title: art.title,
      category: art.category || 'Daerah',
      date: dt.date,
      time: dt.time,
      imageUrl:
        art.featuredImage ||
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
      imageAlt: art.imageAlt || art.title,
      excerpt: cleanExcerpt || 'Berita terkini seputar Kota Batu dan informasi nasional aktual dari redaksi BatuTV.',
      href: safeHref,
      slug: safeSlug,
    };
  });

  // Guarantee that every post in the published feed has a unique URL & slug without collisions
  const feedPosts = ensureUniqueFeedSlugs(rawFeedPosts);

  return limit ? feedPosts.slice(0, limit) : feedPosts;
}

// Get counts for sidebar badges and tabs
export function getArticlesCounts(articlesList?: AdminArticle[]) {
  const articles = articlesList || getStoredArticles();
  return {
    all: articles.filter((a) => a.status !== 'trash').length,
    draft: articles.filter((a) => a.status === 'draft').length,
    scheduled: articles.filter((a) => a.status === 'scheduled').length,
    published: articles.filter((a) => a.status === 'published').length,
    trash: articles.filter((a) => a.status === 'trash').length,
    headlines: articles.filter((a) => a.status === 'published' && a.isHeadline).length,
    totalWithTrash: articles.length,
  };
}

// Get single article by ID
export function getArticleById(id: string): AdminArticle | undefined {
  if (!id || typeof id !== 'string') return undefined;
  const trimmed = id.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
  const articles = getStoredArticles();
  return articles.find((a) => a.id === trimmed);
}

// Get single article by Slug or ID (fallback resolution support)
export function getArticleBySlug(slugOrId: string): AdminArticle | undefined {
  if (!slugOrId || typeof slugOrId !== 'string') return undefined;
  const trimmed = slugOrId.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
  const articles = getStoredArticles();
  return articles.find((a) => {
    if (a.slug && a.slug.trim() === trimmed) return true;
    if (a.id && a.id.trim() === trimmed) return true;
    if (a.slug && a.id && `${a.slug.trim()}-${a.id.trim()}` === trimmed) return true;
    return false;
  });
}

// Helper: Normalize headline positions to be 1..N without duplicates or gaps
export function normalizeHeadlinePositions(articles: AdminArticle[]): AdminArticle[] {
  // Get active published headlines
  const activeHeadlines = articles
    .filter((a) => a.status === 'published' && a.isHeadline)
    .sort((a, b) => (a.headlinePosition || 999) - (b.headlinePosition || 999));

  const headlineIdToPosMap = new Map<string, number>();
  activeHeadlines.forEach((art, index) => {
    headlineIdToPosMap.set(art.id, index + 1);
  });

  return articles.map((art) => {
    if (art.status === 'published' && art.isHeadline) {
      return {
        ...art,
        headlinePosition: headlineIdToPosMap.get(art.id) || null,
      };
    } else if (art.status !== 'published' && art.isHeadline) {
      // Keep editorial intention on draft/scheduled, but clear position to prevent conflicts
      return {
        ...art,
      };
    } else {
      return {
        ...art,
        isHeadline: false,
        headlinePosition: null,
      };
    }
  });
}

// Helper: Determine if an article is currently live and eligible for public display
export function isArticleLive(art: AdminArticle): boolean {
  if (art.status === 'trash' || art.status === 'draft') return false;
  const now = Date.now();

  if (art.status === 'published') {
    if (art.publishedAt) {
      const pubTime = getArticlePublishedTimestamp(art);
      if (pubTime > now) return false; // Future scheduled publish time
    }
    return true;
  }

  if (art.status === 'scheduled') {
    if (art.publishedAt) {
      const schTime = getArticlePublishedTimestamp(art);
      if (schTime <= now) return true; // Scheduled time has arrived
    }
    return false;
  }

  return false;
}

// Get active Hero Headline articles for SO3 (Strict Editorial Selection)
export function getHeroHeadlineArticles(): AdminArticle[] {
  const articles = getStoredArticles();
  const now = Date.now();

  return articles
    .filter((a) => {
      // 1. Must be live (published or scheduled that reached publish time)
      if (!isArticleLive(a)) return false;
      // 2. Must be explicitly flagged as headline by editorial
      if (!a.isHeadline) return false;
      // 3. Must not have passed its headlineUntil expiration
      if (a.headlineUntil) {
        const expTime = new Date(a.headlineUntil).getTime();
        if (!isNaN(expTime) && expTime < now) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Priority 1: Editorial Position (1..5)
      const posA = a.headlinePosition || 999;
      const posB = b.headlinePosition || 999;
      if (posA !== posB) return posA - posB;
      // Priority 2: Published date DESC (latest first)
      return getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a);
    });
}

// Format date and time for SO3 Headline component
function formatHeadlineDateTime(isoDateString?: string) {
  if (!isoDateString) {
    return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
  }
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) {
      return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const humanDate = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${year}`;
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes} WIB`,
      humanDate,
    };
  } catch {
    return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
  }
}

// Convert AdminArticle to HeadlineArticleData with safe slug & URL resolution
function mapAdminArticleToHeadlineData(art: AdminArticle): HeadlineArticleData {
  const dt = formatHeadlineDateTime(art.publishedAt || art.createdAt);
  const safeSlug = resolveArticleSlug(art.slug, art.id);
  const safeHref = resolveArticleHref(art.slug, art.id);

  return {
    id: art.id,
    category: art.category || 'Daerah',
    title: art.title,
    imageUrl:
      art.featuredImage ||
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
    imageAlt: art.imageAlt || art.title,
    date: dt.humanDate,
    time: dt.time,
    href: safeHref,
    slug: safeSlug,
  };
}

// Get structured HeroHeadlineData for SO3 Homepage Grid
export function getHeroHeadlineData(): HeroHeadlineData {
  const articles = getStoredArticles();
  const headlines = getHeroHeadlineArticles();

  // If no editorial headlines exist, fallback to latest published articles or defaults
  if (headlines.length === 0) {
    const livePublished = articles
      .filter((a) => isArticleLive(a))
      .sort((a, b) => getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a));

    if (livePublished.length > 0) {
      const mainArt = livePublished[0];
      const main = mapAdminArticleToHeadlineData(mainArt);
      const subHeadlines = livePublished.slice(1, 5).map(mapAdminArticleToHeadlineData);

      // Backfill up to 4 if needed
      if (subHeadlines.length < 4) {
        const remainingNeed = 4 - subHeadlines.length;
        const defaults = defaultHeroHeadlineData.subHeadlines.filter(
          (dh) => dh.slug !== main.slug && !subHeadlines.some((sh) => sh.slug === dh.slug)
        );
        subHeadlines.push(...defaults.slice(0, remainingNeed));
      }

      return {
        main,
        subHeadlines,
        adBanner: defaultHeroHeadlineData.adBanner,
      };
    }

    return defaultHeroHeadlineData;
  }

  const mainArticle = headlines[0];
  const main = mapAdminArticleToHeadlineData(mainArticle);
  const subHeadlines: HeadlineArticleData[] = headlines.slice(1, 5).map(mapAdminArticleToHeadlineData);

  // If fewer than 4 subheadlines from editorial, backfill from other live published articles first
  if (subHeadlines.length < 4) {
    const headlineIds = new Set(headlines.map((h) => h.id));
    const otherLiveArticles = articles
      .filter((a) => isArticleLive(a) && !headlineIds.has(a.id))
      .sort((a, b) => getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a));

    for (const art of otherLiveArticles) {
      if (subHeadlines.length >= 4) break;
      subHeadlines.push(mapAdminArticleToHeadlineData(art));
    }

    // Final safety backfill from default headlines if database has very few articles
    if (subHeadlines.length < 4) {
      const remainingNeed = 4 - subHeadlines.length;
      const defaults = defaultHeroHeadlineData.subHeadlines.filter(
        (dh) => dh.slug !== main.slug && !subHeadlines.some((sh) => sh.slug === dh.slug)
      );
      subHeadlines.push(...defaults.slice(0, remainingNeed));
    }
  }

  return {
    main,
    subHeadlines,
    adBanner: defaultHeroHeadlineData.adBanner,
  };
}

// Save or Update Article
export function persistArticle(article: AdminArticle): AdminArticle[] {
  const articles = getStoredArticles();
  const existingIdx = articles.findIndex((a) => a.id === article.id);

  let updatedList: AdminArticle[];
  let articleToSave: AdminArticle;
  if (existingIdx >= 0) {
    articleToSave = {
      ...article,
      updatedAt: new Date().toISOString(),
    };
    updatedList = [...articles];
    updatedList[existingIdx] = articleToSave;
  } else {
    articleToSave = {
      ...article,
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: article.views || 0,
    };
    updatedList = [articleToSave, ...articles];
  }

  const normalized = normalizeHeadlinePositions(updatedList);
  saveStoredArticles(normalized);

  // Asynchronously synchronize to Firestore Database
  firestoreArticleRepository.saveArticle(articleToSave).catch((err) => {
    console.warn('[newsAdminStore] Error syncing article to Firestore:', err);
  });

  return normalized;
}

// Move to Trash
export function moveArticleToTrash(id: string): AdminArticle[] {
  const articles = getStoredArticles();
  let trashedArticle: AdminArticle | null = null;
  const updated = articles.map((a) => {
    if (a.id === id) {
      trashedArticle = {
        ...a,
        status: 'trash' as ArticleStatus,
        isHeadline: false,
        headlinePosition: null,
        updatedAt: new Date().toISOString(),
      };
      return trashedArticle;
    }
    return a;
  });
  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);

  if (trashedArticle) {
    firestoreArticleRepository.saveArticle(trashedArticle).catch((err) => {
      console.warn('[newsAdminStore] Error syncing trash status to Firestore:', err);
    });
  }

  return normalized;
}

// Restore from Trash
export function restoreArticleFromTrash(id: string): AdminArticle[] {
  const articles = getStoredArticles();
  let restoredArticle: AdminArticle | null = null;
  const updated = articles.map((a) => {
    if (a.id === id) {
      restoredArticle = { ...a, status: 'draft' as ArticleStatus, updatedAt: new Date().toISOString() };
      return restoredArticle;
    }
    return a;
  });
  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);

  if (restoredArticle) {
    firestoreArticleRepository.saveArticle(restoredArticle).catch((err) => {
      console.warn('[newsAdminStore] Error syncing restored article to Firestore:', err);
    });
  }

  return normalized;
}

// Delete Permanently
export function deleteArticlePermanently(id: string): AdminArticle[] {
  const articles = getStoredArticles();
  const updated = articles.filter((a) => a.id !== id);
  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);

  // Asynchronously delete from Firestore
  firestoreArticleRepository.deleteArticle(id).catch((err) => {
    console.warn('[newsAdminStore] Error deleting article permanently from Firestore:', err);
  });

  return normalized;
}

// Duplicate Article
export function duplicateArticle(id: string): { updatedArticles: AdminArticle[]; newArticle: AdminArticle | null } {
  const articles = getStoredArticles();
  const target = articles.find((a) => a.id === id);
  if (!target) return { updatedArticles: articles, newArticle: null };

  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const newArticle: AdminArticle = {
    ...target,
    id: `art-${Date.now().toString().slice(-4)}${randomSuffix}`,
    title: `${target.title} (Salinan)`,
    slug: `${target.slug}-salinan-${randomSuffix}`,
    status: 'draft',
    isHeadline: false,
    headlinePosition: null,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    seoTitle: `${target.seoTitle} (Salinan)`,
    canonicalUrl: `https://batutv.id/berita/${target.slug}-salinan-${randomSuffix}`,
  };

  const updated = [newArticle, ...articles];
  saveStoredArticles(updated);

  firestoreArticleRepository.saveArticle(newArticle).catch((err) => {
    console.warn('[newsAdminStore] Error creating duplicate in Firestore:', err);
  });

  return { updatedArticles: updated, newArticle };
}

// Bulk Actions
export function bulkUpdateStatus(ids: string[], newStatus: ArticleStatus): AdminArticle[] {
  const articles = getStoredArticles();
  const idSet = new Set(ids);
  const updated = articles.map((a) => {
    if (idSet.has(a.id)) {
      const willBeHeadline = newStatus === 'published' ? a.isHeadline : false;
      return {
        ...a,
        status: newStatus,
        isHeadline: willBeHeadline,
        headlinePosition: willBeHeadline ? a.headlinePosition : null,
        updatedAt: new Date().toISOString(),
      };
    }
    return a;
  });
  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);

  firestoreArticleRepository.bulkUpdateStatus(ids, newStatus).catch((err) => {
    console.warn('[newsAdminStore] Error bulk updating status in Firestore:', err);
  });

  return normalized;
}

export function bulkPermanentDelete(ids: string[]): AdminArticle[] {
  const articles = getStoredArticles();
  const idSet = new Set(ids);
  const updated = articles.filter((a) => !idSet.has(a.id));
  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);

  firestoreArticleRepository.bulkDelete(ids).catch((err) => {
    console.warn('[newsAdminStore] Error bulk deleting in Firestore:', err);
  });

  return normalized;
}

// Headline Management Functions
export function updateHeadlineOrder(orderedIds: string[]): AdminArticle[] {
  const articles = getStoredArticles();
  const idOrderMap = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    idOrderMap.set(id, index + 1);
  });

  const updated = articles.map((art) => {
    if (idOrderMap.has(art.id) && art.status === 'published') {
      return {
        ...art,
        isHeadline: true,
        headlinePosition: idOrderMap.get(art.id)!,
        updatedAt: new Date().toISOString(),
      };
    } else if (art.isHeadline && !idOrderMap.has(art.id)) {
      return {
        ...art,
        isHeadline: false,
        headlinePosition: null,
        updatedAt: new Date().toISOString(),
      };
    }
    return art;
  });

  const normalized = normalizeHeadlinePositions(updated);
  saveStoredArticles(normalized);
  return normalized;
}

export function addArticleToHeadline(articleId: string, targetPosition?: number): AdminArticle[] {
  const articles = getStoredArticles();
  const target = articles.find((a) => a.id === articleId);
  if (!target || target.status !== 'published') return articles;

  const currentHeadlines = articles
    .filter((a) => a.status === 'published' && a.isHeadline && a.id !== articleId)
    .sort((a, b) => (a.headlinePosition || 999) - (b.headlinePosition || 999));

  const pos = targetPosition ? Math.max(1, Math.min(targetPosition, currentHeadlines.length + 1)) : currentHeadlines.length + 1;
  currentHeadlines.splice(pos - 1, 0, target);

  const orderedIds = currentHeadlines.map((a) => a.id);
  return updateHeadlineOrder(orderedIds);
}

export function removeArticleFromHeadline(articleId: string): AdminArticle[] {
  const articles = getStoredArticles();
  const currentHeadlines = articles
    .filter((a) => a.status === 'published' && a.isHeadline && a.id !== articleId)
    .sort((a, b) => (a.headlinePosition || 999) - (b.headlinePosition || 999));

  const orderedIds = currentHeadlines.map((a) => a.id);
  return updateHeadlineOrder(orderedIds);
}
