import { Router } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import authRoutes from "../../modules/auth/auth.routes";
import productRoutes from "../../modules/product/product.routes";
import collectionRoutes from "../../modules/collection/collection.routes";
import homeRoutes from "../../modules/home/home.routes";
import catalogRoutes from "../../modules/catalog/catalog.routes";
import cartRoutes from "../../modules/cart/cart.routes";
import orderRoutes from "../../modules/order/order.routes";
import accountRoutes from "../../modules/account/account.routes";
import adminRoutes from "../../modules/admin/admin.routes";
import newsletterRoutes from "../../modules/newsletter/newsletter.routes";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { checkoutSchema } from "../../modules/order/order.validator";
import { checkoutController } from "../../modules/order/checkout.controller";

const router = Router();

const openApiPath = path.join(process.cwd(), "openapi/openapi.yaml");
let swaggerDocument: object;
try {
  swaggerDocument = YAML.load(openApiPath);
} catch {
  swaggerDocument = {
    openapi: "3.0.0",
    info: { title: "Taraf API", version: "1.0.0" },
  };
}

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/collections", collectionRoutes);
router.use("/home", homeRoutes);
router.use("/catalog", catalogRoutes);
router.use("/cart", cartRoutes);
router.post("/checkout", authenticate, validate(checkoutSchema), checkoutController.create);
router.use("/orders", orderRoutes);
router.use("/account", accountRoutes);
router.use("/admin", adminRoutes);
router.use("/newsletter", newsletterRoutes);

export default router;
