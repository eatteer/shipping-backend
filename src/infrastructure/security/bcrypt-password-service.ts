import * as bcrypt from "bcryptjs";
import { PasswordService } from "@src/application/services/password-service";

export class BcryptPasswordService implements PasswordService {
  private readonly saltRounds: number = 10;

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
