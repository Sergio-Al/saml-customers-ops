import { Tile, Badge } from "@ai-ops/ui";
import { GitMerge } from "lucide-react";

interface Span {
  service: string;
  start: number;
  width: number;
  status: "ok" | "warn" | "error";
}

const MOCK_SPANS: Span[] = [
  { service: "api-gateway", start: 0, width: 100, status: "ok" },
  { service: "auth-service", start: 4, width: 18, status: "ok" },
  { service: "tenant-service", start: 22, width: 12, status: "ok" },
  { service: "ai-agent-service", start: 34, width: 48, status: "ok" },
  { service: "workflow-service", start: 50, width: 26, status: "warn" },
  { service: "event-service", start: 76, width: 18, status: "ok" },
  { service: "analytics-service", start: 82, width: 14, status: "error" },
];

const STATUS_BG: Record<Span["status"], string> = {
  ok: "bg-trace",
  warn: "bg-warning",
  error: "bg-error",
};

interface TraceWaterfallTileProps {
  index?: number;
}

export function TraceWaterfallTile({ index = 0 }: TraceWaterfallTileProps) {
  return (
    <Tile
      size="full"
      index={index}
      title="Distributed Trace"
      icon={<GitMerge size={13} />}
      badge={<Badge tone="neutral">mock</Badge>}
      footer="trace-id: 9a3f2c10b8d54e7a • 7 spans • 248ms"
    >
      <div className="flex h-full flex-col gap-1.5 py-1">
        {MOCK_SPANS.map((span) => (
          <div key={span.service} className="grid grid-cols-[160px_1fr_64px] items-center gap-3">
            <div className="truncate text-[12px] font-mono text-text-secondary">{span.service}</div>
            <div className="relative h-3 rounded-sm bg-elevated">
              <div
                className={`absolute inset-y-0 rounded-sm ${STATUS_BG[span.status]} opacity-80`}
                style={{ left: `${span.start}%`, width: `${span.width}%` }}
              />
            </div>
            <div className="text-right text-[11px] font-mono text-text-tertiary">
              {Math.round(span.width * 2.48)}ms
            </div>
          </div>
        ))}
      </div>
    </Tile>
  );
}
