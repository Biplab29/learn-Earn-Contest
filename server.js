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
import passport from "passport";
import oAuthRouter from "./scr/routes/oAuth.js";



dotenv.config();

const app = express();


app.use(cors({  

  origin: [
    "http://localhost:5173",
    "https://learnandearnweb.netlify.app"
  ], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/oauth", oAuthRouter);
app.use("/api/v1/auth",userRouter );
app.use("/api/v1/contest", contestRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/", dashboardRouter);
app.use("/api/v1/participations", participationRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server working" });
});



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