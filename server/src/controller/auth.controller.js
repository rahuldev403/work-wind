import { ENV } from "../config/env.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRersponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashOtp, verifyOTP, isOTPExpired } from "../utils/otp.js";
import { sendOtpEmail } from "../services/email.service.js";

const isProduction = ENV.node_env === "production";
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No active session");
  }
  const decoded = jwt.verify(refreshToken, ENV.jwt_refresh_secret);
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken != refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const newAccessToken = user.generateAccessToken();
  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };

  return res
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .json(new ApiResponse(200, null, "accesstoken refresh successfull"));
});
export const sigUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!name || !email || !password) {
    throw new ApiError(401, "All feilds are required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new ApiError(400, "Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new ApiError(400, "Password is weak");
  }
  const existingUser = await User.findOne({ email: normalizedEmail });

  const otp = generateOTP();
  const hashedOtp = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  let user;
  if (existingUser) {
    user = existingUser;
    user.name = name;
    user.password = password;
    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = "registration";
    user.otpAttempts = 0;
    await user.save();
  } else {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      otp: hashedOtp,
      otpExpiry,
      otpPurpose: "registration",
      isVerified: false,
    });
  }

  await sendOtpEmail(normalizedEmail, otp, "registration");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: normalizedEmail },
        "OTP sent to your email. Please verify to complete registration.",
      ),
    );
});

export const verifyRegistrationOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }
  const user = await User.findOne({
    email: normalizedEmail,
    otpPurpose: "registration",
  });
  if (!user) {
    throw new ApiError(404, "User not found or OTP not requested");
  }
  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }
  if (user.otpAttempts >= 5) {
    throw new ApiError(
      429,
      "Too many failed attempts. Please request a new OTP.",
    );
  }
  if (isOTPExpired(user.otpExpiry)) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }
  if (!verifyOTP(otp, user.otp)) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: true });
    throw new ApiError(
      400,
      `Invalid OTP.${5 - user.otpAttempts} attempts remaining.`,
    );
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, safeUser, "Registration successful!"));
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const otp = generateOTP();
  const hashedOTP = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = hashedOTP;
  user.otpExpiry = otpExpiry;
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail(normalizedEmail, otp, purpose);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!email || !password) {
    throw new ApiError(400, "all feilds are required");
  }

  if (!validator.isEmail(normalizedEmail)) {
    throw new ApiError(400, "invalid email format");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(400, "user not found");
  }
  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email first");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "invalid credentials");
  }
  const accessToken = user.generateAccessToken();
  const refreshtoken = user.generateRefreshToken();
  user.refreshToken = refreshtoken;
  await user.save({ validateBeforeSave: false });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };
  const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshtoken, refreshTokenOptions)
    .json(new ApiResponse(200, safeUser, "user signin successfully"));
});
export const signOut = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, null, "user signedout successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!validator.isEmail(normalizedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If an account exists with this email, you will receive a password reset code.",
        ),
      );
  }
  const otp = generateOTP();
  const hashedOTP = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = hashedOTP;
  user.otpExpiry = otpExpiry;
  user.otpPurpose = "password-reset";
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail(normalizedEmail, otp, "password-reset");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If an account exists with this email, you will receive a password reset code.",
      ),
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP, and new password are required");
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw new ApiError(400, "Password is not strong enough");
  }
  const user = await User.findOne({
    email: normalizedEmail,
    otpPurpose: "password-reset",
  });

  if (!user) {
    throw new ApiError(404, "Invalid request");
  }
  if (user.otpAttempts >= 5) {
    throw new ApiError(
      429,
      "Too many failed attempts. Please request a new password reset.",
    );
  }
  if (isOTPExpired(user.otpExpiry)) {
    throw new ApiError(
      400,
      "OTP has expired. Please request a new password reset.",
    );
  }
  if (!verifyOTP(otp, user.otp)) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      400,
      `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`,
    );
  }
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset successful! Please login with your new password.",
      ),
    );
});
