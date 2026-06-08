import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import v1Routes from "./routes/v1";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

const app = express();

if (env.isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["X-Session-Id"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Taraf (ترف) Luxury E-Commerce API",
    version: "1.0.0",
    docs: "/api/v1/docs",
  });
});

app.use("/api/v1", v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
