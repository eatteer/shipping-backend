export class ApplicationError extends Error {
  public name: string;
  public error: string;

  public constructor(
    message: string,
    error: string,
    name: string = "ApplicationError"
  ) {
    super(message);
    this.name = name;
    this.error = error;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }

  public setError(error: string): this {
    this.error = error;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }
}
