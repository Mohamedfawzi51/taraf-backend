import Joi from "joi";

export const checkoutSchema = Joi.object({
  addressId: Joi.string().uuid().required(),
  paymentMethod: Joi.string().trim().required(),
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

export const orderIdParamSchema = Joi.object({
  id: Joi.string().required(),
});
