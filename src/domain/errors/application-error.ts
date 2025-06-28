export class ApplicationError extends Error {
  public name: string;
  public code: string;

  public constructor(
    message: string,
    code: string,
    name: string = "ApplicationError"
  ) {
    super(message);
    this.name = name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }

  public setCode(error: string): this {
    this.code = error;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }
}
