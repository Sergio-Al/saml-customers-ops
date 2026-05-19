/**
 * Wrap an async operation in a tracing span.
 *
 * Phase 1: pass-through stub that just measures duration. Phase 7
 * swaps the body for a real OTel span. The function signature stays.
 */
export async function withSpan<T>(
  spanName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    if (process.env.OBSERVABILITY_DEBUG === "true") {
      const durationMs = performance.now() - start;
      console.log(`[span] ${spanName} ${durationMs.toFixed(2)}ms`, attributes ?? {});
    }
  }
}
