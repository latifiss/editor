'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

type Logo = {
  id: string;
  name: string;
  smallLogo: string;
  largeLogo: string;
  alt: string;
  path: string;
  basePath: string;
};

const logos: Logo[] = [
  {
    id: 'ghanapolitan',
    name: 'ghanapolitan',
    smallLogo: '/logos/m-ghanapolitan.svg',
    largeLogo: '/logos/m-ghanapolitan.svg',
    alt: 'Ghanapolitan Logo',
    path: '/ghanapolitan/articles',
    basePath: '/ghanapolitan',
  },
  {
    id: 'ghanascore',
    name: 'ghanascore',
    smallLogo: '/logos/m-ghanascore.svg',
    largeLogo: '/logos/m-ghanascore.svg',
    alt: 'Ghanascore Logo',
    path: '/ghanascore/articles',
    basePath: '/ghanascore',
  },
  {
    id: 'buzzchale',
    name: 'buzzchale',
    smallLogo: '/logos/bc_logo.png',
    largeLogo: '/logos/bc_logo.png',
    alt: 'Buzz Chale Logo',
    path: '/buzzchale/articles',
    basePath: '/buzzchale',
  },
];

interface LogoSelectorProps {
  onLogoChange?: (logo: Logo) => void;
  className?: string;
}

export default function LogoSelector({
  onLogoChange,
  className,
}: LogoSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentLogo = (): Logo => {
    const currentLogo = logos.find(logo => 
      pathname.startsWith(logo.basePath)
    );
    
    return currentLogo || logos[0];
  };

  const [selectedLogo, setSelectedLogo] = useState<Logo>(getCurrentLogo());

  useEffect(() => {
    const newLogo = getCurrentLogo();
    if (newLogo.id !== selectedLogo.id) {
      setSelectedLogo(newLogo);
      onLogoChange?.(newLogo);
    }
  }, [pathname]);

  useEffect(() => {
    const currentLogo = getCurrentLogo();
    logos.forEach((logo) => {
      if (logo.id === currentLogo.id) {
        router.prefetch(logo.path);
      }
    });
  }, [router, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoSelect = (logo: Logo) => {
    if (logo.id === selectedLogo.id) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    if (logo.id !== getCurrentLogo().id) {
      window.open(logo.path, '_blank');
    } else {
      setSelectedLogo(logo);
      onLogoChange?.(logo);
      
      startTransition(() => {
        router.push(logo.path);
      });
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center justify-center p-1.5 rounded-lg',
          'transition-all duration-150',
          'hover:bg-gray-50 dark:hover:bg-neutral-800',
          'active:scale-95',
          isOpen && 'bg-gray-50 dark:bg-neutral-800 shadow-sm'
        )}
        aria-label="Select logo"
        aria-expanded={isOpen}
      >
        <Image
          key={selectedLogo.id}
          src={selectedLogo.largeLogo}
          alt={selectedLogo.alt}
          width={0}
          height={45}
          style={{ width: 'auto' }}
          className="h-[45px] w-auto"
          priority
        />
      </button>

      <div
        className={cn(
          'absolute top-full left-0 mt-2 z-50',
          'transition-all duration-150 ease-out',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'w-52 p-3 rounded-xl shadow-xl',
            'bg-white dark:bg-neutral-900',
            'border border-gray-200 dark:border-neutral-700',
            'backdrop-blur-sm'
          )}
        >
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Select Logo
          </h3>

          <div className="space-y-1.5">
            {logos.map((logo) => {
              const isSelected = logo.id === selectedLogo.id;
              const isCurrentBrand = logo.id === getCurrentLogo().id;

              return (
                <button
                  key={logo.id}
                  onClick={() => handleLogoSelect(logo)}
                  className={cn(
                    'flex items-center gap-3 w-full p-2.5 rounded-lg',
                    'transition-all duration-150',
                    'hover:bg-gray-50 dark:hover:bg-neutral-800',
                    isSelected &&
                      'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600'
                  )}
                  title={isCurrentBrand ? 'Navigate within current tab' : 'Open in new tab'}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center p-1.5 rounded-md border',
                      isSelected
                        ? 'border-gray-300 dark:border-neutral-500 shadow-sm'
                        : 'border-gray-200 dark:border-neutral-700'
                    )}
                  >
                    <Image
                      src={logo.smallLogo}
                      alt={logo.alt}
                      width={0}
                      height={40}
                      style={{ width: 'auto' }}
                      className="h-10 w-auto"
                    />
                  </div>

                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {logo.name}
                  </span>

                  {isSelected && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}

                  {!isCurrentBrand && (
                    <svg 
                      className="ml-auto w-4 h-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-3 pt-2 px-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-neutral-800">
            Click any logo to navigate
          </p>
        </div>
      </div>
    </div>
  );
}