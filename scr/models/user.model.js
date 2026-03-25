import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide an email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      match: [
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number and special character",
      ],
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

Userschema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

Userschema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

Userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

Userschema.methods.generateRefreshToken = function () {
  return jwt.sign(
    
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", Userschema);

console.log("user model is working");


