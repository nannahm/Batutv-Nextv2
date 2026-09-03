import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminCategory, CategoryStatus, CategoryContentType } from '../../types/admin';
import { ICategoryRepository } from '../ICategoryRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'categories';

export function toCategoryFirestoreDocument(cat: AdminCategory): Record<string, any> {
  return sanitizeForFirestore({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    parentId: cat.parentId || null,
    contentTypes: cat.contentTypes || ['news', 'video'],
    status: cat.status || 'active',
    displayOrder: (cat as any).displayOrder ?? 0,
    seoTitle: cat.seoTitle || `${cat.name} | BatuTV`,
    metaDescription: cat.metaDescription || cat.description || `Informasi seputar ${cat.name}`,
    canonicalUrl: cat.canonicalUrl || `/kategori/${cat.slug}`,
    createdAt: cat.createdAt || new Date().toISOString(),
    updatedAt: cat.updatedAt || new Date().toISOString(),
  });
}

export function fromCategoryFirestoreDocument(id: string, data: Record<string, any>): AdminCategory {
  return {
    id: data.id || id,
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    parentId: data.parentId || null,
    contentTypes: (data.contentTypes as CategoryContentType[]) || ['news', 'video'],
    status: (data.status as CategoryStatus) || 'active',
    seoTitle: data.seoTitle || `${data.name || ''} | BatuTV`,
    metaDescription: data.metaDescription || data.description || '',
    canonicalUrl: data.canonicalUrl || `/kategori/${data.slug || ''}`,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    newsCount: data.newsCount ?? 0,
    videoCount: data.videoCount ?? 0,
    totalCount: data.totalCount ?? 0,
  };
}

export class FirestoreCategoryRepository implements ICategoryRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getAll(): Promise<AdminCategory[]> {
    const snap = await getDocs(this.colRef);
    const list: AdminCategory[] = [];
    snap.forEach((docSnap) => {
      list.push(fromCategoryFirestoreDocument(docSnap.id, docSnap.data()));
    });
    return list;
  }

  async getById(id: string): Promise<AdminCategory | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return fromCategoryFirestoreDocument(snap.id, snap.data());
  }

  async getBySlug(slug: string): Promise<AdminCategory | null> {
    const q = query(this.colRef, where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return fromCategoryFirestoreDocument(first.id, first.data());
  }

  async create(category: AdminCategory): Promise<AdminCategory> {
    const docRef = doc(db, COLLECTION_NAME, category.id);
    const docData = toCategoryFirestoreDocument(category);
    await setDoc(docRef, docData);
    return category;
  }

  async update(id: string, partial: Partial<AdminCategory>): Promise<AdminCategory> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Category with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async bulkUpdateStatus(ids: string[], status: CategoryStatus): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;
    const nowIso = new Date().toISOString();

    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, { status, updatedAt: nowIso });
      count++;
    }
    await batch.commit();
    return count;
  }

  subscribe(
    onNext: (categories: AdminCategory[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const list: AdminCategory[] = [];
        snap.forEach((docSnap) => {
          list.push(fromCategoryFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreCategoryRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreCategoryRepository = new FirestoreCategoryRepository();
