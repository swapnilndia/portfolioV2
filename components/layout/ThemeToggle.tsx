'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import './ThemeToggle.scss'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

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

