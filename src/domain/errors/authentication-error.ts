import { ApplicationError } from "@domain/errors/application-error";

export class AuthenticationError extends ApplicationError {
  public constructor(
    message: string = "Authentication failed, check your credentials"
  ) {
    super(message, "AUTHENTICATION_FAILED", "AuthenticationError");
  }
}
