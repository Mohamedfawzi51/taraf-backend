import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
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
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as SignOptions);
};

export const signRefreshToken = (payload: AuthPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return jwt.sign(payload, secret, { expiresIn: "7d" } as SignOptions);
};

export const verifyAccessToken = (token: string): AuthPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.verify(token, secret) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return jwt.verify(token, secret) as AuthPayload;
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
