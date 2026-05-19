import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  const classes = [
    "rounded-[10px] border border-border-op bg-panel p-4 text-text-primary",
    className,
  ].join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
