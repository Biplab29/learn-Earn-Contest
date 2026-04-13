import express from 'express';
import { deleteUser, getAllUsers, getSingleUser, loginUser, logoutUser, registerUser, updateUser } from '../controllers/auth.controller.js';
import { authorizeRoles, verifyJWT } from '../middleware/checkAuthUser.js';
import { userValidationRules, validate } from '../middleware/userValidator.js';
import { forgotPassword } from '../controllers/forgotPassword.controller.js';
import { resetPassword } from '../controllers/resetPassword.controller.js';

const userRouter = express.Router();


userRouter.post("/register",  userValidationRules, validate, registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/user/:id", verifyJWT, getSingleUser);
userRouter.put("/user/update/:id", verifyJWT, authorizeRoles("admin"),updateUser)
userRouter.get("/users", verifyJWT, getAllUsers);
userRouter.post("/user/logout", verifyJWT, logoutUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
//userRouter.patch("/reset-password/:token", resetPassword);
userRouter.put("/reset-password/:token", resetPassword);
userRouter.delete("/delete/user/:id", verifyJWT, authorizeRoles("admin"), deleteUser);

export default userRouter;

console.log("auth route is working");
