
import asyncHandler from '../middleware/asyncHandler.js';
import { User } from '../models/user.model.js';


export const registerUser = asyncHandler(async(req, res)=>{
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({message: "Please provide all the fields"});
    }

    const userExist = await User.findOne({email});
    if(userExist){
        return res.status(400).json({message: "User already exist"});
    }

    const user = await User.create({
        name,
        email,
        password
    });

    res.status(201).json({
        message: "User registered successfully",
        user
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
    secure: false,
  };

  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);

  return res.status(201).json({
    message: "User logged in successfully",
    accessToken,
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

console.log("auth controller is working");


