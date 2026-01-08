'use client';

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Option = {
  id: string | number;
  label: string;
};

type SelectDropdownProps = {
  options: Option[];
  placeholder?: string;
  onChange?: (value: Option) => void;
  value?: Option | null;
};

export function SelectDropdown({
  options,
  placeholder = "Select...",
  onChange,
  value: externalValue = null,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(externalValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange?.(option);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-[310px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between gap-2 w-full rounded-md px-3 py-2 bg-[#fcfcfc] border-[0.8px] border-[#e0e0e0] dark:bg-neutral-800 dark:border-neutral-700 text-gray-900 dark:text-gray-100 font-bold text-sm transition-colors focus-within:border-green-500 focus-within:border-2",
        )}
      >
        <span>{selected?.label || placeholder}</span>
        <svg
          className={cn("w-4 h-4 transition-transform", open ? "rotate-180" : "")}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full font-bold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {options.map((option) => {
            const isActive = selected?.id === option.id;
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-colors font-bold",
                  isActive ? "bg-gray-200 dark:bg-neutral-700" : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}