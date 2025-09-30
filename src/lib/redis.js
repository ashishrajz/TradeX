// src/lib/redis.js
import Redis from "ioredis";

let redis;

if (!global.redis) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false }, // needed for Upstash sometimes
  });
  global.redis = redis;
} else {
  redis = global.redis;
}

export default redis;
