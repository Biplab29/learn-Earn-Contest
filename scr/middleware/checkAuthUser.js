import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const cookieToken = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized access. No token provided");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }

    throw new ApiError(401, "Invalid token");
  }

  const user = await User.findById(decoded.id || decoded._id).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordExpire -profilePicturePublicId"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Account is inactive");
  }

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized access"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role (${req.user.role}) is not allowed`)
      );
    }

    next();
  };
};
