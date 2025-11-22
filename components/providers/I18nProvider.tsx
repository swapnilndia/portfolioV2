'use client'

import { useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonEn from '@/i18n/locales/en/common.json'
import homeEn from '@/i18n/locales/en/home.json'
import projectsEn from '@/i18n/locales/en/projects.json'
import aboutEn from '@/i18n/locales/en/about.json'
import experienceEn from '@/i18n/locales/en/experience.json'
import blogEn from '@/i18n/locales/en/blog.json'
import contactEn from '@/i18n/locales/en/contact.json'

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: commonEn,
          home: homeEn,
          projects: projectsEn,
          about: aboutEn,
          experience: experienceEn,
          blog: blogEn,
          contact: contactEn,
        },
      },
      lng: 'en',
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'home', 'projects', 'about', 'experience', 'blog', 'contact'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

