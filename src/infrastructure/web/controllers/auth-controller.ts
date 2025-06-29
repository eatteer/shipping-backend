import { AuthenticateUser } from "@application/use-cases/auth/authenticate-user";
import { RegisterUser } from "@application/use-cases/auth/register-user";
import {
  AuthBody,
  RegisterBody,
} from "@infrastructure/web/schemas/auth-schemas";
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Controller responsible for handling authentication-related HTTP requests.
 * 
 * This controller provides endpoints for user registration and authentication,
 * delegating business logic to the appropriate use cases.
 * 
 * @since 1.0.0
 */
export class AuthController {
  /**
   * Creates a new AuthController instance.
   * 
   * @param registerUser - Use case for user registration
   * @param authenticateUser - Use case for user authentication
   */
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticateUser: AuthenticateUser
  ) { }

  /**
   * Handles user registration requests.
   * 
   * Creates a new user account with the provided email and password.
   * The password is hashed before storage for security.
   * 
   * @param request - Fastify request containing user registration data
   * @param reply - Fastify reply object for sending response
   * 
   * @example
   * ```typescript
   * // Request body
   * {
   *   "email": "user@example.com",
   *   "password": "securePassword123"
   * }
   * 
   * // Success response (201)
   * {
   *   "message": "User registered successfully"
   * }
   * ```
   * 
   * @throws {UserAlreadyExists} When a user with the provided email already exists
   * @throws {ValidationError} When the provided data is invalid
   * @throws {Error} When database operations fail
   * 
   * @returns Promise that resolves when registration is complete
   * 
   * @since 1.0.0
   */
  public async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email, password } = request.body;

    await this.registerUser.execute({
      email,
      password,
    });

    reply.code(201).send({ message: "User registered successfully" });
  }

  /**
   * Handles user authentication requests.
   * 
   * Authenticates a user with the provided email and password,
   * returning a JWT token upon successful authentication.
   * 
   * @param request - Fastify request containing authentication credentials
   * @param reply - Fastify reply object for sending response
   * 
   * @example
   * ```typescript
   * // Request body
   * {
   *   "email": "user@example.com",
   *   "password": "securePassword123"
   * }
   * 
   * // Success response (200)
   * {
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   * ```
   * 
   * @throws {AuthenticationError} When email or password is incorrect
   * @throws {ValidationError} When the provided data is invalid
   * @throws {Error} When database operations or token generation fails
   * 
   * @returns Promise that resolves with the authentication response
   * 
   * @since 1.0.0
   */
  public async authenticate(
    request: FastifyRequest<{ Body: AuthBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email, password } = request.body;

    const response = await this.authenticateUser.execute({
      email,
      passwordPlainText: password,
    });

    reply.code(200).send(response);
  }
}
