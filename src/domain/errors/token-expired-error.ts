import { ApplicationError } from "@domain/errors/application-error";

export class TokenExpiredError extends ApplicationError {
  public constructor(message: string = "Token expired") {
    super(message, "TOKEN_EXPIRED", "TokenExpiredError");
  }
}
