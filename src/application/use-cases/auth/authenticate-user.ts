import { PasswordService } from "@application/services/password-service";
import { TokenService } from "@application/services/token-service";
import { AuthenticationError } from "@domain/errors/authentication-error";
import { UserRepository } from "@domain/repositories/user-repository";

/**
 * Request data for user authentication.
 * 
 * Contains the credentials required to authenticate a user and generate
 * a JWT token for subsequent authenticated requests.
 * 
 * @since 1.0.0
 */
export type AuthenticateUserRequest = {
  /** User's email address */
  email: string;
  /** Plain text password for verification */
  passwordPlainText: string;
};

/**
 * Response data for successful user authentication.
 * 
 * Contains the JWT token that can be used for subsequent authenticated requests.
 * 
 * @since 1.0.0
 */
export type AuthenticateUserResponse = {
  /** JWT token for authentication */
  token: string;
};

/**
 * Use case for user authentication.
 * 
 * This use case handles the business logic for user authentication.
 * It validates user credentials, generates JWT tokens upon successful
 * authentication, and provides secure access to the application.
 * 
 * @since 1.0.0
 */
export class AuthenticateUser {
  /**
   * Creates a new AuthenticateUser use case instance.
   * 
   * @param userRepository - Repository for user data operations
   * @param passwordService - Service for password verification
   * @param tokenService - Service for JWT token generation
   */
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) { }

  /**
   * Executes the user authentication process.
   * 
   * Performs the complete user authentication workflow:
   * 1. Finds the user by email address
   * 2. Validates the provided password against the stored hash
   * 3. Generates a JWT token with user information
   * 4. Returns the token for subsequent authenticated requests
   * 
   * @param request - User authentication data containing email and password
   * 
   * @example
   * ```typescript
   * const authenticateUser = new AuthenticateUser(
   *   userRepository,
   *   passwordService,
   *   tokenService
   * );
   * 
   * const response = await authenticateUser.execute({
   *   email: "user@example.com",
   *   passwordPlainText: "securePassword123"
   * });
   * 
   * console.log(response.token); // JWT token for authentication
   * ```
   * 
   * @throws {AuthenticationError} When email or password is incorrect
   * @throws {Error} When database operations, password verification, or token generation fails
   * 
   * @returns Promise that resolves to the authentication response containing the JWT token
   * 
   * @since 1.0.0
   */
  public async execute(
    request: AuthenticateUserRequest
  ): Promise<AuthenticateUserResponse> {
    // 1. Find the user by email
    const user = await this.userRepository.findByEmail(request.email);

    // If user not found
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // 2. Compare the provided plain-text password with the stored hash
    const isPasswordValid = await this.passwordService.comparePassword(
      request.passwordPlainText,
      user.passwordHash
    );

    // If password does not match, throw generic authentication error
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // 3. If authentication is successful, generate a JWT token
    const token = await this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    // 4. Return the generated token
    return {
      token: token,
    };
  }
}
