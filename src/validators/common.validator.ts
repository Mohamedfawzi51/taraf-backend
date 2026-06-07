import Joi from "joi";

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const slugParamSchema = Joi.object({
  slug: Joi.string().trim().required(),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const adminOrdersQuerySchema = Joi.object({
  status: Joi.string().valid(
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required(),
});

export const productIdParamSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  priceAmount: Joi.number().integer().min(0),
  stock: Joi.number().integer().min(0),
  isFeatured: Joi.boolean(),
}).min(1);

export const collectionProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});
