'use client';

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { TrashIcon } from "@heroicons/react/24/solid";

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DeleteButton({ className, ...props }: DeleteButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex items-center justify-center gap-1 h-9 bg-red-500 border-red-700 border-[0.5px] text-white text-sm transition-colors font-bold px-2 py-1 rounded-lg",
        className
      )}
    >
      <TrashIcon className="w-3 h-3" />
      <span>Delete</span>
    </button>
  );
}
