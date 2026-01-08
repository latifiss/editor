import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { Admin, AdminTokens, AdminAuthResponse } from './authTypes';

interface AuthState {
  admin: Admin | null;
  tokens: AdminTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  admin: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      try {
        const adminStr = localStorage.getItem('admin');
        const tokensStr = localStorage.getItem('admin_tokens');

        if (adminStr && tokensStr) {
          state.admin = JSON.parse(adminStr);
          state.tokens = JSON.parse(tokensStr);
          state.isAuthenticated = true;
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_tokens');
      } finally {
        state.isInitialized = true;
      }
    },

    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ admin: Admin; tokens: AdminTokens }>) => {
      const { admin, tokens } = action.payload;
      state.admin = admin;
      state.tokens = tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      localStorage.setItem('admin', JSON.stringify(admin));
      localStorage.setItem('admin_tokens', JSON.stringify(tokens));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ admin: Admin; tokens: AdminTokens }>) => {
      const { admin, tokens } = action.payload;
      state.admin = admin;
      state.tokens = tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      localStorage.setItem('admin', JSON.stringify(admin));
      localStorage.setItem('admin_tokens', JSON.stringify(tokens));
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.admin = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      localStorage.removeItem('admin');
      localStorage.removeItem('admin_tokens');
    },

    refreshTokenSuccess: (state, action: PayloadAction<AdminTokens>) => {
      state.tokens = action.payload;
      localStorage.setItem('admin_tokens', JSON.stringify(action.payload));
    },

    updateProfileSuccess: (state, action: PayloadAction<Admin>) => {
      state.admin = { ...state.admin, ...action.payload };
      localStorage.setItem('admin', JSON.stringify(state.admin));
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  initializeAuth,
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshTokenSuccess,
  updateProfileSuccess,
  clearError,
  setLoading,
} = authSlice.actions;

export const selectCurrentAdmin = (state: RootState) => state.auth.admin;
export const selectAuthTokens = (state: RootState) => state.auth.tokens;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsSuperAdmin = (state: RootState) => 
  state.auth.admin?.role === 'super_admin';
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;

export default authSlice.reducer;