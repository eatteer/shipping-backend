import { FastifyRedis } from "@fastify/redis";
import { CacheService } from "@src/application/services/cache-service";

export class RedisCacheService implements CacheService {
  public constructor(private readonly redis: FastifyRedis) {}

  public async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error(`[RedisCacheService] Error getting key ${key}:`, error);
      return null;
    }
  }

  public async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error(`[RedisCacheService] Error setting key ${key}:`, error);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`[RedisCacheService] Error deleting key ${key}:`, error);
    }
  }
}
