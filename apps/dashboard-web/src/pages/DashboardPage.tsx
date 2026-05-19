import { useMemo } from "react";
import { StatTile } from "@ai-ops/ui";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { useEventsStore } from "@/stores/events.store";
import { EventTimelineTile } from "@/tiles/EventTimelineTile";
import { AIStatusTile } from "@/tiles/AIStatusTile";
import { WorkflowGraphTile } from "@/tiles/WorkflowGraphTile";
import { TopEventsTile } from "@/tiles/TopEventsTile";
import { TraceWaterfallTile } from "@/tiles/TraceWaterfallTile";

export function DashboardPage() {
  const events = useEventsStore((s) => s.events);

  const stats = useMemo(() => {
    const now = Date.now();
    const lastMin = events.filter((e) => now - new Date(e.timestamp).getTime() < 60_000);
    const aiCount = events.filter((e) => e.eventType.startsWith("ai.")).length;
    const failed = events.filter(
      (e) => e.eventType.includes("failed") || e.eventType.includes("escalated"),
    ).length;
    const errorRate = events.length ? (failed / events.length) * 100 : 0;
    const tenants = new Set(events.map((e) => e.tenantId));
    return {
      tenants: tenants.size,
      perMin: lastMin.length,
      aiCount,
      errorRate,
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[24px] font-semibold tracking-tight text-text-primary">
          Operational Overview
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Realtime event stream, AI activity, and distributed system health.
        </p>
      </div>

      <BentoGrid>
        <StatTile
          index={0}
          label="Active Tenants"
          value={stats.tenants}
          delta="live"
          deltaDirection="flat"
        />
        <StatTile
          index={1}
          label="Events / min"
          value={stats.perMin}
          delta={`${stats.perMin}/min`}
          deltaDirection={stats.perMin > 0 ? "up" : "flat"}
        />
        <StatTile
          index={2}
          label="AI Requests"
          value={stats.aiCount}
          delta="agent"
          deltaDirection="up"
        />
        <StatTile
          index={3}
          label="Error Rate"
          value={`${stats.errorRate.toFixed(1)}%`}
          delta={`${stats.errorRate.toFixed(1)}%`}
          deltaDirection={stats.errorRate > 5 ? "down" : "flat"}
        />

        <EventTimelineTile index={4} />
        <AIStatusTile index={5} />

        <WorkflowGraphTile index={6} />
        <TopEventsTile index={7} />

        <TraceWaterfallTile index={8} />
      </BentoGrid>
    </div>
  );
}
