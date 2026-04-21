
// import crypto from "crypto";
// import asyncHandler from "../middleware/asyncHandler.js";
// import { User } from "../models/user.model.js";

// export const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const password = req.body.password || req.body.newPassword;
//   const confirmPassword =
//     req.body.confirmPassword || req.body.confirmNewPassword;

//   if (!token) {
//     return res.status(400).json({
//       message: "Reset token is required",
//     });
//   }

//   if (!password) {
//     return res.status(400).json({
//       message: "Password is required",
//     });
//   }

//   if (confirmPassword && password !== confirmPassword) {
//     return res.status(400).json({
//       message: "Passwords do not match",
//     });
//   }

//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({
//       message: "Token invalid or expired",
//     });
//   }

//   user.password = password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();

//   res.status(200).json({
//     message: "Password reset successful",
//   });
// });

// console.log("reset password controller is working");



import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";


// =====================================================
// RESET PASSWORD
// verify reset token and set a new password
// =====================================================
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

 // support multiple request body field names
  const rawPassword = req.body.password || req.body.newPassword;
  const rawConfirmPassword =
    req.body.confirmPassword || req.body.confirmNewPassword;

  const password = rawPassword?.trim();
  const confirmPassword = rawConfirmPassword?.trim();

// reset token is required
  if (!token) {
    return res.status(400).json({
      message: "Reset token is required",
    });
  }

  //password is required
  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }
//validate minimum password length
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  // confirm password is required
  if (!confirmPassword) {
    return res.status(400).json({
      message: "Confirm password is required",
    });
  }

// check password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
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
    return res.status(400).json({
      message: "Token invalid or expired",
    });
  }

  // set new password
  user.password = password;

 //clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  //save user (password will be hashed by pre-save hook)
  
  await user.save();

  return res.status(200).json({
    message: "Password reset successful",
  });
});

console.log("reset password controller is working");