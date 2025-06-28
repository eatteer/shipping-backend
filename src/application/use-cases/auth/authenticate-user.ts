import { PasswordService } from "@application/services/password-service";
import { TokenService } from "@application/services/token-service";
import { UserRepository } from "@domain/repositories/user-repository";

export interface AuthenticateUserRequest {
  email: string;
  passwordPlainText: string;
}

export interface AuthenticateUserResponse {
  token: string;
}

export class AuthenticateUser {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  public async execute(
    request: AuthenticateUserRequest
  ): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      request.passwordPlainText,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("User does not exist or invalid credentials.");
    }

    const token = await this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token: token,
    };
  }
}
