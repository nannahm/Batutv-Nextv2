export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'author';
  avatar?: string;
  loginTime: string;
}

export interface AuthActionResult {
  success: boolean;
  message: string;
  user?: AdminUser | null;
  errors?: Record<string, string[]>;
}
