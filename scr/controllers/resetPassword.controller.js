
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const password = req.body.password || req.body.newPassword;
  const confirmPassword =
    req.body.confirmPassword || req.body.confirmNewPassword;

  if (!token) {
    return res.status(400).json({
      message: "Reset token is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Token invalid or expired",
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: "Password reset successful",
  });
});

console.log("reset password controller is working");
