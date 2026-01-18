'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
    id: 'ghanapolitan',
    name: 'ghanapolitan',
    smallLogo: '/logos/m-ghanapolitan.svg',
    largeLogo: '/logos/m-ghanapolitan.svg',
    alt: 'Ghanapolitan Logo',
    path: '/ghanapolitan/articles',
  },
  {
    id: 'ghanascore',
    name: 'ghanascore',
    smallLogo: '/logos/m-ghanascore.svg',
    largeLogo: '/logos/m-ghanascore.svg',
    alt: 'Ghanascore Logo',
    path: '/ghanascore/articles',
  },
  {
    id: 'afrobeatsreporter',
    name: 'afrobeatsreporter',
    smallLogo: '/logos/m-afrobeatsreporter.svg',
    largeLogo: '/logos/m-afrobeatsreporter.svg',
    alt: 'Afrobeats Reporter Logo',
    path: '/afrobeatsrep/articles',
  },
];

interface LogoSelectorProps {
  defaultLogo?: string;
  onLogoChange?: (logo: Logo) => void;
  className?: string;
}

export default function LogoSelector({
  defaultLogo = 'ghanapolitan',
  onLogoChange,
  className,
}: LogoSelectorProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedLogo, setSelectedLogo] = useState<Logo>(() => {
    return logos.find((l) => l.id === defaultLogo) || logos[0];
  });

  const [isOpen, setIsOpen] = useState(false);

  /**
   * ✅ Prefetch all routes for instant navigation
   */
  useEffect(() => {
    logos.forEach((logo) => {
      router.prefetch(logo.path);
    });
  }, [router]);

  /**
   * Close dropdown on outside click
   */
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

  /**
   * 🚀 FAST navigation handler
   */
  const handleLogoSelect = (logo: Logo) => {
    if (logo.id === selectedLogo.id) {
      setIsOpen(false);
      return;
    }

    // Instant UI update
    setSelectedLogo(logo);
    onLogoChange?.(logo);
    setIsOpen(false);

    // Non-blocking navigation
    startTransition(() => {
      router.push(logo.path);
    });
  };

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
    >
      {/* Trigger */}
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

      {/* Dropdown */}
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
