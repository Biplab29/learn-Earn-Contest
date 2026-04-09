
import asyncHandler from '../middleware/asyncHandler.js';
import { User } from '../models/user.model.js';


// export const registerUser = asyncHandler(async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const userExist = await User.findOne({ email });

//     if (userExist) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = await User.create({
//       name,
//       email,
//       password
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       user
//     });

//   } catch (error) {
//     console.log("REGISTER ERROR:", error.message);

//     res.status(500).json({
//       message: error.message
//     });
//   }
// });

export const registerUser = asyncHandler(async (req, res) => {
  try {
    // 1. Destructure the new fields from req.body
    const { name, email, password, phoneNumber, gender } = req.body;

    // 2. Update validation to include new fields if they are mandatory
    if (!name || !email || !password || !phoneNumber || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Pass the new fields into the create method
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      gender
    });

    // Remove password from the response for security
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    res.status(500).json({
      message: error.message
    });
  }
});


export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, gender } = req.body;

  if (!name || !email || !phoneNumber || !gender) {
     return res.status(400).json({ message: "Please provide all fields" });
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { name, email, phoneNumber, gender },
    { new: true, runValidators: true }
  );
  
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // 4. Send the successful response back
  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser
  });
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

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
    user
  });
});


// export const logoutUser = asyncHandler(async (req, res) => {
//   await User.findByIdAndUpdate(
//     req.user._id,
//     { refreshToken: null },
//     { new: true }
//   );

//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");

//   return res.status(201).json({
//     message: "User logged out successfully",
//   });
// });


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


export const getSingleUser = asyncHandler (async(req, res)=>{

    const {id} = req.params;

    const user = await User.findById(id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }   
    res.status(200).json({
        message: "User fetched successfully",
        user
    });
});


export const getAllUsers = asyncHandler(async(req,res)=>{
    const users = await User.find();
    if(users.length === 0){
        return res.status(404).json({message: "No users found"});
    }   
    res.status(200).json({
        message: "Users fetched successfully",
        users
    });     
});


// ==========================================
// DELETE USER (ADMIN ONLY)
// ==========================================
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the user first to ensure they exist
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Optional: Prevent admins from deleting themselves accidentally
  if (req.user._id.toString() === id) {
    return res.status(400).json({ message: "You cannot delete your own admin account" });
  }

  // 2. Delete the user
  await User.findByIdAndDelete(id);

  // 3. Send success response
  res.status(200).json({
    message: "User deleted successfully"
  });
});

console.log("auth controller is working");


