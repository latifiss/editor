"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Admin } from "@/store/features/auth/authTypes";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useAdminLogoutMutation,
} from "@/store/features/auth/authAPI";
import {
  selectCurrentAdmin,
  selectIsAuthenticated,
  selectIsInitialized,
  initializeAuth,
  updateProfileSuccess,
} from "@/store/features/auth/authSlice";
import { AppDispatch } from "@/store/app/store";
import ProfileHeader from "@/components/admin/profile/ProfileHeader";
import ProfileInfo from "@/components/admin/profile/ProfileInfo";
import EditProfileModal from "@/components/admin/profile/EditProfileModal";
import ChangePasswordModal from "@/components/admin/profile/ChangePasswordModal";
import ProfileSecurity from "@/components/admin/profile/ProfileSecurity";
import { ClipLoader } from "react-spinners";
import { PencilIcon, KeyIcon, ArrowRightOnRectangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface AdminProfileClientProps {
  initialAdmin?: Admin | null;
}

export default function AdminProfileClient({ initialAdmin = null }: AdminProfileClientProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const admin = useSelector(selectCurrentAdmin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetProfileQuery();
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logout, { isLoading: isLoggingOut }] = useAdminLogoutMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      if (initialAdmin) {
        dispatch(updateProfileSuccess(initialAdmin));
      }
      dispatch(initializeAuth());
    }
  }, [dispatch, initialAdmin, isInitialized]);

  const currentAdmin = profileData?.data || admin || initialAdmin;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<Admin>) => {
    try {
      const response = await updateProfileMutation(updatedData).unwrap();

      if (response.success) {
        setIsEditModalOpen(false);
        await refetch();
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      const message = error?.data?.message || error?.data?.errors?.[0] || "Failed to update profile";
      alert(message);
    }
  };

  const handlePasswordChange = async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await changePasswordMutation(passwords).unwrap();
      setIsChangePasswordModalOpen(false);
      alert("Password changed successfully!");
    } catch (error: any) {
      console.error("Password change failed:", error);
      const message = error?.data?.message || "Failed to change password";
      throw new Error(message);
    }
  };

  const refreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Client-side redirect: only when initialized, not authenticated, and no admin data
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !currentAdmin) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, currentAdmin, router]);

  if (isLoadingProfile && !currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ClipLoader size={40} color="#3B82F6" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={refreshProfile}
            disabled={isRefreshing || isLoadingProfile}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing || isLoadingProfile ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <ProfileHeader admin={currentAdmin} />

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={isUpdatingProfile}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <PencilIcon className="h-5 w-5" />
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-2">
                      <ClipLoader size={16} color="#3B82F6" />
                      Updating...
                    </span>
                  ) : (
                    "Edit Profile"
                  )}
                </button>

                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  disabled={isChangingPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <KeyIcon className="h-5 w-5" />
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  {isLoggingOut ? (
                    <span className="flex items-center gap-2">
                      <ClipLoader size={16} color="#EF4444" />
                      Logging out...
                    </span>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      currentAdmin?.role === "super_admin"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        : currentAdmin?.role === "admin"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        : currentAdmin?.role === "editor"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {currentAdmin?.role?.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      currentAdmin?.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {currentAdmin?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                  <span className="text-sm text-gray-900 dark:text-white">{currentAdmin?.lastLogin ? new Date(currentAdmin.lastLogin).toLocaleDateString() : "Never"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm text-gray-900 dark:text-white">{currentAdmin?.createdAt ? new Date(currentAdmin.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ProfileInfo admin={currentAdmin} />
            <ProfileSecurity admin={currentAdmin} />
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleProfileUpdate} admin={currentAdmin} />

      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} onSuccess={handlePasswordChange} />
    </div>
  );
}