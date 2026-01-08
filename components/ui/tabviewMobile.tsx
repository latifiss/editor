'use client'

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import {
  Bars3Icon,
  UserIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { 
  selectCurrentAdmin, 
  selectIsAuthenticated,
  selectIsInitialized 
} from "@/store/features/auth/authSlice";
import { useAdminLogoutMutation } from "@/store/features/auth/authAPI";
import { ClipLoader } from "react-spinners";

type PopupItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
};

const menuItems: Record<string, PopupItem[]> = {
  ghanapolitan: [
    { id: "graphics", label: "Graphics", icon: ChartBarSquareIcon, path: "/ghanapolitan/graphics" },
    { id: "articles", label: "Articles", icon: DocumentChartBarIcon, path: "/ghanapolitan/articles" },
    { id: "features", label: "Features", icon: CalendarDaysIcon, path: "/ghanapolitan/features" },
  ],
  ghanascore: [
    { id: "articles", label: "Articles", icon: DocumentChartBarIcon, path: "/ghanascore/articles" },
    { id: "features", label: "Features", icon: CalendarDaysIcon, path: "/ghanascore/features" },
  ],
  afrobeatsrep: [
    { id: "articles", label: "Articles", icon: DocumentChartBarIcon, path: "/afrobeatsrep/articles" },
    { id: "features", label: "Features", icon: CalendarDaysIcon, path: "/afrobeatsrep/features" },
  ],
};

export default function MenuTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useSelector(selectCurrentAdmin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const [logout, { isLoading: isLoggingOut }] = useAdminLogoutMutation();
  
  const [popupOpen, setPopupOpen] = useState(false);
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentMenuItems, setCurrentMenuItems] = useState<PopupItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let items: PopupItem[] = [];

    if (pathname.includes("/ghanapolitan/")) {
      items = menuItems.ghanapolitan;
    } else if (pathname.includes("/ghanascore/")) {
      items = menuItems.ghanascore;
    } else if (pathname.includes("/afrobeatsrep/")) {
      items = menuItems.afrobeatsrep;
    }

    setCurrentMenuItems(items);
  }, [pathname]);

  const getFirstName = () => {
    if (!admin?.name) return "";
    return admin.name.split(" ")[0];
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setPopupOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = async (item: PopupItem) => {
    if (isNavigating) return;

    setIsNavigating(true);
    setPopupOpen(false);
    
    try {
      await router.push(item.path);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  const handleUserMenuClick = () => {
    if (isAuthenticated) {
      setUserPopupOpen(!userPopupOpen);
    } else {
      router.push("/login");
    }
  };

  if (!isInitialized) {
    return (
      <div className="inline-flex items-center border-[0.5px] border-[#e0e0e0] rounded-full p-1 bg-[#fbfbfb] dark:bg-neutral-800/50 dark:border-neutral-700/50">
        <div className="flex items-center gap-2 px-4 py-2">
          <ClipLoader size={16} color="#666" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentMenuItems.length > 0 && (
        <div className="relative" ref={menuRef}>
          <div className="inline-flex items-center border-[0.5px] border-[#e0e0e0] rounded-full p-1 bg-[#fbfbfb] dark:bg-neutral-800/50 dark:border-neutral-700/50">
            <button
              onClick={() => setPopupOpen(!popupOpen)}
              disabled={isNavigating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-l-full font-semibold transition-colors",
                popupOpen ? "bg-[#ebe8e8] dark:bg-neutral-700" : "hover:bg-stone-200/30 dark:hover:bg-neutral-800/50",
                isNavigating && "opacity-50 cursor-not-allowed"
              )}
            >
              <Bars3Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Menu</span>
            </button>

            <div className="w-[1px] h-6 bg-gray-300 dark:bg-neutral-600"></div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserMenuClick}
                className="flex items-center gap-2 px-4 py-2 rounded-r-full font-semibold hover:bg-stone-200/30 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>
                  {isAuthenticated ? getFirstName() || "Admin" : "Login"}
                </span>
              </button>

              {isAuthenticated && userPopupOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 animate-fade-in p-1">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setUserPopupOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>View Profile</span>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-neutral-700 my-1"></div>
                  
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
              )}
            </div>
          </div>

          {popupOpen && (
            <div className="absolute top-full left-0 mt-2 w-max min-w-[200px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 animate-fade-in p-1">
              {currentMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    disabled={isNavigating}
                    className={cn(
                      "flex items-center rounded-lg gap-2 px-4 py-2 w-full text-left transition-colors h-10",
                      "hover:bg-gray-100 dark:hover:bg-neutral-800",
                      isNavigating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isAuthenticated && admin?.role && (
        <div className="hidden md:inline-flex">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            admin.role === 'super_admin' 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
              : admin.role === 'admin'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              : admin.role === 'editor'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
          )}>
            {admin.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}