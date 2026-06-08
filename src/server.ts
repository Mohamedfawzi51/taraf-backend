import { env } from "./config/env";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { logger } from "./utils/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.port, "0.0.0.0", () => {
      logger.info(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();
