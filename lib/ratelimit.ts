import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {
      // Suppress unhandled error events — errors handled per-call
    });
  }
  return redis;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix ms
}

/**
 * Fixed-window rate limiter backed by Railway Redis.
 * Falls through (allows request) if Redis is unavailable or not configured.
 */
export async function checkRateLimit(
  ip: string,
  route: string,
  limit: number,
  windowSecs: number
): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) {
    // No Redis configured — allow all (development)
    return { success: true, limit, remaining: limit, reset: Date.now() + windowSecs * 1000 };
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const window = Math.floor(now / windowSecs);
    const key = `rl:${route}:${ip}:${window}`;
    const reset = (window + 1) * windowSecs * 1000;

    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSecs * 2);
    }

    const remaining = Math.max(0, limit - count);
    return { success: count <= limit, limit, remaining, reset };
  } catch {
    // Redis error — fail open so a Redis blip doesn't take down the app
    return { success: true, limit, remaining: limit, reset: Date.now() + windowSecs * 1000 };
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    ...(result.success ? {} : { "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)) }),
  };
}
