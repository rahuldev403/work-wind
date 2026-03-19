import { Resend } from "resend";
import { ENV } from "../config/env.js";

const resend = new Resend(ENV.resend_api_key);

export const sendOTPEmail = async (email, otp, purpose) => {
  if (!ENV.resend_api_key) {
    throw new Error("Missing RESEND_API_KEY in environment variables");
  }

  const subject = {
    signup: "Verify Your Account",
    "password-reset": "Reset Your Password",
  }[purpose];

  const message = {
    signup: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    "password-reset": `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
  }[purpose];

  const fromAddress = ENV.resend_from_email || "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${message}</p>
      <h1 style="color: #4CAF50;">${otp}</h1>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(`Resend email error: ${error.message}`);
  }
};

export const sendOtpEmail = sendOTPEmail;
