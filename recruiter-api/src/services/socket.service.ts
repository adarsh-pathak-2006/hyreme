import type { Server } from "socket.io";

let ioRef: Server | null = null;

export function setSocketServer(io: Server) {
  ioRef = io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  ioRef?.to(`user:${userId}`).emit(event, payload);
}

export function emitToRole(role: "candidate" | "recruiter" | "admin", event: string, payload: unknown) {
  ioRef?.to(`role:${role}`).emit(event, payload);
}
