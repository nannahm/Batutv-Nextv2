import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CMSUser, UserRole, UserStatus } from '../../types/user';
import { IUserRepository, UserQueryOptions } from '../IUserRepository';
import { sanitizeForFirestore } from './converterUtils';
import { INITIAL_CMS_USERS } from '../../data/userAdminStore';

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

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

export function toUserFirestoreDocument(user: CMSUser): Record<string, any> {
  return sanitizeForFirestore({
    id: user.id,
    fullName: user.fullName || '',
    username: user.username || '',
    email: user.email || '',
    password: user.password || 'Password@123',
    role: user.role || 'reporter',
    status: user.status || 'aktif',
    authorId: user.authorId || null,
    authorName: user.authorName || null,
    authorPosition: user.authorPosition || null,
    authorPhotoUrl: user.authorPhotoUrl || null,
    lastLogin: user.lastLogin ? convertDateToString(user.lastLogin) : null,
    lastLoginDetails: user.lastLoginDetails || null,
    failedLoginAttempts: user.failedLoginAttempts || 0,
    forcePasswordChange: Boolean(user.forcePasswordChange),
    notes: user.notes || null,
    createdAt: convertDateToString(user.createdAt),
    updatedAt: convertDateToString(user.updatedAt),
  });
}

export function fromUserFirestoreDocument(id: string, data: Record<string, any>): CMSUser {
  const nowIso = new Date().toISOString();
  return {
    id,
    fullName: data.fullName || data.name || 'Pengguna CMS',
    username: data.username || `user_${id.slice(0, 6)}`,
    email: data.email || '',
    password: data.password || 'Password@123',
    role: (data.role as UserRole) || 'reporter',
    status: (data.status as UserStatus) || 'aktif',
    authorId: data.authorId || null,
    authorName: data.authorName || undefined,
    authorPosition: data.authorPosition || undefined,
    authorPhotoUrl: data.authorPhotoUrl || undefined,
    lastLogin: data.lastLogin ? convertDateToString(data.lastLogin) : null,
    lastLoginDetails: data.lastLoginDetails || undefined,
    failedLoginAttempts: typeof data.failedLoginAttempts === 'number' ? data.failedLoginAttempts : 0,
    forcePasswordChange: Boolean(data.forcePasswordChange),
    notes: data.notes || undefined,
    createdAt: convertDateToString(data.createdAt, nowIso),
    updatedAt: convertDateToString(data.updatedAt, nowIso),
  };
}

export class FirestoreUserRepository implements IUserRepository {
  async getUsers(options: UserQueryOptions = {}): Promise<CMSUser[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION);
      let q = query(colRef);

      if (options.role) {
        q = query(colRef, where('role', '==', options.role));
      }
      if (options.limit && options.limit > 0) {
        q = query(q, limit(options.limit));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        const users: CMSUser[] = [];
        snap.forEach((docSnap) => {
          users.push(fromUserFirestoreDocument(docSnap.id, docSnap.data()));
        });

        let result = users;
        if (options.status) {
          result = result.filter((u) => u.status === options.status);
        }
        return result;
      }
    } catch (err) {
      console.warn('[FirestoreUserRepository] getUsers error, falling back to cache:', err);
    }
    return INITIAL_CMS_USERS;
  }

  async getUserById(id: string): Promise<CMSUser | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return fromUserFirestoreDocument(snap.id, snap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreUserRepository] getUserById(${id}) error:`, err);
    }
    const fallback = INITIAL_CMS_USERS.find((u) => u.id === id);
    return fallback || null;
  }

  async getUserByEmail(email: string): Promise<CMSUser | null> {
    try {
      const colRef = collection(db, USERS_COLLECTION);
      const q = query(colRef, where('email', '==', email), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromUserFirestoreDocument(docSnap.id, docSnap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreUserRepository] getUserByEmail(${email}) error:`, err);
    }
    const fallback = INITIAL_CMS_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return fallback || null;
  }

  async saveUser(user: CMSUser): Promise<CMSUser> {
    const docId = user.id || `usr-${Date.now()}`;
    const payload = toUserFirestoreDocument({ ...user, id: docId });
    const docRef = doc(db, USERS_COLLECTION, docId);
    await setDoc(docRef, payload, { merge: true });

    // If admin role, also sync to admins collection for security rules exists() checks
    if (user.role === 'admin') {
      try {
        const adminRef = doc(db, ADMINS_COLLECTION, docId);
        await setDoc(adminRef, payload, { merge: true });
      } catch (err) {
        console.warn('[FirestoreUserRepository] failed to sync to admins collection:', err);
      }
    } else {
      // If downgraded from admin, remove from admins collection
      try {
        const adminRef = doc(db, ADMINS_COLLECTION, docId);
        await deleteDoc(adminRef);
      } catch {
        // ignore
      }
    }

    return { ...user, id: docId };
  }

  async updateUser(id: string, updates: Partial<CMSUser>): Promise<CMSUser> {
    const existing = await this.getUserById(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const merged: CMSUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.saveUser(merged);
  }

  async deleteUser(id: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id);
    await deleteDoc(docRef);

    try {
      const adminRef = doc(db, ADMINS_COLLECTION, id);
      await deleteDoc(adminRef);
    } catch {
      // ignore
    }
  }

  subscribe(
    onNext: (users: CMSUser[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const colRef = collection(db, USERS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const list: CMSUser[] = [];
        snap.forEach((docSnap) => {
          list.push(fromUserFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreUserRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreUserRepository = new FirestoreUserRepository();
