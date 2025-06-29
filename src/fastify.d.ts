import { FastifyInstance } from "fastify";
import { FastifyEnvOptions } from "@fastify/env";
import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyPostgresOptions, FastifyPostgres } from "@fastify/postgres";
import { Config } from "src/config";
import { UserPayload } from "@infrastructure/web/entities/user-payload";

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
    jwt: FastifyJWTOptions["jwt"];
    pg: FastifyPostgres;
    authenticate: (
      request: FastifyRequest<unknown>,
      reply: FastifyReply<unknown>
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}
