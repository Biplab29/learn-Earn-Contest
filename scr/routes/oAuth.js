import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const oAuthRouter = express.Router();

// 🔹 1. Google Login
oAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔹 2. Callback
oAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    // ✅ Generate JWT (same like your normal login)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Redirect to frontend with token
    res.redirect(
      `http://localhost:5173/google-success?token=${token}&role=${user.role}`
    );
  }
);

export default oAuthRouter;

console.log("passport is working");