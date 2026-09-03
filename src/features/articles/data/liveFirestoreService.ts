import { AdminArticle } from '@/src/types/admin';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { fromArticleFirestoreDocument } from '@/src/repositories/firestore/firestoreArticleRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { db as clientDb } from '@/src/lib/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

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
 * - Menggunakan Firebase Admin SDK (D-002 compliant).
 * - Tetap memfilter eksplisit where('status', '==', 'published') agar status draft aman
 *   walaupun Admin SDK bypass Firestore security rules.
 * - Jika server environment tidak memiliki kredensial service account / offline,
 *   otomatis fallback secara aman dengan warning log yang jelas.
 */
export async function fetchArticleBySlugLive(slug: string): Promise<ArticleFetchResult> {
  // 1. Coba fetch melalui Firebase Admin SDK terlebih dahulu
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
    // 2. Jika Admin SDK belum memiliki service account (misal di sandbox AI Studio),
    // gunakan Client SDK yang memiliki rules public-read terverifikasi sebagai jembatan transisi.
    try {
      const colRef = collection(clientDb, COLLECTION_NAME);
      const q = query(
        colRef,
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
      );
      const clientSnap = await getDocs(q);

      if (!clientSnap.empty) {
        const docSnap = clientSnap.docs[0];
        const article = fromArticleFirestoreDocument(docSnap.id, docSnap.data());
        return { source: 'firestore', article };
      }

      return { source: 'not-found', article: null };
    } catch (clientError: any) {
      const errorMsg = clientError?.message || String(clientError);
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
}

/**
 * Mengambil daftar artikel published untuk homepage, sitemaps, atau SSG generateStaticParams.
 * Memastikan filter status == 'published' tetap mutlak.
 */
export async function fetchPublishedArticlesLive(limitCount: number = 20): Promise<ArticlesListFetchResult> {
  // 1. Coba melalui Admin SDK
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
    // 2. Fallback ke Client SDK jika Admin SDK kredensial tidak tersedia di container sandbox
    try {
      const colRef = collection(clientDb, COLLECTION_NAME);
      const q = query(colRef, where('status', '==', 'published'), limit(limitCount));
      const clientSnap = await getDocs(q);

      if (!clientSnap.empty) {
        const articles: AdminArticle[] = [];
        clientSnap.forEach((docSnap) => {
          articles.push(fromArticleFirestoreDocument(docSnap.id, docSnap.data()));
        });
        return { source: 'firestore', articles };
      }
    } catch (clientError: any) {
      const errorMsg = clientError?.message || String(clientError);
      const warning = `[LiveFirestoreService] Firestore connection error (${errorMsg}). Serving seed data.`;
      console.warn(warning);

      return {
        source: 'seed-fallback',
        articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
        warning,
      };
    }
  }

  // Jika koleksi Firestore memang kosong (initial fresh DB)
  return {
    source: 'seed-fallback',
    articles: initialAdminArticles.filter((a) => a.status === 'published').slice(0, limitCount),
    warning: '[LiveFirestoreService] Firestore collection empty. Serving initial seed data.',
  };
}
