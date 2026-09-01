export type UserRole = 'admin' | 'redaksi' | 'editor' | 'reporter' | 'kontributor';

export type UserStatus = 'aktif' | 'nonaktif' | 'ditangguhkan';

export interface UserLoginSessionInfo {
  browser: string;
  device: string;
  ipAddress: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface CMSUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string; // Stored securely for authentication verification
  role: UserRole;
  status: UserStatus;
  lastLogin?: string | null;
  lastLoginDetails?: UserLoginSessionInfo;
  createdAt: string;
  updatedAt: string;
  authorId?: string | null; // Relasi 1-ke-1 ke Master Data Penulis (Author First Architecture)
  authorName?: string; // Resolved author name cache
  authorPosition?: string; // Resolved author position
  authorPhotoUrl?: string; // Resolved author photo
  forcePasswordChange?: boolean;
  failedLoginAttempts?: number;
  sessionsCount?: number;
  notes?: string;
}

export interface UserFormInput {
  authorId: string | null; // Penulis yang dipilih dari Master Data Penulis
  fullName?: string;
  username: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  status: UserStatus;
  forcePasswordChange?: boolean;
}

export interface RolePermissionDetail {
  role: UserRole;
  name: string;
  badgeColor: string;
  description: string;
  allowedAccess: string[];
  capabilities: string[];
  restrictedActions: string[];
  workflowNotes?: string;
}

export interface UserActivityLogPayload {
  userId: string;
  userName: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

