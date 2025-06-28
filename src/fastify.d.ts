import { FastifyInstance } from "fastify";
import { FastifyEnvOptions } from "@fastify/env";
import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyPostgresOptions, FastifyPostgres } from "@fastify/postgres";
import { EnvSchema } from "src/config";

declare module "fastify" {
  export interface FastifyInstance {
    config: EnvSchema;
    jwt: FastifyJWTOptions["jwt"];
    pg: FastifyPostgres;
    // authenticate: (
    //   request: FastifyRequest,
    //   reply: FastifyReply
    // ) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      id: string;
      email: string;
    };
  }
}
