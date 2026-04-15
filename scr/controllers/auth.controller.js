
// import asyncHandler from '../middleware/asyncHandler.js';
// import { User } from '../models/user.model.js';
// import removeCloudinaryFile from '../utils/removeCloudinaryFile.js';


// export const registerUser = asyncHandler(async (req, res) => {
//   let createdUser = null;

//   try {
//     const { name, email, password, phoneNumber, gender } = req.body;
//     const normalizedEmail = email?.toLowerCase().trim();
//     const profilePicture = req.file?.path || "";
//     const profilePicturePublicId = req.file?.filename || "";

//     if (!name || !normalizedEmail || !password || !phoneNumber || !gender) {
//       await removeCloudinaryFile(req.file);

//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const userExist = await User.findOne({ email: normalizedEmail });

//     if (userExist) {
//       await removeCloudinaryFile(req.file);

//       return res.status(400).json({ message: "User already exists" });
//     }

//     createdUser = await User.create({
//       name,
//       email: normalizedEmail,
//       password,
//       phoneNumber,
//       gender,
//       profilePicture,
//       profilePicturePublicId,
//     });

//     const userResponse = createdUser.toObject();
//     delete userResponse.password;
//     delete userResponse.profilePicturePublicId;

//     res.status(201).json({
//       message: "User registered successfully",
//       user: userResponse
//     });

//   } catch (error) {
//     console.log("REGISTER ERROR:", error.message);

//     if (!createdUser) {
//       await removeCloudinaryFile(req.file);
//     }

//     res.status(500).json({
//       message: error.message
//     });
//   }
// });


// export const updateUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, email, phoneNumber, gender } = req.body;
//   const normalizedEmail = email?.toLowerCase().trim();

//   if (!name || !normalizedEmail || !phoneNumber || !gender) {
//      return res.status(400).json({ message: "Please provide all fields" });
//   }
  
//   const updatedUser = await User.findByIdAndUpdate(
//     id,
//     { name, email: normalizedEmail, phoneNumber, gender },
//     { new: true, runValidators: true }
//   );
  
//   if (!updatedUser) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // 4. Send the successful response back
//   res.status(200).json({
//     message: "User updated successfully",
//     user: updatedUser
//   });
// });


// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Please provide all fields" });
//   }

//   const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

//   if (!user || !(await user.comparePassword(password))) {
//     return res.status(401).json({ message: "Invalid email or password" });
//   }
  
//   const accessToken = user.generateAccessToken();
//   const refreshToken = user.generateRefreshToken();

//   user.refreshToken = refreshToken;
//   await user.save();

//   const userResponse = user.toObject();
//   delete userResponse.password;
//   delete userResponse.refreshToken;

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", 
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//   };

//   res.cookie("accessToken", accessToken, options);
//   res.cookie("refreshToken", refreshToken, options);

//   return res.status(200).json({
//     message: "User logged in successfully",
//     accessToken,
//     role: user.role,
//     user: userResponse
//   });
// });



// export const logoutUser = asyncHandler(async (req, res) => {
//   await User.findByIdAndUpdate(
//     req.user._id,
//     { refreshToken: null },
//     { new: true }
//   );

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//   };

//   res.clearCookie("accessToken", options);
//   res.clearCookie("refreshToken", options);

//   return res.status(200).json({
//     message: "User logged out successfully",
//   });
// });


// export const getSingleUser = asyncHandler (async(req, res)=>{

//     const {id} = req.params;

//     const user = await User.findById(id);
//     if(!user){
//         return res.status(404).json({message: "User not found"});
//     }   
//     res.status(200).json({
//         message: "User fetched successfully",
//         user
//     });
// });


// export const getAllUsers = asyncHandler(async(req,res)=>{
//     const users = await User.find();
//     if(users.length === 0){
//         return res.status(404).json({message: "No users found"});
//     }   
//     res.status(200).json({
//         message: "Users fetched successfully",
//         users
//     });     
// });


// // ==========================================
// // DELETE USER (ADMIN ONLY)
// // ==========================================
// export const deleteUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   // 1. Find the user first to ensure they exist
//   const user = await User.findById(id);
  
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Optional: Prevent admins from deleting themselves accidentally
//   if (req.user._id.toString() === id) {
//     return res.status(400).json({ message: "You cannot delete your own admin account" });
//   }

//   // 2. Delete the user
//   await User.findByIdAndDelete(id);

//   // 3. Send success response
//   res.status(200).json({
//     message: "User deleted successfully"
//   });
// });

// console.log("auth controller is working");


import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/user.model.js";
import removeCloudinaryFile from "../utils/removeCloudinaryFile.js";


// =====================================================
// REGISTER USER
// বাংলা: নতুন user register করবে
// English: register a new user
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

    // বাংলা: required field validation
    // English: validate required fields
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

    // বাংলা: email আগে থেকেই আছে কিনা check
    // English: check duplicate email
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      if (profilePicturePublicId) {
        await removeCloudinaryFile(profilePicturePublicId);
      }

      return res.status(400).json({
        message: "User already exists",
      });
    }

    // বাংলা: নতুন user create
    // English: create new user
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


// =====================================================
// UPDATE USER
// বাংলা: user profile update করবে
// English: update user profile
// =====================================================
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, gender } = req.body;

  const normalizedName = name?.trim();
  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedPhoneNumber = phoneNumber?.trim();
  const normalizedGender = gender?.trim();

  // বাংলা: required field validation
  // English: validate required fields
  if (!normalizedName || !normalizedEmail || !normalizedPhoneNumber || !normalizedGender) {
    return res.status(400).json({
      message: "Please provide all fields",
    });
  }

  // বাংলা: শুধু নিজের profile update করতে পারবে, admin হলে any user update করতে পারবে
  // English: allow self update or admin update
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return res.status(403).json({
      message: "You are not allowed to update this user",
    });
  }

  // বাংলা: অন্য user already same email use করছে কিনা check
  // English: prevent duplicate email
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


// =====================================================
// LOGIN USER
// বাংলা: email + password দিয়ে login করবে
// English: login user with email and password
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


// =====================================================
// LOGOUT USER
// বাংলা: user logout করবে
// English: logout user and clear cookies
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


// =====================================================
// GET SINGLE USER
// বাংলা: এক user-এর details দেখাবে
// English: get single user by id
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


// =====================================================
// GET ALL USERS
// বাংলা: সব user list দেখাবে
// English: get all users
// =====================================================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-profilePicturePublicId");

  return res.status(200).json({
    message: "Users fetched successfully",
    count: users.length,
    users,
  });
});


// =====================================================
// DELETE USER
// বাংলা: admin user delete করতে পারবে
// English: admin can delete user
// =====================================================
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("+profilePicturePublicId");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // বাংলা: admin নিজের account delete করতে পারবে না
  // English: prevent admin self delete
  if (req.user._id.toString() === id) {
    return res.status(400).json({
      message: "You cannot delete your own admin account",
    });
  }

  // বাংলা: cloudinary image remove
  // English: remove profile picture from cloudinary
  if (user.profilePicturePublicId) {
    await removeCloudinaryFile(user.profilePicturePublicId);
  }

  await User.findByIdAndDelete(id);

  return res.status(200).json({
    message: "User deleted successfully",
  });
});

console.log("auth controller is working");