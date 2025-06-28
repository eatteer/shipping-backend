import { Type } from "@sinclair/typebox";

export const REGISTER_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

export const REGISTER_RESPONSE_SCHEMA = Type.Object({
  email: Type.String({ format: "email" }),
  createdAt: Type.String({ format: "date-time" }),
});

export const AUTH_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

export const AUTH_RESPONSE_SCHEMA = Type.Object({
  token: Type.String(),
});
