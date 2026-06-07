import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service";
import { getValidated } from "../../utils/validated";

export class OrderController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getValidated<{ page: number; limit: number }>(
        req,
        "query"
      );
      const result = await orderService.listOrders(
        req.user!.userId,
        page,
        limit
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const order = await orderService.getOrder(req.user!.userId, id);
      res.json({ data: order });
    } catch (e) {
      next(e);
    }
  };
}

export const orderController = new OrderController();
