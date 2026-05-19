import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  const classes = ["rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className].join(
    " ",
  );

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
