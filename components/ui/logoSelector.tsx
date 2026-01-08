'use client'

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Logo = {
  id: string;
  name: string;
  smallLogo: string;
  largeLogo: string;
  alt: string;
  path: string;
};

const logos: Logo[] = [
  {
    id: "ghanapolitan",
    name: "ghanapolitan",
    smallLogo: "/logos/m-ghanapolitan.svg",
    largeLogo: "/logos/m-ghanapolitan.svg",
    alt: "Ghanapolitan Logo",
    path: "/ghanapolitan/articles"
  },
  {
    id: "ghanascore",
    name: "ghanascore",
    smallLogo: "/logos/m-ghanascore.svg",
    largeLogo: "/logos/m-ghanascore.svg",
    alt: "Ghanascore Logo",
    path: "/ghanascore/articles"
  },
  {
    id: "afrobeatsreporter",
    name: "afrobeatsreporter",
    smallLogo: "/logos/m-afrobeatsreporter.svg",
    largeLogo: "/logos/m-afrobeatsreporter.svg",
    alt: "Afrobeats Reporter Logo",
    path: "/afrobeatsrep/articles"
  },
];

interface LogoSelectorProps {
  defaultLogo?: string;
  onLogoChange?: (logo: Logo) => void;
  className?: string;
}

export default function LogoSelector({ 
  defaultLogo = "ghanapolitan", 
  onLogoChange,
  className 
}: LogoSelectorProps) {
  const router = useRouter();
  const [selectedLogo, setSelectedLogo] = useState<Logo>(() => 
    logos.find(logo => logo.id === defaultLogo) || logos[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoSelect = async (logo: Logo) => {
    if (logo.id === selectedLogo.id) {
      setIsOpen(false);
      return;
    }

    setSelectedLogo(logo);
    onLogoChange?.(logo);
    setIsOpen(false);
    
    setIsLoading(true);
    
    try {
      await router.push(logo.path);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-lg transition-all duration-150",
          "hover:bg-white-50/80 dark:hover:bg-neutral-800/80",
          "active:scale-95",
          isOpen && "bg-gray-50 dark:bg-neutral-800 shadow-sm"
        )}
        aria-label="Select logo"
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={isLoading}
      >
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-[45px] w-[45px]">
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-neutral-600 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Image
              src={selectedLogo.largeLogo}
              alt={selectedLogo.alt}
              width={0}
              height={45}
              style={{ width: 'auto' }}
              className="h-[45px] w-auto transition-opacity duration-150"
              priority
            />
          )}
        </div>
      </button>

      <div
        className={cn(
          "absolute top-full left-0 mt-2 z-50",
          "transition-all duration-150 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="logo-selector"
      >
        <div className={cn(
          "bg-white dark:bg-neutral-900",
          "border border-gray-200 dark:border-neutral-700",
          "rounded-xl shadow-xl",
          "backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95",
          "p-3",
          "w-52"
        )}>
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
              Select Logo
            </h3>
          </div>
          
          <div className="space-y-1.5">
            {logos.map((logo) => {
              const isSelected = logo.id === selectedLogo.id;
              return (
                <button
                  key={logo.id}
                  onClick={() => handleLogoSelect(logo)}
                  className={cn(
                    "flex items-center gap-3 w-full p-2.5 rounded-lg",
                    "transition-all duration-150",
                    "hover:bg-gray-50 dark:hover:bg-neutral-800",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-neutral-600",
                    isSelected 
                      ? "bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600" 
                      : ""
                  )}
                  role="menuitem"
                  aria-current={isSelected ? "true" : "false"}
                  disabled={isLoading}
                >
                  <div className={cn(
                    "flex items-center justify-center p-1.5 rounded-md",
                    "bg-white dark:bg-neutral-850",
                    "border",
                    isSelected
                      ? "border-gray-300 dark:border-neutral-500 shadow-sm"
                      : "border-gray-200 dark:border-neutral-700"
                  )}>
                    <Image
                      src={logo.smallLogo}
                      alt={logo.alt}
                      width={0}
                      height={40}
                      style={{ width: 'auto' }}
                      className="h-10 w-auto"
                    />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-300"
                    )}>
                      {logo.name}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
              Click any logo to select
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}