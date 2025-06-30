import { Type } from "@sinclair/typebox";

/**
 * Common error response schemas for consistent error handling across the application.
 * These schemas define the structure of error responses returned by the API.
 */

/**
 * Schema for authentication-related errors.
 * Used when user credentials are invalid or authentication fails.
 * 
 * @example
 * ```json
 * {
 *   "message": "Invalid email or password",
 *   "code": "AUTHENTICATION_FAILED",
 *   "name": "AuthenticationError"
 * }
 * ```
 */
export const AUTHENTICATION_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Invalid email or password" }),
  code: Type.String({ example: "AUTHENTICATION_FAILED" }),
  name: Type.String({ example: "AuthenticationError" }),
});

/**
 * Schema for authorization-related errors.
 * Used when user lacks permission to access a resource.
 * 
 * @example
 * ```json
 * {
 *   "message": "Unauthorized access",
 *   "code": "AUTHORIZATION_ERROR",
 *   "name": "AuthorizationError"
 * }
 * ```
 */
export const AUTHORIZATION_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Unauthorized access" }),
  code: Type.String({ example: "AUTHORIZATION_ERROR" }),
  name: Type.String({ example: "AuthorizationError" }),
});

/**
 * Schema for validation errors.
 * Used when request data fails validation rules.
 * 
 * @example
 * ```json
 * {
 *   "message": "Invalid input",
 *   "code": "VALIDATION_ERROR",
 *   "name": "ValidationError"
 * }
 * ```
 */
export const VALIDATION_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Invalid input" }),
  code: Type.String({ example: "VALIDATION_ERROR" }),
  name: Type.String({ example: "ValidationError" }),
});

/**
 * Schema for resource not found errors.
 * Used when a requested resource doesn't exist.
 * 
 * @example
 * ```json
 * {
 *   "message": "Resource not found",
 *   "code": "NOT_FOUND",
 *   "name": "NotFoundError"
 * }
 * ```
 */
export const NOT_FOUND_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Resource not found" }),
  code: Type.String({ example: "NOT_FOUND" }),
  name: Type.String({ example: "NotFoundError" }),
});

/**
 * Schema for conflict errors.
 * Used when there's a conflict with existing data (e.g., duplicate entries).
 * 
 * @example
 * ```json
 * {
 *   "message": "Resource already exists",
 *   "code": "CONFLICT",
 *   "name": "ConflictError"
 * }
 * ```
 */
export const CONFLICT_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Resource already exists" }),
  code: Type.String({ example: "CONFLICT" }),
  name: Type.String({ example: "ConflictError" }),
});

/**
 * Schema for internal server errors.
 * Used for unexpected server errors that don't fit other categories.
 * 
 * @example
 * ```json
 * {
 *   "message": "Internal server error"
 * }
 * ```
 */
export const INTERNAL_SERVER_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Internal server error" }),
  code: Type.String(),
  name: Type.String(),
});

/**
 * Common success response schemas for consistent success responses.
 */

/**
 * Schema for generic success message responses.
 * Used when an operation completes successfully and only a message is needed.
 * 
 * @example
 * ```json
 * {
 *   "message": "Operation completed successfully"
 * }
 * ```
 */
export const SUCCESS_MESSAGE_SCHEMA = Type.Object({
  message: Type.String({ example: "Operation completed successfully" }),
});

/**
 * Schema for a City entity response.
 * Used to validate and document city data returned by the API.
 *
 * @example
 * ```json
 * {
 *   "id": "city-123",
 *   "name": "Springfield",
 *   "departmentId": "dept-1",
 *   "zoneId": "zone-2",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-02T00:00:00.000Z"
 * }
 * ```
 */
export const CITY_RESPONSE_SCHEMA = Type.Object({
  id: Type.String({ example: "city-123" }),
  name: Type.String({ example: "Springfield" }),
  departmentId: Type.String({ example: "dept-1" }),
  zoneId: Type.String({ example: "zone-2" }),
  createdAt: Type.String({ format: "date-time", example: "2024-01-01T00:00:00.000Z" }),
  updatedAt: Type.String({ format: "date-time", example: "2024-01-02T00:00:00.000Z" }),
});

/**
 * Schema for an array of City entity responses.
 * Used to validate and document lists of cities returned by the API.
 *
 * @example
 * ```json
 * [
 *   {
 *     "id": "city-123",
 *     "name": "Springfield",
 *     "departmentId": "dept-1",
 *     "zoneId": "zone-2",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-02T00:00:00.000Z"
 *   }
 * ]
 * ```
 */
export const CITY_ARRAY_RESPONSE_SCHEMA = Type.Array(CITY_RESPONSE_SCHEMA);
