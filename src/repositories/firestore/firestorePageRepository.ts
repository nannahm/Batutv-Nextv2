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
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminPage, PageStatus } from '../../types/admin';
import { IPageRepository } from '../IPageRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'pages';

export function toPageFirestoreDocument(page: AdminPage): Record<string, any> {
  return sanitizeForFirestore({
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content || '',
    excerpt: page.excerpt || '',
    status: page.status || 'published',
    seoTitle: page.seoTitle || `${page.title} | BatuTV`,
    metaDescription: page.metaDescription || page.excerpt || `${page.title} di portal berita BatuTV`,
    featuredImageMediaId: page.featuredImageMediaId || null,
    featuredImageUrl: page.featuredImageUrl || null,
    publishedAt: page.publishedAt || (page.status === 'published' ? page.createdAt || new Date().toISOString() : null),
    createdAt: page.createdAt || new Date().toISOString(),
    updatedAt: page.updatedAt || new Date().toISOString(),
  });
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
    publishedAt: data.publishedAt || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export class FirestorePageRepository implements IPageRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getAll(): Promise<AdminPage[]> {
    const snap = await getDocs(this.colRef);
    const list: AdminPage[] = [];
    snap.forEach((docSnap) => {
      list.push(fromPageFirestoreDocument(docSnap.id, docSnap.data()));
    });
    return list;
  }

  async getById(id: string): Promise<AdminPage | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return fromPageFirestoreDocument(snap.id, snap.data());
  }

  async getBySlug(slug: string): Promise<AdminPage | null> {
    const cleanSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
    const q = query(this.colRef, where('slug', '==', cleanSlug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return fromPageFirestoreDocument(first.id, first.data());
  }

  async getPublished(): Promise<AdminPage[]> {
    const q = query(this.colRef, where('status', '==', 'published'));
    try {
      const snap = await getDocs(q);
      const list: AdminPage[] = [];
      snap.forEach((docSnap) => {
        list.push(fromPageFirestoreDocument(docSnap.id, docSnap.data()));
      });
      return list;
    } catch {
      const all = await this.getAll();
      return all.filter((p) => p.status === 'published');
    }
  }

  async create(page: AdminPage): Promise<AdminPage> {
    const docRef = doc(db, COLLECTION_NAME, page.id);
    const docData = toPageFirestoreDocument(page);
    await setDoc(docRef, docData);
    return page;
  }

  async update(id: string, partial: Partial<AdminPage>): Promise<AdminPage> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Page with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  subscribe(
    onNext: (pages: AdminPage[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const list: AdminPage[] = [];
        snap.forEach((docSnap) => {
          list.push(fromPageFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestorePageRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestorePageRepository = new FirestorePageRepository();
