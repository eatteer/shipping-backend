import { PasswordService } from "@application/services/password-service";
import { User } from "@domain/entities/user";
import { UserAlreadyExists } from "@domain/errors/user-already-exists-error";
import { UserRepository } from "@domain/repositories/user-repository";

export type RegisterUserRequest = {
  email: string;
  password: string;
};

export class RegisterUser {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

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
