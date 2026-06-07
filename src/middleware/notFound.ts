import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCodes } from "../utils/errors";

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(404, ErrorCodes.NOT_FOUND, "Route not found"));
};
