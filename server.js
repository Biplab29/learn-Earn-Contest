import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./scr/config/db.js";
import userRouter from "./scr/routes/auth.route.js";
import cookieParser from "cookie-parser";
import contestRouter from "./scr/routes/contest.route.js";
import cors from "cors";



const app = express();   

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/contest", contestRouter);

app.get("/", (req,res) =>{
  res.status(201).json({message: "Server is running"});
});

app.listen(5000, () => {
  connectDB();
  console.log("Server is running on port 5000");
});

export default app;