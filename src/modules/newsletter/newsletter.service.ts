import Joi from "joi";
import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";

export const subscribeSchema = Joi.object({
  email: Joi.string().email().required(),
});

export class NewsletterService {
  async subscribe(email: string) {
    try {
      await prisma.newsletterSubscription.create({
        data: { email: email.toLowerCase() },
      });
    } catch {
      throw new AppError(409, ErrorCodes.CONFLICT, "Email already subscribed");
    }
  }
}

export const newsletterService = new NewsletterService();
