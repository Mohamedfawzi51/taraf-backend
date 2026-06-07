"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const getParam = (value) => Array.isArray(value) ? value[0] : value;
class ProductController {
    constructor() {
        this.createProduct = async (req, res, next) => {
            try {
                const files = req.files;
                const product = await product_service_1.productService.createProduct(req.body, files);
                res.status(201).json(product);
            }
            catch (error) {
                next(error);
            }
        };
        this.getProducts = async (_req, res, next) => {
            try {
                const products = await product_service_1.productService.getProducts();
                res.json(products);
            }
            catch (error) {
                next(error);
            }
        };
        this.getProductById = async (req, res, next) => {
            try {
                const product = await product_service_1.productService.getProductById(getParam(req.params.id));
                res.json(product);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProduct = async (req, res, next) => {
            try {
                const product = await product_service_1.productService.updateProduct(getParam(req.params.id), req.body);
                res.json(product);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteProduct = async (req, res, next) => {
            try {
                await product_service_1.productService.deleteProduct(getParam(req.params.id));
                res.json({ message: "Product deleted successfully" });
            }
            catch (error) {
                next(error);
            }
        };
        this.addProductImages = async (req, res, next) => {
            try {
                const files = req.files;
                const product = await product_service_1.productService.addProductImages(getParam(req.params.id), files ?? []);
                res.status(201).json(product);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteProductImage = async (req, res, next) => {
            try {
                const product = await product_service_1.productService.deleteProductImage(getParam(req.params.id), req.query.publicId);
                res.json(product);
            }
            catch (error) {
                next(error);
            }
        };
        this.createVariant = async (req, res, next) => {
            try {
                const variant = await product_service_1.productService.createVariant(getParam(req.params.productId), req.body);
                res.status(201).json(variant);
            }
            catch (error) {
                next(error);
            }
        };
        this.getVariants = async (req, res, next) => {
            try {
                const variants = await product_service_1.productService.getVariants(getParam(req.params.productId));
                res.json(variants);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateVariant = async (req, res, next) => {
            try {
                const variant = await product_service_1.productService.updateVariant(getParam(req.params.productId), getParam(req.params.variantId), req.body);
                res.json(variant);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteVariant = async (req, res, next) => {
            try {
                await product_service_1.productService.deleteVariant(getParam(req.params.productId), getParam(req.params.variantId));
                res.json({ message: "Variant deleted successfully" });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
