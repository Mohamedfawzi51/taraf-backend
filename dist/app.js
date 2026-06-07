"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const product_1 = require("./modules/product");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.get("/", (_req, res) => {
    res.json({
        message: "API is running",
    });
});
app.use("/api/products", product_1.productRoutes);
app.use(errorHandler_1.errorHandler);
exports.default = app;
