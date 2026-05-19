import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type TileSize = "xs" | "sm" | "md" | "lg" | "xl" | "wide" | "full";

export interface TileProps {
  size?: TileSize;
  title?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  pulse?: boolean;
  index?: number;
  className?: string;
  children?: ReactNode;
}

const SIZE_CLASSES: Record<TileSize, string> = {
  xs: "col-span-3 row-span-1",
  sm: "col-span-3 row-span-2",
  md: "col-span-4 row-span-2",
  lg: "col-span-6 row-span-2",
  xl: "col-span-6 row-span-3",
  wide: "col-span-8 row-span-2",
  full: "col-span-12 row-span-3",
};

export function Tile({
  size = "sm",
  title,
  icon,
  badge,
  footer,
  pulse = false,
  index = 0,
  className = "",
  children,
}: TileProps) {
  const baseClasses = [
    "bg-panel border border-border-op rounded-[10px] p-4 flex flex-col gap-2 overflow-hidden",
    SIZE_CLASSES[size],
    className,
  ].join(" ");

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 8 }}
      animate={
        pulse ? { opacity: 1, y: 0, borderColor: ["#4DA3FF", "#242933"] } : { opacity: 1, y: 0 }
      }
      transition={{
        opacity: { duration: 0.25, delay: index * 0.04 },
        y: { duration: 0.25, delay: index * 0.04 },
        borderColor: { duration: 0.4, repeat: pulse ? Infinity : 0, repeatType: "reverse" },
      }}
    >
      {(title || badge || icon) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium text-text-tertiary">
            {icon}
            {title}
          </div>
          {badge}
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
      {footer && <div className="text-[12px] font-mono text-text-muted">{footer}</div>}
    </motion.div>
  );
}
