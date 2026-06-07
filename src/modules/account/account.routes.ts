import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { addressSchema, updateProfileSchema } from "../auth/auth.validator";
import {
  idParamSchema,
  productIdParamSchema,
} from "../../validators/common.validator";
import { accountController } from "./account.controller";

const router = Router();
router.use(authenticate);

router.get("/profile", accountController.profile);
router.patch("/profile", validate(updateProfileSchema), accountController.updateProfile);
router.get("/addresses", accountController.addresses);
router.post("/addresses", validate(addressSchema), accountController.addAddress);
router.patch(
  "/addresses/:id",
  validate(idParamSchema, "params"),
  validate(addressSchema),
  accountController.updateAddress
);
router.delete(
  "/addresses/:id",
  validate(idParamSchema, "params"),
  accountController.deleteAddress
);
router.patch(
  "/addresses/:id/default",
  validate(idParamSchema, "params"),
  accountController.setDefaultAddress
);
router.get("/loyalty", accountController.loyalty);
router.get("/favorites", accountController.favorites);
router.post(
  "/favorites/:productId",
  validate(productIdParamSchema, "params"),
  accountController.addFavorite
);
router.delete(
  "/favorites/:productId",
  validate(productIdParamSchema, "params"),
  accountController.removeFavorite
);

export default router;
