import { Router } from "express";
import { validate } from "../../middleware/validate";
import { subscribeSchema } from "./newsletter.service";
import { newsletterController } from "./newsletter.controller";

const router = Router();
router.post("/subscribe", validate(subscribeSchema), newsletterController.subscribe);
export default router;
