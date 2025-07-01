import {
  AuthenticateUser,
  AuthenticateUserRequest,
  AuthenticateUserResponse,
} from "@application/use-cases/auth/authenticate-user";
import { UserRepository } from "@domain/repositories/user-repository";
import { PasswordService } from "@application/services/password-service";
import { TokenService } from "@application/services/token-service";
import { AuthenticationError } from "@domain/errors/authentication-error";
import { User } from "@domain/entities/user";

describe("AuthenticateUser", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let authenticateUser: AuthenticateUser;

  // Common test data
  const MOCK_USER_ID = "user-123";
  const MOCK_USER_EMAIL = "test@example.com";
  const MOCK_PLAIN_PASSWORD = "password123";
  const MOCK_PASSWORD_HASH = "hashedPasswordXYZ";
  const MOCK_JWT_TOKEN = "mock.jwt.token";

  const MOCK_USER: User = {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    passwordHash: MOCK_PASSWORD_HASH,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Initialize mocks for each test run to ensure isolation
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    // Create a fresh instance of the use case for each test
    authenticateUser = new AuthenticateUser(
      userRepository,
      passwordService,
      tokenService
    );
  });

  describe("execute - successful authentication", () => {
    it("should successfully authenticate a user and return a JWT token", async () => {
      // Set up mocks for a successful login scenario.
      // The user repository will find the user by email.
      userRepository.findByEmail.mockResolvedValue(MOCK_USER);

      // The password service will confirm the plain password matches the hash.
      passwordService.comparePassword.mockResolvedValue(true);

      // The token service will generate a valid JWT.
      tokenService.generateToken.mockResolvedValue(MOCK_JWT_TOKEN);

      const request: AuthenticateUserRequest = {
        email: MOCK_USER_EMAIL,
        passwordPlainText: MOCK_PLAIN_PASSWORD,
      };

      const response: AuthenticateUserResponse = await authenticateUser.execute(
        request
      );

      // Assertions:
      // Verify that the user repository was called once to find the user by email.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_USER_EMAIL);

      // Verify that the password service was called once to compare passwords.
      expect(passwordService.comparePassword).toHaveBeenCalledTimes(1);

      // Ensure the password comparison was done with the correct plain text password and stored hash.
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD,
        MOCK_PASSWORD_HASH
      );

      // Verify that the token service was called once to generate a token.
      expect(tokenService.generateToken).toHaveBeenCalledTimes(1);

      // Ensure the token was generated with the user's ID and email.
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        email: MOCK_USER_EMAIL,
      });

      // Verify the final response contains the expected JWT token.
      expect(response).toEqual({ token: MOCK_JWT_TOKEN });
    });
  });

  describe("execute - invalid credentials", () => {
    it("should throw AuthenticationError if user is not found", async () => {
      // Configure the user repository to return null, simulating a user not found scenario.
      userRepository.findByEmail.mockResolvedValue(null);

      const request: AuthenticateUserRequest = {
        email: "nonexistent@example.com",
        passwordPlainText: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to throw an AuthenticationError.
      await expect(authenticateUser.execute(request)).rejects.toThrow(
        AuthenticationError
      );

      // Verify that findByEmail was called with the provided email.
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );

      // Crucially, ensure that the password and token services were NOT called,
      // as authentication should fail early if the user doesn't exist.
      expect(passwordService.comparePassword).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if password does not match", async () => {
      // Configure mocks: user found, but the password comparison will fail.
      userRepository.findByEmail.mockResolvedValue(MOCK_USER);
      passwordService.comparePassword.mockResolvedValue(false); // Simulate incorrect password

      const request: AuthenticateUserRequest = {
        email: MOCK_USER_EMAIL,
        passwordPlainText: "wrongPassword",
      };

      // Expect the use case to throw an AuthenticationError.
      await expect(authenticateUser.execute(request)).rejects.toThrow(
        AuthenticationError
      );

      // Verify that findByEmail was called with the correct email.
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_USER_EMAIL);

      // Verify that comparePassword was called exactly once.
      expect(passwordService.comparePassword).toHaveBeenCalledTimes(1);

      // Ensure the comparison was attempted with the wrong plain password against the stored hash.
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        "wrongPassword",
        MOCK_PASSWORD_HASH
      );

      // Ensure the token service was NOT called, as authentication failed.
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe("execute - dependency errors", () => {
    it("should throw an error if userRepository.findByEmail fails", async () => {
      const mockError = new Error("Database connection failed");

      // Configure findByEmail to reject, simulating a database issue.
      userRepository.findByEmail.mockRejectedValue(mockError);

      const request: AuthenticateUserRequest = {
        email: MOCK_USER_EMAIL,
        passwordPlainText: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the underlying database error.
      await expect(authenticateUser.execute(request)).rejects.toThrow(
        mockError
      );

      // Verify findByEmail was called.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_USER_EMAIL);

      // Ensure no further services were called since the first step failed.
      expect(passwordService.comparePassword).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw an error if passwordService.comparePassword fails", async () => {
      const mockError = new Error("Password service internal error");

      // User is found successfully.
      userRepository.findByEmail.mockResolvedValue(MOCK_USER);

      // But comparePassword fails (e.g., a problem with the hashing library).
      passwordService.comparePassword.mockRejectedValue(mockError);

      const request: AuthenticateUserRequest = {
        email: MOCK_USER_EMAIL,
        passwordPlainText: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the error from the password service.
      await expect(authenticateUser.execute(request)).rejects.toThrow(
        mockError
      );

      // Verify findByEmail was called.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_USER_EMAIL);

      // Verify comparePassword was called.
      expect(passwordService.comparePassword).toHaveBeenCalledTimes(1);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD,
        MOCK_PASSWORD_HASH
      );

      // Ensure token generation was not attempted.
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw an error if tokenService.generateToken fails", async () => {
      const mockError = new Error("Token generation failed");

      // User is found.
      userRepository.findByEmail.mockResolvedValue(MOCK_USER);

      // Password comparison succeeds.
      passwordService.comparePassword.mockResolvedValue(true);

      // But token generation fails.
      tokenService.generateToken.mockRejectedValue(mockError);

      const request: AuthenticateUserRequest = {
        email: MOCK_USER_EMAIL,
        passwordPlainText: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the error from the token service.
      await expect(authenticateUser.execute(request)).rejects.toThrow(
        mockError
      );

      // Verify all preceding steps were called as expected.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_USER_EMAIL);
      expect(passwordService.comparePassword).toHaveBeenCalledTimes(1);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD,
        MOCK_PASSWORD_HASH
      );

      expect(tokenService.generateToken).toHaveBeenCalledTimes(1);
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        email: MOCK_USER_EMAIL,
      });
    });
  });
});
