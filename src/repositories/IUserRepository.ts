import { CMSUser, UserRole, UserStatus } from '../types/user';

export interface UserQueryOptions {
  role?: UserRole;
  status?: UserStatus;
  limit?: number;
}

export interface IUserRepository {
  getUsers(options?: UserQueryOptions): Promise<CMSUser[]>;
  getUserById(id: string): Promise<CMSUser | null>;
  getUserByEmail(email: string): Promise<CMSUser | null>;
  saveUser(user: CMSUser): Promise<CMSUser>;
  updateUser(id: string, updates: Partial<CMSUser>): Promise<CMSUser>;
  deleteUser(id: string): Promise<void>;
  subscribe(
    onNext: (users: CMSUser[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
