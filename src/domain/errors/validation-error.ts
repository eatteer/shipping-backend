import { ApplicationError } from "@domain/errors/application-error";

export class ValidationError extends ApplicationError {
  public constructor(message: string = "Input values invalid") {
    super(message, "VALIDATION_ERROR", "ValidationError");
  }
}
