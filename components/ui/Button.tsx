import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.scss'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  as = 'button',
  href,
  ...props
}: ButtonProps) => {
  const baseClasses = `btn btn--${variant} btn--${size}`
  const classes = className ? `${baseClasses} ${className}` : baseClasses

  if (as === 'a' && href) {
    const { target, rel, ...anchorProps } = props as any
    return (
      <a
        href={href}
        className={classes}
        target={target}
        rel={rel}
        {...anchorProps}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

