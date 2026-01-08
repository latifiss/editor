'use client';

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
};

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="flex items-center rounded-lg px-4 py-2 focus-within:border-green-500 focus-within:border-2 transition-colors bg-[#fcfcfc] border-[0.8px] border-[#e0e0e0] dark:bg-neutral-800 dark:border-neutral-700 w-full">
      <input
        {...props}
        className={cn(
          "flex-1 outline-none text-sm font-semibold text-gray-900 bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
          className
        )}
      />
    </div>
  );
}
