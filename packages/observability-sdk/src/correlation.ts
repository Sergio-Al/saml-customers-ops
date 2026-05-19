/**
 * Correlation ID helpers. Used to thread a logical operation across
 * HTTP requests, event bus messages, and AI agent calls.
 */
export const CORRELATION_HEADER = "x-correlation-id";

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Pull a correlation ID off an incoming headers map, generating one
 * if absent. Keeps the convention consistent across services.
 */
export function extractCorrelationId(headers: Record<string, string | undefined>): string {
  return headers[CORRELATION_HEADER] ?? generateCorrelationId();
}
