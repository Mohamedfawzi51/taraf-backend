import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError, ErrorCodes } from "../utils/errors";

type ValidationTarget = "body" | "params" | "query";

export const validate = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(
        new AppError(400, ErrorCodes.VALIDATION_ERROR, "Validation failed", {
          errors: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        })
      );
      return;
    }

    req.validated = { ...req.validated, [target]: value };
    next();
  };
};
