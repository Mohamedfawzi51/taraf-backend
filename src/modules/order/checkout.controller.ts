import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service";
import { getValidated } from "../../utils/validated";

export class CheckoutController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { addressId, paymentMethod } = getValidated<{
        addressId: string;
        paymentMethod: string;
      }>(req, "body");
      const order = await orderService.checkout(
        req.user!.userId,
        addressId,
        paymentMethod
      );
      res.status(201).json({ data: order });
    } catch (e) {
      next(e);
    }
  };
}

export const checkoutController = new CheckoutController();
