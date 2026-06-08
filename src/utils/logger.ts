import { isProduction } from "../config/env";

type LogLevel = "info" | "warn" | "error" | "debug";

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  if (level === "debug" && isProduction) return;

  const prefix = `[${level.toUpperCase()}]`;
  if (meta !== undefined) {
    console[level === "debug" ? "log" : level](prefix, message, meta);
    return;
  }
  console[level === "debug" ? "log" : level](prefix, message);
};

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
};
