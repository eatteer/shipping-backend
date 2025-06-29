import { Type } from "@sinclair/typebox";

// Common error response schemas
export const AUTHENTICATION_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Invalid email or password" }),
    code: Type.String({ example: "AUTHENTICATION_FAILED" }),
    name: Type.String({ example: "AuthenticationError" }),
});

export const AUTHORIZATION_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Unauthorized access" }),
    code: Type.String({ example: "AUTHORIZATION_ERROR" }),
    name: Type.String({ example: "AuthorizationError" }),
});

export const VALIDATION_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Invalid input" }),
    code: Type.String({ example: "VALIDATION_ERROR" }),
    name: Type.String({ example: "ValidationError" }),
});

export const NOT_FOUND_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Resource not found" }),
    code: Type.String({ example: "NOT_FOUND" }),
    name: Type.String({ example: "NotFoundError" }),
});

export const CONFLICT_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Resource already exists" }),
    code: Type.String({ example: "CONFLICT" }),
    name: Type.String({ example: "ConflictError" }),
});

export const INTERNAL_SERVER_ERROR_SCHEMA = Type.Object({
    message: Type.String({ example: "Internal server error" }),
});

// Common success response schemas
export const SUCCESS_MESSAGE_SCHEMA = Type.Object({
    message: Type.String({ example: "Operation completed successfully" }),
}); 