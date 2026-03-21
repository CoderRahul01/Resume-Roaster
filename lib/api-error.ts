/**
 * Safe error helper for API routes.
 *
 * In production: logs the real error server-side, returns a generic message to
 * the client so internal details (model names, API URLs, stack traces) are never
 * exposed in the response body.
 *
 * In development: passes the real message through so you can debug locally.
 */
export function safeErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (process.env.NODE_ENV !== "production") {
    return error instanceof Error ? error.message : String(error);
  }
  return fallback;
}
