import { redis } from "../lib/redis";

async function main() {
  console.log("Testing Redis connection...");
  try {
    await redis.set("test-key", "Resume Roaster is alive!");
    const val = await redis.get("test-key");
    console.log("Successfully connected and retrieved value:", val);
    
    // Cleanup
    await redis.del("test-key");
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  } finally {
    redis.quit();
  }
}

main();
