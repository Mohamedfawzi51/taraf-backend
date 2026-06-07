import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { productController } from "./product.controller";
import {
  createReviewSchema,
  listProductsQuerySchema,
  reviewQuerySchema,
  slugParamSchema,
} from "./product.validator";

const router = Router();

router.get("/", validate(listProductsQuerySchema, "query"), productController.list);
router.get(
  "/:slug",
  validate(slugParamSchema, "params"),
  productController.getBySlug
);
router.get(
  "/:slug/reviews",
  validate(slugParamSchema, "params"),
  validate(reviewQuerySchema, "query"),
  productController.getReviews
);
router.post(
  "/:slug/reviews",
  authenticate,
  validate(slugParamSchema, "params"),
  validate(createReviewSchema),
  productController.addReview
);

export default router;
