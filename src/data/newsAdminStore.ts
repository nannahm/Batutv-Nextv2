import { AdminArticle, ArticleStatus } from '../types/admin';
import { initialAdminArticles } from './newsAdminDummyData';
import { HeroHeadlineData, HeadlineArticleData, defaultHeroHeadlineData } from '../components/HeroHeadlineGrid';
import { LatestNewsPost } from './latestNewsData';
import { resolveArticleSlug, resolveArticleHref, ensureUniqueFeedSlugs } from '../utils/slugResolver';
import { firestoreArticleRepository } from '../repositories/firestore/firestoreArticleRepository';
import {
  getArticlePublishedTimestamp,
  formatNewsFeedDateTime,
  formatHeadlineDateTime,
  mapAdminArticleToHeadlineData,
  isArticleLive,
  getHeroHeadlineArticlesFromList,
  mapAdminArticlesToFeedPosts,
  mapAdminArticlesToHeroData,
} from '../utils/newsFormatters';

// Re-export pure formatting utilities so existing callers (adminDashboardData, seoGenerators, etc.) don't break
export {
  getArticlePublishedTimestamp,
  formatNewsFeedDateTime,
  formatHeadlineDateTime,
  mapAdminArticleToHeadlineData,
  isArticleLive,
  getHeroHeadlineArticlesFromList,
  mapAdminArticlesToFeedPosts,
  mapAdminArticlesToHeroData,
};

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

/**
 * SO5 Query: Get all Published Articles for News Feed sorted strictly by publishedAt DESC
 * Guarantees that any newly published article immediately appears at index 0 on Homepage.
 */
export function getPublishedNewsFeedPosts(limit?: number): LatestNewsPost[] {
  const articles = getStoredArticles();
  return mapAdminArticlesToFeedPosts(articles, limit);
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

// Get active Hero Headline articles for SO3 (Strict Editorial Selection)
export function getHeroHeadlineArticles(): AdminArticle[] {
  const articles = getStoredArticles();
  return getHeroHeadlineArticlesFromList(articles);
}

// Get structured HeroHeadlineData for SO3 Homepage Grid
export function getHeroHeadlineData(): HeroHeadlineData {
  const articles = getStoredArticles();
  return mapAdminArticlesToHeroData(articles);
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
