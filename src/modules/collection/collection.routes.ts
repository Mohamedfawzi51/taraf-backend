import { Router } from "express";
import { validate } from "../../middleware/validate";
import {
  collectionProductsQuerySchema,
  slugParamSchema,
} from "../../validators/common.validator";
import { collectionController } from "./collection.controller";

const router = Router();

router.get("/", collectionController.list);
router.get(
  "/:slug/products",
  validate(slugParamSchema, "params"),
  validate(collectionProductsQuerySchema, "query"),
  collectionController.products
);

export default router;
