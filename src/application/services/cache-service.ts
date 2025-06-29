export interface CacheService {
  /**
   * Retrieves a value from the cache by its key.
   * @param key The cache key.
   * @returns The cached string value, or null if not found.
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value in the cache with an optional time-to-live (TTL).
   * @param key The cache key.
   * @param value The string value to store.
   * @param ttlSeconds The time-to-live for the cache entry in seconds.
   */
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache by its key.
   * @param key The cache key.
   */
  del(key: string): Promise<void>;
}
