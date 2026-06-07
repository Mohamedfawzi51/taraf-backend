"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema, target = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            res.status(400).json({
                message: "Validation failed",
                errors: error.details.map((detail) => ({
                    field: detail.path.join("."),
                    message: detail.message,
                })),
            });
            return;
        }
        req[target] = value;
        next();
    };
};
exports.validate = validate;
