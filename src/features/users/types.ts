import {
  CMSUser,
  CanonicalUserRole,
  UserRole,
  UserStatus,
  MigrationStatus,
  UserFormInput,
  RolePermissionDetail,
  UserLoginSessionInfo,
  toCanonicalRole,
} from '@/src/types/user';

export type {
  CMSUser,
  CanonicalUserRole,
  UserRole,
  UserStatus,
  MigrationStatus,
  UserFormInput,
  RolePermissionDetail,
  UserLoginSessionInfo,
};

export { toCanonicalRole };

export interface UserListFetchResult {
  users: CMSUser[];
  source: 'firestore-live' | 'seed-cache';
  total: number;
}

export interface UserDetailFetchResult {
  user: CMSUser | null;
  source: 'firestore-live' | 'seed-cache';
}
