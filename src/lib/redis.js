import Redis from "ioredis";

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    tls: process.env.REDIS_URL.includes("upstash") ? {} : undefined,
  });
  console.log("✅ Connected to Redis");
} else {
  console.warn("⚠️ REDIS_URL not found — skipping Redis connection (likely build time)");
}

export default redisClient;
