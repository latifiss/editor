'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState<boolean>(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('Current theme:', theme)
      console.log('Resolved theme:', resolvedTheme)
      console.log('HTML class:', document.documentElement.className)
    }
  }, [theme, resolvedTheme, mounted])

  if (!mounted) {
    return (
      <button className="p-2 rounded-md bg-gray-200 dark:bg-gray-800">
        ●
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {resolvedTheme}
      </span>
      <button 
        onClick={() => {
          const next = resolvedTheme === 'light' ? 'dark' : 'light'
          console.log('Setting theme to (resolved):', next)
          setTheme(next)
        }}
        className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}