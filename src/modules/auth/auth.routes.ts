import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "./auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(logoutSchema), authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
