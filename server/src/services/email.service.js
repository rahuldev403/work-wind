import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.email_user,
    pass: ENV.email_password,
  },
});

export const sendOTPEmail = async (email, otp, purpose) => {
  const subject = {
    registration: "Verify Your Account",
    login: "Your Login Verification Code",
    "password-reset": "Reset Your Password",
  }[purpose];

  const message = {
    registration: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    login: `Your login verification code is: ${otp}. This code will expire in 5 minutes.`,
    "password-reset": `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
  }[purpose];

  const mailOptions = {
    from: ENV.email_user,
    to: email,
    subject: subject,
    html: `
      <h2>${subject}</h2>
      <p>${message}</p>
      <h1 style="color: #4CAF50;">${otp}</h1>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = sendOTPEmail;
