import { config } from "dotenv";
config({ path: ".env.local" }); // Load the local env file explicitly
import { redis } from "../lib/redis";

async function main() {
  console.log("Testing Redis connection to:", process.env.REDIS_URL?.replace(/:([^:@]+)@/, ':***@'));
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
