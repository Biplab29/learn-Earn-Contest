import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const oAuthRouter = express.Router();

// Google Auth

oAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

oAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
 
    res.redirect(
      `http://localhost:5173/google-success?token=${token}&role=${user.role}`
    );
  }
);

export default oAuthRouter;

console.log("passport is working");