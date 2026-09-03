import { AdminArticle } from '@/src/types/admin';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { fromArticleFirestoreDocument } from '@/src/repositories/firestore/firestoreArticleRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';

export type ArticleFetchResult =
  | { source: 'firestore'; article: AdminArticle }
  | { source: 'seed-fallback'; article: AdminArticle; warning: string }
  | { source: 'not-found'; article: null };

export type ArticlesListFetchResult =
  | { source: 'firestore'; articles: AdminArticle[] }
  | { source: 'seed-fallback'; articles: AdminArticle[]; warning: string };

const COLLECTION_NAME = 'articles';

/**
 * Mengambil 1 artikel berdasarkan slug di server context:
 * - Menggunakan Firebase Admin SDK murni (D-002 compliant, tanpa ketergantungan Client SDK).
 * - Tetap memfilter eksplisit where('status', '==', 'published') agar status draft aman
 *   walaupun Admin SDK bypass Firestore security rules.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache (jika database unreachable / cold build).
 */
export async function fetchArticleBySlugLive(slug: string): Promise<ArticleFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(COLLECTION_NAME)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const article = fromArticleFirestoreDocument(docSnap.id, docSnap.data());
      return { source: 'firestore', article };
    }

    return { source: 'not-found', article: null };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreService] Admin SDK fetch gagal (${errorMsg}). Menggunakan fallback seed cache.`;
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
 * Mengambil daftar artikel published untuk homepage, sitemaps, atau SSG generateStaticParams.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache.
 * - Memastikan filter status == 'published' tetap mutlak.
 */
export async function fetchPublishedArticlesLive(limitCount: number = 20): Promise<ArticlesListFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(COLLECTION_NAME)
      .where('status', '==', 'published')
      .limit(limitCount)
      .get();

    if (!snap.empty) {
      const articles: AdminArticle[] = [];
      snap.forEach((docSnap) => {
        articles.push(fromArticleFirestoreDocument(docSnap.id, docSnap.data()));
      });
      return { source: 'firestore', articles };
    }
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreService] Admin SDK query gagal (${errorMsg}). Menggunakan data seed.`;
    console.warn(warning);

    return {
      source: 'seed-fallback',
      articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
      warning,
    };
  }

  // Jika koleksi Firestore memang kosong (initial fresh DB)
  return {
    source: 'seed-fallback',
    articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
    warning: '[LiveFirestoreService] Firestore collection empty. Serving initial seed data.',
  };
}
