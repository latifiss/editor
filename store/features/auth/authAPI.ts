import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshTokenSuccess,
  updateProfileSuccess,
  setLoading,
} from './authSlice';
import {
  Admin,
  AdminAuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshTokenResponse,
  ProfileResponse,
} from './authTypes';

const extractAdminFromResponse = (data: any): Admin => ({
  _id: data.id || data._id,
  name: data.name,
  email: data.email,
  role: data.role,
  profileImage: data.profileImage,
  lastLogin: data.lastLogin,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  isActive: data.isActive || true,
  displayName: data.displayName || data.name || data.email.split('@')[0],
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api/admin/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    login: builder.mutation<AdminAuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(loginStart());
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            const admin = extractAdminFromResponse(data.data);
            const tokens = data.data.tokens;
            
            dispatch(loginSuccess({ admin, tokens }));
          } else {
            dispatch(loginFailure(data.message || 'Login failed'));
          }
        } catch (error: any) {
          const message =
            error?.data?.message ||
            error?.data?.errors?.[0] ||
            error?.error ||
            'Login failed. Please check your credentials.';
          dispatch(loginFailure(message));
        }
      },
    }),

    register: builder.mutation<AdminAuthResponse, RegisterCredentials>({
      query: (userData) => ({
        url: 'register',
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(registerStart());
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            const admin = extractAdminFromResponse(data.data);
            const tokens = data.data.tokens;
            
            dispatch(registerSuccess({ admin, tokens }));
          } else {
            dispatch(registerFailure(data.message || 'Registration failed'));
          }
        } catch (error: any) {
          const message =
            error?.data?.message ||
            error?.data?.errors?.join(', ') ||
            error?.error ||
            'Registration failed.';
          dispatch(registerFailure(message));
        }
      },
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: 'refresh-token',
        method: 'POST',
        body: { refreshToken },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            dispatch(refreshTokenSuccess(data.data));
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch(logout());
        }
      },
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => 'profile',
      providesTags: ['Admin'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            const admin = extractAdminFromResponse(data.data);
            dispatch(updateProfileSuccess(admin));
          }
        } catch (error) {
          console.error('Profile fetch failed:', error);
        }
      },
    }),

    updateProfile: builder.mutation<ProfileResponse, Partial<Admin>>({
      query: (profileData) => ({
        url: 'profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Admin'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            const admin = extractAdminFromResponse(data.data);
            dispatch(updateProfileSuccess(admin));
          }
        } catch (error: any) {
          const message =
            error?.data?.message ||
            error?.error ||
            'Profile update failed';
          console.error(message);
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (passwords) => ({
        url: 'change-password',
        method: 'POST',
        body: passwords,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          await queryFulfilled;
        } catch (error: any) {
          const message =
            error?.data?.message ||
            error?.error ||
            'Password change failed';
          console.error(message);
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    adminLogout: builder.mutation<void, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logout());
      },
    }),

    getAllAdmins: builder.query<{ success: boolean; data: Admin[] }, void>({
      query: () => 'admins',
      providesTags: ['Admin'],
    }),

    updateAdminStatus: builder.mutation<
      { success: boolean; message: string; data: Admin },
      { adminId: string; isActive: boolean }
    >({
      query: ({ adminId, isActive }) => ({
        url: `admins/${adminId}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useAdminLogoutMutation,
  useGetAllAdminsQuery,
  useUpdateAdminStatusMutation,
} = authApi;