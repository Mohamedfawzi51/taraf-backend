import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { getSessionId } from "../../middleware/auth";
import { getValidated } from "../../utils/validated";

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(
        getValidated(req, "body")
      );
      res.status(201).json({ data: result });
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        getValidated(req, "body"),
        getSessionId(req)
      );
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = getValidated<{ refreshToken: string }>(
        req,
        "body"
      );
      const tokens = await authService.refresh(refreshToken);
      res.json({ data: tokens });
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = getValidated<{ refreshToken?: string }>(req, "body");
      await authService.logout(body.refreshToken);
      res.json({ data: { message: "Logged out" } });
    } catch (e) {
      next(e);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ data: user });
    } catch (e) {
      next(e);
    }
  };
}

export const authController = new AuthController();
