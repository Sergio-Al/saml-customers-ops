import type { EventEnvelope, EventType } from "@ai-ops/shared-types";

/**
 * Publishes events onto the configured event bus.
 * Implementations: RedisStreamsPublisher (local), EventBridgePublisher (cloud).
 */
export interface IEventPublisher {
  publish<TPayload>(envelope: EventEnvelope<TPayload>): Promise<void>;
  publishBatch<TPayload>(envelopes: EventEnvelope<TPayload>[]): Promise<void>;
}

/**
 * Handler invoked for each received event. Return value indicates ack.
 * Throwing routes the event to retry / DLQ depending on policy.
 */
export type EventHandler<TPayload = unknown> = (envelope: EventEnvelope<TPayload>) => Promise<void>;

/**
 * Subscribes to events on the configured bus.
 * Implementations: RedisStreamsConsumer (local), SqsConsumer (cloud).
 */
export interface IEventConsumer {
  subscribe<TPayload>(eventType: EventType, handler: EventHandler<TPayload>): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Retry policy applied to failed event deliveries.
 */
export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 200,
  backoffMultiplier: 2,
  maxDelayMs: 30_000,
};
