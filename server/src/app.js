import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { ENV } from "./config/env.js";
import authRoute from "./routes/auth.route.js";
import incidentRoute from "./routes/incident.routes.js";
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "too many request,please try again later",
});
// creating the Express app
export const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);
app.use(
  cors({
    origin: ENV.client_url || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/auth", authRoute);
app.use("/api/incidents", incidentRoute);
