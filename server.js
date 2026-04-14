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
//import notificationRouter from "./scr/routes/notification.routes.js";




dotenv.config();

const app = express();


app.use(cors({  

  origin: [
    "http://localhost:5173",
    "https://learnearnweb.netlify.app"
  ], 
  
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1/auth",userRouter );
app.use("/api/v1/contest", contestRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/", dashboardRouter);
app.use("/api/v1/participations", participationRouter);
//app.use("/api/v1/notifications", notificationRouter);


app.get("/", (req, res) => {
  res.json({ message: "Server working" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_UNEXPECTED_FILE" && err.field
        ? `Unexpected field: ${err.field}. Allowed upload fields are image, projectBriefing, and projectBriefingPdf.`
        : err.message || "Invalid upload request";

    return res.status(400).json({ message });
  }

  if (
    /Only JPG, PNG, JPEG, and WEBP images are allowed|Only PDF files are allowed for the project briefing|Only contest images and PDF project briefings are allowed/i.test(
      err?.message || ""
    )
  ) {
    return res.status(400).json({
      message: err.message,
    });
  }

  return res.status(err.status || err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
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
