import { createEventEnvelope } from "@ai-ops/event-sdk";
import { EventType } from "@ai-ops/shared-types";
import type { EventEnvelope } from "@ai-ops/shared-types";

const EVENT_TYPES: EventType[] = Object.values(EventType);
const TENANTS = ["tenant-acme", "tenant-globex", "tenant-initech"];
const SOURCES = [
  "api-gateway",
  "ai-agent-service",
  "workflow-service",
  "event-service",
  "tenant-service",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function makePayload(eventType: EventType): Record<string, unknown> {
  switch (eventType) {
    case EventType.AiResponseGenerated:
      return { tokens: Math.floor(Math.random() * 800) + 50, model: "gpt-4o-mini" };
    case EventType.CustomerMessageReceived:
      return { channel: pick(["web", "email", "slack"]), length: Math.floor(Math.random() * 200) };
    case EventType.TicketEscalated:
      return { priority: pick(["p1", "p2", "p3"]) };
    case EventType.PaymentFailed:
      return { amount: Math.floor(Math.random() * 500), currency: "USD" };
    case EventType.WorkflowStarted:
    case EventType.WorkflowCompleted:
    case EventType.WorkflowFailed:
      return { workflowId: `wf-${Math.floor(Math.random() * 1000)}` };
    case EventType.TenantRateLimitExceeded:
      return { limit: "events_per_minute", value: 1200 };
    case EventType.TenantCreated:
      return { plan: pick(["starter", "growth", "enterprise"]) };
    case EventType.UserInvited:
      return { role: pick(["admin", "operator", "analyst"]) };
    default:
      return {};
  }
}

export interface MockGeneratorController {
  start: () => void;
  stop: () => void;
}

export function createMockEventGenerator(
  onEvent: (e: EventEnvelope) => void,
  intervalMs = 1200,
): MockGeneratorController {
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (timer) return;
      timer = setInterval(() => {
        const eventType = pick(EVENT_TYPES);
        const envelope = createEventEnvelope({
          tenantId: pick(TENANTS),
          source: pick(SOURCES),
          eventType,
          correlationId: crypto.randomUUID(),
          payload: makePayload(eventType),
        });
        onEvent(envelope);
      }, intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
