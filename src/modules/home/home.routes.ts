import { Router } from "express";
import { homeController } from "./home.controller";

const router = Router();
router.get("/", homeController.get);
export default router;
