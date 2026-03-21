/**
 * Shared parsing utilities for Claude AI responses.
 */

/** Strip markdown code fences (```json ... ```) that Claude sometimes wraps responses in. */
export function stripCodeFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (match ? match[1] : raw).trim();
}

/** Parse JSON safely, returning the parsed value or throwing with a descriptive error. */
export function safeJsonParse<T>(raw: string, label: string): T {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    console.error(`${label}: Claude returned invalid JSON:`, cleaned);
    throw new Error(`${label} returned an invalid response. Please try again.`);
  }
}
