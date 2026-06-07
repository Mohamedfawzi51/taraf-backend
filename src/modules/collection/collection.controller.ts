import { NextFunction, Request, Response } from "express";
import { collectionService } from "./collection.service";
import { getValidated } from "../../utils/validated";

export class CollectionController {
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await collectionService.listCollections();
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  products = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = getValidated<{ slug: string }>(req, "params");
      const { page, limit } = getValidated<{ page: number; limit: number }>(
        req,
        "query"
      );
      const result = await collectionService.getCollectionProducts(
        slug,
        page,
        limit
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}

export const collectionController = new CollectionController();
