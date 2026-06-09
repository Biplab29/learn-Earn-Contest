
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");

  // validate email input
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return next(new ErrorHandler("Valid email is required", 400));
  }

  const user = await User.findOne({ email: normalizedEmail });


  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  // store hashed token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px;">
        We received a request to reset your password. Click the button below to choose a new one:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #999; font-size: 14px;">
        This link will expire in <strong>10 minutes</strong>.
      </p>
      <p style="color: #777; font-size: 13px; word-break: break-all;">
        If the button does not work, copy and paste this link into your browser:
        <br />
        ${resetUrl}
      </p>
    </div>
  `;

  try {
    await sendEmail(user.email, "Password Reset", message);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message || "Failed to send reset email", 500));
  }

  return res.status(200).json({
    success: true,
    message: "If an account with that email exists, a reset link has been sent",
  });
});
