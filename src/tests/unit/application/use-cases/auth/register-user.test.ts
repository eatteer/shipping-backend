import {
  RegisterUser,
  RegisterUserRequest,
} from "@application/use-cases/auth/register-user";
import { UserRepository } from "@domain/repositories/user-repository";
import { PasswordService } from "@application/services/password-service";
import { User } from "@domain/entities/user";
import { UserAlreadyExists } from "@domain/errors/user-already-exists-error";

describe("RegisterUser", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let registerUser: RegisterUser;

  // Common test data
  const MOCK_NEW_EMAIL = "newuser@example.com";
  const MOCK_PLAIN_PASSWORD = "securePassword123";
  const MOCK_HASHED_PASSWORD = "hashedPasswordForNewUser";

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

    // Configure the hashPassword mock to always return a predictable hash.
    passwordService.hashPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);

    // Create a new instance of the use case before each test.
    registerUser = new RegisterUser(userRepository, passwordService);
  });

  describe("execute - successful registration", () => {
    it("should register a new user successfully when email does not exist", async () => {
      // Set up mocks for a successful registration scenario.
      // The user repository should indicate that no user exists with the new email.
      userRepository.findByEmail.mockResolvedValue(null);

      // The save operation should complete successfully.
      userRepository.save.mockResolvedValue(undefined);

      const request: RegisterUserRequest = {
        email: MOCK_NEW_EMAIL,
        password: MOCK_PLAIN_PASSWORD,
      };

      // Execute the use case.
      await registerUser.execute(request);

      // Assertions:
      // Verify that findByEmail was called once to check for existing users.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_NEW_EMAIL);

      // Verify that hashPassword was called once to hash the plain password.
      expect(passwordService.hashPassword).toHaveBeenCalledTimes(1);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD
      );

      // Verify that save was called once to persist the new user.
      expect(userRepository.save).toHaveBeenCalledTimes(1);

      // Ensure save was called with a User instance containing the correct email and hashed password.
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: MOCK_NEW_EMAIL,
          passwordHash: MOCK_HASHED_PASSWORD,
        })
      );

      // Further verify that the argument passed to save is indeed an instance of the User entity.
      const userPassedToSave = userRepository.save.mock.calls[0][0];
      expect(userPassedToSave).toBeInstanceOf(User);
    });
  });

  describe("execute - email already exists", () => {
    it("should throw UserAlreadyExists error if a user with the email already exists", async () => {
      // Configure mocks to simulate an existing user with the same email.
      userRepository.findByEmail.mockResolvedValue({
        id: "existing-user-id",
        email: MOCK_NEW_EMAIL,
        passwordHash: "someExistingHash",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request: RegisterUserRequest = {
        email: MOCK_NEW_EMAIL,
        password: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to throw a specific UserAlreadyExists error.
      await expect(registerUser.execute(request)).rejects.toThrow(
        UserAlreadyExists
      );

      // Assertions:
      // Verify that findByEmail was called once to check for the existing user.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_NEW_EMAIL);

      // Ensure that password hashing and user saving were NOT attempted,
      // as the process should halt early due to the existing email.
      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("execute - dependency errors", () => {
    it("should throw an error if userRepository.findByEmail fails", async () => {
      const mockError = new Error("Database connection failed during find");

      // Configure findByEmail to reject, simulating a database error during the initial check.
      userRepository.findByEmail.mockRejectedValue(mockError);

      const request: RegisterUserRequest = {
        email: MOCK_NEW_EMAIL,
        password: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the underlying database error.
      await expect(registerUser.execute(request)).rejects.toThrow(mockError);

      // Verify that findByEmail was called.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_NEW_EMAIL);

      // Ensure no further operations (hashing or saving) were attempted.
      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if passwordService.hashPassword fails", async () => {
      const mockError = new Error("Password hashing failed");

      // User does not exist, proceeding to hash.
      userRepository.findByEmail.mockResolvedValue(null);

      // Configure hashPassword to reject, simulating an error during the hashing process.
      passwordService.hashPassword.mockRejectedValue(mockError);

      const request: RegisterUserRequest = {
        email: MOCK_NEW_EMAIL,
        password: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the password service error.
      await expect(registerUser.execute(request)).rejects.toThrow(mockError);

      // Verify findByEmail was called as the first step.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_NEW_EMAIL);

      // Verify hashPassword was attempted.
      expect(passwordService.hashPassword).toHaveBeenCalledTimes(1);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD
      );

      // Ensure user saving was NOT attempted since hashing failed.
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if userRepository.save fails", async () => {
      const mockError = new Error("Database save failed");

      // User does not exist.
      userRepository.findByEmail.mockResolvedValue(null);

      // Password hashing succeeds.
      passwordService.hashPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);

      // Configure save to reject, simulating a database error during persistence.
      userRepository.save.mockRejectedValue(mockError);

      const request: RegisterUserRequest = {
        email: MOCK_NEW_EMAIL,
        password: MOCK_PLAIN_PASSWORD,
      };

      // Expect the use case to re-throw the database save error.
      await expect(registerUser.execute(request)).rejects.toThrow(mockError);

      // Verify all preceding steps were called as expected before the failure.
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(MOCK_NEW_EMAIL);
      expect(passwordService.hashPassword).toHaveBeenCalledTimes(1);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        MOCK_PLAIN_PASSWORD
      );

      expect(userRepository.save).toHaveBeenCalledTimes(1);

      // Confirm the user object attempted to be saved was correctly formed.
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: MOCK_NEW_EMAIL,
          passwordHash: MOCK_HASHED_PASSWORD,
        })
      );
    });
  });
});
