import './Footer.scss'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

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

