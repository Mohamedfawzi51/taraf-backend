import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { AppError, ErrorCodes } from "../utils/errors";

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const signAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
};

export const signRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: "7d",
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as AuthPayload;
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication required"));
    return;
  }

  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    req.user = verifyAccessToken(header.slice(7));
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication required"));
    return;
  }
  if (req.user.role !== "ADMIN") {
    next(new AppError(403, ErrorCodes.FORBIDDEN, "Admin access required"));
    return;
  }
  next();
};

export const getSessionId = (req: Request): string | undefined => {
  const sessionId = req.headers["x-session-id"];
  if (typeof sessionId === "string" && sessionId.trim()) return sessionId.trim();
  return undefined;
};
