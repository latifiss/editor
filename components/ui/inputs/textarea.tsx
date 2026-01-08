'use client';

import { TextareaHTMLAttributes, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder?: string;
  error?: boolean;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    handleInput(); 
    textarea.addEventListener('input', handleInput);

    return () => textarea.removeEventListener('input', handleInput);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center rounded-md px-3 py-2 bg-[#fcfcfc] border-[0.8px] dark:bg-neutral-800 focus-within:border-green-500 focus-within:border-2 transition-colors w-[310px]",
        error
          ? "border-red-500 dark:border-red-500"
          : "border-[#e0e0e0] dark:border-neutral-700"
      )}
    >
      <textarea
        ref={textareaRef}
        className={cn(
          "flex-1 resize-none outline-none text-sm font-semibold text-gray-900 bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
          className
        )}
        {...props}
        style={{ minHeight: '40px' }}
        rows={1}
      />
    </div>
  );
}
