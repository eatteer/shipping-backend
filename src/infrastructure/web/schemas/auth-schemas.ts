import { Static, Type } from "@sinclair/typebox";
import {
  SUCCESS_MESSAGE_SCHEMA,
} from "@infrastructure/web/schemas/common-schemas";

// Request schemas
export const REGISTER_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

export const AUTH_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

// Response schemas
export const AUTH_RESPONSE_SCHEMA = Type.Object({
  token: Type.String(),
});

export const REGISTER_RESPONSE_SCHEMA = SUCCESS_MESSAGE_SCHEMA;

// Custom error schemas for auth-specific errors
export const USER_ALREADY_EXISTS_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "User already exists" }),
  code: Type.String({ example: "USER_ALREADY_EXISTS" }),
  name: Type.String({ example: "UserAlreadyExists" }),
});

// Type exports for HTTP layer
export type RegisterBody = Static<typeof REGISTER_BODY_SCHEMA>;
export type AuthBody = Static<typeof AUTH_BODY_SCHEMA>;
export type AuthResponse = Static<typeof AUTH_RESPONSE_SCHEMA>;
export type RegisterResponse = Static<typeof REGISTER_RESPONSE_SCHEMA>;
