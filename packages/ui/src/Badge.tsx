import type { ReactNode } from "react";

export interface BadgeProps {
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "ai";
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-elevated text-text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-error/10 text-error",
  info: "bg-event/10 text-event",
  ai: "bg-ai/10 text-ai",
};

export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
