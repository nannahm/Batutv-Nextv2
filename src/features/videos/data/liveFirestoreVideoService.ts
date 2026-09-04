import { AdminVideo } from '@/src/types/admin';
import { initialAdminVideos } from '@/src/data/videoAdminDummyData';
import { fromVideoFirestoreDocument } from './adminFirestoreVideoRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';

export type VideoFetchResult =
  | { source: 'firestore'; video: AdminVideo }
  | { source: 'seed-fallback'; video: AdminVideo; warning: string }
  | { source: 'not-found'; video: null };

export type VideosListFetchResult =
  | { source: 'firestore'; videos: AdminVideo[] }
  | { source: 'seed-fallback'; videos: AdminVideo[]; warning: string };

const COLLECTION_NAME = 'videos';

/**
 * Mengambil 1 video berdasarkan slug di server context:
 * - Menggunakan Firebase Admin SDK murni (D-002 compliant).
 * - Filter eksplisit where('status', '==', 'published') di level query.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache.
 */
export async function fetchVideoBySlugLive(slug: string): Promise<VideoFetchResult> {
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
      const video = fromVideoFirestoreDocument(docSnap.id, docSnap.data());
      return { source: 'firestore', video };
    }

    return { source: 'not-found', video: null };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreVideoService] Admin SDK fetch gagal (${errorMsg}). Menggunakan fallback seed cache.`;
    console.warn(warning);

    const seedVideo = initialAdminVideos.find(
      (v) => (v.slug === slug || v.id === slug) && v.status === 'published'
    );

    if (seedVideo) {
      return { source: 'seed-fallback', video: seedVideo, warning };
    }

    return { source: 'not-found', video: null };
  }
}

/**
 * Mengambil daftar video published untuk katalog publik, sitemaps, atau SSG generateStaticParams.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache.
 * - Filter eksplisit where('status', '==', 'published') di level query.
 */
export async function fetchPublishedVideosLive(
  limitCount: number = 50
): Promise<VideosListFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(COLLECTION_NAME)
      .where('status', '==', 'published')
      .limit(limitCount)
      .get();

    if (!snap.empty) {
      const videos: AdminVideo[] = [];
      snap.forEach((docSnap) => {
        videos.push(fromVideoFirestoreDocument(docSnap.id, docSnap.data()));
      });
      return { source: 'firestore', videos };
    }
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreVideoService] Admin SDK query gagal (${errorMsg}). Menggunakan data seed.`;
    console.warn(warning);

    return {
      source: 'seed-fallback',
      videos: initialAdminVideos.filter((v) => v.status === 'published').slice(0, limitCount),
      warning,
    };
  }

  return {
    source: 'seed-fallback',
    videos: initialAdminVideos.filter((v) => v.status === 'published').slice(0, limitCount),
    warning: '[LiveFirestoreVideoService] Firestore collection empty. Serving initial seed data.',
  };
}
