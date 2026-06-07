import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import v1Routes from "./routes/v1";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
    exposedHeaders: ["X-Session-Id"],
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

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
