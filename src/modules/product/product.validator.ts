import Joi from "joi";

export const listProductsQuerySchema = Joi.object({
  category: Joi.string().valid("perfumes", "watches", "bags", "accessories"),
  brand: Joi.string().valid("unique-diamond", "orad", "taraf-collection"),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  sort: Joi.string().valid("newest", "price-asc", "price-desc").default("newest"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

export const slugParamSchema = Joi.object({
  slug: Joi.string().trim().required(),
});

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  content: Joi.string().trim().min(5).max(2000).required(),
});
