import { CMSUser, UserStatus, MigrationStatus, toCanonicalRole } from '@/src/types/user';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { INITIAL_CMS_USERS } from '@/src/data/initialUsers';

const COLLECTION_NAME = 'users';

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

export function fromAdminUserFirestore(id: string, data: Record<string, any>): CMSUser {
  const nowIso = new Date().toISOString();
  const canonicalRole = toCanonicalRole(data.role);
  const isLegacyUnmigrated = ['usr-005', 'usr-006', 'usr-007', 'usr-008', 'usr-009'].includes(id);

  return {
    id,
    fullName: data.fullName || data.name || 'Pengguna CMS',
    username: data.username || `user_${id.slice(0, 6)}`,
    email: data.email || '',
    password: data.password || 'Password@123',
    role: canonicalRole,
    status: (data.status as UserStatus) || 'aktif',
    migrationStatus: (data.migrationStatus as MigrationStatus) || (isLegacyUnmigrated ? 'unmigrated' : 'migrated'),
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

export class AdminFirestoreUserRepository {
  async getUsers(): Promise<CMSUser[]> {
    try {
      const adminDb = getAdminFirestore();
      const snapshot = await adminDb.collection(COLLECTION_NAME).get();

      if (!snapshot.empty) {
        const users: CMSUser[] = [];
        snapshot.forEach((doc) => {
          users.push(fromAdminUserFirestore(doc.id, doc.data()));
        });
        return users;
      }
      return INITIAL_CMS_USERS;
    } catch (err: any) {
      console.warn(`[AdminFirestoreUserRepository.getUsers] Fallback ke INITIAL_CMS_USERS:`, err.message || err);
      return INITIAL_CMS_USERS;
    }
  }

  async getUserById(id: string): Promise<CMSUser | null> {
    try {
      const adminDb = getAdminFirestore();
      const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();

      if (doc.exists) {
        return fromAdminUserFirestore(doc.id, doc.data() || {});
      }

      // Check initial users fallback
      const foundSeed = INITIAL_CMS_USERS.find((u) => u.id === id);
      return foundSeed || null;
    } catch (err: any) {
      console.warn(`[AdminFirestoreUserRepository.getUserById] Fallback ke seed untuk ${id}:`, err.message || err);
      const foundSeed = INITIAL_CMS_USERS.find((u) => u.id === id);
      return foundSeed || null;
    }
  }

  async getUserByEmail(email: string): Promise<CMSUser | null> {
    try {
      const adminDb = getAdminFirestore();
      const cleanEmail = email.toLowerCase().trim();
      const snapshot = await adminDb
        .collection(COLLECTION_NAME)
        .where('email', '==', cleanEmail)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        return fromAdminUserFirestore(firstDoc.id, firstDoc.data());
      }

      // Check fallback
      const foundSeed = INITIAL_CMS_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      return foundSeed || null;
    } catch (err: any) {
      console.warn(`[AdminFirestoreUserRepository.getUserByEmail] Fallback ke seed untuk ${email}:`, err.message || err);
      const cleanEmail = email.toLowerCase().trim();
      const foundSeed = INITIAL_CMS_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      return foundSeed || null;
    }
  }
}

export const adminFirestoreUserRepository = new AdminFirestoreUserRepository();
