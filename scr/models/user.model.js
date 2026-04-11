// import mongoose from "mongoose";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const Userschema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//     },
//     email: {
//       type: String,
//       unique: true,
//     },
//     password: {
//       type: String,
//     },
//     role: {
//       type: String,
//       enum: ["admin", "student"],
//       default: "student",
//     },

//     refreshToken: String,
    
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,
//   },
//   { timestamps: true }
// );

// Userschema.pre("save", async function () {
//   if (!this.isModified("password")) return ;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// Userschema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };


// Userschema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     { 
//       id: this._id,
//       role: this.role  
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: "1D" }
//   );
// };

// Userschema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     { 
//       id: this._id,
//       role: this.role 
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// export const User = mongoose.model("User", Userschema);

// console.log("user model is working");


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
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
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

Userschema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

Userschema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

Userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1D" }
  );
};

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
