

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Userschema = new mongoose.Schema(
  {
    // বাংলা: user name
    // English: full name of user
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // বাংলা: user email
    // English: unique user email
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // বাংলা: password (normal signup-এর জন্য required)
    // English: password required for non-Google users
    password: {
      type: String,
      select: false,
      required: function () {
        return !this.googleId;
      },
    },

    // বাংলা: phone number
    // English: optional phone number
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // বাংলা: profile picture url
    // English: profile picture URL
    profilePicture: {
      type: String,
      default: "",
      trim: true,
    },

    // বাংলা: cloud/public id of profile image
    // English: profile image public id
    profilePicturePublicId: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },

    // বাংলা: gender
    // English: gender field
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
    },

    // বাংলা: role (admin/student)
    // English: user role
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    // বাংলা: Google login id
    // English: Google account id
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // বাংলা: refresh token
    // English: refresh token for auth
    refreshToken: {
      type: String,
      select: false,
    },

    // বাংলা: forgot password token
    // English: reset password token
    resetPasswordToken: {
      type: String,
      select: false,
    },

    // বাংলা: reset token expire time
    // English: reset password expiry
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);


// =====================================================
// HASH PASSWORD BEFORE SAVE
// বাংলা: password change হলে save-এর আগে hash হবে
// English: hash password before saving
// =====================================================
Userschema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// =====================================================
// COMPARE PASSWORD
// বাংলা: entered password আর hashed password compare করবে
// English: compare entered password with stored hash
// =====================================================
Userschema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};


// =====================================================
// GENERATE ACCESS TOKEN
// বাংলা: short-lived access token generate করবে
// English: generate access token
// =====================================================
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


// =====================================================
// GENERATE REFRESH TOKEN
// বাংলা: long-lived refresh token generate করবে
// English: generate refresh token
// =====================================================
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
