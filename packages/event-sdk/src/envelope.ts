import type { EventEnvelope, EventType } from "@ai-ops/shared-types";

/**
 * Build a fully-populated EventEnvelope with sensible defaults.
 * Caller must provide tenantId, source, eventType, payload, and correlationId.
 */
export function createEventEnvelope<TPayload>(input: {
  tenantId: string;
  source: string;
  eventType: EventType;
  payload: TPayload;
  correlationId: string;
  causationId?: string;
  schemaVersion?: number;
  eventId?: string;
  timestamp?: string;
}): EventEnvelope<TPayload> {
  return {
    eventId: input.eventId ?? crypto.randomUUID(),
    tenantId: input.tenantId,
    eventType: input.eventType,
    correlationId: input.correlationId,
    causationId: input.causationId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    source: input.source,
    schemaVersion: input.schemaVersion ?? 1,
    payload: input.payload,
  };
}
