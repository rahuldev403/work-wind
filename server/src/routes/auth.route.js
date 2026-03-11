import express from "express";
import {
  refresh,
  signIn,
  signOut,
  sigUp,
  verifyRegistrationOTP,
  forgotPassword,
  resetPassword,
  resendOTP,
} from "../controller/auth.controller.js";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.middleware.js";
import ApiResponse from "../utils/ApiRersponse.js";

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "too many login requrests,try again later",
});

const authRoute = express.Router();

authRoute.post("/signup", sigUp);
authRoute.post("/verify-registration", verifyRegistrationOTP);
authRoute.post("/forgot-password", forgotPassword);
authRoute.post("/reset-password", resetPassword);
authRoute.post("/resend-otp", resendOTP);
authRoute.post("/signin", authLimiter, signIn);
authRoute.post("/refresh", refresh);
authRoute.post("/signout", signOut);
authRoute.get("/me", requireAuth, (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Authenticated user"));
});
export default authRoute;
