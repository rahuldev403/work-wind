import crypto from "crypto";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOTP = (inputOTP, hashedOTP) => {
  const hashedInput = hashOtp(inputOTP);
  return hashedInput === hashedOTP;
};

export const isOTPExpired = (otpExpiry) => {
  return new Date() > new Date(otpExpiry);
};
