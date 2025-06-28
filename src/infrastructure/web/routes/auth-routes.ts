import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { AuthController } from "@infrastructure/web/controllers/auth-controller";
import {
  AUTH_BODY_SCHEMA,
  AUTH_RESPONSE_SCHEMA,
  REGISTER_BODY_SCHEMA,
  REGISTER_RESPONSE_SCHEMA,
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
        response: {
          201: REGISTER_RESPONSE_SCHEMA,
          409: Type.Object({
            message: Type.String(),
            error: Type.Optional(Type.String()),
          }),
          500: Type.Object({
            message: Type.String(),
            error: Type.Optional(Type.String()),
          }),
        },
      },
    },
    authController.register.bind(authController)
  );

  fastify.post<{ Body: Static<typeof AUTH_BODY_SCHEMA> }>(
    "/authenticate",
    {
      schema: {
        body: AUTH_BODY_SCHEMA,
        response: {
          200: AUTH_RESPONSE_SCHEMA,
          401: Type.Object({
            message: Type.String(),
            error: Type.Optional(Type.String()),
          }),
          500: Type.Object({
            message: Type.String(),
            error: Type.Optional(Type.String()),
          }),
        },
      },
    },
    authController.authenticate.bind(authController)
  );
}
