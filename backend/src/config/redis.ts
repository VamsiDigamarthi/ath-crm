import { Redis, RedisOptions } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const bullMqConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

export const redisConnectionOptions: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
};

let redisClient: Redis | null = null;
let isRedisConnected = false;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConnectionOptions);

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log(`[REDIS] Successfully connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redisClient.on("error", (err) => {
      isRedisConnected = false;
      console.error(`[REDIS ERROR] Connection failed:`, err.message);
    });

    redisClient.on("close", () => {
      isRedisConnected = false;
      console.warn(`[REDIS] Connection closed`);
    });
  }

  return redisClient;
}

export function isRedisAvailable(): boolean {
  return isRedisConnected;
}
