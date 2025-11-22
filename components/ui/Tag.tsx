import type { ReactNode } from 'react'
import { TechIcon } from '@/utils/techIcons'
import './Tag.scss'

interface TagProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md'
  className?: string
  showIcon?: boolean
  techName?: string
}

export const Tag = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = false,
  techName,
}: TagProps) => {
  const classes = `tag tag--${variant} tag--${size} ${className}`.trim()
  const displayTechName = techName || (typeof children === 'string' ? children : '')

  return (
    <span className={classes}>
      {showIcon && displayTechName && (
        <TechIcon name={displayTechName} size={size === 'sm' ? 14 : 16} className="tag__icon" />
      )}
      <span className="tag__text">{children}</span>
    </span>
  )
}

