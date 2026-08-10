import { Response } from "express";

export class SuccessHandler {
  static handle(
    res: Response,
    message: string,
    data: any = null,
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
