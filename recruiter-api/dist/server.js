"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const socket_1 = require("./socket");
async function bootstrap() {
    await (0, db_1.connectToDatabase)();
    const app = (0, app_1.createApp)();
    const server = (0, http_1.createServer)(app);
    (0, socket_1.attachSocketServer)(server);
    const shutdown = async (signal) => {
        console.log(`${signal} received. Shutting down HYREME recruiter API...`);
        server.close(async () => {
            await mongoose_1.default.connection.close().catch(() => undefined);
            process.exit(0);
        });
    };
    process.on("SIGINT", () => {
        void shutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
        void shutdown("SIGTERM");
    });
    server.listen(env_1.env.PORT, () => {
        console.log(`HYREME recruiter API listening on port ${env_1.env.PORT}`);
    });
}
bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
});
