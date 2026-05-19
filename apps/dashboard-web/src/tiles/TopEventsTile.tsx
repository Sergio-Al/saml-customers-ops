import { useMemo } from "react";
import { Tile } from "@ai-ops/ui";
import { useEventsStore, selectEventCounts } from "@/stores/events.store";

interface TopEventsTileProps {
  index?: number;
}

export function TopEventsTile({ index = 0 }: TopEventsTileProps) {
  const events = useEventsStore((s) => s.events);

  const top = useMemo(() => {
    const counts = selectEventCounts(events);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [events]);

  const max = top[0]?.[1] ?? 1;

  return (
    <Tile size="md" index={index} title="Top Events" footer={`${events.length} total`}>
      <div className="flex h-full min-h-0 flex-col gap-1 overflow-hidden">
        {top.length === 0 && (
          <div className="text-[12px] font-mono text-text-muted">no events yet</div>
        )}
        {top.map(([type, count]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-[150px] truncate text-[11px] font-mono text-text-secondary">
              {type}
            </div>
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-elevated">
              <div
                className="absolute inset-y-0 left-0 bg-event"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <div className="w-8 text-right text-[11px] font-mono text-text-tertiary">{count}</div>
          </div>
        ))}
      </div>
    </Tile>
  );
}
