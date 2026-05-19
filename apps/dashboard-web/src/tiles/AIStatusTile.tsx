import { Tile, Badge } from "@ai-ops/ui";
import { Bot } from "lucide-react";
import { useEventsStore } from "@/stores/events.store";

interface AIStatusTileProps {
  index?: number;
}

export function AIStatusTile({ index = 0 }: AIStatusTileProps) {
  const lastEvent = useEventsStore((s) => s.events[0]);
  const aiEvent = useEventsStore((s) => s.events.find((e) => e.eventType.startsWith("ai.")));

  return (
    <Tile
      size="sm"
      index={index}
      title="AI Status"
      icon={<Bot size={13} />}
      badge={<Badge tone="ai">agent</Badge>}
    >
      <div className="flex h-full flex-col justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ai" />
          <span className="text-[13px] text-text-secondary">
            {aiEvent ? "Active" : "Agent idle"}
          </span>
        </div>
        <div className="text-[11px] font-mono text-text-muted">
          last: {lastEvent?.eventType ?? "—"}
        </div>
      </div>
    </Tile>
  );
}
