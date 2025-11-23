'use client'

import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import './Hero.scss'

export const Hero = () => {
  const { t } = useTranslation('home')

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__text">
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
                href="/Swapnil_Resume.pdf"
                variant="secondary"
                size="lg"
                download="Swapnil_Katiyar_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Resume
              </Button>
            </div>
          </div>
          <div className="hero__image-wrapper">
            <div className="hero__image-container">
              <Image
                src="/swapnil_hero.png"
                alt="Swapnil Katiyar"
                width={500}
                height={600}
                priority
                className="hero__image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

