'use client';

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
};

export function IconInput({ icon: Icon, className, ...props }: TextInputProps) {
  return (
    <div className="flex items-center gap-2 h-10 rounded-md px-3 py-2 focus-within:border-green-500 focus-within:border-2 transition-colors bg-[#fcfcfc] border-[0.8px] border-[#e0e0e0] dark:bg-neutral-800 dark:border-neutral-700 w-full">
      {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-300" />}
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
