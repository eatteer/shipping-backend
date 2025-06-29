import { PasswordService } from "@application/services/password-service";
import { User } from "@domain/entities/user";
import { UserAlreadyExists } from "@domain/errors/user-already-exists-error";
import { UserRepository } from "@domain/repositories/user-repository";

/**
 * Request data for user registration.
 * 
 * Contains the essential information required to create a new user account.
 * 
 * @since 1.0.0
 */
export type RegisterUserRequest = {
  /** User's email address (must be unique) */
  email: string;
  /** Plain text password (will be hashed before storage) */
  password: string;
};

/**
 * Use case for user registration.
 * 
 * This use case handles the business logic for creating new user accounts.
 * It validates that the email is unique, hashes the password securely,
 * and persists the new user to the database.
 * 
 * @since 1.0.0
 */
export class RegisterUser {
  /**
   * Creates a new RegisterUser use case instance.
   * 
   * @param userRepository - Repository for user data operations
   * @param passwordService - Service for password hashing operations
   */
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) { }

  /**
   * Executes the user registration process.
   * 
   * Performs the complete user registration workflow:
   * 1. Checks if a user with the provided email already exists
   * 2. Hashes the plain text password securely
   * 3. Creates a new User entity
   * 4. Persists the user to the database
   * 
   * @param request - User registration data containing email and password
   * 
   * @example
   * ```typescript
   * const registerUser = new RegisterUser(userRepository, passwordService);
   * 
   * await registerUser.execute({
   *   email: "newuser@example.com",
   *   password: "securePassword123"
   * });
   * ```
   * 
   * @throws {UserAlreadyExists} When a user with the provided email already exists
   * @throws {Error} When database operations fail or password hashing fails
   * 
   * @returns Promise that resolves when user registration is complete
   * 
   * @since 1.0.0
   */
  public async execute(request: RegisterUserRequest): Promise<void> {
    // 1. Check if a user with the provided email already exists
    const existingUser = await this.userRepository.findByEmail(request.email);

    // 2. If a user exists
    if (existingUser) {
      throw new UserAlreadyExists();
    }

    // 3. Hash the plain-text password
    const passwordHash = await this.passwordService.hashPassword(
      request.password
    );

    // 4. Create a new User
    const newUser = new User({
      email: request.email,
      passwordHash: passwordHash,
    });

    // 5. Persist the new user
    await this.userRepository.save(newUser);
  }
}
