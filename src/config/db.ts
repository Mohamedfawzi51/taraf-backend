import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "../utils/logger";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ["error"] : ["error", "warn"],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  await prisma.$connect();
  logger.info("PostgreSQL connected via Prisma");
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};
