import { ApplicationError } from "@domain/errors/application-error";

export class InvalidTokenError extends ApplicationError {
  public constructor(message: string = "Invalid token") {
    super(message, "INVALID_TOKEN", "InvalidTokenError");
  }
}
