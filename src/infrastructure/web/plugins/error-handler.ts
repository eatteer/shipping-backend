import { AuthenticationError } from "@domain/errors/authentication-error";
import { AuthorizationError } from "@domain/errors/authorization-error";
import { InvalidTokenError } from "@domain/errors/invalid-token-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { TokenExpiredError } from "@domain/errors/token-expired-error";
import { UserAlreadyExists } from "@domain/errors/user-already-exists-error";
import { ValidationError } from "@domain/errors/validation-error";
import { FastifyError, FastifyInstance } from "fastify";

export function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    // 401 Unauthorized - Authentication and token errors
    if (
      error instanceof AuthenticationError ||
      error instanceof TokenExpiredError ||
      error instanceof InvalidTokenError
    ) {
      return reply.status(401).send({
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }

    // 400 Bad Request - Validation and business rule errors
    if (
      error instanceof ValidationError ||
      error instanceof SameOriginDestinationCityError
    ) {
      return reply.status(400).send({
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }

    // 409 Conflict - Data conflicts
    if (error instanceof UserAlreadyExists) {
      return reply.status(409).send({
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }

    // 404 Not Found - Resource not found
    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }

    // 403 Forbidden - Authorization errors
    if (error instanceof AuthorizationError) {
      return reply.status(403).send({
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }

    reply.send(error);
  });
}
