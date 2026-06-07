import { NextFunction, Request, Response } from "express";
import { homeService } from "./home.service";

export class HomeController {
  get = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Fetching home data...");
      const data = await homeService.getHome();
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };
}

export const homeController = new HomeController();
