import { FastifyInstance } from "fastify";
import { FastifyEnvOptions } from "@fastify/env";
import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyPostgresOptions, FastifyPostgres } from "@fastify/postgres";
import { Config } from "src/config";
import { UserPayload } from "@infrastructure/web/entities/user-payload";

declare module "fastify" {
  export interface FastifyInstance {
    config: Config;
    jwt: FastifyJWTOptions["jwt"];
    pg: FastifyPostgres;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user: UserPayload;
  }
}
