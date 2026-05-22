import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { setSocketServer } from "./services/socket.service";
import { verifyAccessToken } from "./utils/auth";

function parseCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) {
      return cookies;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

export function attachSocketServer(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGINS,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      const accessToken = cookies.hyreme_access_token;
      if (accessToken) {
        const user = verifyAccessToken(accessToken);
        socket.join(`user:${user.id}`);
        socket.join(`role:${user.role}`);
        socket.emit("auth:joined", { userId: user.id, role: user.role });
      }
    } catch {
      socket.emit("auth:error", { message: "Invalid access token." });
    }

    socket.emit("system:ready", {
      message: "HYREME real-time layer connected.",
    });
  });

  setSocketServer(io);
  return io;
}
