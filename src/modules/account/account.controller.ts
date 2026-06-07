import { NextFunction, Request, Response } from "express";
import { accountService } from "./account.service";
import { authService } from "../auth/auth.service";
import { getValidated } from "../../utils/validated";

export class AccountController {
  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await accountService.getProfile(req.user!.userId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await authService.updateProfile(
        req.user!.userId,
        getValidated(req, "body")
      );
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  addresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await accountService.listAddresses(req.user!.userId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await accountService.addAddress(
        req.user!.userId,
        getValidated(req, "body")
      );
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const data = await accountService.updateAddress(
        req.user!.userId,
        id,
        getValidated(req, "body")
      );
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      await accountService.deleteAddress(req.user!.userId, id);
      res.json({ data: { message: "Address deleted" } });
    } catch (e) {
      next(e);
    }
  };

  setDefaultAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      await accountService.setDefaultAddress(req.user!.userId, id);
      res.json({ data: { message: "Default address updated" } });
    } catch (e) {
      next(e);
    }
  };

  loyalty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await accountService.getLoyalty(req.user!.userId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  favorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await accountService.listFavorites(req.user!.userId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = getValidated<{ productId: string }>(req, "params");
      await accountService.addFavorite(req.user!.userId, productId);
      res.status(201).json({ data: { message: "Added to favorites" } });
    } catch (e) {
      next(e);
    }
  };

  removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = getValidated<{ productId: string }>(req, "params");
      await accountService.removeFavorite(req.user!.userId, productId);
      res.json({ data: { message: "Removed from favorites" } });
    } catch (e) {
      next(e);
    }
  };
}

export const accountController = new AccountController();
