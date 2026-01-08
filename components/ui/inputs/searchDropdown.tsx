'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ClipLoader } from 'react-spinners';

type Option = {
  id: string | number;
  label: string;
};

type SearchDropdownProps = {
  placeholder?: string;
  value?: Option | null;
  onChange?: (value: Option) => void;
  onSearch: (query: string) => Promise<Option[]>;
  defaultResults?: Option[];
  showDefaultOnOpen?: boolean;
};

export function SearchDropdown({
  placeholder = 'Search...',
  value: externalValue = null,
  onChange,
  onSearch,
  defaultResults = [],
  showDefaultOnOpen = true,
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Option[]>(defaultResults);
  const [selected, setSelected] = useState<Option | null>(externalValue);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDefaults, setShowDefaults] = useState(showDefaultOnOpen);

  useEffect(() => {
    setSelected(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowDefaults(showDefaultOnOpen);
        setQuery('');
        setResults(defaultResults);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [defaultResults, showDefaultOnOpen]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    if (!query.trim() && showDefaults && defaultResults.length > 0) {
      setResults(defaultResults);
      setLoading(false);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setShowDefaults(false);

    onSearch(query)
      .then((data) => {
        if (active) setResults(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [query, open, onSearch, defaultResults, showDefaults]);

  const handleOpen = () => {
    setOpen(true);
    if (showDefaultOnOpen) {
      setResults(defaultResults);
      setShowDefaults(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim() && showDefaultOnOpen) {
      setShowDefaults(true);
      setResults(defaultResults);
    }
  };

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange?.(option);
    setQuery(option.label);
    setOpen(false);
    setShowDefaults(showDefaultOnOpen);
    setResults(defaultResults);
  };

  const getDisplayText = () => selected?.label || placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex items-center justify-between gap-2 w-full rounded-md px-3 py-2 bg-[#fcfcfc] border-[0.8px] border-[#e0e0e0] dark:bg-neutral-800 dark:border-neutral-700 text-gray-900 dark:text-gray-100 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors'
        )}
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg
          className={cn('w-4 h-4 transition-transform flex-shrink-0', open ? 'rotate-180' : '')}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
          <div className="relative">
            <input
              value={query}
              onChange={handleInputChange}
              autoFocus
              placeholder="Type to search..."
              className="w-full px-3 py-2 pl-3 pr-10 border-b border-gray-200 dark:border-neutral-700 bg-transparent text-sm font-bold outline-none placeholder:text-gray-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <ClipLoader size={16} color="#6b7280" />
              </div>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading && !showDefaults && (
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <ClipLoader size={16} color="#10B981" />
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            )}

            {!loading && results.length === 0 && !query && !showDefaults && (
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                Start typing to search...
              </div>
            )}

            {showDefaults && !query && defaultResults.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 py-1">
                  Latest Sections
                </div>
              </div>
            )}

            {results.map((option) => {
              const isActive = selected?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{option.label}</div>
                  </div>
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
