"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketServer = setSocketServer;
exports.emitToUser = emitToUser;
exports.emitToRole = emitToRole;
let ioRef = null;
function setSocketServer(io) {
    ioRef = io;
}
function emitToUser(userId, event, payload) {
    ioRef?.to(`user:${userId}`).emit(event, payload);
}
function emitToRole(role, event, payload) {
    ioRef?.to(`role:${role}`).emit(event, payload);
}
