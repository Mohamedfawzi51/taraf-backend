import { Request } from "express";

type ValidationTarget = "body" | "params" | "query";

declare global {
  namespace Express {
    interface Request {
      validated?: Partial<Record<ValidationTarget, unknown>>;
    }
  }
}

export const getValidated = <T>(
  req: Request,
  target: ValidationTarget
): T => {
  if (req.validated?.[target] !== undefined) {
    return req.validated[target] as T;
  }
  return req[target] as T;
};
