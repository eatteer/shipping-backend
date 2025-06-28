import { PasswordService } from "@application/services/password-service";
import { User } from "@domain/entities/user";
import { UserAlreadyExists } from "@domain/errors/user-already-exists-error";
import { UserRepository } from "@domain/repositories/user-repository";

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export interface RegisterUserResponse {
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
      throw new UserAlreadyExists();
    }

    const passwordHash = await this.passwordService.hashPassword(
      request.password
    );

    const newUser = new User({
      email: request.email,
      passwordHash: passwordHash,
    });

    await this.userRepository.save(newUser);

    return {
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
