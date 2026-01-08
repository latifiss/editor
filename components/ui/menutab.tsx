'use client'

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  FilmIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: string[];
};

const tabs: Tab[] = [
  { id: "home", label: "Dashboard", icon: ChartBarSquareIcon, items: ["Overview", "Stats", "Reports"] },
  { id: "account", label: "Articles", icon: DocumentChartBarIcon, items: ["All Articles", "Drafts", "Create Article"] },
  { id: "media", label: "Media", icon: FilmIcon, items: ["Library", "Upload", "Folders"] },
  { id: "settings", label: "Schedules", icon: CalendarDaysIcon, items: ["My Schedule", "Upcoming", "History"] },
];

export default function IconTabsMobile() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (id: string) => {
    if (activeTab === id) {
      setPopupOpen(!popupOpen);
    } else {
      setActiveTab(id);
      setPopupOpen(true);
    }
  };

  const activeTabObj = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="relative inline-block" ref={tabRef}>
      <div className="inline-flex items-center text-secondary border-[0.5px] border-[#e0e0e0] rounded-full p-1 bg-[#fbfbfb] dark:bg-neutral-800/50 dark:border-neutral-700/50 gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors",
                isActive
                  ? "bg-[#ebe8e8] dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border border-[#e0e0e0]"
                  : "text-gray-700 dark:text-gray-400 hover:bg-stone-200/30 dark:hover:bg-neutral-800/50"
              )}
            >
              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {popupOpen && activeTabObj && (
        <div
          className="absolute top-full left-0 mt-2 w-max min-w-[200px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {activeTabObj.items.map((item, index) => (
            <button
              key={index}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors rounded"
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}