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
        summary: "Register a new user",
        description:
          "Creates a new user account with a unique email and password.",
        tags: ["Auth"],
        body: REGISTER_BODY_SCHEMA, // Your existing TypeBox schema for the request body
        // response: {
        //   201: Type.Object({ // Define the successful response (HTTP 201 Created)
        //     message: Type.String({ example: 'User registered successfully.' }),
        //   }),
        //   400: Type.Object({ // Define a common error response for bad requests
        //     message: Type.String({ example: 'Email already exists.' }), // Updated example message for clarity
        //     code: Type.String({ example: 'USER_ALREADY_EXISTS' }),
        //   }),
        //   500: Type.Object({ // Define a generic internal server error response
        //     message: Type.String({ example: 'An unexpected error occurred.' }),
        //   }),
        // },
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
        // response: {
        //   200: Type.Object({ // Define the successful response (HTTP 200 OK)
        //     token: Type.String({
        //       description: 'JWT authentication token',
        //       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYmE3ZDAwMi03YjYzLTQzNDYtYjYxMi0zMjEwMzIyZGE5NjIiLCJ1c2VybmFtZSI6ImV4YW1wbGV1c2VyIiwiaWF0IjoxNjU0OTI3MDAwLCJleHAiOjE2NTQ5MzU2MDB9.someRandomJwtSignature',
        //     }),
        //   }),
        //   401: Type.Object({ // Define a common error response for unauthorized access
        //     message: Type.String({ example: 'Invalid credentials.' }),
        //     code: Type.String({ example: 'INVALID_CREDENTIALS' }),
        //   }),
        //   500: Type.Object({ // Define a generic internal server error response
        //     message: Type.String({ example: 'An unexpected error occurred.' }),
        //   }),
        // },
      },
    },
    authController.authenticate.bind(authController)
  );
}
