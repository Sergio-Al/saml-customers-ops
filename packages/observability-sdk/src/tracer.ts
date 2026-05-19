/**
 * Initializes an OpenTelemetry tracer for a service.
 *
 * Phase 1: stub. Phase 7 will wire this up to `@opentelemetry/sdk-node`
 * with OTLP exporter pointing at Tempo. Keeping the surface stable now
 * means services can import and call it without future refactors.
 */
export interface TracerConfig {
  serviceName: string;
  serviceVersion?: string;
  otlpEndpoint?: string;
  environment?: string;
}

export function initTracer(config: TracerConfig): void {
  // Phase 7: replace with real OTel SDK setup.
  if (process.env.OBSERVABILITY_DEBUG === "true") {
    console.log("[observability] tracer init (stub)", config);
  }
}
