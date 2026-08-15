import { CustomError } from "./custom-error.js";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public customMessage: string = "Not Found") {
    super(customMessage);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.customMessage }];
  }
}
