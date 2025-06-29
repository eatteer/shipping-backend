import { PasswordService } from "@application/services/password-service";
import { TokenService } from "@application/services/token-service";
import { AuthenticationError } from "@domain/errors/authentication-error";
import { UserRepository } from "@domain/repositories/user-repository";

export type AuthenticateUserRequest = {
  email: string;
  passwordPlainText: string;
};

export type AuthenticateUserResponse = {
  token: string;
};

export class AuthenticateUser {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) { }

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
