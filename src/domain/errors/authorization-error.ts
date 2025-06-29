import { ApplicationError } from "@domain/errors/application-error";

export class AuthorizationError extends ApplicationError {
  public constructor(message: string = "Unauthorized access") {
    super(message, "AUTHORIZATION_ERROR", "AuthorizationError");
  }
}
