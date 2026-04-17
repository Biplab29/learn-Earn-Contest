

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Userschema = new mongoose.Schema(
  {
   
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      select: false,
      required: function () {
        return !this.googleId;
      },
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
      trim: true,
    },

    profilePicturePublicId: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    
    refreshToken: {
      type: String,
      select: false,
    },

    
    resetPasswordToken: {
      type: String,
      select: false,
    },

   
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);



// HASH PASSWORD BEFORE SAVE

Userschema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// COMPARE PASSWORD

Userschema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// GENERATE ACCESS TOKEN

Userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

// GENERATE REFRESH TOKEN

Userschema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", Userschema);

console.log("user model is working");
