import express from 'express';
import { getAllUsers, getSingleUser, loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';
import { authorizeRoles, verifyJWT } from '../middleware/checkAuthUser.js';

const userRouter = express.Router();


userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/user/:id", verifyJWT, getSingleUser);
userRouter.get("/users",  verifyJWT,authorizeRoles("admin"),getAllUsers);
userRouter.delete("/user/:id", verifyJWT, authorizeRoles("admin"), logoutUser);


export default userRouter;

console.log("auth route is working");