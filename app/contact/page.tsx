'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import './Contact.scss'

export default function ContactPage() {
  const { t } = useTranslation('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    // TODO: Implement actual form submission
    // For now, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSubmitStatus('success')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <Section title={t('title')} subtitle={t('subtitle')}>
      <div className="contact-page">
        <div className="contact-page__content">
          <Card className="contact-page__form-card">
            <form onSubmit={handleSubmit} className="contact-page__form">
              <div className="contact-page__field">
                <label htmlFor="name" className="contact-page__label">
                  {t('form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="contact-page__input"
                />
              </div>

              <div className="contact-page__field">
                <label htmlFor="email" className="contact-page__label">
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="contact-page__input"
                />
              </div>

              <div className="contact-page__field">
                <label htmlFor="message" className="contact-page__label">
                  {t('form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="contact-page__textarea"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="contact-page__success">
                  {t('form.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="contact-page__error">{t('form.error')}</div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="contact-page__submit"
              >
                {isSubmitting ? t('form.sending') : t('form.submit')}
              </Button>
            </form>
          </Card>

          <Card className="contact-page__social-card">
            <h3 className="contact-page__social-title">{t('social.title')}</h3>
            <div className="contact-page__social-links">
              <a
                href="https://www.linkedin.com/in/swapnil-katiyar"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page__social-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {t('social.linkedin')}
              </a>
              <a
                href="https://github.com/swapnilkatiyar"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page__social-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {t('social.github')}
              </a>
              <a
                href="mailto:swapnilkatiyar.dev@gmail.com"
                className="contact-page__social-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {t('social.email')}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}

