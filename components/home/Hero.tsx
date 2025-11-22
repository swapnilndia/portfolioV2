'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import './Hero.scss'

export const Hero = () => {
  const { t } = useTranslation('home')

  return (
    <section className="hero">
      <div className="hero__container">
        <h1 className="hero__title">{t('hero.title')}</h1>
        <p className="hero__subtitle">{t('hero.subtitle')}</p>
        <p className="hero__description">{t('hero.description')}</p>
        <p className="hero__location">📍 {t('hero.location')}</p>
        <div className="hero__actions">
          <Button as="a" href="/projects" variant="primary" size="lg">
            View Projects
          </Button>
          <Button
            as="a"
            href="#"
            variant="secondary"
            size="lg"
            onClick={(e) => {
              e.preventDefault()
              // Placeholder for resume download
              console.log('Download resume')
            }}
          >
            Download Resume
          </Button>
        </div>
      </div>
    </section>
  )
}

