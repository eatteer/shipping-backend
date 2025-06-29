import { ApplicationError } from "@domain/errors/application-error";

export class AuthenticationError extends ApplicationError {
  public constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_FAILED", "AuthenticationError");
  }
}
