

import express from "express";
import {
  deleteUser,
  getAllUsers,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/auth.controller.js";

import { authorizeRoles, verifyJWT } from "../middleware/checkAuthUser.js";
import { userValidationRules, validate } from "../middleware/userValidator.js";
import { forgotPassword } from "../controllers/forgotPassword.controller.js";
import { resetPassword } from "../controllers/resetPassword.controller.js";
import { uploadProfilePicture } from "../middleware/uploadMiddleware.js";

const userRouter = express.Router();


// register a new user
// =====================================================
userRouter.post(
  "/register",
  uploadProfilePicture.single("profilePicture"),
  userValidationRules,
  validate,
  registerUser
);

// login user
// =====================================================
userRouter.post("/login", loginUser);


//get one user by id
// =====================================================
userRouter.get("/user/:id", verifyJWT, getSingleUser);

// user can update self, admin can update any user
// =====================================================
userRouter.put("/user/update/:id", verifyJWT, updateUser);



// get all users
// =====================================================
userRouter.get("/users", verifyJWT, getAllUsers);


//logout user
// =====================================================
userRouter.post("/user/logout", verifyJWT, logoutUser);


// send forgot password reset link
// =====================================================
userRouter.post("/forgot-password", forgotPassword);


// reset password with token
// =====================================================
userRouter.post("/reset-password/:token", resetPassword);

userRouter.put("/reset-password/:token", resetPassword);


// admin can delete a user
// =====================================================
userRouter.delete(
  "/delete/user/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteUser
);

export default userRouter;

console.log("auth route is working");
