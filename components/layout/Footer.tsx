import './Footer.scss'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* suppressHydrationWarning: year is computed at render time and may differ between server and client at year rollover */}
          <p className="footer__copyright" suppressHydrationWarning>
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

