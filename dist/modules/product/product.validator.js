"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVariantSchema = exports.createVariantSchema = exports.deleteImageQuerySchema = exports.variantParamsSchema = exports.productIdParamSchema = exports.idParamSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const booleanField = joi_1.default.boolean().truthy("true", "1").falsy("false", "0");
const tagsField = joi_1.default.alternatives()
    .try(joi_1.default.array().items(joi_1.default.string().trim()), joi_1.default.string().custom((value, helpers) => {
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            return helpers.error("any.invalid");
        }
        return parsed;
    }
    catch {
        return helpers.error("any.invalid");
    }
}, "JSON array"))
    .default([]);
const idParam = joi_1.default.string().trim().required();
exports.createProductSchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(1).max(200).required(),
    description: joi_1.default.string().trim().min(1).required(),
    category: joi_1.default.string().trim().allow("", null),
    brand: joi_1.default.string().trim().allow("", null),
    tags: tagsField,
    isActive: booleanField.default(true),
    isFeatured: booleanField.default(false),
});
exports.updateProductSchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(1).max(200),
    description: joi_1.default.string().trim().min(1),
    category: joi_1.default.string().trim().allow("", null),
    brand: joi_1.default.string().trim().allow("", null),
    tags: tagsField,
    isActive: booleanField,
    isFeatured: booleanField,
}).min(1);
exports.idParamSchema = joi_1.default.object({
    id: idParam,
});
exports.productIdParamSchema = joi_1.default.object({
    productId: idParam,
});
exports.variantParamsSchema = joi_1.default.object({
    productId: idParam,
    variantId: idParam,
});
exports.deleteImageQuerySchema = joi_1.default.object({
    publicId: joi_1.default.string().trim().required(),
});
exports.createVariantSchema = joi_1.default.object({
    sku: joi_1.default.string().trim().uppercase().min(1).max(100).required(),
    name: joi_1.default.string().trim().allow("", null),
    attributes: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.string()).default({}),
    price: joi_1.default.number().min(0).required(),
    compareAtPrice: joi_1.default.number().min(0),
    stock: joi_1.default.number().integer().min(0).default(0),
    isActive: booleanField.default(true),
});
exports.updateVariantSchema = joi_1.default.object({
    sku: joi_1.default.string().trim().uppercase().min(1).max(100),
    name: joi_1.default.string().trim().allow("", null),
    attributes: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.string()),
    price: joi_1.default.number().min(0),
    compareAtPrice: joi_1.default.number().min(0).allow(null),
    stock: joi_1.default.number().integer().min(0),
    isActive: booleanField,
}).min(1);
