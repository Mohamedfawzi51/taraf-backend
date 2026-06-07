"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
const connectDB = async () => {
    await exports.prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
};
exports.connectDB = connectDB;
