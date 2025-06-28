import { FastifyInstance } from "fastify";
import { FastifyEnvOptions } from "@fastify/env";
import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyPostgresOptions, FastifyPostgres } from "@fastify/postgres";

declare module "fastify" {
  interface FastifyInstance {
    // config: {
    //   PORT: number;
    //   DB_HOST: string;
    //   DB_PORT: number;
    //   DB_USER: string;
    //   DB_PASSWORD: string;
    //   DB_NAME: string;
    //   JWT_SECRET: string;
    //   JWT_EXPIRES_IN: string;
    // };

    jwt: FastifyJWTOptions["jwt"];
    pg: FastifyPostgres;

    // authenticate: (
    //   request: FastifyRequest,
    //   reply: FastifyReply
    // ) => Promise<void>;
  }
}
