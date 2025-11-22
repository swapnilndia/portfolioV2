import type { ReactNode } from 'react'
import { Container } from './Container'
import './Section.scss'

interface SectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  id?: string
}

export const Section = ({
  children,
  title,
  subtitle,
  className = '',
  id,
}: SectionProps) => {
  return (
    <section className={`section ${className}`.trim()} id={id}>
      <Container>
        {(title || subtitle) && (
          <div className="section__header">
            {title && <h2 className="section__title">{title}</h2>}
            {subtitle && <p className="section__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}

