import { ApplicationError } from "@domain/errors/application-error";

export class NotFoundError extends ApplicationError {
  public constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", "NotFoundError");
  }
}
