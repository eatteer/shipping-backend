import { ApplicationError } from "@domain/errors/application-error";

export class UserAlreadyExists extends ApplicationError {
  public constructor(
    message: string = "User already exists, check your credentials"
  ) {
    super(message, "USER_ALREADY_EXISTS", "UserAlreadyExists");
  }
}
