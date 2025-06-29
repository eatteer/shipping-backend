import { Static, Type } from "@sinclair/typebox";
import {
  SUCCESS_MESSAGE_SCHEMA,
} from "@infrastructure/web/schemas/common-schemas";

/**
 * Authentication-related schemas for user registration and login.
 * These schemas define the structure of request and response data for auth endpoints.
 */

/**
 * Request schemas for authentication operations.
 */

/**
 * Schema for user registration request body.
 * Defines the required fields for creating a new user account.
 * 
 * @example
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * ```
 */
export const REGISTER_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

/**
 * Schema for user authentication request body.
 * Defines the required fields for user login.
 * 
 * @example
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * ```
 */
export const AUTH_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

/**
 * Response schemas for authentication operations.
 */

/**
 * Schema for successful authentication response.
 * Returns a JWT token upon successful login.
 * 
 * @example
 * ```json
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 */
export const AUTH_RESPONSE_SCHEMA = Type.Object({
  token: Type.String(),
});

/**
 * Schema for successful user registration response.
 * Returns a success message when user is created.
 * 
 * @example
 * ```json
 * {
 *   "message": "User registered successfully"
 * }
 * ```
 */
export const REGISTER_RESPONSE_SCHEMA = SUCCESS_MESSAGE_SCHEMA;

/**
 * Custom error schemas for auth-specific errors.
 */

/**
 * Schema for user already exists error.
 * Used when attempting to register a user with an email that already exists.
 * 
 * @example
 * ```json
 * {
 *   "message": "User already exists",
 *   "code": "USER_ALREADY_EXISTS",
 *   "name": "UserAlreadyExists"
 * }
 * ```
 */
export const USER_ALREADY_EXISTS_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "User already exists" }),
  code: Type.String({ example: "USER_ALREADY_EXISTS" }),
  name: Type.String({ example: "UserAlreadyExists" }),
});

/**
 * Type exports for HTTP layer.
 * These types are derived from the schemas and used for TypeScript type checking.
 */

/** Type for user registration request body */
export type RegisterBody = Static<typeof REGISTER_BODY_SCHEMA>;

/** Type for user authentication request body */
export type AuthBody = Static<typeof AUTH_BODY_SCHEMA>;

/** Type for successful authentication response */
export type AuthResponse = Static<typeof AUTH_RESPONSE_SCHEMA>;

/** Type for successful user registration response */
export type RegisterResponse = Static<typeof REGISTER_RESPONSE_SCHEMA>;
