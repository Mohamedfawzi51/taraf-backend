import { NextFunction, Request, Response } from "express";
import { getSessionId } from "../../middleware/auth";
import { getValidated } from "../../utils/validated";
import { cartService } from "./cart.service";

export class CartController {
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await cartService.getCartResponse(
        req.user?.userId,
        getSessionId(req)
      );
      if (result.sessionId) {
        res.setHeader("X-Session-Id", result.sessionId);
      }
      res.json({ data: result.data });
    } catch (e) {
      next(e);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity } = getValidated<{
        productId: string;
        quantity: number;
      }>(req, "body");
      const result = await cartService.addItem(
        productId,
        quantity,
        req.user?.userId,
        getSessionId(req)
      );
      if (result.sessionId) res.setHeader("X-Session-Id", result.sessionId);
      res.status(201).json({ data: result.data });
    } catch (e) {
      next(e);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = getValidated<{ itemId: string }>(req, "params");
      const { quantity } = getValidated<{ quantity: number }>(req, "body");
      const result = await cartService.updateItem(
        itemId,
        quantity,
        req.user?.userId,
        getSessionId(req)
      );
      res.json({ data: result.data });
    } catch (e) {
      next(e);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = getValidated<{ itemId: string }>(req, "params");
      const result = await cartService.removeItem(
        itemId,
        req.user?.userId,
        getSessionId(req)
      );
      res.json({ data: result.data });
    } catch (e) {
      next(e);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await cartService.clearCart(
        req.user?.userId,
        getSessionId(req)
      );
      res.json({ data: result.data });
    } catch (e) {
      next(e);
    }
  };
}

export const cartController = new CartController();
