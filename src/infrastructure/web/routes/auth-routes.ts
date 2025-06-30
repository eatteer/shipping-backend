import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { AuthController } from "@infrastructure/web/controllers/auth-controller";
import {
  AUTH_BODY_SCHEMA,
  AUTH_RESPONSE_SCHEMA,
  REGISTER_BODY_SCHEMA,
  REGISTER_RESPONSE_SCHEMA,
  USER_ALREADY_EXISTS_ERROR_SCHEMA,
} from "@infrastructure/web/schemas/auth-schemas";
import {
  AUTHENTICATION_ERROR_SCHEMA,
  INTERNAL_SERVER_ERROR_SCHEMA,
} from "@infrastructure/web/schemas/common-schemas";

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
        summary: "Register a new user",
        description:
          "Creates a new user account with a unique email and password.",
        tags: ["Auth"],
        body: REGISTER_BODY_SCHEMA,
        response: {
          201: REGISTER_RESPONSE_SCHEMA,
          409: USER_ALREADY_EXISTS_ERROR_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
      },
    },
    authController.register.bind(authController)
  );

  fastify.post<{ Body: Static<typeof AUTH_BODY_SCHEMA> }>(
    "/authenticate",
    {
      schema: {
        summary: "Authenticate user and get JWT token",
        description:
          "Authenticates a user with an email and password, returning a JSON Web Token (JWT) upon successful login.",
        tags: ["Auth"],
        body: AUTH_BODY_SCHEMA,
        response: {
          200: AUTH_RESPONSE_SCHEMA,
          401: AUTHENTICATION_ERROR_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
      },
    },
    authController.authenticate.bind(authController)
  );
}
