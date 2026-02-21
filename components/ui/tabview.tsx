'use client'

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
};

const allTabs: Record<string, Tab[]> = {
  ghanapolitan: [
    { id: "graphics", label: "Graphics", icon: ChartBarSquareIcon, path: "/ghanapolitan/graphics" },
    { id: "articles", label: "Articles", icon: DocumentChartBarIcon, path: "/ghanapolitan/articles" },
    { id: "features", label: "Features", icon: CalendarDaysIcon, path: "/ghanapolitan/features" },
    { id: "sections", label: "Sections", icon: CalendarDaysIcon, path: "/ghanapolitan/sections" },
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

export default function IconTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("");
  const [currentTabs, setCurrentTabs] = useState<Tab[]>([]);

  useEffect(() => {
    let tabs: Tab[] = [];
    let defaultActiveTab = "";

    if (pathname.includes("/ghanapolitan/")) {
      tabs = allTabs.ghanapolitan;
      if (pathname.includes("/ghanapolitan/graphics")) {
        defaultActiveTab = "graphics";
      } else if (pathname.includes("/ghanapolitan/features")) {
        defaultActiveTab = "features";
      } else if (
        pathname.includes("/ghanapolitan/articles") ||
        pathname.includes("/ghanapolitan/create-article") ||
        pathname.includes("/ghanapolitan/edit-article") ||
        pathname.includes("/ghanapolitan/edit-live-article") ||
        pathname.includes("/ghanapolitan/article-detail")
      ) {
        defaultActiveTab = "articles";
      }
    } else if (pathname.includes("/ghanascore/")) {
      tabs = allTabs.ghanascore;
      if (pathname.includes("/ghanascore/features")) {
        defaultActiveTab = "features";
      } else if (
        pathname.includes("/ghanascore/articles") ||
        pathname.includes("/ghanascore/create-article") ||
        pathname.includes("/ghanascore/edit-article") ||
        pathname.includes("/ghanascore/edit-live-article") ||
        pathname.includes("/ghanascore/article-detail")
      ) {
        defaultActiveTab = "articles";
      }
    } else if (pathname.includes("/afrobeatsrep/")) {
      tabs = allTabs.afrobeatsrep;
      if (pathname.includes("/afrobeatsrep/features")) {
        defaultActiveTab = "features";
      } else if (
        pathname.includes("/afrobeatsrep/articles") ||
        pathname.includes("/afrobeatsrep/create-article") ||
        pathname.includes("/afrobeatsrep/edit-article") ||
        pathname.includes("/afrobeatsrep/article-detail")
      ) {
        defaultActiveTab = "articles";
      }
    }

    setCurrentTabs(tabs);
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [pathname]);

  const handleTabClick = (tab: Tab) => {
    if (tab.id === activeTab) return;

    setActiveTab(tab.id);
    
    router.push(tab.path);
  };

  if (currentTabs.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center text-secondary border-[0.1px] border-[#e0e0e0] rounded-full p-1 bg-[#fbfbfb] dark:bg-neutral-800/50 dark:border-neutral-700/50 gap-1">
      {currentTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-150",
              "dark:bg-neutral-800/50",
              "hover:bg-[#f0f0f0] dark:hover:bg-neutral-700/50",
              isActive
                ? "bg-[#ebe8e8] text-gray-700 border-[#e0e0e0] shadow-sm"
                : "text-gray-600 dark:text-gray-300"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 transition-colors duration-150",
              isActive 
                ? "text-gray-700 dark:text-gray-300" 
                : "text-gray-500 dark:text-gray-400"
            )} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}