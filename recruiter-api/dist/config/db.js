"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectToDatabase() {
    mongoose_1.default.set("autoIndex", env_1.env.NODE_ENV !== "production");
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            family: 4,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown MongoDB connection failure";
        throw new Error(`Failed to connect to MongoDB. Check MONGODB_URI, Atlas Network Access, and database credentials. Original error: ${message}`);
    }
}
