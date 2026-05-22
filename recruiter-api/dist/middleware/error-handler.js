"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const app_error_1 = require("../utils/app-error");
function notFound(_req, _res, next) {
    next(new app_error_1.AppError("Route not found", 404));
}
function errorHandler(error, _req, res, _next) {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            issues: error.flatten(),
        });
    }
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    const fallbackMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message: fallbackMessage });
}
