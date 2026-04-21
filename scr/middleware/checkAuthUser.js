// import jwt from "jsonwebtoken";
// import asyncHandler from "../middleware/asyncHandler.js";
// import  {User}  from "../models/user.model.js";


// const verifyJWT = asyncHandler(async (req, res, next) => {
//   const token =
//     req.cookies?.accessToken ||
//     req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Token not found" });
//   }
// console.log("token", token);

//   let decoded;  

//   try {
//     decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }

//   const user = await User.findById(decoded.id).select("-password");

//   if (!user) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
//   console.log("user", user)

//   req.user = user;

//   next();
// });


// export const authorizeRoles = (...roles) => {
//   return asyncHandler(async (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: `Role (${req.user.role}) is not allowed`,
//       });
//     }

//     next();
//   });
// };

// export {verifyJWT};

// console.log("AuthUser is working");

// import jwt from "jsonwebtoken";
// import asyncHandler from "../middleware/asyncHandler.js";
// import { User } from "../models/user.model.js";

// const verifyJWT = asyncHandler(async (req, res, next) => {

//   const token =
//     req.cookies?.accessToken ||
//     req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Token not found" });
//   }

//   let decoded;

//   try {
//     decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }

//   const user = await User.findById(decoded.id || decoded._id).select("-password");

//   if (!user) {
//     return res.status(401).json({ message: "User not found" });
//   }

//   req.user = user;

//   next();
// });

// export const authorizeRoles = (...roles) => {
//   return asyncHandler(async (req, res, next) => {

//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: `Role (${req.user.role}) is not allowed`,
//       });
//     }

//     next();
//   });
// };

// export { verifyJWT };
// console.log("AuthUser is working");

import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";


// verify JWT from cookie or Authorization header
// =====================================================
const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");

  //safely extract Bearer token from header
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : null;

  // cookie token fast check korbe, na thakle header token
  // prefer cookie token, fallback to header token
  const token = req.cookies?.accessToken || tokenFromHeader;

  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  const user = await User.findById(decoded.id || decoded._id).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordExpire -profilePicturePublicId"
  );

  if (!user) {
    return res.status(401).json({
      message: "User not found",
    });
  }
  req.user = user;

  next();
});

// AUTHORIZE ROLE
//  allow access only for specific roles
// =====================================================
export const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
  
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

   

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed`,
      });
    }

    next();
  });
};

export { verifyJWT };

console.log("Auth middleware is working");