'use client'

import { useState, useEffect } from 'react'
import './Footer.scss'

export const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number>(2025)

  useEffect(() => {
    // Set year on client side only to avoid hydration mismatch
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <p className="footer__copyright">
            © {currentYear} Swapnil Katiyar. All rights reserved.
          </p>
          <p className="footer__built-with">
            Built with React, TypeScript, and SCSS
          </p>
        </div>
      </div>
    </footer>
  )
}

