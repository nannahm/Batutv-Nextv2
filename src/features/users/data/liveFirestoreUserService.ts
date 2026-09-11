import { CMSUser } from '@/src/types/user';
import { adminFirestoreUserRepository } from './adminFirestoreUserRepository';
import { UserListFetchResult, UserDetailFetchResult } from '../types';

/**
 * Mengambil daftar seluruh pengguna CMS dari Firestore menggunakan Admin SDK (SSR/Server-Side).
 * Jika gagal atau belum terinisialisasi, fallback ke data awal terkonfigurasi.
 */
export async function fetchUsersLive(): Promise<UserListFetchResult> {
  try {
    const users = await adminFirestoreUserRepository.getUsers();
    return {
      users,
      source: 'firestore-live',
      total: users.length,
    };
  } catch (err: any) {
    console.error('[fetchUsersLive] Error mengambil data pengguna:', err.message || err);
    const users = await adminFirestoreUserRepository.getUsers();
    return {
      users,
      source: 'seed-cache',
      total: users.length,
    };
  }
}

/**
 * Mengambil satu pengguna CMS berdasarkan ID.
 */
export async function fetchUserByIdLive(id: string): Promise<UserDetailFetchResult> {
  try {
    const user = await adminFirestoreUserRepository.getUserById(id);
    return {
      user,
      source: user ? 'firestore-live' : 'seed-cache',
    };
  } catch (err: any) {
    console.error(`[fetchUserByIdLive] Error mengambil pengguna ${id}:`, err.message || err);
    const user = await adminFirestoreUserRepository.getUserById(id);
    return {
      user,
      source: 'seed-cache',
    };
  }
}
