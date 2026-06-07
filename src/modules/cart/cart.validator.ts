import Joi from "joi";

export const addCartItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

export const itemIdParamSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
});
