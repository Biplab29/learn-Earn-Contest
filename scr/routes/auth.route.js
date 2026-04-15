// import express from 'express';
// import { deleteUser, getAllUsers, getSingleUser, loginUser, logoutUser, registerUser, updateUser } from '../controllers/auth.controller.js';
// import { authorizeRoles, verifyJWT } from '../middleware/checkAuthUser.js';
// import { userValidationRules, validate } from '../middleware/userValidator.js';
// import { forgotPassword } from '../controllers/forgotPassword.controller.js';
// import { resetPassword } from '../controllers/resetPassword.controller.js';
// import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

// const userRouter = express.Router();


// userRouter.post(
//   "/register",
//   uploadProfilePicture.single("profilePicture"),
//   userValidationRules,
//   validate,
//   registerUser
// );
// userRouter.post("/login", loginUser);
// userRouter.get("/user/:id", verifyJWT, getSingleUser);
// userRouter.put("/user/update/:id", verifyJWT, authorizeRoles("admin"),updateUser)
// userRouter.get("/users", verifyJWT, getAllUsers);
// userRouter.post("/user/logout", verifyJWT, logoutUser);
// userRouter.post("/forgot-password", forgotPassword);
// userRouter.post("/reset-password/:token", resetPassword);
// userRouter.put("/reset-password/:token", resetPassword);
// userRouter.delete("/delete/user/:id", verifyJWT, authorizeRoles("admin"), deleteUser);

// export default userRouter;

// console.log("auth route is working");

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


// =====================================================
// REGISTER
// বাংলা: নতুন user register করবে
// English: register a new user
// =====================================================
userRouter.post(
  "/register",
  uploadProfilePicture.single("profilePicture"),
  userValidationRules,
  validate,
  registerUser
);


// =====================================================
// LOGIN
// বাংলা: user login করবে
// English: login user
// =====================================================
userRouter.post("/login", loginUser);


// =====================================================
// GET SINGLE USER
// বাংলা: single user details দেখাবে
// English: get one user by id
// =====================================================
userRouter.get("/user/:id", verifyJWT, getSingleUser);


// =====================================================
// UPDATE USER
// বাংলা: user নিজের profile update করতে পারবে, admin অন্য user update করতে পারবে
// English: user can update self, admin can update any user
// =====================================================
userRouter.put("/user/update/:id", verifyJWT, updateUser);


// =====================================================
// GET ALL USERS
// বাংলা: সব user list, শুধু admin দেখতে পারবে
// English: get all users, admin only
// =====================================================
userRouter.get("/users", verifyJWT, authorizeRoles("admin"), getAllUsers);


// =====================================================
// LOGOUT
// বাংলা: user logout করবে
// English: logout user
// =====================================================
userRouter.post("/user/logout", verifyJWT, logoutUser);


// =====================================================
// FORGOT PASSWORD
// বাংলা: forgot password mail পাঠাবে
// English: send forgot password reset link
// =====================================================
userRouter.post("/forgot-password", forgotPassword);


// =====================================================
// RESET PASSWORD
// বাংলা: reset token দিয়ে নতুন password set করবে
// English: reset password with token
// =====================================================
userRouter.post("/reset-password/:token", resetPassword);
// চাইলে এটা remove করে শুধু PUT রাখতে পারো
userRouter.put("/reset-password/:token", resetPassword);


// =====================================================
// DELETE USER
// বাংলা: admin user delete করতে পারবে
// English: admin can delete a user
// =====================================================
userRouter.delete(
  "/delete/user/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteUser
);

export default userRouter;

console.log("auth route is working");
