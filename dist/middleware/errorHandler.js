"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    if (err.message === "Only image files are allowed") {
        res.status(400).json({ message: err.message });
        return;
    }
    if (err instanceof Error && err.message.includes("File too large")) {
        res.status(400).json({ message: "Image must be 5MB or smaller" });
        return;
    }
    res.status(500).json({
        message: "Internal server error",
        error: err.message,
    });
};
exports.errorHandler = errorHandler;
