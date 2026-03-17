import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cors from "cors";
import fileUpload from "express-fileupload";
import { ENV } from "./config/env.js";
import authRoute from "./routes/auth.route.js";
import incidentRoute from "./routes/incident.routes.js";
import ApiError from "./utils/ApiError.js";
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "too many request,please try again later",
});

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);
app.use(fileUpload());
app.use(
  cors({
    origin: ENV.client_url || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/auth", authRoute);
app.use("/api/incidents", incidentRoute);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
});
