// src/infrastructure/cache/redis-cache-service.ts

import { FastifyRedis } from "@fastify/redis";
import { CacheService } from "@src/application/services/cache-service";

export class RedisCacheService implements CacheService {
  constructor(private readonly redis: FastifyRedis) {} // Inject the Redis client here

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error(`[RedisCacheService] Error getting key ${key}:`, error);
      // Decide how to handle cache errors. Returning null effectively treats it as a cache miss.
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error(`[RedisCacheService] Error setting key ${key}:`, error);
      // Log the error but don't rethrow, as cache failures shouldn't break core functionality.
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`[RedisCacheService] Error deleting key ${key}:`, error);
    }
  }
}
