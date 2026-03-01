'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { COUNTRIES, isoToFlag } from '@/data/countries'
import './Contact.scss'

type ContactFormData = {
  name: string
  email: string
  selectedIso: string
  phoneNumber: string
  message: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>

export default function ContactPage() {
  const { t } = useTranslation('contact')
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    selectedIso: 'IN',
    phoneNumber: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.iso === formData.selectedIso) ?? COUNTRIES.find((c) => c.iso === 'IN')!,
    [formData.selectedIso]
  )

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso.toLowerCase().includes(q)
    )
  }, [countrySearch])

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setCountrySearch('')
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setCountrySearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [dropdownOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [dropdownOpen])

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          const iso = (data.country_code as string).toUpperCase()
          const match = COUNTRIES.find((c) => c.iso === iso)
          if (match) {
            setFormData((prev) => ({ ...prev, selectedIso: iso }))
          }
        }
      })
      .catch(() => {
        // silently fall back to IN
      })
  }, [])

  const validateForm = (data: ContactFormData): ContactFormErrors => {
    const errors: ContactFormErrors = {}

    if (!data.name.trim()) {
      errors.name = t('form.validation.required')
    } else if (data.name.trim().length < 2) {
      errors.name = t('form.validation.nameMin')
    }

    if (!data.email.trim()) {
      errors.email = t('form.validation.required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = t('form.validation.emailInvalid')
    }

    if (data.phoneNumber.trim()) {
      if (!/^\d{6,14}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
        errors.phoneNumber = t('form.validation.phoneInvalid')
      }
    }

    if (!data.message.trim()) {
      errors.message = t('form.validation.required')
    } else if (data.message.trim().length < 10) {
      errors.message = t('form.validation.messageMin')
    }

    return errors
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    setSubmitStatus('idle')
    setSubmitErrorMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedData: ContactFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      selectedIso: formData.selectedIso,
      phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
      message: formData.message.trim(),
    }

    const errors = validateForm(trimmedData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSubmitStatus('error')
      setSubmitErrorMessage(t('form.errorInvalid'))
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitErrorMessage('')
    setFormErrors({})

    try {
      const country = COUNTRIES.find((c) => c.iso === trimmedData.selectedIso)
      const phone = trimmedData.phoneNumber
        ? `${country?.dialCode ?? ''}${trimmedData.phoneNumber}`
        : ''

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedData.name,
          email: trimmedData.email,
          phone,
          message: trimmedData.message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('form.error'))
      }

      setSubmitStatus('success')
      setFormData((prev) => ({ ...prev, name: '', email: '', phoneNumber: '', message: '' }))
    } catch (error) {
      setSubmitStatus('error')
      setSubmitErrorMessage(error instanceof Error ? error.message : t('form.error'))
    } finally {
      setIsSubmitting(false)
    }
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
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={formErrors.name ? 'contact-name-error' : undefined}
                  className="contact-page__input"
                />
                {formErrors.name && (
                  <p id="contact-name-error" className="contact-page__field-error">
                    {formErrors.name}
                  </p>
                )}
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
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? 'contact-email-error' : undefined}
                  className="contact-page__input"
                />
                {formErrors.email && (
                  <p id="contact-email-error" className="contact-page__field-error">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="contact-page__field">
                <label htmlFor="phoneNumber" className="contact-page__label">
                  {t('form.phone')}
                  <span className="contact-page__label-optional"> ({t('form.optional')})</span>
                </label>
                <div className="contact-page__phone-row">
                  <div className="contact-page__country-select-wrapper" ref={dropdownRef}>
                    <button
                      type="button"
                      className="contact-page__country-trigger"
                      onClick={() => setDropdownOpen((o) => !o)}
                      disabled={isSubmitting}
                      aria-haspopup="listbox"
                      aria-expanded={dropdownOpen}
                      aria-label="Select country code"
                    >
                      <span className="contact-page__select-flag" aria-hidden="true">
                        {isoToFlag(formData.selectedIso)}
                      </span>
                      <span className="contact-page__dial-code">{selectedCountry.dialCode}</span>
                      <svg className="contact-page__dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="contact-page__country-dropdown" role="listbox" aria-label="Country">
                        <div className="contact-page__country-search-wrap">
                          <input
                            ref={searchRef}
                            type="text"
                            className="contact-page__country-search"
                            placeholder="Search country…"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                          />
                        </div>
                        <ul className="contact-page__country-list">
                          {filteredCountries.length > 0 ? filteredCountries.map((country) => (
                            <li
                              key={country.iso}
                              role="option"
                              aria-selected={country.iso === formData.selectedIso}
                              className={`contact-page__country-option${country.iso === formData.selectedIso ? ' contact-page__country-option--active' : ''}`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, selectedIso: country.iso }))
                                setDropdownOpen(false)
                                setCountrySearch('')
                              }}
                            >
                              <span aria-hidden="true">{isoToFlag(country.iso)}</span>
                              <span className="contact-page__country-name">{country.name}</span>
                              <span className="contact-page__country-dial">{country.dialCode}</span>
                            </li>
                          )) : (
                            <li className="contact-page__country-empty">No results</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder={t('form.phonePlaceholder')}
                    aria-invalid={Boolean(formErrors.phoneNumber)}
                    aria-describedby={formErrors.phoneNumber ? 'contact-phone-error' : undefined}
                    className="contact-page__input"
                  />
                </div>
                {formErrors.phoneNumber && (
                  <p id="contact-phone-error" className="contact-page__field-error">
                    {formErrors.phoneNumber}
                  </p>
                )}
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
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.message)}
                  aria-describedby={formErrors.message ? 'contact-message-error' : undefined}
                  className="contact-page__textarea"
                />
                {formErrors.message && (
                  <p id="contact-message-error" className="contact-page__field-error">
                    {formErrors.message}
                  </p>
                )}
              </div>

              {submitStatus === 'success' && (
                <div className="contact-page__success">
                  {t('form.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="contact-page__error">
                  {submitErrorMessage || t('form.error')}
                </div>
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
                href="https://www.linkedin.com/in/swapnilndia/"
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
                href="https://github.com/swapnilndia"
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
                href="https://leetcode.com/u/Swapnilndia/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page__social-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                {t('social.leetcode')}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}
