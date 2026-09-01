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
import { AdminAuthor, AuthorPosition, AuthorStatus } from '../../types/admin';
import { IAuthorRepository } from '../IAuthorRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'authors';

export function toAuthorFirestoreDocument(author: AdminAuthor): Record<string, any> {
  return sanitizeForFirestore({
    id: author.id,
    name: author.name,
    slug: author.slug,
    position: author.position || 'Reporter',
    email: author.email || '',
    phone: author.phone || '',
    bio: author.bio || '',
    photoUrl: author.photoUrl || '',
    photoMediaId: author.photoMediaId || '',
    status: author.status || 'active',
    seoTitle: author.seoTitle || `${author.name} - Profil Penulis & Jurnalis BatuTV`,
    metaDescription: author.metaDescription || author.bio || `Profil jurnalis dan kumpulan artikel berita karya ${author.name} di BatuTV.`,
    createdAt: author.createdAt || new Date().toISOString(),
    updatedAt: author.updatedAt || new Date().toISOString(),
  });
}

export function fromAuthorFirestoreDocument(id: string, data: Record<string, any>): AdminAuthor {
  // Handle legacy aliases (role -> position, photo -> photoUrl)
  const position = (data.position || data.role || 'Reporter') as AuthorPosition;
  const photoUrl = data.photoUrl || data.photo || '';

  return {
    id: data.id || id,
    name: data.name || '',
    slug: data.slug || '',
    position,
    email: data.email || '',
    phone: data.phone || '',
    bio: data.bio || '',
    photoUrl,
    photoMediaId: data.photoMediaId || '',
    status: (data.status as AuthorStatus) || 'active',
    seoTitle: data.seoTitle || `${data.name || ''} - Profil Penulis BatuTV`,
    metaDescription: data.metaDescription || data.bio || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    newsCount: data.newsCount ?? 0,
    videoCount: data.videoCount ?? 0,
    totalCount: data.totalCount ?? 0,
  };
}

export class FirestoreAuthorRepository implements IAuthorRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getAll(): Promise<AdminAuthor[]> {
    const snap = await getDocs(this.colRef);
    const list: AdminAuthor[] = [];
    snap.forEach((docSnap) => {
      list.push(fromAuthorFirestoreDocument(docSnap.id, docSnap.data()));
    });
    return list;
  }

  async getById(id: string): Promise<AdminAuthor | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return fromAuthorFirestoreDocument(snap.id, snap.data());
  }

  async getBySlug(slug: string): Promise<AdminAuthor | null> {
    const q = query(this.colRef, where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return fromAuthorFirestoreDocument(first.id, first.data());
  }

  async getByEmail(email: string): Promise<AdminAuthor | null> {
    const q = query(this.colRef, where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return fromAuthorFirestoreDocument(first.id, first.data());
  }

  async create(author: AdminAuthor): Promise<AdminAuthor> {
    const docRef = doc(db, COLLECTION_NAME, author.id);
    const docData = toAuthorFirestoreDocument(author);
    await setDoc(docRef, docData);
    return author;
  }

  async update(id: string, partial: Partial<AdminAuthor>): Promise<AdminAuthor> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Author with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async bulkUpdateStatus(ids: string[], status: AuthorStatus): Promise<number> {
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
    onNext: (authors: AdminAuthor[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const list: AdminAuthor[] = [];
        snap.forEach((docSnap) => {
          list.push(fromAuthorFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreAuthorRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreAuthorRepository = new FirestoreAuthorRepository();
