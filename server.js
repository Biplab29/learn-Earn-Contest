import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./scr/config/db.js";
import userRouter from "./scr/routes/auth.route.js";
import contestRouter from "./scr/routes/contest.route.js";
import teamRouter from "./scr/routes/teamRoute.js";
import submissionRouter from "./scr/routes/submission.route.js";
import dashboardRouter from "./scr/routes/dashboard.routes.js";
import participationRouter from "./scr/routes/participation.routes.js";
import errorMiddleware from "./scr/middleware/errorMiddleware.js";
import ApiResponse from "./scr/utils/ApiResponse.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://learnearnweb.netlify.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/contest", contestRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1/participation", participationRouter);

app.get("/", (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "Server working"));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB ERROR:", err.message);
  });
