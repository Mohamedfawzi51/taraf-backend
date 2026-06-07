import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().pattern(/^\+966\d{9}$/).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+966\d{9}$/),
  avatar: Joi.string().uri().allow("", null),
}).min(1);

export const addressSchema = Joi.object({
  label: Joi.string().trim().required(),
  icon: Joi.string().valid("home", "work").default("home"),
  line1: Joi.string().trim().required(),
  line2: Joi.string().trim().allow("", null),
  city: Joi.string().trim().required(),
  country: Joi.string().trim().default("SA"),
  isDefault: Joi.boolean().default(false),
});
