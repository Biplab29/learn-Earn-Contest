import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./scr/config/db.js";
import userRouter from "./scr/routes/auth.route.js";


dotenv.config();

const app = express();


app.use(cors({
  origin: [
    "https://learnandearnweb.netlify.app",
    "https://desunlearnanderan.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1/auth",userRouter );

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