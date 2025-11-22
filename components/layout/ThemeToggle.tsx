'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import './ThemeToggle.scss'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className="theme-toggle"
        aria-label="Switch theme"
        title="Switch theme"
        disabled
      >
        <span className="theme-toggle__icon" aria-hidden="true">
          🌙
        </span>
        <span className="visually-hidden">Switch theme</span>
      </button>
    )
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="visually-hidden">
        Switch to {theme === 'light' ? 'dark' : 'light'} theme
      </span>
    </button>
  )
}

