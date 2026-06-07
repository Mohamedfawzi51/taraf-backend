import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCodes } from "../utils/errors";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err.message === "Only image files are allowed") {
    res.status(400).json({
      error: { code: ErrorCodes.BAD_REQUEST, message: err.message },
    });
    return;
  }

  if (err.message.includes("File too large")) {
    res.status(400).json({
      error: { code: ErrorCodes.BAD_REQUEST, message: "Image must be 5MB or smaller" },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "Internal server error",
      details:
        process.env.NODE_ENV !== "production"
          ? { message: err.message, stack: err.stack }
          : undefined,
    },
  });
};
