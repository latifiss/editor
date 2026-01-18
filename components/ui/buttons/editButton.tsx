'use client';

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function EditButton({ className, ...props }: EditButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex items-center justify-center gap-1 h-9 bg-[#fdfdfd] border-[#e0e0e0] border-[0.5px] text-[#000000] text-sm transition-colors font-bold px-2 py-1 rounded-lg",
        className
      )}
    >
      <span>Edit this article</span>
    </button>
  );
}
