"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.productService = exports.productRoutes = void 0;
var product_routes_1 = require("./product.routes");
Object.defineProperty(exports, "productRoutes", { enumerable: true, get: function () { return __importDefault(product_routes_1).default; } });
var product_service_1 = require("./product.service");
Object.defineProperty(exports, "productService", { enumerable: true, get: function () { return product_service_1.productService; } });
var product_controller_1 = require("./product.controller");
Object.defineProperty(exports, "productController", { enumerable: true, get: function () { return product_controller_1.productController; } });
