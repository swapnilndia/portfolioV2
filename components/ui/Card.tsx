import type { ReactNode } from "react";
import "./Card.scss";

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  as?: "div" | "article";
}

export const Card = ({
  children,
  className = "",
  header,
  footer,
  onClick,
  as: Component = "div",
}: CardProps) => {
  const classes = `card ${onClick ? "card--clickable" : ""} ${className}`.trim();

  return (
    <Component className={classes} onClick={onClick}>
      {header && <div className="card__header">{header}</div>}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </Component>
  );
};
