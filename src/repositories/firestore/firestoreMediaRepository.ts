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
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminMedia, MediaType } from '../../types/admin';
import { IMediaRepository } from '../IMediaRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'media';

export function toMediaFirestoreDocument(media: AdminMedia): Record<string, any> {
  return sanitizeForFirestore({
    id: media.id,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType || 'image/jpeg',
    extension: media.extension || 'jpg',
    mediaType: media.mediaType || 'image',
    width: media.width || 0,
    height: media.height || 0,
    fileSize: media.fileSize || 0,
    altText: media.altText || '',
    caption: media.caption || '',
    description: media.description || '',
    url: media.url || '',
    sizes: media.sizes || {},
    usageCount: media.usageCount ?? 0,
    usedIn: media.usedIn || [],
    createdAt: media.createdAt || new Date().toISOString(),
    updatedAt: media.updatedAt || new Date().toISOString(),
  });
}

export function fromMediaFirestoreDocument(id: string, data: Record<string, any>): AdminMedia {
  const filename = data.filename || data.fileName || '';
  const mediaType = (data.mediaType || (data.mimeType?.startsWith('image/') ? 'image' : 'document')) as MediaType;

  return {
    id: data.id || id,
    filename,
    originalName: data.originalName || filename,
    mimeType: data.mimeType || 'image/jpeg',
    extension: data.extension || 'jpg',
    mediaType: mediaType || 'image',
    width: Number(data.width) || 0,
    height: Number(data.height) || 0,
    fileSize: Number(data.fileSize) || 0,
    altText: data.altText || '',
    caption: data.caption || '',
    description: data.description || '',
    url: data.url || '',
    sizes: data.sizes || {},
    usageCount: Number(data.usageCount) || 0,
    usedIn: Array.isArray(data.usedIn) ? data.usedIn : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export class FirestoreMediaRepository implements IMediaRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getAll(filter?: { mediaType?: MediaType; search?: string }): Promise<AdminMedia[]> {
    let q = query(this.colRef, orderBy('createdAt', 'desc'));
    if (filter?.mediaType) {
      q = query(this.colRef, where('mediaType', '==', filter.mediaType), orderBy('createdAt', 'desc'));
    }

    try {
      const snap = await getDocs(q);
      let list: AdminMedia[] = [];
      snap.forEach((docSnap) => {
        list.push(fromMediaFirestoreDocument(docSnap.id, docSnap.data()));
      });

      if (filter?.search) {
        const term = filter.search.toLowerCase();
        list = list.filter(
          (m) =>
            m.originalName.toLowerCase().includes(term) ||
            m.altText.toLowerCase().includes(term) ||
            m.caption.toLowerCase().includes(term) ||
            m.filename.toLowerCase().includes(term)
        );
      }

      return list;
    } catch {
      // Fallback query without composite index if necessary
      const snap = await getDocs(this.colRef);
      let list: AdminMedia[] = [];
      snap.forEach((docSnap) => {
        list.push(fromMediaFirestoreDocument(docSnap.id, docSnap.data()));
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (filter?.mediaType) {
        list = list.filter((m) => m.mediaType === filter.mediaType);
      }
      if (filter?.search) {
        const term = filter.search.toLowerCase();
        list = list.filter(
          (m) =>
            m.originalName.toLowerCase().includes(term) ||
            m.altText.toLowerCase().includes(term) ||
            m.caption.toLowerCase().includes(term) ||
            m.filename.toLowerCase().includes(term)
        );
      }
      return list;
    }
  }

  async getById(id: string): Promise<AdminMedia | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return fromMediaFirestoreDocument(snap.id, snap.data());
  }

  async create(media: AdminMedia): Promise<AdminMedia> {
    const docRef = doc(db, COLLECTION_NAME, media.id);
    const docData = toMediaFirestoreDocument(media);
    await setDoc(docRef, docData);
    return media;
  }

  async update(id: string, partial: Partial<AdminMedia>): Promise<AdminMedia> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Media with ID ${id} not found after update`);
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

  subscribe(
    onNext: (mediaList: AdminMedia[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const list: AdminMedia[] = [];
        snap.forEach((docSnap) => {
          list.push(fromMediaFirestoreDocument(docSnap.id, docSnap.data()));
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreMediaRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreMediaRepository = new FirestoreMediaRepository();
