import { PasswordService } from "@application/services/password-service";
import { User } from "@domain/entities/user";
import { UserRepository } from "@domain/repositories/user-repository";

export interface RegisterUserRequest {
  email: string;
  passwordPlainText: string;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
  createdAt: Date;
}

export class RegisterUser {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  public async execute(
    request: RegisterUserRequest
  ): Promise<RegisterUserResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = await this.passwordService.hashPassword(
      request.passwordPlainText
    );

    const newUser = new User({
      email: request.email,
      passwordHash: passwordHash,
    });

    await this.userRepository.save(newUser);

    return {
      userId: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
