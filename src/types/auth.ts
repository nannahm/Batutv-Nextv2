export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}
