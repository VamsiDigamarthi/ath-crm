import { CustomError } from "./custom-error.js";

export class NotAllowedError extends CustomError {
  statusCode = 403;

  constructor() {
    super("Action not allowed");

    Object.setPrototypeOf(this, NotAllowedError.prototype);
  }

  serializeErrors() {
    return [{ message: "You do not have permission to perform this action" }];
  }
}
