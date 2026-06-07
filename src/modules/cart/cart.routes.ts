import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { cartController } from "./cart.controller";
import {
  addCartItemSchema,
  itemIdParamSchema,
  updateCartItemSchema,
} from "./cart.validator";

const router = Router();

router.use(optionalAuth);

router.get("/", cartController.getCart);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.patch(
  "/items/:itemId",
  validate(itemIdParamSchema, "params"),
  validate(updateCartItemSchema),
  cartController.updateItem
);
router.delete(
  "/items/:itemId",
  validate(itemIdParamSchema, "params"),
  cartController.removeItem
);
router.delete("/", cartController.clearCart);

export default router;
