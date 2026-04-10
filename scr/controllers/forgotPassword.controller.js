
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // const message = `
  //   <h2>Password Reset</h2>
  //   <p>Click below to reset your password:</p>
  //   <a href="${resetUrl}">${resetUrl}</a>
  //   <p>This link will expire in 10 minutes.</p>
  // `;

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
    </div>
  `;

  await sendEmail(user.email, "Password Reset", message);

  res.status(200).json({
    message: "Reset link sent to your email",
  });
});