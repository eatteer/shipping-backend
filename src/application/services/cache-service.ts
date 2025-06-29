/**
 * Service interface for caching operations.
 * 
 * This service provides a standardized way to interact with cache storage,
 * supporting common operations like get, set, and delete with optional TTL.
 * 
 * @since 1.0.0
 */
export interface CacheService {
  /**
   * Retrieves a value from the cache by its key.
   * 
   * Attempts to fetch a cached value using the provided key. Returns null
   * if the key doesn't exist or if the cached value has expired.
   * 
   * @param key - The unique identifier for the cached value
   * 
   * @example
   * ```typescript
   * const cachedValue = await cacheService.get("user:123");
   * if (cachedValue) {
   *   const user = JSON.parse(cachedValue);
   * }
   * ```
   * 
   * @returns Promise that resolves to the cached string value, or null if not found
   * 
   * @throws {Error} When cache connection fails or other cache-related errors occur
   * 
   * @since 1.0.0
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value in the cache with an optional time-to-live (TTL).
   * 
   * Stores the provided value in the cache using the specified key. If TTL
   * is provided, the value will automatically expire after the specified
   * number of seconds.
   * 
   * @param key - The unique identifier for the cached value
   * @param value - The string value to store in the cache
   * @param ttlSeconds - Optional time-to-live in seconds. If not provided, the value won't expire
   * 
   * @example
   * ```typescript
   * // Store without expiration
   * await cacheService.set("user:123", JSON.stringify(userData));
   * 
   * // Store with 1 hour expiration
   * await cacheService.set("user:123", JSON.stringify(userData), 3600);
   * ```
   * 
   * @returns Promise that resolves when the value is successfully stored
   * 
   * @throws {Error} When cache connection fails or storage operation fails
   * 
   * @since 1.0.0
   */
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache by its key.
   * 
   * Removes the cached value associated with the specified key. If the key
   * doesn't exist, the operation completes successfully without error.
   * 
   * @param key - The unique identifier of the cached value to delete
   * 
   * @example
   * ```typescript
   * // Remove cached user data
   * await cacheService.del("user:123");
   * ```
   * 
   * @returns Promise that resolves when the value is successfully deleted
   * 
   * @throws {Error} When cache connection fails or deletion operation fails
   * 
   * @since 1.0.0
   */
  del(key: string): Promise<void>;
}
