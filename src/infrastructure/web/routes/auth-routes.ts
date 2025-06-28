import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { AuthController } from "@infrastructure/web/controllers/auth-controller";
import {
  AUTH_BODY_SCHEMA,
  REGISTER_BODY_SCHEMA,
} from "@infrastructure/web/schemas/auth-schemas";

interface AuthRoutesDependencies {
  authController: AuthController;
}

export async function authRoutes(
  fastify: FastifyInstance,
  { authController }: AuthRoutesDependencies
) {
  fastify.post<{ Body: Static<typeof REGISTER_BODY_SCHEMA> }>(
    "/register",
    {
      schema: {
        body: REGISTER_BODY_SCHEMA,
      },
    },
    authController.register.bind(authController)
  );

  fastify.post<{ Body: Static<typeof AUTH_BODY_SCHEMA> }>(
    "/authenticate",
    {
      schema: {
        body: AUTH_BODY_SCHEMA,
      },
    },
    authController.authenticate.bind(authController)
  );
}
