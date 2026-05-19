/**
 * Canonical event envelope used across all services and the event bus.
 *
 * Every event flowing through the platform (Redis Streams locally,
 * EventBridge in cloud) is wrapped in this envelope. Services should
 * never publish raw payloads — always wrap with `EventEnvelope`.
 */
export interface EventEnvelope<TPayload = unknown> {
  /** UUID v4. Unique per event instance. */
  eventId: string;
  /** Tenant scope. All events MUST be tenant-scoped for isolation. */
  tenantId: string;
  /** Dotted event type, e.g. `ai.response.generated`. */
  eventType: EventType;
  /** Correlation ID for tracing a logical operation across services. */
  correlationId: string;
  /** Causation ID — eventId of the event that triggered this one. */
  causationId?: string;
  /** ISO-8601 timestamp at publish time. */
  timestamp: string;
  /** Source service name. */
  source: string;
  /** Schema version for the payload shape (forward-compat). */
  schemaVersion: number;
  /** Domain payload. Shape depends on `eventType`. */
  payload: TPayload;
}

/**
 * Canonical event type names.
 * Use this enum-like const everywhere instead of magic strings.
 */
export const EventType = {
  CustomerMessageReceived: "customer.message.received",
  AiResponseGenerated: "ai.response.generated",
  TicketEscalated: "ticket.escalated",
  PaymentFailed: "payment.failed",
  WorkflowStarted: "workflow.started",
  WorkflowCompleted: "workflow.completed",
  WorkflowFailed: "workflow.failed",
  TenantRateLimitExceeded: "tenant.rate_limit_exceeded",
  TenantCreated: "tenant.created",
  UserInvited: "user.invited",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
