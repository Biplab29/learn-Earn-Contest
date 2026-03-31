import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
   
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email message
  const message = `
    <h2>Password Reset</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  // Send email
  await sendEmail(user.email, "Password Reset", message);

  res.status(200).json({
    message: "Reset link sent to your email",
    resetToken,
  });
});

console.log("forgot paswword controller is working")