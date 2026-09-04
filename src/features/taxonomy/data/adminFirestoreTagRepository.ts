import { AdminTag, TagStatus, TagContentType } from '@/src/types/admin';
import { ITagRepository } from '@/src/repositories/ITagRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { initialAdminTags } from '@/src/data/tagAdminDummyData';
import { generateTaxonomySlug } from '../schemas';

const COLLECTION_NAME = 'tags';

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

export function toTagFirestoreDocument(tag: AdminTag): Record<string, any> {
  const cleanSlug = tag.slug ? generateTaxonomySlug(tag.slug) : generateTaxonomySlug(tag.name);

  return {
    id: tag.id,
    name: tag.name || '',
    slug: cleanSlug || `tag-${tag.id}`,
    contentTypes: Array.isArray(tag.contentTypes) && tag.contentTypes.length > 0 ? tag.contentTypes : ['news', 'video'],
    status: tag.status || 'active',
    seoTitle: tag.seoTitle || `${tag.name} | Berita Tag BatuTV`,
    metaDescription: tag.metaDescription || `Kumpulan berita dan liputan terkini terkait tag #${tag.name} di BatuTV.`,
    createdAt: convertDateToString(tag.createdAt),
    updatedAt: convertDateToString(tag.updatedAt),
    newsCount: typeof tag.newsCount === 'number' ? tag.newsCount : 0,
    videoCount: typeof tag.videoCount === 'number' ? tag.videoCount : 0,
    totalCount: typeof tag.totalCount === 'number' ? tag.totalCount : 0,
  };
}

export function fromTagFirestoreDocument(id: string, data: Record<string, any>): AdminTag {
  const name = data.name || 'Untitled Tag';
  const slug = data.slug || generateTaxonomySlug(name) || id;

  return {
    id: data.id || id,
    name,
    slug,
    contentTypes: (data.contentTypes as TagContentType[]) || ['news', 'video'],
    status: (data.status as TagStatus) || 'active',
    seoTitle: data.seoTitle || `${name} | Berita Tag BatuTV`,
    metaDescription: data.metaDescription || `Kumpulan berita dan informasi terkait tag #${name}`,
    createdAt: convertDateToString(data.createdAt),
    updatedAt: convertDateToString(data.updatedAt),
    newsCount: data.newsCount ?? 0,
    videoCount: data.videoCount ?? 0,
    totalCount: data.totalCount ?? 0,
  };
}

export class AdminFirestoreTagRepository implements ITagRepository {
  private colName = COLLECTION_NAME;

  private getDb() {
    return getAdminFirestore();
  }

  async getAll(): Promise<AdminTag[]> {
    try {
      const snap = await this.getDb().collection(this.colName).get();
      if (snap.empty) {
        return initialAdminTags;
      }

      return snap.docs.map((docSnap) =>
        fromTagFirestoreDocument(docSnap.id, docSnap.data())
      );
    } catch (err) {
      console.warn('[AdminFirestoreTagRepository.getAll] Menggunakan fallback static tags:', err);
      return initialAdminTags;
    }
  }

  async getById(id: string): Promise<AdminTag | null> {
    try {
      const docSnap = await this.getDb().collection(this.colName).doc(id).get();
      if (docSnap.exists) {
        return fromTagFirestoreDocument(docSnap.id, docSnap.data()!);
      }

      const seedTag = initialAdminTags.find((t) => t.id === id);
      return seedTag || null;
    } catch (err) {
      console.warn(`[AdminFirestoreTagRepository.getById] Gagal mengambil id ${id}:`, err);
      return initialAdminTags.find((t) => t.id === id) || null;
    }
  }

  async getBySlug(slug: string): Promise<AdminTag | null> {
    try {
      const snap = await this.getDb()
        .collection(this.colName)
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromTagFirestoreDocument(docSnap.id, docSnap.data());
      }

      const seedTag = initialAdminTags.find((t) => t.slug === slug);
      return seedTag || null;
    } catch (err) {
      console.warn(`[AdminFirestoreTagRepository.getBySlug] Gagal mengambil slug ${slug}:`, err);
      return initialAdminTags.find((t) => t.slug === slug) || null;
    }
  }

  async create(tag: AdminTag): Promise<AdminTag> {
    const docId = tag.id || `tag-${Date.now()}`;
    const cleanDoc = toTagFirestoreDocument({
      ...tag,
      id: docId,
      createdAt: tag.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.getDb().collection(this.colName).doc(docId).set(cleanDoc);
    return fromTagFirestoreDocument(docId, cleanDoc);
  }

  async update(id: string, partial: Partial<AdminTag>): Promise<AdminTag> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Tag dengan id ${id} tidak ditemukan.`);
    }

    const merged: AdminTag = {
      ...existing,
      ...partial,
      id,
      updatedAt: new Date().toISOString(),
    };

    const cleanDoc = toTagFirestoreDocument(merged);
    await this.getDb().collection(this.colName).doc(id).set(cleanDoc, { merge: true });
    return fromTagFirestoreDocument(id, cleanDoc);
  }

  async delete(id: string): Promise<void> {
    await this.getDb().collection(this.colName).doc(id).delete();
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const db = this.getDb();
    const batch = db.batch();

    for (const id of ids) {
      const ref = db.collection(this.colName).doc(id);
      batch.delete(ref);
    }

    await batch.commit();
    return ids.length;
  }

  async bulkUpdateStatus(ids: string[], status: TagStatus): Promise<number> {
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
    onNext: (tags: AdminTag[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    this.getAll().then(onNext).catch(onError);
    return () => {};
  }
}

export const adminFirestoreTagRepository = new AdminFirestoreTagRepository();
