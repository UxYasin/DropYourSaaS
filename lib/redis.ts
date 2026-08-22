import { Redis } from '@upstash/redis';

// Reads UPSTASH_REDIS_REST_URL or KV_REST_API_URL from the environment.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redis = (url && token) ? new Redis({ url, token }) : Redis.fromEnv();
