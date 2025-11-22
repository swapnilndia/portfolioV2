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
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page__social-link"
              >
                {t('social.linkedin')}
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page__social-link"
              >
                {t('social.github')}
              </a>
              <a
                href="mailto:contact@example.com"
                className="contact-page__social-link"
              >
                {t('social.email')}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}

