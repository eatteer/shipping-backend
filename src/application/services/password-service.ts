/**
 * Service interface for password operations.
 * 
 * This service provides a standardized way to handle password hashing and
 * verification for secure user authentication.
 * 
 * @since 1.0.0
 */
export interface PasswordService {
  /**
   * Hashes a plain text password for secure storage.
   * 
   * Converts a plain text password into a secure hash that can be safely
   * stored in the database. The hash is one-way and cannot be reversed.
   * 
   * @param password - The plain text password to hash
   * 
   * @example
   * ```typescript
   * const hashedPassword = await passwordService.hashPassword("mySecurePassword123");
   * // Returns: "$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8."
   * ```
   * 
   * @returns Promise that resolves to the hashed password string
   * 
   * @throws {Error} When hashing operation fails due to configuration or processing errors
   * 
   * @since 1.0.0
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compares a plain text password with a stored hash.
   * 
   * Verifies if a plain text password matches a previously hashed password
   * by comparing them securely without revealing the original password.
   * 
   * @param password - The plain text password to verify
   * @param hash - The stored hash to compare against
   * 
   * @example
   * ```typescript
   * const isValid = await passwordService.comparePassword(
   *   "mySecurePassword123",
   *   "$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8."
   * );
   * // Returns: true if passwords match, false otherwise
   * ```
   * 
   * @returns Promise that resolves to true if passwords match, false otherwise
   * 
   * @throws {Error} When comparison operation fails due to configuration or processing errors
   * 
   * @since 1.0.0
   */
  comparePassword(password: string, hash: string): Promise<boolean>;
}
