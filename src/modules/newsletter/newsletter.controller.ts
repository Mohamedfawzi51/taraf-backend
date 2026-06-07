import { NextFunction, Request, Response } from "express";
import { newsletterService } from "./newsletter.service";
import { getValidated } from "../../utils/validated";

export class NewsletterController {
  subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = getValidated<{ email: string }>(req, "body");
      await newsletterService.subscribe(email);
      res.status(201).json({ data: { message: "Subscribed successfully" } });
    } catch (e) {
      next(e);
    }
  };
}

export const newsletterController = new NewsletterController();
