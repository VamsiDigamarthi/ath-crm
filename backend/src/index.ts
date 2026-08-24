import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import { errorHandler } from "./middlewares/error-handler.js";
import { NotFoundError } from "./errors/not-found-error.js";
import { rootRouter } from "./routes/index.js";
import { currentUser } from "./middlewares/current-user.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS Origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:7000",
      "http://localhost:3000",
      "http://localhost:80",
      "http://localhost",
    ];

// 1. CORS MUST BE FIRST SO ALL RESPONSES & PREFLIGHTS RECEIVE HEADERS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// 2. Security Headers & Logging
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));

// 3. Body & Cookie Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// 4. Rate Limiting (Never block OPTIONS preflights, generous window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Never rate limit CORS preflights
});
app.use("/api", limiter);

// 5. Global Auth Middleware - Populates req.currentUser
app.use(currentUser);

// 6. All API routes consolidated under /api
app.use("/api", rootRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Auth Backend is running!");
});

// Handle 404 routes
app.use(async () => {
  throw new NotFoundError();
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
