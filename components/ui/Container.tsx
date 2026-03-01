import type { ReactNode } from "react";
import "./Container.scss";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = ({ children, className = "", maxWidth = "xl" }: ContainerProps) => {
  const classes = `container container--${maxWidth} ${className}`.trim();

  return <div className={classes}>{children}</div>;
};
