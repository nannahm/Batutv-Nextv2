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
import { AdminTag, TagStatus, TagContentType } from '../../types/admin';
import { ITagRepository } from '../ITagRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'tags';

export function toTagFirestoreDocument(tag: AdminTag): Record<string, any> {
  return sanitizeForFirestore({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    contentTypes: tag.contentTypes || ['news', 'video'],
    status: tag.status || 'active',
    seoTitle: tag.seoTitle || `${tag.name} | Berita Tag BatuTV`,
    metaDescription: tag.metaDescription || `Kumpulan berita dan informasi terkini terkait tag #${tag.name} di BatuTV.`,
    createdAt: tag.createdAt || new Date().toISOString(),
    updatedAt: tag.updatedAt || new Date().toISOString(),
  });
}

export function fromTagFirestoreDocument(id: string, data: Record<string, any>): AdminTag {
  return {
    id: data.id || id,
    name: data.name || '',
    slug: data.slug || '',
    contentTypes: (data.contentTypes as TagContentType[]) || ['news', 'video'],
    status: (data.status as TagStatus) || 'active',
    seoTitle: data.seoTitle || `${data.name || ''} | Berita Tag BatuTV`,
    metaDescription: data.metaDescription || `Kumpulan berita dan informasi terkait tag #${data.name || ''}`,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    newsCount: data.newsCount ?? 0,
    videoCount: data.videoCount ?? 0,
    totalCount: data.totalCount ?? 0,
  };
}

export class FirestoreTagRepository implements ITagRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getAll(): Promise<AdminTag[]> {
    const snap = await getDocs(this.colRef);
    const list: AdminTag[] = [];
    snap.forEach((docSnap) => {
      list.push(fromTagFirestoreDocument(docSnap.id, docSnap.data()));
    });
    return list;
  }

  async getById(id: string): Promise<AdminTag | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return fromTagFirestoreDocument(snap.id, snap.data());
  }

  async getBySlug(slug: string): Promise<AdminTag | null> {
    const q = query(this.colRef, where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return fromTagFirestoreDocument(first.id, first.data());
  }

  async create(tag: AdminTag): Promise<AdminTag> {
    const docRef = doc(db, COLLECTION_NAME, tag.id);
    const docData = toTagFirestoreDocument(tag);
    await setDoc(docRef, docData);
    return tag;
  }

  async update(id: string, partial: Partial<AdminTag>): Promise<AdminTag> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Tag with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;
    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.delete(docRef);
      count++;
    }
    await batch.commit();
    return count;
  }

  async bulkUpdateStatus(ids: string[], status: TagStatus): Promise<number> {
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
    onNext: (tags: AdminTag[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const list: AdminTag[] = [];
        snap.forEach((docSnap) => {
          list.push(fromTagFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreTagRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreTagRepository = new FirestoreTagRepository();
