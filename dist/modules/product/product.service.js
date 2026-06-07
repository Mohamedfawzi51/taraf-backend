"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
const errors_1 = require("../../utils/errors");
const cloudinaryUpload_1 = require("../../utils/cloudinaryUpload");
const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
const isUniqueConstraintError = (error) => error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002";
const isNotFoundError = (error) => error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
class ProductService {
    async createProduct(data, files) {
        const slug = slugify(data.name);
        const existingProduct = await db_1.prisma.product.findUnique({ where: { slug } });
        if (existingProduct) {
            throw new errors_1.AppError(409, "A product with this name already exists");
        }
        let imageData = [];
        if (files?.length) {
            const uploaded = await (0, cloudinaryUpload_1.uploadManyToCloudinary)(files);
            imageData = uploaded.map((image, index) => ({
                ...image,
                isPrimary: index === 0,
            }));
        }
        return db_1.prisma.product.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                category: data.category || null,
                brand: data.brand || null,
                tags: data.tags ?? [],
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                images: imageData.length ? { create: imageData } : undefined,
            },
            include: { images: true, variants: true },
        });
    }
    async getProducts() {
        return db_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { images: true },
        });
    }
    async getProductById(id) {
        const product = await db_1.prisma.product.findUnique({
            where: { id },
            include: { images: true, variants: true },
        });
        if (!product) {
            throw new errors_1.AppError(404, "Product not found");
        }
        return product;
    }
    async updateProduct(id, data) {
        const updateData = {};
        if (data.name) {
            updateData.name = data.name;
            updateData.slug = slugify(data.name);
        }
        if (data.description)
            updateData.description = data.description;
        if (data.category !== undefined)
            updateData.category = data.category || null;
        if (data.brand !== undefined)
            updateData.brand = data.brand || null;
        if (data.tags !== undefined)
            updateData.tags = data.tags;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.isFeatured !== undefined)
            updateData.isFeatured = data.isFeatured;
        try {
            return await db_1.prisma.product.update({
                where: { id },
                data: updateData,
                include: { images: true, variants: true },
            });
        }
        catch (error) {
            if (isNotFoundError(error)) {
                throw new errors_1.AppError(404, "Product not found");
            }
            if (isUniqueConstraintError(error)) {
                throw new errors_1.AppError(409, "A product with this name already exists");
            }
            throw error;
        }
    }
    async deleteProduct(id) {
        const product = await db_1.prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!product) {
            throw new errors_1.AppError(404, "Product not found");
        }
        await Promise.all(product.images.map((image) => (0, cloudinaryUpload_1.deleteFromCloudinary)(image.publicId)));
        await db_1.prisma.product.delete({ where: { id: product.id } });
    }
    async addProductImages(id, files) {
        const product = await db_1.prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!product) {
            throw new errors_1.AppError(404, "Product not found");
        }
        if (!files.length) {
            throw new errors_1.AppError(400, "At least one image is required");
        }
        const uploaded = await (0, cloudinaryUpload_1.uploadManyToCloudinary)(files);
        const hasPrimary = product.images.some((image) => image.isPrimary);
        await db_1.prisma.productImage.createMany({
            data: uploaded.map((image, index) => ({
                url: image.url,
                publicId: image.publicId,
                productId: product.id,
                isPrimary: !hasPrimary && index === 0,
            })),
        });
        return db_1.prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true, variants: true },
        });
    }
    async deleteProductImage(id, publicId) {
        const image = await db_1.prisma.productImage.findFirst({
            where: { publicId, productId: id },
        });
        if (!image) {
            throw new errors_1.AppError(404, "Image not found");
        }
        await (0, cloudinaryUpload_1.deleteFromCloudinary)(image.publicId);
        await db_1.prisma.productImage.delete({ where: { id: image.id } });
        if (image.isPrimary) {
            const nextPrimary = await db_1.prisma.productImage.findFirst({
                where: { productId: id },
                orderBy: { createdAt: "asc" },
            });
            if (nextPrimary) {
                await db_1.prisma.productImage.update({
                    where: { id: nextPrimary.id },
                    data: { isPrimary: true },
                });
            }
        }
        return db_1.prisma.product.findUnique({
            where: { id },
            include: { images: true, variants: true },
        });
    }
    async createVariant(productId, data) {
        const product = await db_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new errors_1.AppError(404, "Product not found");
        }
        try {
            return await db_1.prisma.productVariant.create({
                data: {
                    productId: product.id,
                    sku: data.sku.toUpperCase(),
                    name: data.name || null,
                    attributes: data.attributes ?? {},
                    price: data.price,
                    compareAtPrice: data.compareAtPrice,
                    stock: data.stock ?? 0,
                    isActive: data.isActive ?? true,
                },
            });
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new errors_1.AppError(409, "SKU already exists");
            }
            throw error;
        }
    }
    async getVariants(productId) {
        return db_1.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
        });
    }
    async updateVariant(productId, variantId, data) {
        const existing = await db_1.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!existing) {
            throw new errors_1.AppError(404, "Variant not found");
        }
        const updateData = {};
        if (data.sku !== undefined)
            updateData.sku = data.sku.toUpperCase();
        if (data.name !== undefined)
            updateData.name = data.name || null;
        if (data.attributes !== undefined)
            updateData.attributes = data.attributes;
        if (data.price !== undefined)
            updateData.price = data.price;
        if (data.compareAtPrice !== undefined) {
            updateData.compareAtPrice = data.compareAtPrice;
        }
        if (data.stock !== undefined)
            updateData.stock = data.stock;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        try {
            return await db_1.prisma.productVariant.update({
                where: { id: existing.id },
                data: updateData,
            });
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new errors_1.AppError(409, "SKU already exists");
            }
            throw error;
        }
    }
    async deleteVariant(productId, variantId) {
        const existing = await db_1.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!existing) {
            throw new errors_1.AppError(404, "Variant not found");
        }
        await db_1.prisma.productVariant.delete({ where: { id: existing.id } });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
