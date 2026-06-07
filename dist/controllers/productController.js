"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariant = exports.getVariants = exports.createVariant = exports.deleteProductImage = exports.addProductImages = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
const parseJsonField = (value, fallback) => {
    if (typeof value !== "string") {
        return fallback;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
};
const parseBoolean = (value, fallback) => {
    if (value === undefined || value === null) {
        return fallback;
    }
    return value === "true" || value === true;
};
const getParam = (value) => Array.isArray(value) ? value[0] : value;
const isUniqueConstraintError = (error) => error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002";
const createProduct = async (req, res) => {
    try {
        const { name, description, category, brand, tags, isActive, isFeatured } = req.body;
        if (!name || !description) {
            res.status(400).json({ message: "Name and description are required" });
            return;
        }
        const slug = slugify(name);
        const existingProduct = await db_1.prisma.product.findUnique({ where: { slug } });
        if (existingProduct) {
            res.status(409).json({ message: "A product with this name already exists" });
            return;
        }
        const files = req.files;
        const parsedTags = parseJsonField(tags, []);
        let imageData = [];
        if (files?.length) {
            const uploaded = await (0, cloudinaryUpload_1.uploadManyToCloudinary)(files);
            imageData = uploaded.map((image, index) => ({
                ...image,
                isPrimary: index === 0,
            }));
        }
        const product = await db_1.prisma.product.create({
            data: {
                name,
                slug,
                description,
                category,
                brand,
                tags: Array.isArray(parsedTags) ? parsedTags : [],
                isActive: parseBoolean(isActive, true),
                isFeatured: parseBoolean(isFeatured, false),
                images: imageData.length
                    ? { create: imageData }
                    : undefined,
            },
            include: { images: true, variants: true },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createProduct = createProduct;
const getProducts = async (_req, res) => {
    try {
        const products = await db_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { images: true },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: getParam(req.params.id) },
            include: { images: true, variants: true },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const { name, description, category, brand, tags, isActive, isFeatured } = req.body;
        const data = {};
        if (name) {
            data.name = name;
            data.slug = slugify(name);
        }
        if (description)
            data.description = description;
        if (category !== undefined)
            data.category = category;
        if (brand !== undefined)
            data.brand = brand;
        if (tags !== undefined) {
            const parsedTags = parseJsonField(tags, []);
            data.tags = Array.isArray(parsedTags) ? parsedTags : [];
        }
        if (isActive !== undefined) {
            data.isActive = parseBoolean(isActive, true);
        }
        if (isFeatured !== undefined) {
            data.isFeatured = parseBoolean(isFeatured, false);
        }
        const product = await db_1.prisma.product.update({
            where: { id: getParam(req.params.id) },
            data,
            include: { images: true, variants: true },
        });
        res.json(product);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (isUniqueConstraintError(error)) {
            res.status(409).json({ message: "A product with this name already exists" });
            return;
        }
        res.status(500).json({
            message: "Failed to update product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: getParam(req.params.id) },
            include: { images: true },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        await Promise.all(product.images.map((image) => (0, cloudinaryUpload_1.deleteFromCloudinary)(image.publicId)));
        await db_1.prisma.product.delete({ where: { id: product.id } });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteProduct = deleteProduct;
const addProductImages = async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: getParam(req.params.id) },
            include: { images: true },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const files = req.files;
        if (!files?.length) {
            res.status(400).json({ message: "At least one image is required" });
            return;
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
        const updatedProduct = await db_1.prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true, variants: true },
        });
        res.status(201).json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to add product images",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addProductImages = addProductImages;
const deleteProductImage = async (req, res) => {
    try {
        const publicId = req.query.publicId;
        if (!publicId) {
            res.status(400).json({ message: "publicId query parameter is required" });
            return;
        }
        const image = await db_1.prisma.productImage.findFirst({
            where: {
                publicId,
                productId: getParam(req.params.id),
            },
        });
        if (!image) {
            res.status(404).json({ message: "Image not found" });
            return;
        }
        await (0, cloudinaryUpload_1.deleteFromCloudinary)(image.publicId);
        await db_1.prisma.productImage.delete({ where: { id: image.id } });
        if (image.isPrimary) {
            const nextPrimary = await db_1.prisma.productImage.findFirst({
                where: { productId: getParam(req.params.id) },
                orderBy: { createdAt: "asc" },
            });
            if (nextPrimary) {
                await db_1.prisma.productImage.update({
                    where: { id: nextPrimary.id },
                    data: { isPrimary: true },
                });
            }
        }
        const product = await db_1.prisma.product.findUnique({
            where: { id: getParam(req.params.id) },
            include: { images: true, variants: true },
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete product image",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteProductImage = deleteProductImage;
const createVariant = async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: getParam(req.params.productId) },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const { sku, name, attributes, price, compareAtPrice, stock, isActive } = req.body;
        if (!sku || price === undefined) {
            res.status(400).json({ message: "SKU and price are required" });
            return;
        }
        const variant = await db_1.prisma.productVariant.create({
            data: {
                productId: product.id,
                sku: String(sku).toUpperCase(),
                name,
                attributes: attributes ?? {},
                price: Number(price),
                compareAtPrice: compareAtPrice !== undefined ? Number(compareAtPrice) : undefined,
                stock: stock !== undefined ? Number(stock) : 0,
                isActive: isActive ?? true,
            },
        });
        res.status(201).json(variant);
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            res.status(409).json({ message: "SKU already exists" });
            return;
        }
        res.status(500).json({
            message: "Failed to create variant",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createVariant = createVariant;
const getVariants = async (req, res) => {
    try {
        const variants = await db_1.prisma.productVariant.findMany({
            where: { productId: getParam(req.params.productId) },
            orderBy: { createdAt: "desc" },
        });
        res.json(variants);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch variants",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getVariants = getVariants;
const updateVariant = async (req, res) => {
    try {
        const existing = await db_1.prisma.productVariant.findFirst({
            where: {
                id: getParam(req.params.variantId),
                productId: getParam(req.params.productId),
            },
        });
        if (!existing) {
            res.status(404).json({ message: "Variant not found" });
            return;
        }
        const { sku, name, attributes, price, compareAtPrice, stock, isActive } = req.body;
        const data = {};
        if (sku !== undefined)
            data.sku = String(sku).toUpperCase();
        if (name !== undefined)
            data.name = name;
        if (attributes !== undefined)
            data.attributes = attributes;
        if (price !== undefined)
            data.price = Number(price);
        if (compareAtPrice !== undefined) {
            data.compareAtPrice = Number(compareAtPrice);
        }
        if (stock !== undefined)
            data.stock = Number(stock);
        if (isActive !== undefined)
            data.isActive = Boolean(isActive);
        const variant = await db_1.prisma.productVariant.update({
            where: { id: existing.id },
            data,
        });
        res.json(variant);
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            res.status(409).json({ message: "SKU already exists" });
            return;
        }
        res.status(500).json({
            message: "Failed to update variant",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateVariant = updateVariant;
const deleteVariant = async (req, res) => {
    try {
        const existing = await db_1.prisma.productVariant.findFirst({
            where: {
                id: getParam(req.params.variantId),
                productId: getParam(req.params.productId),
            },
        });
        if (!existing) {
            res.status(404).json({ message: "Variant not found" });
            return;
        }
        await db_1.prisma.productVariant.delete({ where: { id: existing.id } });
        res.json({ message: "Variant deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete variant",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteVariant = deleteVariant;
