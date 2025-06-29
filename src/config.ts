import { FastifyInstance } from "fastify";
import { FromSchema, type JSONSchema } from "json-schema-to-ts";

export const CONFIG_SCHEMA = {
  type: "object",
  required: [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
  ],
  properties: {
    PORT: { type: "number", default: 3000 },
    DB_HOST: { type: "string" },
    DB_PORT: { type: "number" },
    DB_USER: { type: "string" },
    DB_PASSWORD: { type: "string" },
    DB_NAME: { type: "string" },
    JWT_SECRET: { type: "string" },
    JWT_EXPIRES_IN: { type: "string" },
  },
} as const satisfies JSONSchema;

export type Config = FromSchema<typeof CONFIG_SCHEMA>;

export function getEnv(fastify: FastifyInstance): Config {
  return fastify.getEnvs();
}
