import { ApplicationError } from "@domain/errors/application-error";

export class SameOriginDestinationCityError extends ApplicationError {
  public constructor(
    message: string = "Origin and destination city must be different"
  ) {
    super(
      message,
      "SAME_ORIGIN_DESTINATION_CITY",
      "SameOriginDestinationCityError"
    );
  }
}
