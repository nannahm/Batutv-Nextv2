import { AdminCategory, CategoryStatus, CategoryContentType } from '@/src/types/admin';
import { ICategoryRepository } from '@/src/repositories/ICategoryRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { initialAdminCategories } from '@/src/data/categoryAdminDummyData';
import { generateTaxonomySlug } from '../schemas';

const COLLECTION_NAME = 'categories';

function convertDateToString(val: any, fallback: string = new Date().toISOString()): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val?.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return fallback;
}

export function toCategoryFirestoreDocument(cat: AdminCategory): Record<string, any> {
  const cleanSlug = cat.slug ? generateTaxonomySlug(cat.slug) : generateTaxonomySlug(cat.name);

  return {
    id: cat.id,
    name: cat.name || '',
    slug: cleanSlug || `cat-${cat.id}`,
    description: cat.description || '',
    parentId: cat.parentId || null,
    contentTypes: Array.isArray(cat.contentTypes) && cat.contentTypes.length > 0 ? cat.contentTypes : ['news', 'video'],
    status: cat.status || 'active',
    seoTitle: cat.seoTitle || `${cat.name} | BatuTV`,
    metaDescription: cat.metaDescription || cat.description || `Informasi seputar ${cat.name}`,
    canonicalUrl: cat.canonicalUrl || `/kategori/${cleanSlug}`,
    createdAt: convertDateToString(cat.createdAt),
    updatedAt: convertDateToString(cat.updatedAt),
    newsCount: typeof cat.newsCount === 'number' ? cat.newsCount : 0,
    videoCount: typeof cat.videoCount === 'number' ? cat.videoCount : 0,
    totalCount: typeof cat.totalCount === 'number' ? cat.totalCount : 0,
  };
}

export function fromCategoryFirestoreDocument(id: string, data: Record<string, any>): AdminCategory {
  const name = data.name || 'Untitled Category';
  const slug = data.slug || generateTaxonomySlug(name) || id;

  return {
    id: data.id || id,
    name,
    slug,
    description: data.description || '',
    parentId: data.parentId || null,
    contentTypes: (data.contentTypes as CategoryContentType[]) || ['news', 'video'],
    status: (data.status as CategoryStatus) || 'active',
    seoTitle: data.seoTitle || `${name} | BatuTV`,
    metaDescription: data.metaDescription || data.description || `Informasi seputar ${name}`,
    canonicalUrl: data.canonicalUrl || `/kategori/${slug}`,
    createdAt: convertDateToString(data.createdAt),
    updatedAt: convertDateToString(data.updatedAt),
    newsCount: data.newsCount ?? 0,
    videoCount: data.videoCount ?? 0,
    totalCount: data.totalCount ?? 0,
  };
}

export class AdminFirestoreCategoryRepository implements ICategoryRepository {
  private colName = COLLECTION_NAME;

  private getDb() {
    return getAdminFirestore();
  }

  async getAll(): Promise<AdminCategory[]> {
    try {
      const snap = await this.getDb().collection(this.colName).get();
      if (snap.empty) {
        return initialAdminCategories;
      }

      return snap.docs.map((docSnap) =>
        fromCategoryFirestoreDocument(docSnap.id, docSnap.data())
      );
    } catch (err) {
      console.warn('[AdminFirestoreCategoryRepository.getAll] Menggunakan fallback static categories:', err);
      return initialAdminCategories;
    }
  }

  async getById(id: string): Promise<AdminCategory | null> {
    try {
      const docSnap = await this.getDb().collection(this.colName).doc(id).get();
      if (docSnap.exists) {
        return fromCategoryFirestoreDocument(docSnap.id, docSnap.data()!);
      }

      const seedCat = initialAdminCategories.find((c) => c.id === id);
      return seedCat || null;
    } catch (err) {
      console.warn(`[AdminFirestoreCategoryRepository.getById] Gagal mengambil id ${id}:`, err);
      return initialAdminCategories.find((c) => c.id === id) || null;
    }
  }

  async getBySlug(slug: string): Promise<AdminCategory | null> {
    try {
      const snap = await this.getDb()
        .collection(this.colName)
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromCategoryFirestoreDocument(docSnap.id, docSnap.data());
      }

      const seedCat = initialAdminCategories.find((c) => c.slug === slug);
      return seedCat || null;
    } catch (err) {
      console.warn(`[AdminFirestoreCategoryRepository.getBySlug] Gagal mengambil slug ${slug}:`, err);
      return initialAdminCategories.find((c) => c.slug === slug) || null;
    }
  }

  async create(category: AdminCategory): Promise<AdminCategory> {
    const docId = category.id || `cat-${Date.now()}`;
    const cleanDoc = toCategoryFirestoreDocument({
      ...category,
      id: docId,
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.getDb().collection(this.colName).doc(docId).set(cleanDoc);
    return fromCategoryFirestoreDocument(docId, cleanDoc);
  }

  async update(id: string, partial: Partial<AdminCategory>): Promise<AdminCategory> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Kategori dengan id ${id} tidak ditemukan.`);
    }

    const merged: AdminCategory = {
      ...existing,
      ...partial,
      id,
      updatedAt: new Date().toISOString(),
    };

    const cleanDoc = toCategoryFirestoreDocument(merged);
    await this.getDb().collection(this.colName).doc(id).set(cleanDoc, { merge: true });
    return fromCategoryFirestoreDocument(id, cleanDoc);
  }

  async delete(id: string): Promise<void> {
    await this.getDb().collection(this.colName).doc(id).delete();
  }

  async bulkUpdateStatus(ids: string[], status: CategoryStatus): Promise<number> {
    const db = this.getDb();
    const batch = db.batch();
    const nowIso = new Date().toISOString();

    for (const id of ids) {
      const ref = db.collection(this.colName).doc(id);
      batch.update(ref, { status, updatedAt: nowIso });
    }

    await batch.commit();
    return ids.length;
  }

  subscribe(
    onNext: (categories: AdminCategory[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // In server/Admin SDK context, return a no-op unsubscribe function
    this.getAll().then(onNext).catch(onError);
    return () => {};
  }
}

export const adminFirestoreCategoryRepository = new AdminFirestoreCategoryRepository();
