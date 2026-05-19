import { useEffect, useState } from "react";
import { useEventsStore } from "@/stores/events.store";
import { createMockEventGenerator } from "@/lib/mock-event-generator";
import { createEventStream } from "@/lib/event-stream";

export function useEventStream(): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const addEvent = useEventsStore((s) => s.addEvent);

  useEffect(() => {
    const useMock = import.meta.env.VITE_USE_MOCK_EVENTS === "true";

    if (useMock) {
      const ctrl = createMockEventGenerator((e) => addEvent(e), 1200);
      ctrl.start();
      setConnected(true);
      return () => {
        ctrl.stop();
        setConnected(false);
      };
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const cleanup = createEventStream(
      `${apiUrl}/events/stream`,
      (e) => addEvent(e),
      (c) => setConnected(c),
    );
    return cleanup;
  }, [addEvent]);

  return { connected };
}
