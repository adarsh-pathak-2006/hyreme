"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSocketServer = attachSocketServer;
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const socket_service_1 = require("./services/socket.service");
const auth_1 = require("./utils/auth");
function parseCookieHeader(cookieHeader) {
    if (!cookieHeader) {
        return {};
    }
    return cookieHeader.split(";").reduce((cookies, part) => {
        const [rawKey, ...rawValue] = part.trim().split("=");
        if (!rawKey) {
            return cookies;
        }
        cookies[rawKey] = decodeURIComponent(rawValue.join("="));
        return cookies;
    }, {});
}
function attachSocketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.CLIENT_ORIGINS,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        try {
            const cookies = parseCookieHeader(socket.handshake.headers.cookie);
            const accessToken = cookies.hyreme_access_token;
            if (accessToken) {
                const user = (0, auth_1.verifyAccessToken)(accessToken);
                socket.join(`user:${user.id}`);
                socket.join(`role:${user.role}`);
                socket.emit("auth:joined", { userId: user.id, role: user.role });
            }
        }
        catch {
            socket.emit("auth:error", { message: "Invalid access token." });
        }
        socket.emit("system:ready", {
            message: "HYREME real-time layer connected.",
        });
    });
    (0, socket_service_1.setSocketServer)(io);
    return io;
}
