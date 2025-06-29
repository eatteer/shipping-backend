import { AuthenticateUser } from "@application/use-cases/auth/authenticate-user";
import { RegisterUser } from "@application/use-cases/auth/register-user";
import {
  AuthBody,
  RegisterBody,
} from "@infrastructure/web/schemas/auth-schemas";
import { FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticateUser: AuthenticateUser
  ) {}

  public async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    const { email, password } = request.body;

    await this.registerUser.execute({
      email,
      password,
    });

    reply.code(201).send({ message: "User registered successfully" });
  }

  public async authenticate(
    request: FastifyRequest<{ Body: AuthBody }>,
    reply: FastifyReply
  ) {
    const { email, password } = request.body;

    const response = await this.authenticateUser.execute({
      email,
      passwordPlainText: password,
    });

    reply.code(200).send(response);
  }
}
