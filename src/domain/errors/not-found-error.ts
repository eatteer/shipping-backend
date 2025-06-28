import { ApplicationError } from "@domain/errors/application-error";

export class NotFoundError extends ApplicationError {
  public constructor(
    message: string = "Resource not found",
    entityName?: string
  ) {
    super(
      entityName ? `${entityName} not found` : message,
      "NOT_FOUND",
      "NotFoundError"
    );
  }

  public setEntityName(entityName: string) {
    this.message = `${entityName} not found`;
    return this;
  }
}
