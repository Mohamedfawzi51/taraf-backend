import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { orderController } from "./order.controller";
import { orderIdParamSchema, orderQuerySchema } from "./order.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate(orderQuerySchema, "query"), orderController.list);
router.get(
  "/:id",
  validate(orderIdParamSchema, "params"),
  orderController.get
);

export default router;
