import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonEn from './locales/en/common.json'
import homeEn from './locales/en/home.json'
import projectsEn from './locales/en/projects.json'
import aboutEn from './locales/en/about.json'
import experienceEn from './locales/en/experience.json'
import blogEn from './locales/en/blog.json'
import contactEn from './locales/en/contact.json'

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

export default i18n



