export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
  displayName?: string;
}

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
  authToken?: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'editor' | 'viewer';
    profileImage?: string;
    lastLogin?: string;
    createdAt?: string;
    tokens: AdminTokens;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  role?: 'super_admin' | 'admin' | 'editor' | 'viewer';
  profileImage?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: AdminTokens;
}

export interface ProfileResponse {
  success: boolean;
  data: Admin;
}

export interface AuthState {
  admin: Admin | null;
  tokens: AdminTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}