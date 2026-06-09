import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/auth.route.js";
import contestRouter from "./routes/contest.route.js";
import teamRouter from "./routes/teamRoute.js";
import submissionRouter from "./routes/submission.route.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import participationRouter from "./routes/participation.routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

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
  return res.status(200).json({
    success: true,
    message: "Server working",
  });
});

app.use(errorMiddleware);

export default app;
