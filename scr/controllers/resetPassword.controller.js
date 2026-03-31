import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
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

  // Set new password
  user.password = password;

  // Clear fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: "Password reset successful",
  });
});

console.log("reset password controller is working")