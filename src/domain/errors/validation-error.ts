import { ApplicationError } from "@domain/errors/application-error";

export class ValidationError extends ApplicationError {
  public constructor(message: string = "Invalid input") {
    super(message, "VALIDATION_ERROR", "ValidationError");
  }
}
