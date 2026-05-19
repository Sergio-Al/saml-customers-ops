import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { Tile, Badge } from "@ai-ops/ui";
import { Activity } from "lucide-react";
import type { BadgeProps } from "@ai-ops/ui";
import { EventType } from "@ai-ops/shared-types";
import type { EventType as EventTypeT } from "@ai-ops/shared-types";
import { useEventsStore } from "@/stores/events.store";

function badgeTone(type: EventTypeT): NonNullable<BadgeProps["tone"]> {
  if (type.startsWith("ai.")) return "ai";
  if (type.startsWith("customer.")) return "info";
  if (type === EventType.WorkflowCompleted) return "success";
  if (type === EventType.WorkflowFailed) return "danger";
  if (type === EventType.WorkflowStarted) return "warning";
  if (type === EventType.TicketEscalated) return "danger";
  if (type === EventType.PaymentFailed) return "danger";
  if (type.startsWith("tenant.")) return "warning";
  return "neutral";
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

const ALL_TYPES = Object.values(EventType);

interface EventTimelineTileProps {
  index?: number;
}

export function EventTimelineTile({ index = 0 }: EventTimelineTileProps) {
  const events = useEventsStore((s) => s.events);
  const filterTypes = useEventsStore((s) => s.filterTypes);
  const setFilterTypes = useEventsStore((s) => s.setFilterTypes);
  const correlationFilter = useEventsStore((s) => s.correlationFilter);
  const setCorrelationFilter = useEventsStore((s) => s.setCorrelationFilter);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterTypes.length && !filterTypes.includes(e.eventType)) return false;
      if (correlationFilter && !e.correlationId.startsWith(correlationFilter)) return false;
      return true;
    });
  }, [events, filterTypes, correlationFilter]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (expanded.has(filtered[i]!.eventId) ? 220 : 40),
    overscan: 8,
  });

  const toggleType = (type: EventTypeT) => {
    if (filterTypes.includes(type)) {
      setFilterTypes(filterTypes.filter((t) => t !== type));
    } else {
      setFilterTypes([...filterTypes, type]);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
    rowVirtualizer.measure();
  };

  return (
    <Tile
      size="wide"
      index={index}
      title="Event Timeline"
      icon={<Activity size={13} />}
      badge={<Badge tone="info">{filtered.length} live</Badge>}
    >
      <div className="flex h-full min-h-[260px] flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = filterTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  active
                    ? "border-event bg-event/10 text-event"
                    : "border-border-op text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {t}
              </button>
            );
          })}
          <input
            type="text"
            placeholder="correlation prefix…"
            value={correlationFilter}
            onChange={(e) => setCorrelationFilter(e.target.value)}
            className="ml-auto w-44 rounded-md border border-border-op bg-canvas px-2 py-1 text-[11px] font-mono text-text-secondary placeholder:text-text-muted focus:border-event focus:outline-none"
          />
        </div>

        <div
          ref={parentRef}
          className="relative flex-1 overflow-y-auto rounded-md border border-border-op bg-canvas"
        >
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            <AnimatePresence initial={false}>
              {rowVirtualizer.getVirtualItems().map((vRow) => {
                const event = filtered[vRow.index]!;
                const isExpanded = expanded.has(event.eventId);
                return (
                  <div
                    key={event.eventId}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vRow.start}px)`,
                      height: vRow.size,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -8, borderLeftColor: "#4DA3FF" }}
                      animate={{ opacity: 1, x: 0, borderLeftColor: "#242933" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-full overflow-hidden border-b border-l-2 border-border-op px-3 py-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(event.eventId)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <Badge tone={badgeTone(event.eventType)}>{event.eventType}</Badge>
                        <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
                          {event.correlationId.slice(0, 8)}
                        </span>
                        <span className="truncate text-[11px] text-text-secondary">
                          {event.source}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-[11px] text-text-muted">
                          {relativeTime(event.timestamp)}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="mt-2 max-h-[170px] overflow-auto rounded-sm bg-panel p-2 text-[11px]">
                          <JsonView data={event} style={defaultStyles} />
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] font-mono text-text-muted">
              waiting for events…
            </div>
          )}
        </div>
      </div>
    </Tile>
  );
}
