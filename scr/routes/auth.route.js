import express from 'express';
import { getAllUsers, getSingleUser, loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';
import { authorizeRoles, verifyJWT } from '../middleware/checkAuthUser.js';
import { userValidationRules, validate } from '../middleware/userValidator.js';
import { forgotPassword } from '../controllers/forgotPassword.controller.js';
import { resetPassword } from '../controllers/resetPassword.controller.js';

const userRouter = express.Router();


userRouter.post("/register",  userValidationRules, validate, registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/user/:id", verifyJWT, getSingleUser);
userRouter.get("/users", verifyJWT, authorizeRoles("admin"), getAllUsers);
userRouter.post("/user/logout", verifyJWT, logoutUser);
userRouter.post("/forgot-password", verifyJWT, forgotPassword);
userRouter.post("/reset-password/:token", verifyJWT, resetPassword);

export default userRouter;

console.log("auth route is working");