const nodeEnv = process.env.NODE_ENV ?? "development";
export const isProduction = nodeEnv === "production";
export const isDevelopment = !isProduction;

if (isDevelopment) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv/config");
}

const requireEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parseCorsOrigins = (value: string | undefined): string[] => {
  const raw = value?.trim();
  if (!raw) {
    if (isProduction) {
      throw new Error("Missing required environment variable: CORS_ORIGIN");
    }
    return ["http://localhost:3001"];
  }
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
};

export const env = {
  nodeEnv,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT) || 3000,
  databaseUrl: requireEnv("DATABASE_URL"),
  directUrl: requireEnv("DIRECT_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "15m",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  cloudinary: {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  },
} as const;
