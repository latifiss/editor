"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "rounded-xl bg-green-600 border-green-700 text-white border",
    secondary:
    "flex rounded-full bg-[#fefefc] border-[0.5px] border-[#e0e0e0] " +
    "dark:bg-neutral-800/50 dark:border-neutral-700/50",

      outline:
        "rounded-xl bg-[#23c55e] border-[#1e9a4b] text-white border-[1.5px]",
      ghost:
        "flex rounded-xl bg-[#fefefc] border-[1.5px] border-[#e0e0e0] " +
    "dark:bg-neutral-800/50 dark:border-neutral-700/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "font-bold text-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:pointer-events-none",
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
