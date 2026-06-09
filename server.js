import "dotenv/config";
import app from "./scr/app.js";
import { connectDB } from "./scr/config/db.js";

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
