import { AdminCategory, AdminTag, AdminArticle } from '@/src/types/admin';
import { initialAdminCategories } from '@/src/data/categoryAdminDummyData';
import { initialAdminTags } from '@/src/data/tagAdminDummyData';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { fromArticleFirestoreDocument } from '@/src/repositories/firestore/firestoreArticleRepository';
import { fromCategoryFirestoreDocument } from './adminFirestoreCategoryRepository';
import { fromTagFirestoreDocument } from './adminFirestoreTagRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import {
  CategoryFetchResult,
  CategoriesListFetchResult,
  TagFetchResult,
  TagsListFetchResult,
} from '../types';

const CATEGORIES_COLLECTION = 'categories';
const TAGS_COLLECTION = 'tags';
const ARTICLES_COLLECTION = 'articles';

/**
 * Mengambil 1 kategori aktif berdasarkan slug di server context:
 * - Menggunakan Firebase Admin SDK murni (D-002 compliant).
 * - Filter EKSPLISIT where('status', '==', 'active') di level query agar kategori inactive tidak bocor ke publik.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache (filtered by active).
 */
export async function fetchCategoryBySlugLive(slug: string): Promise<CategoryFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(CATEGORIES_COLLECTION)
      .where('slug', '==', slug)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const category = fromCategoryFirestoreDocument(docSnap.id, docSnap.data());
      return { source: 'firestore', category };
    }

    return { source: 'not-found', category: null };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreTaxonomyService] Gagal fetch kategori slug "${slug}" (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const seedCat = initialAdminCategories.find(
      (c) => (c.slug === slug || c.id === slug) && c.status === 'active'
    );

    if (seedCat) {
      return { source: 'seed-fallback', category: seedCat, warning };
    }

    return { source: 'not-found', category: null };
  }
}

/**
 * Mengambil seluruh kategori aktif untuk halaman publik, navigasi, sitemap, dan arsip.
 * - EKSPLISIT filter status: 'active'.
 */
export async function fetchActiveCategoriesLive(): Promise<CategoriesListFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(CATEGORIES_COLLECTION)
      .where('status', '==', 'active')
      .get();

    if (!snap.empty) {
      const categories = snap.docs.map((docSnap) =>
        fromCategoryFirestoreDocument(docSnap.id, docSnap.data())
      );
      return { source: 'firestore', categories };
    }

    const fallbackActive = initialAdminCategories.filter((c) => c.status === 'active');
    return {
      source: 'seed-fallback',
      categories: fallbackActive,
      warning: 'Firestore categories kosong, menggunakan fallback aktif seed data.',
    };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreTaxonomyService] Gagal fetch active categories (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const fallbackActive = initialAdminCategories.filter((c) => c.status === 'active');
    return { source: 'seed-fallback', categories: fallbackActive, warning };
  }
}

/**
 * Mengambil 1 tag aktif berdasarkan slug di server context:
 * - Menggunakan Firebase Admin SDK murni (D-002 compliant).
 * - Filter EKSPLISIT where('status', '==', 'active') di level query.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache (filtered by active).
 */
export async function fetchTagBySlugLive(slug: string): Promise<TagFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(TAGS_COLLECTION)
      .where('slug', '==', slug)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const tag = fromTagFirestoreDocument(docSnap.id, docSnap.data());
      return { source: 'firestore', tag };
    }

    return { source: 'not-found', tag: null };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreTaxonomyService] Gagal fetch tag slug "${slug}" (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const seedTag = initialAdminTags.find(
      (t) => (t.slug === slug || t.id === slug) && t.status === 'active'
    );

    if (seedTag) {
      return { source: 'seed-fallback', tag: seedTag, warning };
    }

    return { source: 'not-found', tag: null };
  }
}

/**
 * Mengambil seluruh tag aktif untuk halaman publik, sitemap, dan filter.
 * - EKSPLISIT filter status: 'active'.
 */
export async function fetchActiveTagsLive(): Promise<TagsListFetchResult> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(TAGS_COLLECTION)
      .where('status', '==', 'active')
      .get();

    if (!snap.empty) {
      const tags = snap.docs.map((docSnap) =>
        fromTagFirestoreDocument(docSnap.id, docSnap.data())
      );
      return { source: 'firestore', tags };
    }

    const fallbackActive = initialAdminTags.filter((t) => t.status === 'active');
    return {
      source: 'seed-fallback',
      tags: fallbackActive,
      warning: 'Firestore tags kosong, menggunakan fallback aktif seed data.',
    };
  } catch (adminError: any) {
    const errorMsg = adminError?.message || String(adminError);
    const warning = `[LiveFirestoreTaxonomyService] Gagal fetch active tags (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const fallbackActive = initialAdminTags.filter((t) => t.status === 'active');
    return { source: 'seed-fallback', tags: fallbackActive, warning };
  }
}

/**
 * Mengambil daftar artikel published untuk arsip kategori tertentu:
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache
 * - Filter eksplisit where('status', '==', 'published')
 */
export async function fetchArticlesByCategoryLive(
  categorySlug: string,
  limitCount: number = 30
): Promise<AdminArticle[]> {
  try {
    const adminDb = getAdminFirestore();
    const snap = await adminDb
      .collection(ARTICLES_COLLECTION)
      .where('status', '==', 'published')
      .where('categorySlug', '==', categorySlug)
      .limit(limitCount)
      .get();

    if (!snap.empty) {
      return snap.docs.map((docSnap) =>
        fromArticleFirestoreDocument(docSnap.id, docSnap.data())
      );
    }
  } catch (err) {
    console.warn(`[LiveFirestoreTaxonomyService] Firestore query articles for category "${categorySlug}" failed:`, err);
  }

  // Fallback ke seed articles
  return initialAdminArticles
    .filter(
      (a) =>
        a.status === 'published' &&
        (a.categorySlug === categorySlug ||
          a.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === categorySlug)
    )
    .slice(0, limitCount);
}

/**
 * Mengambil daftar artikel published untuk arsip tag tertentu:
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache
 * - Filter eksplisit where('status', '==', 'published')
 */
export async function fetchArticlesByTagLive(
  tagSlug: string,
  limitCount: number = 30
): Promise<AdminArticle[]> {
  try {
    const adminDb = getAdminFirestore();
    // Firestore array-contains untuk tags
    const snap = await adminDb
      .collection(ARTICLES_COLLECTION)
      .where('status', '==', 'published')
      .where('tags', 'array-contains', tagSlug)
      .limit(limitCount)
      .get();

    if (!snap.empty) {
      return snap.docs.map((docSnap) =>
        fromArticleFirestoreDocument(docSnap.id, docSnap.data())
      );
    }
  } catch (err) {
    console.warn(`[LiveFirestoreTaxonomyService] Firestore query articles for tag "${tagSlug}" failed:`, err);
  }

  // Fallback ke seed articles (cek jika array tags mengandung slug atau nama)
  const normTag = tagSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return initialAdminArticles
    .filter((a) => {
      if (a.status !== 'published' || !Array.isArray(a.tags)) return false;
      return a.tags.some(
        (t) =>
          t.toLowerCase().replace(/[^a-z0-9]/g, '') === normTag ||
          t.toLowerCase() === tagSlug
      );
    })
    .slice(0, limitCount);
}

