"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Sticker({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "border-2 border-dashed border-[#e0e0e0] [stroke-dasharray:6_6] border-[0.5px] dark:border-neutral-700 px-2 py-1 rounded-full text-sm mb-2 bg-[#fdfdfd] dark:bg-neutral-800 text-secondary font-bold animate-fade-in",
    secondary:
  "bg-blue-600/5 text-blue-500 font-bold px-2 py-1 rounded-xl",
    ghost:
      "text- text-gray-500 font-bold",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "flex",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
