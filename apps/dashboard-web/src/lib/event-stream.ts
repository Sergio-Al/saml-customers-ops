import { DEFAULT_RETRY_POLICY } from "@ai-ops/event-sdk";
import type { EventEnvelope } from "@ai-ops/shared-types";

/**
 * Subscribe to a Server-Sent Events stream and forward decoded envelopes.
 * Reconnects with exponential backoff per DEFAULT_RETRY_POLICY.
 * Returns a cleanup function.
 */
export function createEventStream(
  url: string,
  onEvent: (e: EventEnvelope) => void,
  onConnectionChange?: (connected: boolean) => void,
): () => void {
  let source: EventSource | null = null;
  let attempt = 0;
  let stopped = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (stopped) return;
    source = new EventSource(url);
    source.onopen = () => {
      attempt = 0;
      onConnectionChange?.(true);
    };
    source.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data) as EventEnvelope;
        onEvent(parsed);
      } catch {
        // ignore malformed
      }
    };
    source.onerror = () => {
      onConnectionChange?.(false);
      source?.close();
      source = null;
      if (stopped) return;
      attempt += 1;
      const delay = Math.min(
        DEFAULT_RETRY_POLICY.initialDelayMs *
          Math.pow(DEFAULT_RETRY_POLICY.backoffMultiplier, attempt - 1),
        DEFAULT_RETRY_POLICY.maxDelayMs,
      );
      reconnectTimer = setTimeout(connect, delay);
    };
  };

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    source?.close();
    onConnectionChange?.(false);
  };
}
