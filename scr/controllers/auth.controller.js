

import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";
import removeCloudinaryFile from "../utils/removeCloudinaryFile.js";
import ErrorHandler from "../utils/ErrorHandler.js";



// REGISTER USER
// register a new user
// =====================================================
export const registerUser = asyncHandler(async (req, res, next) => {
  let createdUser = null;

  try {
    const { name, email, password, phoneNumber, gender } = req.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhoneNumber = phoneNumber?.trim();
    const normalizedGender = gender?.trim();

    const profilePicture = req.file?.path || "";
    const profilePicturePublicId = req.file?.filename || "";

    // validate required fields
    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !normalizedPhoneNumber ||
      !normalizedGender
    ) {
      if (profilePicturePublicId) {
        await removeCloudinaryFile(profilePicturePublicId);
      }

      return next(new ErrorHandler("All fields are required", 400));
    }

    
    // check duplicate email
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      if (profilePicturePublicId) {
        await removeCloudinaryFile(profilePicturePublicId);
      }

      return next(new ErrorHandler("User already exists", 400));
    }

    // create new user
    createdUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      phoneNumber: normalizedPhoneNumber,
      gender: normalizedGender,
      profilePicture,
      profilePicturePublicId,
    });

    const userResponse = createdUser.toObject();
    delete userResponse.password;
    delete userResponse.profilePicturePublicId;
    delete userResponse.refreshToken;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpire;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    if (!createdUser && req.file?.filename) {
      await removeCloudinaryFile(req.file.filename);
    }

    return next(new ErrorHandler(error.message, 500));
  }
});


// update user profile
// =====================================================
export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phoneNumber, gender } = req.body;

  const normalizedName = name?.trim();
  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedPhoneNumber = phoneNumber?.trim();
  const normalizedGender = gender?.trim();

  // validate required fields
  if (!normalizedName || !normalizedEmail || !normalizedPhoneNumber || !normalizedGender) {
    return next(new ErrorHandler("Please provide all fields", 400));
  }

  // only nijer profile update korte parbe, admin hole any user update korte parbe
  // allow self update or admin update
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return next(new ErrorHandler("You are not allowed to update this user", 403));
  }

  // onno user already same email use korche ki na check
  //  prevent duplicate email
  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: id },
  });

  if (existingUser) {
    return next(new ErrorHandler("Email already in use by another user", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      name: normalizedName,
      email: normalizedEmail,
      phoneNumber: normalizedPhoneNumber,
      gender: normalizedGender,
    },
    { new: true, runValidators: true }
  ).select("-profilePicturePublicId");

  if (!updatedUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: updatedUser,
  });
});

//login user with email and password
// =====================================================
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide all fields", 400));
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password +refreshToken");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;
  delete userResponse.profilePicturePublicId;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpire;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    accessToken,
    role: user.role,
    user: userResponse,
  });
});


// logout user and clear cookies
// =====================================================
export const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: null },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});


// get single user by id
// =====================================================

export const getSingleUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-profilePicturePublicId");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user,
  });
});

// get all users
// =====================================================
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-profilePicturePublicId");

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    count: users.length,
    users,
  });
});

// admin can delete user
// =====================================================
export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("+profilePicturePublicId");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // admin nijer account delete korte paarbe na
  //  prevent admin self delete
  if (req.user._id.toString() === id) {
    return next(new ErrorHandler("You cannot delete your own admin account", 400));
  }
  
  // remove profile picture from cloudinary
  if (user.profilePicturePublicId) {
    await removeCloudinaryFile(user.profilePicturePublicId);
  }

  await User.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

console.log("auth controller is working");
