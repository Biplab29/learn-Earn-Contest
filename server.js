import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./scr/config/db.js";
import userRouter from "./scr/routes/auth.route.js";
import contestRouter from "./scr/routes/contest.route.js";

dotenv.config();

const app = express();

// ✅ MIDDLEWARE
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://learn-earn-contest-1.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ ROUTES
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/contest", contestRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server working" });
});

// ✅ CONNECT DB FIRST
connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});