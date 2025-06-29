/**
 * Payload structure for JWT tokens.
 * 
 * Contains the essential user information that is encoded in JWT tokens
 * for authentication and authorization purposes.
 * 
 * @since 1.0.0
 */
export interface TokenPayload {
  /** Unique identifier of the user */
  userId: string;
  /** Email address of the user */
  email: string;
}

/**
 * Service interface for JWT token operations.
 * 
 * This service provides a standardized way to generate and verify JWT tokens
 * for user authentication and session management.
 * 
 * @since 1.0.0
 */
export interface TokenService {
  /**
   * Generates a JWT token with the provided user payload.
   * 
   * Creates a signed JWT token containing the user's identification
   * information. The token can be used for subsequent authenticated requests.
   * 
   * @param payload - User information to encode in the token
   * 
   * @example
   * ```typescript
   * const token = await tokenService.generateToken({
   *   userId: "user-123",
   *   email: "user@example.com"
   * });
   * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * ```
   * 
   * @returns Promise that resolves to the generated JWT token string
   * 
   * @throws {Error} When token generation fails due to configuration or signing errors
   * 
   * @since 1.0.0
   */
  generateToken(payload: TokenPayload): Promise<string>;

  /**
   * Verifies and decodes a JWT token.
   * 
   * Validates the provided JWT token signature and extracts the user
   * payload if the token is valid and not expired.
   * 
   * @param token - The JWT token string to verify
   * 
   * @example
   * ```typescript
   * try {
   *   const payload = await tokenService.verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
   *   console.log(payload.userId); // "user-123"
   *   console.log(payload.email);  // "user@example.com"
   * } catch (error) {
   *   // Handle invalid or expired token
   * }
   * ```
   * 
   * @returns Promise that resolves to the decoded token payload
   * 
   * @throws {TokenExpiredError} When the token has expired
   * @throws {InvalidTokenError} When the token is malformed or invalid
   * @throws {Error} When token verification fails due to other errors
   * 
   * @since 1.0.0
   */
  verifyToken(token: string): Promise<TokenPayload>;
}
