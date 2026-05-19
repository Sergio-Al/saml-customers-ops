import type { ReactNode } from "react";
import { Tile } from "./Tile.js";

export interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  size?: "xs" | "sm";
  index?: number;
}

const DELTA_CLASSES: Record<NonNullable<StatTileProps["deltaDirection"]>, string> = {
  up: "text-success",
  down: "text-error",
  flat: "text-text-muted",
};

const DELTA_ARROW: Record<NonNullable<StatTileProps["deltaDirection"]>, string> = {
  up: "▲",
  down: "▼",
  flat: "→",
};

export function StatTile({
  label,
  value,
  delta,
  deltaDirection = "flat",
  size = "xs",
  index = 0,
}: StatTileProps) {
  return (
    <Tile size={size} index={index}>
      <div className="flex h-full flex-col justify-center gap-1">
        <div className="text-[12px] font-medium uppercase tracking-wider text-text-tertiary">
          {label}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-display text-[28px] font-semibold leading-none text-text-primary">
            {value}
          </div>
          {delta && (
            <div className={`text-[12px] font-mono ${DELTA_CLASSES[deltaDirection]}`}>
              {DELTA_ARROW[deltaDirection]} {delta}
            </div>
          )}
        </div>
      </div>
    </Tile>
  );
}
