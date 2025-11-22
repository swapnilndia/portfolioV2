'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useUiStore } from '@/store/uiStore'
import './Header.scss'

export const Header = () => {
  const { t } = useTranslation('common')
  const pathname = usePathname()
  const { mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen, chatOpen } = useUiStore()

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/experience', label: t('nav.experience') },
    { path: '/blog', label: t('nav.blog') },
    { path: '/contact', label: t('nav.contact') },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link href="/" className="header__logo" onClick={() => setMobileMenuOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </Link>

        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`header__nav-link ${
                isActive(item.path) ? 'header__nav-link--active' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <LanguageSwitcher />
          <ThemeToggle />
          {!chatOpen && (
            <button
              className="header__menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="header__menu-icon" aria-hidden="true">
                {mobileMenuOpen ? '✕' : '☰'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

