import { AdminPage, PageStatus } from '@/src/types/admin';
import { IPageRepository } from '@/src/repositories/IPageRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { initialAdminPagesData } from '@/src/data/pagesAdminDummyData';

const COLLECTION_NAME = 'pages';

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

export function toPageFirestoreDocument(page: AdminPage): Record<string, any> {
  return {
    id: page.id,
    title: page.title || '',
    slug: page.slug || page.id,
    content: page.content || '',
    excerpt: page.excerpt || '',
    status: page.status || 'published',
    seoTitle: page.seoTitle || `${page.title} | BatuTV`,
    metaDescription: page.metaDescription || page.excerpt || `${page.title} di portal berita BatuTV`,
    featuredImageMediaId: page.featuredImageMediaId || null,
    featuredImageUrl: page.featuredImageUrl || null,
    publishedAt: page.publishedAt ? convertDateToString(page.publishedAt) : null,
    createdAt: convertDateToString(page.createdAt),
    updatedAt: convertDateToString(page.updatedAt),
  };
}

export function fromPageFirestoreDocument(id: string, data: Record<string, any>): AdminPage {
  return {
    id: data.id || id,
    title: data.title || '',
    slug: data.slug || '',
    content: data.content || '',
    excerpt: data.excerpt || '',
    status: (data.status as PageStatus) || 'published',
    seoTitle: data.seoTitle || `${data.title || ''} | BatuTV`,
    metaDescription: data.metaDescription || data.excerpt || '',
    featuredImageMediaId: data.featuredImageMediaId || undefined,
    featuredImageUrl: data.featuredImageUrl || undefined,
    publishedAt: data.publishedAt ? convertDateToString(data.publishedAt) : null,
    createdAt: convertDateToString(data.createdAt),
    updatedAt: convertDateToString(data.updatedAt),
  };
}

export class AdminFirestorePageRepository implements IPageRepository {
  async getAll(): Promise<AdminPage[]> {
    try {
      const db = getAdminFirestore();
      const snap = await db.collection(COLLECTION_NAME).get();
      if (snap.empty) {
        return initialAdminPagesData;
      }
      return snap.docs.map((d) => fromPageFirestoreDocument(d.id, d.data()));
    } catch (err) {
      console.warn('[AdminFirestorePageRepository] Failed to fetch pages from Admin SDK, fallback to seed cache:', err);
      return initialAdminPagesData;
    }
  }

  async getById(id: string): Promise<AdminPage | null> {
    try {
      const db = getAdminFirestore();
      const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) {
        return initialAdminPagesData.find((p) => p.id === id) || null;
      }
      return fromPageFirestoreDocument(docSnap.id, docSnap.data()!);
    } catch (err) {
      console.warn(`[AdminFirestorePageRepository] Failed to fetch page ID "${id}":`, err);
      return initialAdminPagesData.find((p) => p.id === id) || null;
    }
  }

  async getBySlug(slug: string): Promise<AdminPage | null> {
    const cleanSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
    try {
      const db = getAdminFirestore();
      const snap = await db.collection(COLLECTION_NAME).where('slug', '==', cleanSlug).limit(1).get();
      if (!snap.empty) {
        const first = snap.docs[0];
        return fromPageFirestoreDocument(first.id, first.data());
      }
      return initialAdminPagesData.find((p) => p.slug.toLowerCase() === cleanSlug) || null;
    } catch (err) {
      console.warn(`[AdminFirestorePageRepository] Failed to fetch page slug "${cleanSlug}":`, err);
      return initialAdminPagesData.find((p) => p.slug.toLowerCase() === cleanSlug) || null;
    }
  }

  async getPublished(): Promise<AdminPage[]> {
    try {
      const db = getAdminFirestore();
      const snap = await db.collection(COLLECTION_NAME).where('status', '==', 'published').get();
      if (!snap.empty) {
        return snap.docs.map((d) => fromPageFirestoreDocument(d.id, d.data()));
      }
      return initialAdminPagesData.filter((p) => p.status === 'published');
    } catch (err) {
      console.warn('[AdminFirestorePageRepository] Failed to fetch published pages:', err);
      return initialAdminPagesData.filter((p) => p.status === 'published');
    }
  }

  async create(page: AdminPage): Promise<AdminPage> {
    const db = getAdminFirestore();
    const docData = toPageFirestoreDocument(page);
    await db.collection(COLLECTION_NAME).doc(page.id).set(docData, { merge: true });
    return page;
  }

  async update(id: string, partial: Partial<AdminPage>): Promise<AdminPage> {
    const db = getAdminFirestore();
    const updateData = {
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await db.collection(COLLECTION_NAME).doc(id).set(updateData, { merge: true });
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Page with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getAdminFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
  }

  subscribe(
    onNext: (pages: AdminPage[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // Admin SDK does not use real-time listeners for serverless Next.js
    this.getAll()
      .then(onNext)
      .catch((err) => {
        if (onError) onError(err);
      });
    return () => {};
  }
}

export const adminFirestorePageRepository = new AdminFirestorePageRepository();
