import { FastifyReply, FastifyRequest } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  AUTH_BODY_SCHEMA,
  REGISTER_BODY_SCHEMA,
} from "@infrastructure/web/schemas/auth-schemas";
import { RegisterUser } from "@application/use-cases/auth/register-user";
import { AuthenticateUser } from "@application/use-cases/auth/authenticate-user";

type RegisterBody = Static<typeof REGISTER_BODY_SCHEMA>;
type AuthBody = Static<typeof AUTH_BODY_SCHEMA>;

export class AuthController {
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticateUser: AuthenticateUser
  ) {}

  public async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;

      const response = await this.registerUser.execute({
        email,
        passwordPlainText: password,
      });

      reply.code(201).send(response);
    } catch (error: any) {
      if (error.message === "User with this email already exists.") {
        reply.code(409).send({ message: error.message });
      } else {
        request.log.error(error);

        reply.code(500).send({ message: "Internal server error" });
      }
    }
  }

  public async authenticate(
    request: FastifyRequest<{ Body: AuthBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;

      const response = await this.authenticateUser.execute({
        email,
        passwordPlainText: password,
      });

      reply.code(200).send(response);
    } catch (error: any) {
      if (error.message === "User does not exist or invalid credentials.") {
        reply.code(401).send({ message: error.message });
      } else {
        request.log.error(error);

        reply.code(500).send({ message: "Internal server error" });
      }
    }
  }
}
