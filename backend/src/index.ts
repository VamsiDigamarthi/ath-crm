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

// Security & Logging
app.use(helmet()); // Sets various HTTP headers for security
app.use(morgan("dev")); // Logs requests to the console

// Rate Limiting to prevent brute force/spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});


app.use("/api", limiter);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:80", "http://localhost"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Global Auth Middleware - Populates req.currentUser
app.use(currentUser);

// All API routes consolidated under /api
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

// Restart trigger
