'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nStore } from '@/store/i18nStore'
import './LanguageSwitcher.scss'

type Language = 'en' | 'hi'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useI18nStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    // { code: 'hi', label: 'HI' }, // Hidden for now
  ]

  // Avoid hydration mismatch by not rendering active state until mounted
  if (!mounted) {
    return (
      <div className="language-switcher">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className="language-switcher__button"
            aria-label={`Switch to ${lang.label}`}
            disabled
          >
            {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`language-switcher__button ${
            language === lang.code ? 'language-switcher__button--active' : ''
          }`}
          onClick={() => handleLanguageChange(lang.code)}
          aria-label={`Switch to ${lang.label}`}
          aria-pressed={language === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

