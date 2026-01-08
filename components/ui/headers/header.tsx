"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import IconTabs from "../tabview";
import { 
  UserIcon,
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";
import ButtonIcon from "../buttons/iconButton";
import MenuTabs from "../tabviewMobile";
import { 
  selectCurrentAdmin, 
  selectIsAuthenticated,
  selectIsInitialized 
} from "@/store/features/auth/authSlice";
import { useAdminLogoutMutation } from "@/store/features/auth/authAPI";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClipLoader } from "react-spinners";
import LogoSelector from "../logoSelector";

export default function Header() {
  const router = useRouter();
  const admin = useSelector(selectCurrentAdmin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const [logout, { isLoading: isLoggingOut }] = useAdminLogoutMutation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getFirstName = () => {
    if (!admin?.name) return "Account";
    return admin.name.split(" ")[0];
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      setUserMenuOpen(false);
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      setUserMenuOpen(!userMenuOpen);
    } else {
      router.push("/login");
    }
  };

  if (!isInitialized) {
    return (
      <header className="w-full bg-transparent">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
          <LogoSelector 
            defaultLogo="ghanascore"
            onLogoChange={(logo) => console.log('Selected:', logo.name)}
            className="my-4"
          />

          <div className="hidden md:block">
            <IconTabs />
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-2 px-4 py-2">
              <ClipLoader size={16} color="#666" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>

          <div className="md:hidden">
            <MenuTabs />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-transparent">
      <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
        <LogoSelector 
          defaultLogo="ghanascore"
          onLogoChange={(logo) => console.log('Selected:', logo.name)}
          className="my-4"
        />

        <div className="hidden md:block">
          <IconTabs />
        </div>

        <div className="hidden md:block relative" ref={userMenuRef}>
          <ButtonIcon 
            icon={UserIcon} 
            text={isAuthenticated ? getFirstName() : "Account"} 
            variant="primary" 
            onClick={handleUserButtonClick}
            className="relative z-10"
          />

          {isAuthenticated && userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 animate-fade-in p-1">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700">
                <p className="font-semibold text-gray-900 dark:text-white">{admin?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.email}</p>
                <div className="mt-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    admin?.role === 'super_admin' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      : admin?.role === 'admin'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : admin?.role === 'editor'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                  )}>
                    {admin?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>View Profile</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <ClipLoader size={14} color="#666" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <MenuTabs />
        </div>
      </div>
    </header>
  );
}