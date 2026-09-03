import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { AdminArticle } from '@/src/types/admin';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { fromArticleFirestoreDocument } from '@/src/repositories/firestore/firestoreArticleRepository';

export type ArticleFetchResult =
  | { source: 'firestore'; article: AdminArticle }
  | { source: 'seed-fallback'; article: AdminArticle; warning: string }
  | { source: 'not-found'; article: null };

export type ArticlesListFetchResult =
  | { source: 'firestore'; articles: AdminArticle[] }
  | { source: 'seed-fallback'; articles: AdminArticle[]; warning: string };

const COLLECTION_NAME = 'articles';

/**
 * Fetches an article by slug from Firestore live with clear distinction:
 * 1. Found in Firestore -> source: 'firestore'
 * 2. Firestore connection/credentials error -> source: 'seed-fallback' (with explicit warning log)
 * 3. Firestore query succeeded but document does not exist -> source: 'not-found' (404 sungguhan, TIDAK fallback ke seed)
 */
export async function fetchArticleBySlugLive(slug: string): Promise<ArticleFetchResult> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const article = fromArticleFirestoreDocument(docSnap.id, docSnap.data());
      // Check status: only published articles can be shown on public portal
      if (article.status === 'published') {
        return { source: 'firestore', article };
      }
      return { source: 'not-found', article: null };
    }

    // Firestore query executed successfully, document genuinely does not exist
    return { source: 'not-found', article: null };
  } catch (error: any) {
    // Firestore unreachable or credentials missing (e.g. offline container build environment)
    const errorMsg = error?.message || String(error);
    const warning = `[LiveFirestoreService] Firestore connection unreachable (${errorMsg}). Falling back to static seed cache.`;
    console.warn(warning);

    const seedArticle = initialAdminArticles.find(
      (a) => a.slug === slug && a.status === 'published'
    );

    if (seedArticle) {
      return { source: 'seed-fallback', article: seedArticle, warning };
    }

    return { source: 'not-found', article: null };
  }
}

/**
 * Fetches published articles list for homepage, sitemaps, or feed.
 * Distinguishes between successful Firestore fetch vs connection error fallback.
 */
export async function fetchPublishedArticlesLive(limitCount: number = 20): Promise<ArticlesListFetchResult> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('status', '==', 'published'), limit(limitCount));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const articles: AdminArticle[] = [];
      snap.forEach((docSnap) => {
        articles.push(fromArticleFirestoreDocument(docSnap.id, docSnap.data()));
      });
      return { source: 'firestore', articles };
    }

    // Collection empty or no published articles in Firestore yet:
    // If empty in newly provisioned DB, provide seed articles as initial bootstrap
    return {
      source: 'seed-fallback',
      articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
      warning: '[LiveFirestoreService] Firestore collection empty. Serving initial seed data.',
    };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const warning = `[LiveFirestoreService] Firestore connection error (${errorMsg}). Serving seed data.`;
    console.warn(warning);

    return {
      source: 'seed-fallback',
      articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
      warning,
    };
  }
}
