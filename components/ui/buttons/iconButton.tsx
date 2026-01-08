'use client'

import { ButtonHTMLAttributes, ElementType } from 'react'
import { cn } from '@/lib/utils'

type ButtonIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ElementType 
  text: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function ButtonIcon({
  icon: Icon,
  text,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonIconProps) {
  const base = "flex items-center gap-2 rounded-full p-2 h-[49px] font-bold transition-colors"
  const variants = {
    primary: "font-bold flex rounded-full bg-[rgba(254,254,252,0.5)] border-[0.5px] border-[#e0e0e0] " +
    "dark:bg-neutral-800/50 dark:border-neutral-700/50",
    secondary: "font-bold bg-blue-200/30 dark:bg-blue-800/50 border-blue-700/50 border",
    outline: "font-bold border border-gray-400 dark:border-gray-600 bg-transparent",
    ghost: "font-bold bg-transparent",
  }

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Icon className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400" />
      {text}
    </button>
  )
}
