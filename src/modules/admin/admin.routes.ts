import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import {
  adminOrdersQuerySchema,
  idParamSchema,
  paginationQuerySchema,
  updateOrderStatusSchema,
  updateProductSchema,
} from "../../validators/common.validator";
import { adminController } from "./admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", adminController.stats);
router.get(
  "/orders",
  validate(adminOrdersQuerySchema, "query"),
  adminController.orders
);
router.patch(
  "/orders/:id/status",
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus
);
router.get(
  "/products",
  validate(paginationQuerySchema, "query"),
  adminController.products
);
router.post(
  "/products",
  upload.array("images", 10),
  adminController.createProduct
);
router.patch(
  "/products/:id",
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  adminController.updateProduct
);
router.delete(
  "/products/:id",
  validate(idParamSchema, "params"),
  adminController.deleteProduct
);
router.get("/inventory", adminController.inventory);
router.get(
  "/customers",
  validate(paginationQuerySchema, "query"),
  adminController.customers
);
router.post("/reports/export", adminController.exportReport);

export default router;
