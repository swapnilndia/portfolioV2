import type { HTMLAttributes, ReactNode } from "react";
import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

/**
 * HTMLAttributes<HTMLElement> is used instead of ButtonHTMLAttributes<HTMLButtonElement>
 * because event handlers in ButtonHTMLAttributes are typed for HTMLButtonElement,
 * which is incompatible with HTMLAnchorElement when rendering as <a>.
 * HTMLAttributes<HTMLElement> provides the common base whose event handlers
 * (typed for HTMLElement) are compatible with both button and anchor elements.
 */
interface ButtonProps extends HTMLAttributes<HTMLElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  as?: "button" | "a";
  // Anchor-specific
  href?: string;
  target?: string;
  rel?: string;
  download?: string;
  // Button-specific
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  form?: string;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  as = "button",
  href,
  target,
  rel,
  download,
  type,
  disabled,
  form,
  ...props
}: ButtonProps) => {
  const baseClasses = `btn btn--${variant} btn--${size}`;
  const classes = className ? `${baseClasses} ${className}` : baseClasses;

  if (as === "a" && href) {
    return (
      <a href={href} className={classes} target={target} rel={rel} download={download} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} form={form} {...props}>
      {children}
    </button>
  );
};
