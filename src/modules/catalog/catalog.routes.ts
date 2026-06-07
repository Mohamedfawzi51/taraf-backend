import { Router } from "express";
import { catalogController } from "./catalog.controller";

const router = Router();
router.get("/filters", catalogController.filters);
export default router;
