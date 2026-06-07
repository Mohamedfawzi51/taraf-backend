import { NextFunction, Request, Response } from "express";
import { productService } from "./product.service";
import { getValidated } from "../../utils/validated";

export class ProductController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.listProducts(
        getValidated(req, "query")
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = getValidated<{ slug: string }>(req, "params");
      const product = await productService.getBySlug(slug);
      res.json({ data: product });
    } catch (e) {
      next(e);
    }
  };

  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = getValidated<{ slug: string }>(req, "params");
      const { page, limit } = getValidated<{ page: number; limit: number }>(
        req,
        "query"
      );
      const result = await productService.getReviews(slug, page, limit);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = getValidated<{ slug: string }>(req, "params");
      const { rating, content } = getValidated<{
        rating: number;
        content: string;
      }>(req, "body");
      const review = await productService.addReview(
        slug,
        req.user!.userId,
        rating,
        content
      );
      res.status(201).json({ data: review });
    } catch (e) {
      next(e);
    }
  };
}

export const productController = new ProductController();
