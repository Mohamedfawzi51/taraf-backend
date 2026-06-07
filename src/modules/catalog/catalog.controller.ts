import { NextFunction, Request, Response } from "express";
import { catalogService } from "./catalog.service";

export class CatalogController {
  filters = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await catalogService.getFilters();
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };
}

export const catalogController = new CatalogController();
