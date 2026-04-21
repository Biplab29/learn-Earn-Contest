

import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";
import removeCloudinaryFile from "../utils/removeCloudinaryFile.js";



// REGISTER USER
// register a new user
// =====================================================
export const registerUser = asyncHandler(async (req, res) => {
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

      return res.status(400).json({
        message: "All fields are required",
      });
    }

    
    // check duplicate email
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      if (profilePicturePublicId) {
        await removeCloudinaryFile(profilePicturePublicId);
      }

      return res.status(400).json({
        message: "User already exists",
      });
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
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    if (!createdUser && req.file?.filename) {
      await removeCloudinaryFile(req.file.filename);
    }

    return res.status(500).json({
      message: error.message,
    });
  }
});


// update user profile
// =====================================================
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, gender } = req.body;

  const normalizedName = name?.trim();
  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedPhoneNumber = phoneNumber?.trim();
  const normalizedGender = gender?.trim();

  // validate required fields
  if (!normalizedName || !normalizedEmail || !normalizedPhoneNumber || !normalizedGender) {
    return res.status(400).json({
      message: "Please provide all fields",
    });
  }

  // only nijer profile update korte parbe, admin hole any user update korte parbe
  // allow self update or admin update
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return res.status(403).json({
      message: "You are not allowed to update this user",
    });
  }

  // onno user already same email use korche ki na check
  //  prevent duplicate email
  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: id },
  });

  if (existingUser) {
    return res.status(400).json({
      message: "Email already in use by another user",
    });
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
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

//login user with email and password
// =====================================================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide all fields",
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password +refreshToken");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
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
    message: "User logged in successfully",
    accessToken,
    role: user.role,
    user: userResponse,
  });
});


// logout user and clear cookies
// =====================================================
export const logoutUser = asyncHandler(async (req, res) => {
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
    message: "User logged out successfully",
  });
});


// get single user by id
// =====================================================

export const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-profilePicturePublicId");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User fetched successfully",
    user,
  });
});

// get all users
// =====================================================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-profilePicturePublicId");

  return res.status(200).json({
    message: "Users fetched successfully",
    count: users.length,
    users,
  });
});

// admin can delete user
// =====================================================
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("+profilePicturePublicId");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // admin nijer account delete korte paarbe na
  //  prevent admin self delete
  if (req.user._id.toString() === id) {
    return res.status(400).json({
      message: "You cannot delete your own admin account",
    });
  }
  
  // remove profile picture from cloudinary
  if (user.profilePicturePublicId) {
    await removeCloudinaryFile(user.profilePicturePublicId);
  }

  await User.findByIdAndDelete(id);

  return res.status(200).json({
    message: "User deleted successfully",
  });
});

console.log("auth controller is working");