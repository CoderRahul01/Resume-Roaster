import { Redis } from 'ioredis';

const globalForRedis = global as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || '', {
    connectTimeout: 10000,
    retryStrategy: (times) => {
      // Reconnect after 50ms, up to a max wait of 2000ms
      return Math.min(times * 50, 2000);
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
