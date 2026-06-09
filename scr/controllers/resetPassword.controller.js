
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// =====================================================
// RESET PASSWORD
// verify reset token and set a new password
// =====================================================
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

 // support multiple request body field names
  const rawPassword = req.body.password || req.body.newPassword;
  const rawConfirmPassword =
    req.body.confirmPassword || req.body.confirmNewPassword;

  const password = rawPassword?.trim();
  const confirmPassword = rawConfirmPassword?.trim();

// reset token is required
  if (!token) {
    return next(new ErrorHandler("Reset token is required", 400));
  }

  //password is required
  if (!password) {
    return next(new ErrorHandler("Password is required", 400));
  }
//validate minimum password length
  if (password.length < 6) {
    return next(new ErrorHandler("Password must be at least 6 characters long", 400));
  }

  // confirm password is required
  if (!confirmPassword) {
    return next(new ErrorHandler("Confirm password is required", 400));
  }

// check password confirmation
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

// hash the reset token to match DB value
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

//find user by valid and unexpired reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token invalid or expired", 400));
  }

  // set new password
  user.password = password;

 //clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  //save user (password will be hashed by pre-save hook)
  
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

console.log("reset password controller is working");
