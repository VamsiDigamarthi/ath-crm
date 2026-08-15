import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // Fallback for custom errors where instanceof check fails due to TS prototype wrapping
  if ("statusCode" in err && typeof (err as any).serializeErrors === "function") {
    return res.status((err as any).statusCode).send({ errors: (err as any).serializeErrors() });
  }

  console.error("[Unhandled Error]:", err);

  res.status(400).send({
    errors: [{ message: err.message || "Something went wrong" }],
  });
};
