import { Type } from "@sinclair/typebox";

export const REGISTER_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});

export const AUTH_BODY_SCHEMA = Type.Object({
  email: Type.String({ format: "email", minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 255 }),
});
