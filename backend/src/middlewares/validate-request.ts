import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { RequestValidationError } from "../errors/request-validation-error.js";

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RequestValidationError(error);
      }
      next(error);
    }
  };
};
