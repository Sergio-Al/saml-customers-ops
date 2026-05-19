import { create } from "zustand";
import type { EventEnvelope, EventType } from "@ai-ops/shared-types";

const MAX_EVENTS = 200;

interface EventsState {
  events: EventEnvelope[];
  filterTypes: EventType[];
  correlationFilter: string;
  addEvent: (event: EventEnvelope) => void;
  clearEvents: () => void;
  setFilterTypes: (types: EventType[]) => void;
  setCorrelationFilter: (value: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  filterTypes: [],
  correlationFilter: "",
  addEvent: (event) =>
    set((state) => {
      const next = [event, ...state.events];
      if (next.length > MAX_EVENTS) next.length = MAX_EVENTS;
      return { events: next };
    }),
  clearEvents: () => set({ events: [] }),
  setFilterTypes: (types) => set({ filterTypes: types }),
  setCorrelationFilter: (value) => set({ correlationFilter: value }),
}));

export function selectEventCounts(events: EventEnvelope[]): Map<EventType, number> {
  const counts = new Map<EventType, number>();
  for (const e of events) {
    counts.set(e.eventType, (counts.get(e.eventType) ?? 0) + 1);
  }
  return counts;
}
